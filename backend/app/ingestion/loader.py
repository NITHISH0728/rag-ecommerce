import os
import json
import csv
from typing import List, Tuple
from pydantic import ValidationError
from backend.app.core.logging_config import logger
from backend.app.models.product import Product

def load_products_from_json(path: str) -> Tuple[List[Product], List[str]]:
    """
    Load and parse products from a JSON file.
    Returns a tuple of (list of valid Product models, list of validation error descriptions).
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"JSON product dataset file not found at: {path}")
    
    logger.info(f"Loading products from JSON: {path}")
    
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Malformed JSON in product dataset: {e.msg}")
            
    if not isinstance(data, list):
        raise ValueError("JSON product dataset must contain a list of products.")
        
    valid_products: List[Product] = []
    errors: List[str] = []
    
    for idx, item in enumerate(data):
        try:
            product = Product.model_validate(item)
            valid_products.append(product)
        except ValidationError as e:
            prod_id = item.get("productId") or item.get("product_id") or f"Index-{idx}"
            err_msg = f"Validation failed for product ID {prod_id}: {e.errors()}"
            errors.append(err_msg)
            logger.warning(err_msg)
            
    return valid_products, errors

def load_products_from_csv(path: str) -> Tuple[List[Product], List[str]]:
    """
    Load and parse products from a CSV file (with JSON-serialized subfields).
    Returns a tuple of (list of valid Product models, list of validation error descriptions).
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV product dataset file not found at: {path}")
        
    logger.info(f"Loading products from CSV fallback: {path}")
    
    valid_products: List[Product] = []
    errors: List[str] = []
    
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        
        for idx, row in enumerate(reader):
            try:
                # Helper to parse JSON strings from cells
                def parse_json_cell(cell_value: str, default):
                    if not cell_value or cell_value.strip() == "":
                        return default
                    try:
                        return json.loads(cell_value)
                    except json.JSONDecodeError:
                        return default

                # Map CSV columns back to Pydantic aliases / names
                mapped = {}
                mapped["productId"] = row.get("product_id")
                mapped["name"] = row.get("name")
                mapped["slug"] = row.get("slug")
                mapped["brand"] = row.get("brand")
                mapped["model"] = row.get("model") if row.get("model") else None
                mapped["sku"] = row.get("sku") if row.get("sku") else None
                mapped["category"] = row.get("category")
                
                # Numeric fields
                mapped["price"] = int(float(row.get("price"))) if row.get("price") else 0
                mapped["originalPrice"] = int(float(row.get("original_price"))) if row.get("original_price") else None
                mapped["discountPercentage"] = int(float(row.get("discount_percentage"))) if row.get("discount_percentage") else None
                mapped["currency"] = row.get("currency", "INR")
                mapped["description"] = row.get("description")
                mapped["shortDescription"] = row.get("short_description")
                
                # Parse JSON fields
                mapped["specifications"] = parse_json_cell(row.get("specifications_json"), {})
                mapped["rating"] = float(row.get("rating")) if row.get("rating") else 0.0
                mapped["reviewCount"] = int(float(row.get("review_count"))) if row.get("review_count") else None
                mapped["stock"] = int(float(row.get("stock"))) if row.get("stock") else 0
                mapped["warranty"] = row.get("warranty")
                
                mapped["useCases"] = parse_json_cell(row.get("use_cases_json"), [])
                mapped["tags"] = parse_json_cell(row.get("tags_json"), [])
                mapped["images"] = parse_json_cell(row.get("images_json"), [])
                mapped["colorOptions"] = parse_json_cell(row.get("color_options_json"), None)
                mapped["highlights"] = parse_json_cell(row.get("highlights_json"), None)
                
                # Featured flag
                feat_str = str(row.get("featured")).lower()
                mapped["featured"] = feat_str in ("true", "1", "yes")
                
                mapped["createdAt"] = row.get("created_at")
                mapped["updatedAt"] = row.get("updated_at")
                
                # Validate using Pydantic model
                product = Product.model_validate(mapped)
                valid_products.append(product)
                
            except Exception as e:
                prod_id = row.get("product_id") or f"Row-{idx+2}"
                err_msg = f"Validation failed for CSV record {prod_id}: {str(e)}"
                errors.append(err_msg)
                logger.warning(err_msg)
                
    return valid_products, errors

def load_products(path: str) -> Tuple[List[Product], List[str]]:
    """
    Load products, automatically detecting file extension (JSON or CSV).
    """
    _, ext = os.path.splitext(path.lower())
    if ext == ".json":
        return load_products_from_json(path)
    elif ext == ".csv":
        return load_products_from_csv(path)
    else:
        raise ValueError(f"Unsupported file extension '{ext}' for dataset loading. Must be .json or .csv")
