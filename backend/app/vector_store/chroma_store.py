import os
import sys
import time
import ctypes
import json
from datetime import datetime
from typing import List, Set, Optional, Dict, Any
import chromadb
from backend.app.core.config import settings
from backend.app.core.logging_config import logger
from backend.app.vector_store.vector_store_interface import VectorStoreInterface
from backend.app.vector_store.models import (
    VectorRecord, StoredVectorRecord, VectorSearchResult,
    UpsertResult, DeleteResult, VerificationResult
)
from backend.app.vector_store.filters import VectorSearchFilters, build_chroma_where
from backend.app.vector_store.exceptions import (
    VectorStoreInitializationError, CollectionNotFoundError,
    CollectionCompatibilityError, InvalidEmbeddingError,
    EmbeddingDimensionMismatchError, VectorUpsertError,
    VectorDeleteError, VectorSearchError, ConcurrentWriteError
)

def is_pid_running(pid: int) -> bool:
    """Checks if a process ID is currently running on Windows or UNIX."""
    if pid <= 0:
        return False
    if os.name == 'nt':
        PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
        handle = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
        if handle:
            ctypes.windll.kernel32.CloseHandle(handle)
            return True
        return False
    else:
        try:
            os.kill(pid, 0)
        except OSError:
            return False
        else:
            return True

class IngestionLock:
    """
    Context manager to enforce single-write operations on the ChromaDB database
    using a persistent lock file.
    """
    def __init__(self, lock_file_path: str):
        self.lock_file_path = os.path.abspath(lock_file_path)
        self.acquired = False

    def __enter__(self):
        # Ensure directories exist
        os.makedirs(os.path.dirname(self.lock_file_path), exist_ok=True)
        
        # Check for existing lock file
        if os.path.exists(self.lock_file_path):
            try:
                with open(self.lock_file_path, "r") as f:
                    content = f.read().strip()
                if content:
                    pid = int(content)
                    if is_pid_running(pid):
                        logger.warning(f"Process PID {pid} holds the lock file: {self.lock_file_path}.")
                        raise ConcurrentWriteError(f"Concurrency conflict: Ingestion is already running under PID {pid}.")
                    else:
                        logger.warning(f"Stale ingestion lock file found for dead PID {pid}. Deleting stale lock.")
                        os.remove(self.lock_file_path)
            except (ValueError, OSError) as e:
                # If lock file is corrupted or not readable, remove it safely
                logger.warning(f"Removing corrupted or inaccessible lock file: {e}")
                try:
                    os.remove(self.lock_file_path)
                except Exception:
                    pass

        # Write current PID to lock file
        try:
            with open(self.lock_file_path, "w") as f:
                f.write(str(os.getpid()))
            self.acquired = True
            logger.debug(f"Acquired ingestion lock: {self.lock_file_path} for PID {os.getpid()}")
        except OSError as e:
            raise ConcurrentWriteError(f"Failed to acquire ingestion lock: {e}")

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.acquired:
            try:
                if os.path.exists(self.lock_file_path):
                    os.remove(self.lock_file_path)
                    logger.debug(f"Released ingestion lock: {self.lock_file_path}")
            except OSError as e:
                logger.error(f"Failed to release ingestion lock file: {e}")


class ChromaStore(VectorStoreInterface):
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.VECTOR_DB_PATH
        self.collection_name = settings.VECTOR_COLLECTION_NAME
        self.lock_file_path = os.path.join(self.db_path, ".ingestion.lock")
        self.client: Optional[chromadb.PersistentClient] = None
        self.collection: Optional[Any] = None
        self.initialize()

    def initialize(self) -> None:
        try:
            os.makedirs(self.db_path, exist_ok=True)
            self.client = chromadb.PersistentClient(path=self.db_path)
            
            # Metadata for the collection
            provider = settings.EMBEDDING_PROVIDER.lower()
            model = settings.LOCAL_EMBEDDING_MODEL
            
            self.expected_metadata = {
                "application": "ShopSmart AI",
                "purpose": "Product catalog semantic retrieval",
                "schema_version": "1.0",
                "distance_metric": "cosine",
                "embedding_provider": provider,
                "embedding_model": model,
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            
            # Check if collection already exists
            exists = False
            try:
                # Try getting existing collection
                self.collection = self.client.get_collection(name=self.collection_name)
                exists = True
            except Exception:
                # Does not exist, create it below
                pass
                
            if exists:
                # Verify metadata compatibility
                meta = self.collection.metadata or {}
                
                # Verify embedding model and provider if present in store
                existing_provider = meta.get("embedding_provider")
                existing_model = meta.get("embedding_model")
                existing_metric = meta.get("distance_metric", "cosine")
                existing_version = meta.get("schema_version")
                
                mismatches = []
                if existing_provider and existing_provider != provider:
                    mismatches.append(f"embedding_provider: stored '{existing_provider}' vs configured '{provider}'")
                if existing_model and existing_model != model:
                    mismatches.append(f"embedding_model: stored '{existing_model}' vs configured '{model}'")
                if existing_metric != "cosine":
                    mismatches.append(f"distance_metric: stored '{existing_metric}' vs expected 'cosine'")
                if existing_version and existing_version != "1.0":
                    mismatches.append(f"schema_version: stored '{existing_version}' vs expected '1.0'")
                    
                if mismatches:
                    err_desc = "; ".join(mismatches)
                    logger.error(f"Collection compatibility check failed: {err_desc}")
                    raise CollectionCompatibilityError(
                        f"Database schema mismatch. Embedding configuration changes detected: {err_desc}. "
                        "A complete vector reset or collection migration is required."
                    )
                logger.info(f"Connected to existing Chroma collection '{self.collection_name}' successfully.")
            else:
                # Create collection with Cosine distance metric metadata
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    metadata={
                        **self.expected_metadata,
                        "hnsw:space": "cosine" # Configures Chroma to use cosine distance metric
                    }
                )
                logger.info(f"Created new Chroma collection '{self.collection_name}' with Cosine distance.")
        except CollectionCompatibilityError as e:
            raise e
        except Exception as e:
            raise VectorStoreInitializationError(f"Failed to initialize ChromaDB store: {e}")

    def upsert_records(self, records: List[VectorRecord]) -> UpsertResult:
        if not records:
            return UpsertResult(inserted_count=0, updated_count=0, success=True)
            
        # 1. Validate records (dimensions, Nan/inf)
        dimension = len(records[0].embedding)
        if dimension == 0:
            raise InvalidEmbeddingError("Embedding vector cannot be empty.")
            
        for idx, rec in enumerate(records):
            if len(rec.embedding) != dimension:
                raise EmbeddingDimensionMismatchError(
                    f"Vector dimension mismatch at index {idx}. Expected {dimension}, got {len(rec.embedding)}"
                )
            if any(val is None or val != val for val in rec.embedding):
                raise InvalidEmbeddingError(f"Vector at index {idx} contains NaN or None values.")

        # Query existing hashes to classify inserts vs updates
        inserted = 0
        updated = 0
        
        # Acquire Lock
        with IngestionLock(self.lock_file_path):
            existing_ids = set(self.collection.get(ids=[r.id for r in records])["ids"])
            
            ids = []
            embeddings = []
            documents = []
            metadatas = []
            
            for rec in records:
                ids.append(rec.id)
                embeddings.append(rec.embedding)
                documents.append(rec.document)
                
                # Flatten metadata arrays
                flat_meta = {}
                for k, v in rec.metadata.items():
                    if isinstance(v, (list, tuple)):
                        flat_meta[k] = "|".join(map(str, v))
                    elif isinstance(v, (dict, set)):
                        flat_meta[k] = json.dumps(v)
                    elif v is None:
                        continue
                    else:
                        flat_meta[k] = v
                metadatas.append(flat_meta)
                
                if rec.id in existing_ids:
                    updated += 1
                else:
                    inserted += 1

            try:
                self.collection.upsert(
                    ids=ids,
                    embeddings=embeddings,
                    documents=documents,
                    metadatas=metadatas
                )
            except Exception as e:
                raise VectorUpsertError(f"Failed to upsert records into Chroma collection: {e}")
                
        return UpsertResult(inserted_count=inserted, updated_count=updated, success=True)

    def get_records(self, ids: List[str]) -> List[StoredVectorRecord]:
        if not ids:
            return []
        try:
            results = self.collection.get(
                ids=ids,
                include=["embeddings", "documents", "metadatas"]
            )
            retrieved_ids = results.get("ids", [])
            embeddings = results.get("embeddings")
            documents = results.get("documents")
            metadatas = results.get("metadatas")
            
            records = []
            for i in range(len(retrieved_ids)):
                meta = metadatas[i] if metadatas is not None and len(metadatas) > i else {}
                embed = list(embeddings[i]) if embeddings is not None and len(embeddings) > i else None
                doc = documents[i] if documents is not None and len(documents) > i else ""
                
                records.append(
                    StoredVectorRecord(
                        id=retrieved_ids[i],
                        embedding=embed,
                        document=doc,
                        metadata=meta
                    )
                )
            return records
        except Exception as e:
            logger.error(f"Failed to fetch records: {e}")
            return []

    def get_record(self, id: str) -> Optional[StoredVectorRecord]:
        records = self.get_records([id])
        return records[0] if records else None

    def delete_records(self, ids: List[str]) -> DeleteResult:
        if not ids:
            return DeleteResult(deleted_count=0, success=True)
            
        with IngestionLock(self.lock_file_path):
            try:
                self.collection.delete(ids=ids)
            except Exception as e:
                raise VectorDeleteError(f"Failed to delete records: {e}")
                
        return DeleteResult(deleted_count=len(ids), success=True)

    def delete_by_product_id(self, product_id: str) -> DeleteResult:
        with IngestionLock(self.lock_file_path):
            try:
                # Find matching IDs first to return deleted count
                matches = self.collection.get(where={"product_id": product_id})
                ids_to_delete = matches.get("ids", [])
                if ids_to_delete:
                    self.collection.delete(ids=ids_to_delete)
                return DeleteResult(deleted_count=len(ids_to_delete), success=True)
            except Exception as e:
                raise VectorDeleteError(f"Failed to delete records for product '{product_id}': {e}")

    def delete_stale_records(self, active_ids: Set[str]) -> DeleteResult:
        with IngestionLock(self.lock_file_path):
            try:
                all_ids = self.collection.get()["ids"]
                stale_ids = [uid for uid in all_ids if uid not in active_ids]
                if stale_ids:
                    # Delete in batches of 100 to avoid query limits
                    batch_size = 100
                    for i in range(0, len(stale_ids), batch_size):
                        self.collection.delete(ids=stale_ids[i : i + batch_size])
                return DeleteResult(deleted_count=len(stale_ids), success=True)
            except Exception as e:
                raise VectorDeleteError(f"Failed to delete stale records: {e}")

    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filters: Optional[VectorSearchFilters] = None
    ) -> List[VectorSearchResult]:
        try:
            where_clause = build_chroma_where(filters)
            
            # Query collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_clause,
                include=["documents", "metadatas", "distances"]
            )
            
            ids = results.get("ids", [[]])[0]
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            
            search_results = []
            for rank, idx in enumerate(range(len(ids))):
                dist = distances[idx]
                
                # Cosine similarity normalization: score = 1 - distance (clamped to 0..1)
                # Cosine distance is returned by Chroma (0 means identical, 2 means opposite)
                similarity = max(0.0, min(1.0, 1.0 - dist))
                
                meta = metadatas[idx] or {}
                prod_id = str(meta.get("product_id", ""))
                
                search_results.append(
                    VectorSearchResult(
                        id=ids[idx],
                        product_id=prod_id,
                        document=documents[idx],
                        metadata=meta,
                        distance=float(dist),
                        similarity_score=float(similarity),
                        rank=rank + 1
                    )
                )
            return search_results
        except Exception as e:
            raise VectorSearchError(f"Similarity search failed: {e}")

    def count(self) -> int:
        return self.collection.count()

    def list_ids(self) -> List[str]:
        return self.collection.get()["ids"]

    def get_existing_hashes(self) -> Dict[str, str]:
        results = self.collection.get(include=["metadatas"])
        ids = results.get("ids", [])
        metadatas = results.get("metadatas", [])
        
        hashes = {}
        for uid, meta in zip(ids, metadatas):
            if meta and "content_hash" in meta:
                hashes[uid] = str(meta["content_hash"])
        return hashes

    def get_collection_metadata(self) -> Dict:
        return self.collection.metadata or {}

    def verify_collection(self) -> VerificationResult:
        try:
            record_count = self.collection.count()
            if record_count == 0:
                return VerificationResult(
                    success=False,
                    total_records=0,
                    valid_records=0,
                    invalid_records=0,
                    errors=["Collection is completely empty."]
                )
                
            results = self.collection.get(include=["embeddings", "metadatas", "documents"])
            ids = results.get("ids", [])
            metadatas = results.get("metadatas")
            embeddings = results.get("embeddings")
            documents = results.get("documents")
            
            errors = []
            warnings = []
            valid_count = 0
            invalid_count = 0
            
            detected_dim = None
            
            for idx in range(len(ids)):
                r_id = ids[idx]
                r_meta = metadatas[idx] if metadatas is not None else {}
                r_embed = embeddings[idx] if embeddings is not None else None
                r_doc = documents[idx] if documents is not None else ""
                
                is_valid = True
                
                # 1. Check ID
                if not r_id:
                    errors.append(f"Record index {idx} has an empty ID.")
                    is_valid = False
                    
                # 2. Check Document Content
                if not r_doc.strip():
                    errors.append(f"Record '{r_id}' contains empty document content.")
                    is_valid = False
                    
                # 3. Check Embedding
                if r_embed is None or len(r_embed) == 0:
                    errors.append(f"Record '{r_id}' is missing embedding vectors.")
                    is_valid = False
                else:
                    if detected_dim is None:
                        detected_dim = len(r_embed)
                    elif len(r_embed) != detected_dim:
                        errors.append(f"Record '{r_id}' has inconsistent dimension {len(r_embed)}. Expected {detected_dim}.")
                        is_valid = False
                        
                # 4. Check Metadata Keys
                required_keys = ["product_id", "slug", "name", "brand", "category", "price", "content_hash", "source"]
                for key in required_keys:
                    if key not in r_meta:
                        errors.append(f"Record '{r_id}' is missing required metadata field: '{key}'")
                        is_valid = False
                        
                if is_valid:
                    valid_count += 1
                else:
                    invalid_count += 1
                    
            meta = self.collection.metadata or {}
            
            return VerificationResult(
                success=(invalid_count == 0 and len(errors) == 0),
                total_records=record_count,
                valid_records=valid_count,
                invalid_records=invalid_count,
                warnings=warnings,
                errors=errors,
                embedding_dimension=detected_dim,
                provider=meta.get("embedding_provider"),
                model=meta.get("embedding_model"),
                schema_version=meta.get("schema_version")
            )
        except Exception as e:
            raise VectorStoreInitializationError(f"Verification process failed: {e}")

    def reset_collection(self, confirmation: str) -> None:
        if confirmation != "RESET_SHOPSMART_VECTOR_STORE":
            raise ValueError("Invalid confirmation phrase. Reset aborted.")
            
        with IngestionLock(self.lock_file_path):
            try:
                self.client.delete_collection(name=self.collection_name)
                # Re-create empty collection
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    metadata={
                        **self.expected_metadata,
                        "hnsw:space": "cosine"
                    }
                )
                logger.info(f"Vector store collection '{self.collection_name}' has been reset successfully.")
            except Exception as e:
                raise VectorDeleteError(f"Failed to reset collection: {e}")
