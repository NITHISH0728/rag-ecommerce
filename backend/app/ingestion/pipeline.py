import os
import time
from datetime import datetime
from typing import List, Dict, Set, Tuple, Any
from backend.app.core.config import settings
from backend.app.core.logging_config import logger
from backend.app.models.product import Product
from backend.app.models.rag_document import RAGDocument
from backend.app.models.ingestion_result import IngestionResult
from backend.app.ingestion.loader import load_products
from backend.app.ingestion.validator import validate_dataset_uniqueness
from backend.app.ingestion.normalizer import normalize_product
from backend.app.ingestion.document_builder import build_product_document_text
from backend.app.ingestion.chunker import chunk_product_document
from backend.app.ingestion.hashing import calculate_text_hash
from backend.app.providers.embedding_provider import get_provider
from backend.app.vector_store.vector_store_interface import get_vector_store
from backend.app.vector_store.models import VectorRecord

class IngestionPipeline:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.provider = get_provider()

    def run(
        self,
        data_path: str,
        dry_run: bool = False,
        force_reembed: bool = False,
        delete_stale: bool = True
    ) -> IngestionResult:
        """
        Executes the ingestion pipeline.
        """
        started_at = datetime.utcnow().isoformat() + "Z"
        start_time = time.time()
        
        warnings: List[str] = []
        errors: List[str] = []
        success = True
        
        products_loaded = 0
        products_valid_count = 0
        products_invalid_count = 0
        documents_created = 0
        chunks_created = 0
        embedded_count = 0
        failed_count = 0
        dimension = None
        
        new_chunks_list: List[RAGDocument] = []
        updated_chunks_list: List[RAGDocument] = []
        unchanged_chunks_list: List[RAGDocument] = []
        removed_chunk_ids: List[str] = []
        
        try:
            # 1. Load Products
            raw_products, load_errors = load_products(data_path)
            products_loaded = len(raw_products) + len(load_errors)
            products_invalid_count += len(load_errors)
            warnings.extend(load_errors)
            
            if not raw_products:
                if products_loaded == 0:
                    raise ValueError("Product dataset is completely empty or missing.")
                else:
                    raise ValueError("All products in dataset failed initial validation.")

            # 2. Validate Dataset-Level Uniqueness
            dataset_errors = validate_dataset_uniqueness(raw_products)
            if dataset_errors:
                for err in dataset_errors:
                    errors.append(f"Dataset uniqueness violation: {err}")
                raise ValueError("Dataset validation failed due to uniqueness violations.")

            # 3. Normalize & Build Chunks
            active_chunk_ids: Set[str] = set()
            active_chunks: List[RAGDocument] = []
            
            for p in raw_products:
                # Normalization
                norm_product, norm_warnings = normalize_product(p)
                warnings.extend(norm_warnings)
                products_valid_count += 1
                
                # Build doc text
                doc_text = build_product_document_text(norm_product)
                documents_created += 1
                
                # Split doc into chunks
                chunk_results = chunk_product_document(
                    product_id=norm_product.product_id,
                    document_text=doc_text,
                    chunk_size=settings.CHUNK_SIZE
                )
                
                for chunk in chunk_results:
                    # Calculate hash
                    content_hash = calculate_text_hash(chunk.content)
                    
                    # Prepare flat metadata dictionary
                    meta: Dict[str, Any] = {
                        "product_id": norm_product.product_id,
                        "slug": norm_product.slug,
                        "name": norm_product.name,
                        "brand": norm_product.brand,
                        "category": norm_product.category,
                        "price": norm_product.price,
                        "currency": norm_product.currency,
                        "rating": norm_product.rating,
                        "stock": norm_product.stock,
                        "stock_status": "out_of_stock" if norm_product.stock == 0 else ("low_stock" if norm_product.stock <= 5 else "in_stock"),
                        "warranty": norm_product.warranty,
                        "featured": norm_product.featured,
                        "schema_version": "1.0",
                        "content_hash": content_hash
                    }
                    
                    if norm_product.model:
                        meta["model"] = norm_product.model
                    if norm_product.sku:
                        meta["sku"] = norm_product.sku
                    if norm_product.original_price is not None:
                        meta["original_price"] = norm_product.original_price
                    if norm_product.discount_percentage is not None:
                        meta["discount_percentage"] = norm_product.discount_percentage
                    if norm_product.review_count is not None:
                        meta["review_count"] = norm_product.review_count
                    if norm_product.use_cases:
                        meta["use_cases"] = "|".join(norm_product.use_cases)
                    if norm_product.tags:
                        meta["tags"] = "|".join(norm_product.tags)
                    if norm_product.updated_at:
                        meta["updated_at"] = norm_product.updated_at

                    rag_doc = RAGDocument(
                        document_id=chunk.chunk_id,
                        product_id=norm_product.product_id,
                        chunk_id=f"chunk-{chunk.chunk_index:03d}",
                        content=chunk.content,
                        metadata=meta,
                        content_hash=content_hash,
                        source=os.path.basename(data_path)
                    )
                    active_chunks.append(rag_doc)
                    active_chunk_ids.add(rag_doc.document_id)
                    chunks_created += 1

            # 4. Fetch Existing Vector DB Records
            existing_hashes = self.vector_store.get_existing_hashes()
            
            # 5. Classify Changes
            for chunk in active_chunks:
                chunk_id = chunk.document_id
                c_hash = chunk.content_hash
                
                if force_reembed:
                    # Treat everything as new / updated to force re-embedding
                    if chunk_id in existing_hashes:
                        updated_chunks_list.append(chunk)
                    else:
                        new_chunks_list.append(chunk)
                else:
                    if chunk_id not in existing_hashes:
                        new_chunks_list.append(chunk)
                    else:
                        existing_hash = existing_hashes[chunk_id]
                        if existing_hash != c_hash:
                            updated_chunks_list.append(chunk)
                        else:
                            unchanged_chunks_list.append(chunk)

            # Identify removed records
            for chunk_id in existing_hashes.keys():
                if chunk_id not in active_chunk_ids:
                    removed_chunk_ids.append(chunk_id)

            # 6. Generate Embeddings for New/Updated Chunks
            chunks_to_embed = new_chunks_list + updated_chunks_list
            embeddings: List[List[float]] = []
            
            embedded_count = len(chunks_to_embed)
            failed_count = 0
            
            if embedded_count > 0:
                if dry_run:
                    logger.info(f"[Dry-run] Skipping embedding generation for {embedded_count} chunks.")
                    # Simulate zero embeddings
                    embeddings = [[] for _ in range(embedded_count)]
                else:
                    logger.info(f"Generating embeddings for {embedded_count} new/updated chunks in batches...")
                    texts_to_embed = [c.content for c in chunks_to_embed]
                    batch_size = settings.EMBEDDING_BATCH_SIZE
                    
                    for i in range(0, embedded_count, batch_size):
                        batch_texts = texts_to_embed[i : i + batch_size]
                        logger.info(f"Processing batch {i // batch_size + 1} ({len(batch_texts)} texts)...")
                        
                        try:
                            batch_embeddings = self.provider.embed_documents(batch_texts)
                            embeddings.extend(batch_embeddings)
                        except Exception as e:
                            logger.error(f"Failed to generate embeddings for batch starting at index {i}: {e}")
                            failed_count += len(batch_texts)
                            success = False
                            errors.append(f"Embedding batch failure: {e}")
                            raise e

            # 7. Write Vectors to ChromaDB
            if not dry_run and success:
                if chunks_to_embed:
                    records = [
                        VectorRecord(
                            id=chunk.document_id,
                            embedding=emb,
                            document=chunk.content,
                            metadata=chunk.metadata
                        )
                        for chunk, emb in zip(chunks_to_embed, embeddings)
                    ]
                    self.vector_store.upsert_records(records)
                
                if delete_stale and removed_chunk_ids:
                    self.vector_store.delete_records(removed_chunk_ids)

            # 8. Report Dimension Detection
            dimension = self.provider.get_embedding_dimension()
            if dimension is None and not dry_run:
                # Run a query query check to detect dimension if no document was embedded
                try:
                    test_vec = self.provider.embed_query("test dimension detection query text")
                    dimension = len(test_vec)
                except Exception:
                    pass

        except Exception as e:
            success = False
            err_msg = f"Critical pipeline failure: {e}"
            errors.append(err_msg)
            logger.error(err_msg)
            
        completed_at = datetime.utcnow().isoformat() + "Z"
        duration = round(time.time() - start_time, 2)
        
        result = IngestionResult(
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration,
            source_file=data_path,
            products_loaded=products_loaded,
            products_valid=products_valid_count,
            products_invalid=products_invalid_count,
            documents_created=documents_created,
            chunks_created=chunks_created,
            new_chunks=len(new_chunks_list),
            updated_chunks=len(updated_chunks_list),
            unchanged_chunks=len(unchanged_chunks_list),
            removed_chunks=len(removed_chunk_ids),
            embedded_chunks=embedded_count - failed_count,
            failed_chunks=failed_count,
            embedding_provider=self.provider.get_provider_name(),
            embedding_model=self.provider.get_model_name(),
            embedding_dimension=dimension,
            collection_name=settings.VECTOR_COLLECTION_NAME,
            dry_run=dry_run,
            warnings=warnings,
            errors=errors,
            success=success
        )
        
        # Log Summary
        logger.info("\n================ Ingestion Summary ================")
        logger.info(f"Success: {result.success}")
        logger.info(f"Products: Loaded {result.products_loaded} | Valid {result.products_valid} | Invalid {result.products_invalid}")
        logger.info(f"Chunks: Total Created {result.chunks_created} | New {result.new_chunks} | Updated {result.updated_chunks} | Unchanged {result.unchanged_chunks}")
        logger.info(f"Removed Stale Chunks: {result.removed_chunks}")
        logger.info(f"API Embeddings Requested: {result.embedded_chunks} chunks")
        logger.info(f"Provider: {result.embedding_provider} ({result.embedding_model})")
        if result.embedding_dimension:
            logger.info(f"Vector Dimension: {result.embedding_dimension}")
        logger.info(f"Collection Name: {result.collection_name}")
        logger.info(f"Duration: {result.duration_seconds}s")
        logger.info("===================================================\n")
        
        return result
