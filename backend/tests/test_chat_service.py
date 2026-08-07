import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from backend.app.chat.models import ChatRequest
from backend.app.chat.service import ChatService
from backend.app.chat.session_manager import get_session_store

@pytest.fixture
def mock_llm_and_vector_store():
    # Patch get_llm_provider and SearchService to return mocks
    with patch("backend.app.rag.orchestrator.get_llm_provider") as mock_get_llm, \
         patch("backend.app.rag.orchestrator.SearchService") as mock_search_cls:
         
        # Mock LLM provider
        mock_prov = MagicMock()
        mock_prov.generate = AsyncMock()
        mock_prov.generate.return_value.content = "This is a mock assistant answer for coding laptop [P1]."
        mock_prov.generate.return_value.latency_seconds = 0.5
        mock_prov.get_provider_name.return_value = "groq"
        mock_prov.get_model_name.return_value = "llama-3.1-8b-instant"
        mock_get_llm.return_value = mock_prov
        
        # Mock SearchService
        mock_search = MagicMock()
        mock_search.search_chunks.return_value = []
        mock_search_cls.return_value = mock_search
        
        yield mock_prov, mock_search

def test_chat_service_rest(mock_llm_and_vector_store):
    mock_prov, mock_search = mock_llm_and_vector_store
    
    # We populate the orchestrator search cache with LAP-001 so it maps the card correctly
    class MockProduct:
        product_id = "LAP-001"
        slug = "dell"
        name = "Dell Laptop"
        brand = "Dell"
        category = "Laptops"
        price = 58999
        currency = "INR"
        rating = 4.4
        stock = 10
        warranty = "1 year"
        images = ["/img.png"]
        
    chat_service = ChatService()
    chat_service.orchestrator.catalog_products = {
        "LAP-001": MockProduct()
    }
    
    # Mock search chunks return list
    from backend.app.vector_store.models import VectorSearchResult
    mock_search.search_chunks.return_value = [
        VectorSearchResult(
            id="LAP-001::chunk-000",
            product_id="LAP-001",
            document="Specifications:\n- Processor: i5\n- RAM: 16 GB\n- Storage: 512 GB",
            metadata={
                "product_id": "LAP-001",
                "name": "Dell Laptop",
                "brand": "Dell",
                "category": "Laptops",
                "price": 58999,
                "rating": 4.4,
                "stock_status": "in_stock",
                "stock": 10,
                "warranty": "1 year",
                "slug": "dell",
                "content_hash": "abc",
                "source": "s"
            },
            distance=0.1,
            similarity_score=0.9,
            rank=1
        )
    ]

    req = ChatRequest(
        message="I need a laptop for coding under ₹60,000",
        conversation_id="test_conv_id",
        stream=False
    )
    
    # Execute
    import asyncio
    response = asyncio.run(chat_service.process_chat(req))
    
    assert response.conversation_id == "test_conv_id"
    assert "mock assistant answer" in response.answer
    assert len(response.citations) == 1
    assert response.citations[0].product_id == "LAP-001"
    assert len(response.products) == 1
    assert response.products[0].product_id == "LAP-001"
    assert response.retrieval_status == "success"
    assert response.grounded is True
