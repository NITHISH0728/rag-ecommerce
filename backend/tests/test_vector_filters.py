from backend.app.vector_store.filters import VectorSearchFilters, build_chroma_where

def test_filters_empty():
    assert build_chroma_where(None) is None
    assert build_chroma_where(VectorSearchFilters()) is None

def test_filters_single():
    f = VectorSearchFilters(category="Laptops")
    where = build_chroma_where(f)
    assert where == {"category": "Laptops"}

def test_filters_multiple_and():
    f = VectorSearchFilters(
        category="Laptops",
        brand="Dell",
        maximum_price=60000.0
    )
    where = build_chroma_where(f)
    assert where is not None
    assert "$and" in where
    assert len(where["$and"]) == 3
    assert {"category": "Laptops"} in where["$and"]
    assert {"brand": "Dell"} in where["$and"]
    assert {"price": {"$lte": 60000}} in where["$and"]

def test_filters_price_bounds():
    f = VectorSearchFilters(minimum_price=30000.0, maximum_price=80000.0)
    where = build_chroma_where(f)
    assert where is not None
    assert "$and" in where
    assert {"price": {"$gte": 30000}} in where["$and"]
    assert {"price": {"$lte": 80000}} in where["$and"]
