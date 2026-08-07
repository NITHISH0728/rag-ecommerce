from backend.app.rag.response_validator import validate_response_groundedness
from backend.app.chat.models import RecommendedProduct

def test_response_validator_valid():
    citations_manifest = [
        {"citation_id": "P1", "product_id": "LAP-001", "product_name": "Dell", "slug": "dell", "chunk_ids": [], "matched_sections": []}
    ]
    recommended_products = [
        RecommendedProduct(
            product_id="LAP-001", slug="dell", name="Dell", brand="Dell", category="Laptops",
            price=50000, currency="INR", rating=4.5, stock=10, stock_status="in_stock", warranty="1 year", image="/img.png", reason="reason"
        )
    ]
    
    # Valid answer referencing P1
    is_valid, answer, errors = validate_response_groundedness(
        answer="I recommend Dell Inspiron [P1].",
        citations_manifest=citations_manifest,
        recommended_products=recommended_products,
        maximum_price=60000.0
    )
    
    assert is_valid is True
    assert "[P1]" in answer
    assert len(errors) == 0

def test_response_validator_hallucinated_citation():
    citations_manifest = [
        {"citation_id": "P1", "product_id": "LAP-001", "product_name": "Dell", "slug": "dell", "chunk_ids": [], "matched_sections": []}
    ]
    recommended_products = []
    
    # Hallucinated citation [P2] not present in manifest
    is_valid, answer, errors = validate_response_groundedness(
        answer="I recommend Dell [P1] and HP [P2].",
        citations_manifest=citations_manifest,
        recommended_products=recommended_products
    )
    
    assert is_valid is False
    # P2 citation should be stripped
    assert "[P2]" not in answer
    assert any("Hallucinated citation" in err for err in errors)

def test_response_validator_budget_exceeded():
    citations_manifest = []
    recommended_products = [
        RecommendedProduct(
            product_id="LAP-002", slug="hp", name="HP", brand="HP", category="Laptops",
            price=75000, currency="INR", rating=4.5, stock=10, stock_status="in_stock", warranty="1 year", image="/img.png", reason="reason"
        )
    ]
    
    # LAP-002 price is 75000, which exceeds 60000 limit
    is_valid, answer, errors = validate_response_groundedness(
        answer="I recommend HP laptop.",
        citations_manifest=citations_manifest,
        recommended_products=recommended_products,
        maximum_price=60000.0
    )
    
    assert is_valid is False
    assert any("exceeds maximum budget" in err for err in errors)

def test_response_validator_secret_leaks():
    is_valid, answer, errors = validate_response_groundedness(
        answer="Here is the groq_api_key: sk_mock_key",
        citations_manifest=[],
        recommended_products=[]
    )
    assert is_valid is False
    assert "groq_api_key" not in answer
    assert "The AI response service is temporarily unavailable." in answer
