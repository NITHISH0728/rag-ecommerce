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

def test_delete_specific_ids(temp_chroma_store):
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.5] * 1536,
        document="Laptop Doc 1",
        metadata={"product_id": "LAP-001", "name": "A", "price": 10, "category": "L", "brand": "B", "slug": "a", "content_hash": "x", "source": "s"}
    )
    r2 = VectorRecord(
        id="LAP-001::chunk-001",
        embedding=[0.5] * 1536,
        document="Laptop Doc 2",
        metadata={"product_id": "LAP-001", "name": "A", "price": 10, "category": "L", "brand": "B", "slug": "a", "content_hash": "y", "source": "s"}
    )
    temp_chroma_store.upsert_records([r1, r2])
    assert temp_chroma_store.count() == 2
    
    # Delete specific id
    res = temp_chroma_store.delete_records(["LAP-001::chunk-000"])
    assert res.success is True
    assert res.deleted_count == 1
    assert temp_chroma_store.count() == 1
    assert temp_chroma_store.get_record("LAP-001::chunk-000") is None
    assert temp_chroma_store.get_record("LAP-001::chunk-001") is not None

def test_delete_by_product_id(temp_chroma_store):
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.5] * 1536,
        document="Doc 1",
        metadata={"product_id": "LAP-001", "name": "A", "price": 10, "category": "L", "brand": "B", "slug": "a", "content_hash": "x", "source": "s"}
    )
    r2 = VectorRecord(
        id="LAP-002::chunk-000",
        embedding=[0.5] * 1536,
        document="Doc 2",
        metadata={"product_id": "LAP-002", "name": "A", "price": 10, "category": "L", "brand": "B", "slug": "a", "content_hash": "y", "source": "s"}
    )
    temp_chroma_store.upsert_records([r1, r2])
    assert temp_chroma_store.count() == 2
    
    # Delete by product id
    res = temp_chroma_store.delete_by_product_id("LAP-001")
    assert res.success is True
    assert res.deleted_count == 1
    assert temp_chroma_store.count() == 1
    assert temp_chroma_store.get_record("LAP-001::chunk-000") is None
    assert temp_chroma_store.get_record("LAP-002::chunk-000") is not None

def test_delete_stale_records(temp_chroma_store):
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.5] * 1536,
        document="Doc 1",
        metadata={"product_id": "LAP-001", "name": "A", "price": 10, "category": "L", "brand": "B", "slug": "a", "content_hash": "x", "source": "s"}
    )
    r2 = VectorRecord(
        id="LAP-002::chunk-000",
        embedding=[0.5] * 1536,
        document="Doc 2",
        metadata={"product_id": "LAP-002", "name": "A", "price": 10, "category": "L", "brand": "B", "slug": "a", "content_hash": "y", "source": "s"}
    )
    temp_chroma_store.upsert_records([r1, r2])
    
    # Delete stale (keep only LAP-001)
    res = temp_chroma_store.delete_stale_records({"LAP-001::chunk-000"})
    assert res.success is True
    assert res.deleted_count == 1
    assert temp_chroma_store.count() == 1
    assert temp_chroma_store.get_record("LAP-002::chunk-000") is None
