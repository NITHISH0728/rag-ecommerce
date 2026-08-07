import pytest
from backend.app.core.config import settings
from backend.app.vector_store.chroma_store import ChromaStore
from backend.app.vector_store.models import VectorRecord

@pytest.fixture
def temp_chroma_store(tmp_path):
    original_path = settings.VECTOR_DB_PATH
    settings.VECTOR_DB_PATH = str(tmp_path / "chromadb")
    store = ChromaStore(db_path=settings.VECTOR_DB_PATH)
    yield store
    settings.VECTOR_DB_PATH = original_path

def test_idempotent_upsert(temp_chroma_store):
    record = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.5] * 1536,
        document="Test Content",
        metadata={
            "product_id": "LAP-001",
            "name": "Test Laptop",
            "price": 50000,
            "category": "Laptops",
            "brand": "Dell",
            "slug": "test-laptop",
            "content_hash": "hash-v1",
            "source": "test.json"
        }
    )
    
    # First upsert
    res1 = temp_chroma_store.upsert_records([record])
    assert res1.inserted_count == 1
    assert res1.updated_count == 0
    assert temp_chroma_store.count() == 1
    
    # Second identical upsert
    res2 = temp_chroma_store.upsert_records([record])
    assert res2.inserted_count == 0
    assert res2.updated_count == 1
    assert temp_chroma_store.count() == 1

def test_update_changed_content(temp_chroma_store):
    record1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.5] * 1536,
        document="Content Version 1",
        metadata={
            "product_id": "LAP-001",
            "name": "Test Laptop",
            "price": 50000,
            "category": "Laptops",
            "brand": "Dell",
            "slug": "test-laptop",
            "content_hash": "hash-v1",
            "source": "test.json"
        }
    )
    temp_chroma_store.upsert_records([record1])
    
    # Update same ID with new content
    record2 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.5] * 1536,
        document="Content Version 2",
        metadata={
            "product_id": "LAP-001",
            "name": "Test Laptop",
            "price": 50000,
            "category": "Laptops",
            "brand": "Dell",
            "slug": "test-laptop",
            "content_hash": "hash-v2",
            "source": "test.json"
        }
    )
    
    res = temp_chroma_store.upsert_records([record2])
    assert res.inserted_count == 0
    assert res.updated_count == 1
    
    # Verify content changed
    stored = temp_chroma_store.get_record("LAP-001::chunk-000")
    assert stored.document == "Content Version 2"
    assert stored.metadata["content_hash"] == "hash-v2"
