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

def test_verify_empty_collection(temp_chroma_store):
    res = temp_chroma_store.verify_collection()
    assert res.success is False
    assert res.total_records == 0
    assert len(res.errors) > 0

def test_verify_valid_collection(temp_chroma_store):
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.1] * 1536,
        document="This is a test document content",
        metadata={
            "product_id": "LAP-001",
            "name": "Test Laptop",
            "price": 50000,
            "category": "Laptops",
            "brand": "Dell",
            "slug": "test-laptop",
            "content_hash": "abc",
            "source": "test.json"
        }
    )
    temp_chroma_store.upsert_records([r1])
    
    res = temp_chroma_store.verify_collection()
    assert res.success is True
    assert res.total_records == 1
    assert res.valid_records == 1
    assert len(res.errors) == 0

def test_verify_missing_metadata(temp_chroma_store):
    # Insert record missing required metadata fields (e.g., name or price)
    r1 = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.1] * 1536,
        document="Test Document",
        metadata={
            "product_id": "LAP-001"
            # Missing name, price, brand, category, slug, content_hash, source
        }
    )
    temp_chroma_store.upsert_records([r1])
    
    res = temp_chroma_store.verify_collection()
    assert res.success is False
    assert res.invalid_records == 1
    assert any("missing required metadata field" in err for err in res.errors)
