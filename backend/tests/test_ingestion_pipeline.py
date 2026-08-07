import json
import pytest
from unittest.mock import MagicMock, patch
from backend.app.models.product import Product
from backend.app.ingestion.pipeline import IngestionPipeline

@pytest.fixture
def mock_products_json(tmp_path):
    json_file = tmp_path / "test_products.json"
    
    product_data = [{
        "productId": "LAP-999",
        "name": "Test Laptop",
        "slug": "test-laptop",
        "brand": "TestBrand",
        "category": "Laptops",
        "price": 50000,
        "currency": "INR",
        "description": "This is a detailed description of the laptop that needs to be at least fifty words long to satisfy the validation checks of the product model without raising an exception during tests.",
        "shortDescription": "Concise laptop desc",
        "specifications": {"RAM": "8 GB"},
        "rating": 4.5,
        "stock": 10,
        "warranty": "1 year",
        "useCases": ["Coding", "College"],
        "tags": ["laptop", "test", "portable", "device"],
        "images": ["/img.png"],
        "featured": True,
        "createdAt": "2026-07-01T10:00:00.000Z",
        "updatedAt": "2026-08-01T10:00:00.000Z"
    }]
    
    json_file.write_text(json.dumps(product_data), encoding="utf-8")
    return str(json_file)

@patch("backend.app.ingestion.pipeline.get_vector_store")
@patch("backend.app.ingestion.pipeline.get_provider")
def test_pipeline_dry_run(mock_get_provider, mock_get_vector_store, mock_products_json):
    # Setup mocks
    mock_store = MagicMock()
    mock_store.get_existing_hashes.return_value = {}
    mock_get_vector_store.return_value = mock_store
    
    mock_prov = MagicMock()
    mock_prov.get_provider_name.return_value = "mock_provider"
    mock_prov.get_model_name.return_value = "mock_model"
    mock_prov.get_embedding_dimension.return_value = 1536
    mock_get_provider.return_value = mock_prov

    pipeline = IngestionPipeline()
    
    # Run in dry-run mode
    result = pipeline.run(
        data_path=mock_products_json,
        dry_run=True,
        force_reembed=False
    )
    
    assert result.success is True
    assert result.dry_run is True
    assert result.products_loaded == 1
    assert result.products_valid == 1
    assert result.products_invalid == 0
    assert result.chunks_created == 1
    assert result.new_chunks == 1
    
    # Ensure ChromaDB and embedding API were NOT called in dry-run
    mock_store.upsert_records.assert_not_called()
    mock_prov.embed_documents.assert_not_called()
