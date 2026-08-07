import pytest
from unittest.mock import MagicMock
from backend.app.rag.orchestrator import RAGOrchestrator
from backend.app.chat.models import ChatRequest
from backend.app.chat.history import ConversationSession

@pytest.fixture
def mock_orchestrator():
    orch = RAGOrchestrator()
    orch.search_service = MagicMock()
    orch.llm = MagicMock()
    return orch

@pytest.fixture
def empty_session():
    return ConversationSession("test_session")

def test_filter_precedence_api_override(mock_orchestrator, empty_session):
    # API Request specifies Laptops, Query has Phone. API should win!
    req = ChatRequest(
        message="phone under 50000",
        filters={
            "category": "Laptops",
            "maximum_price": 60000.0
        }
    )
    from backend.app.rag.query_analyzer import QueryAnalysis
    analysis = QueryAnalysis(
        intent="product_recommendation",
        category="Phones",
        maximum_price=50000.0,
        minimum_price=None,
        brand=None,
        minimum_rating=None,
        stock_status=None,
        use_cases=[],
        keywords=[],
        comparison_product_ids=[],
        featured=None,
        requires_retrieval=True
    )
    
    filters = mock_orchestrator._apply_filter_precedence(req, analysis, empty_session)
    assert filters.category == "Laptops"
    assert filters.maximum_price == 60000.0
