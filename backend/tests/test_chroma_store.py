import pytest
import os
from unittest.mock import MagicMock
from backend.app.core.config import settings
from backend.app.vector_store.chroma_store import ChromaStore
from backend.app.vector_store.models import VectorRecord
from backend.app.vector_store.exceptions import CollectionCompatibilityError

@pytest.fixture
def temp_chroma_store(tmp_path):
    original_path = settings.VECTOR_DB_PATH
    settings.VECTOR_DB_PATH = str(tmp_path / "chromadb")
    
    # Instantiate with new path
    store = ChromaStore(db_path=settings.VECTOR_DB_PATH)
    
    yield store
    
    # Reset path
    settings.VECTOR_DB_PATH = original_path

def test_store_initialization(temp_chroma_store):
    assert temp_chroma_store.client is not None
    assert temp_chroma_store.collection is not None
    assert temp_chroma_store.collection_name == settings.VECTOR_COLLECTION_NAME
    assert os.path.exists(temp_chroma_store.db_path)

def test_store_count_empty(temp_chroma_store):
    assert temp_chroma_store.count() == 0

def test_store_upsert_single(temp_chroma_store):
    record = VectorRecord(
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
    
    res = temp_chroma_store.upsert_records([record])
    assert res.success is True
    assert res.inserted_count == 1
    assert res.updated_count == 0
    assert temp_chroma_store.count() == 1

def test_store_get_record(temp_chroma_store):
    record = VectorRecord(
        id="LAP-001::chunk-000",
        embedding=[0.2] * 1536,
        document="My test content text",
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
    temp_chroma_store.upsert_records([record])
    
    stored = temp_chroma_store.get_record("LAP-001::chunk-000")
    assert stored is not None
    assert stored.id == "LAP-001::chunk-000"
    assert stored.document == "My test content text"
    assert stored.metadata["brand"] == "Dell"
