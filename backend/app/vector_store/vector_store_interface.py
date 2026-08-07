from abc import ABC, abstractmethod
from typing import List, Set, Optional, Dict
from backend.app.vector_store.models import (
    VectorRecord, StoredVectorRecord, VectorSearchResult,
    UpsertResult, DeleteResult, VerificationResult
)
from backend.app.vector_store.filters import VectorSearchFilters

class VectorStoreInterface(ABC):
    @abstractmethod
    def initialize(self) -> None:
        """Initialize the client connection and resolve/create the collection."""
        pass

    @abstractmethod
    def upsert_records(self, records: List[VectorRecord]) -> UpsertResult:
        """Insert or update vector records in the store."""
        pass

    @abstractmethod
    def get_records(self, ids: List[str]) -> List[StoredVectorRecord]:
        """Fetch records by their document IDs."""
        pass

    @abstractmethod
    def get_record(self, id: str) -> Optional[StoredVectorRecord]:
        """Fetch a single record by its document ID."""
        pass

    @abstractmethod
    def delete_records(self, ids: List[str]) -> DeleteResult:
        """Remove specific records by their document IDs."""
        pass

    @abstractmethod
    def delete_by_product_id(self, product_id: str) -> DeleteResult:
        """Remove all records matching a specific product ID."""
        pass

    @abstractmethod
    def delete_stale_records(self, active_ids: Set[str]) -> DeleteResult:
        """Remove all records whose document ID is not in active_ids."""
        pass

    @abstractmethod
    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filters: Optional[VectorSearchFilters] = None
    ) -> List[VectorSearchResult]:
        """Perform semantic search using a query embedding and optional filters."""
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total document count in the collection."""
        pass

    @abstractmethod
    def list_ids(self) -> List[str]:
        """Return all document IDs currently indexed."""
        pass

    @abstractmethod
    def get_existing_hashes(self) -> Dict[str, str]:
        """Retrieve all chunk IDs and their content hashes currently stored."""
        pass

    @abstractmethod
    def get_collection_metadata(self) -> Dict:
        """Return metadata details associated with the collection."""
        pass

    @abstractmethod
    def verify_collection(self) -> VerificationResult:
        """Perform database and schema validation checks."""
        pass

    @abstractmethod
    def reset_collection(self, confirmation: str) -> None:
        """Clear and delete the collection entirely, requiring confirmation."""
        pass

def get_vector_store() -> VectorStoreInterface:
    from backend.app.vector_store.chroma_store import ChromaStore
    return ChromaStore()
