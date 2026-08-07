from backend.app.rag.query_analyzer import analyze_query_deterministically

def test_query_analyzer_recommendation():
    analysis = analyze_query_deterministically("I need a laptop for coding under ₹60,000")
    assert analysis.intent == "product_recommendation"
    assert analysis.category == "Laptops"
    assert analysis.maximum_price == 60000.0
    assert "Coding" in analysis.use_cases

def test_query_analyzer_k_multiplier():
    analysis = analyze_query_deterministically("gaming laptop under 80k")
    assert analysis.maximum_price == 80000.0
    assert "Gaming" in analysis.use_cases

def test_query_analyzer_lakh_multiplier():
    analysis = analyze_query_deterministically("laptop under 1.2 lakh")
    assert analysis.maximum_price == 120000.0

def test_query_analyzer_star_rating():
    analysis = analyze_query_deterministically("phone above 4.5 stars")
    assert analysis.category == "Phones"
    assert analysis.minimum_rating == 4.5

def test_query_analyzer_stock_status():
    analysis = analyze_query_deterministically("wireless mechanical keyboard in stock")
    assert analysis.category == "Keyboards"
    assert analysis.stock_status == "in_stock"

def test_query_analyzer_comparison():
    analysis = analyze_query_deterministically("Compare Dell Inspiron and HP Pavilion")
    assert analysis.intent == "product_comparison"
    assert analysis.category == "Laptops"
