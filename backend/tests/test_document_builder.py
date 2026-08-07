from backend.app.models.product import Product
from backend.app.ingestion.document_builder import build_product_document_text

def test_document_builder_formatting():
    product_data = {
        "productId": "LAP-999",
        "name": "Test Laptop Pro",
        "slug": "test-laptop-pro",
        "brand": "TestBrand",
        "category": "Laptops",
        "price": 50000,
        "currency": "INR",
        "description": "This is a detailed description of the laptop that needs to be at least fifty words long to satisfy the validation checks of the product model without raising an exception during tests.",
        "shortDescription": "Concise laptop desc",
        "specifications": {"Processor": "Intel Core i5", "RAM": "16 GB"},
        "rating": 4.5,
        "stock": 10,
        "warranty": "1 year",
        "useCases": ["Coding", "College"],
        "tags": ["laptop", "test", "portable", "device"],
        "images": ["/img.png"],
        "featured": True,
        "createdAt": "2026-07-01T10:00:00.000Z",
        "updatedAt": "2026-08-01T10:00:00.000Z"
    }
    
    product = Product.model_validate(product_data)
    text = build_product_document_text(product)
    
    assert "Product Name: Test Laptop Pro" in text
    assert "Product ID: LAP-999" in text
    assert "Availability: In stock" in text
    assert "Key Specifications:" in text
    assert "- Processor: Intel Core i5" in text
    assert "- RAM: 16 GB" in text
    assert "Recommended Use Cases:" in text
    assert "- Coding" in text
    assert "Search Tags:" in text
    assert "- laptop" in text
