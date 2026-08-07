import os
import json
import csv
import pytest
from backend.app.models.product import Product
from backend.app.ingestion.loader import load_products_from_json, load_products_from_csv

def test_pydantic_camelcase_alias():
    raw = {
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
    }
    
    prod = Product.model_validate(raw)
    assert prod.product_id == "LAP-999"
    assert prod.short_description == "Concise laptop desc"
    assert prod.use_cases == ["Coding", "College"]
    assert prod.created_at == "2026-07-01T10:00:00.000Z"

def test_load_json_loader(tmp_path):
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
    
    products, errors = load_products_from_json(str(json_file))
    assert len(products) == 1
    assert len(errors) == 0
    assert products[0].product_id == "LAP-999"

def test_load_csv_loader(tmp_path):
    csv_file = tmp_path / "test_products.csv"
    
    headers = [
        'product_id', 'name', 'slug', 'brand', 'model', 'sku', 'category', 'price',
        'original_price', 'discount_percentage', 'currency', 'description', 'short_description',
        'specifications_json', 'rating', 'review_count', 'stock', 'warranty', 'use_cases_json',
        'tags_json', 'images_json', 'color_options_json', 'highlights_json', 'featured',
        'created_at', 'updated_at'
    ]
    
    row = {
        'product_id': 'LAP-999',
        'name': 'Test Laptop',
        'slug': 'test-laptop',
        'brand': 'TestBrand',
        'model': 'ModelX',
        'sku': 'SKU-001',
        'category': 'Laptops',
        'price': '50000',
        'original_price': '',
        'discount_percentage': '',
        'currency': 'INR',
        'description': 'This is a detailed description of the laptop that needs to be at least fifty words long to satisfy the validation checks of the product model without raising an exception during tests.',
        'short_description': 'Concise laptop desc',
        'specifications_json': '{"RAM": "8 GB"}',
        'rating': '4.5',
        'review_count': '',
        'stock': '10',
        'warranty': '1 year',
        'use_cases_json': '["Coding", "College"]',
        'tags_json': '["laptop", "test", "portable", "device"]',
        'images_json': '["/img.png"]',
        'color_options_json': '',
        'highlights_json': '',
        'featured': 'true',
        'created_at': '2026-07-01T10:00:00.000Z',
        'updated_at': '2026-08-01T10:00:00.000Z'
    }
    
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerow(row)
        
    products, errors = load_products_from_csv(str(csv_file))
    assert len(products) == 1
    assert len(errors) == 0
    assert products[0].product_id == "LAP-999"
    assert products[0].sku == "SKU-001"
