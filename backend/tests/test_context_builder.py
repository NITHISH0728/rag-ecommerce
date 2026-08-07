from backend.app.rag.context_builder import build_rag_context
from backend.app.vector_store.models import VectorSearchResult

def test_context_builder_empty():
    context_str, manifest = build_rag_context([])
    assert "No retrieved catalog products" in context_str
    assert manifest == []

def test_context_builder_formatting():
    item = VectorSearchResult(
        id="LAP-001::chunk-000",
        product_id="LAP-001",
        document="Specifications:\n- Processor: Intel i5\n- RAM: 16 GB\n- Storage: 512 GB",
        metadata={
            "product_id": "LAP-001",
            "name": "Dell Inspiron",
            "brand": "Dell",
            "category": "Laptops",
            "price": 58999,
            "rating": 4.4,
            "stock_status": "in_stock",
            "stock": 10,
            "warranty": "1 year",
            "slug": "dell"
        },
        distance=0.1,
        similarity_score=0.9,
        rank=1
    )
    
    context_str, manifest = build_rag_context([item], maximum_price=60000.0, use_cases=["Coding"])
    assert "[P1]" in context_str
    assert "Dell Inspiron" in context_str
    assert "INR 58999" in context_str
    assert "- Category: Laptops" in context_str
    
    assert len(manifest) == 1
    assert manifest[0]["citation_id"] == "P1"
    assert manifest[0]["product_id"] == "LAP-001"
