import pytest
from unittest.mock import MagicMock
from backend.app.core.config import settings
from backend.app.vector_store.chroma_store import ChromaStore
from backend.app.vector_store.models import VectorRecord
from backend.app.vector_store.filters import VectorSearchFilters
from backend.app.retrieval.search_service import SearchService

@pytest.fixture
def temp_chroma_store(tmp_path):
    original_path = settings.VECTOR_DB_PATH
    settings.VECTOR_DB_PATH = str(tmp_path / "chromadb")
    store = ChromaStore(db_path=settings.VECTOR_DB_PATH)
    yield store
    settings.VECTOR_DB_PATH = original_path

def test_similarity_search_scores(temp_chroma_store):
    # Insert two records with slightly different vectors
    # Using simple orthonormal vectors to check scoring
    # A vector identical to search query should have cosine distance 0.0 (similarity 1.0)
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[1.0] + [0.0]*1535,
        document="Document 1 content details",
        metadata={"product_id": "LAP-001", "name": "Dell Laptop", "price": 50000, "category": "Laptops", "brand": "Dell", "slug": "dell", "content_hash": "x", "source": "s"}
    )
    r2 = VectorRecord(
        id="LAP-002::chunk-000",
        embedding=[0.0, 1.0] + [0.0]*1534,
        document="Document 2 content details",
        metadata={"product_id": "LAP-002", "name": "HP Laptop", "price": 60000, "category": "Laptops", "brand": "HP", "slug": "hp", "content_hash": "y", "source": "s"}
    )
    temp_chroma_store.upsert_records([r1, r2])
    
    # Query with r1 vector
    query_vec = [1.0] + [0.0]*1535
    results = temp_chroma_store.similarity_search(query_vec, top_k=2)
    
    assert len(results) == 2
    assert results[0].id == "LAP-001::chunk-000"
    # Cosine distance should be 0.0 for identical vector, so similarity score is 1.0
    assert abs(results[0].similarity_score - 1.0) < 1e-5
    
    #HP vector is orthogonal (cosine similarity 0.0, distance 1.0)
    assert results[1].id == "LAP-002::chunk-000"
    assert abs(results[1].similarity_score - 0.0) < 1e-5

def test_search_service_deduplication(temp_chroma_store):
    # Insert two chunks for the same product LAP-001, and one chunk for LAP-002
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[1.0] + [0.0]*1535,
        document="Product 1 Chunk 0",
        metadata={"product_id": "LAP-001", "name": "Laptop A", "price": 50000, "category": "Laptops", "brand": "Dell", "slug": "dell", "content_hash": "x", "source": "s"}
    )
    r2 = VectorRecord(
        id="LAP-001::chunk-001",
        embedding=[0.9, 0.1] + [0.0]*1534,
        document="Product 1 Chunk 1",
        metadata={"product_id": "LAP-001", "name": "Laptop A", "price": 50000, "category": "Laptops", "brand": "Dell", "slug": "dell", "content_hash": "y", "source": "s"}
    )
    r3 = VectorRecord(
        id="LAP-002::chunk-000",
        embedding=[0.1, 0.9] + [0.0]*1534,
        document="Product 2 Chunk 0",
        metadata={"product_id": "LAP-002", "name": "Laptop B", "price": 60000, "category": "Laptops", "brand": "HP", "slug": "hp", "content_hash": "z", "source": "s"}
    )
    temp_chroma_store.upsert_records([r1, r2, r3])
    
    # We mock SearchService provider to return our test vectors
    search_service = SearchService()
    # Mock embedding provider to return a query vector close to Laptop A
    search_service.provider.embed_query = MagicMock(return_value=[1.0] + [0.0]*1535)
    
    # Product mode search should return deduplicated product hits (LAP-001 and LAP-002)
    deduped = search_service.search_products(query="laptop a", top_k=5)
    assert len(deduped) == 2
    # First item should be the highest scoring chunk of LAP-001
    assert deduped[0].product_id == "LAP-001"
    assert deduped[0].id == "LAP-001::chunk-000"
    # Second item should be LAP-002
    assert deduped[1].product_id == "LAP-002"
