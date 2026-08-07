from typing import List, Set
from backend.app.models.product import Product

def validate_dataset_uniqueness(products: List[Product]) -> List[str]:
    """
    Validate uniqueness constraints across the entire product list.
    Checks:
    - Unique product_id
    - Unique slug
    - Unique sku (where SKU is specified and not empty)
    
    Returns a list of validation error descriptions.
    """
    errors: List[str] = []
    
    seen_ids: Set[str] = set()
    seen_slugs: Set[str] = set()
    seen_skus: Set[str] = set()
    
    for p in products:
        # Check Product ID
        if p.product_id in seen_ids:
            errors.append(f"Duplicate product_id found: '{p.product_id}'")
        else:
            seen_ids.add(p.product_id)
            
        # Check Slug
        slug_lower = p.slug.lower()
        if slug_lower in seen_slugs:
            errors.append(f"Duplicate slug found: '{p.slug}' (casing ignored)")
        else:
            seen_slugs.add(slug_lower)
            
        # Check SKU
        if p.sku:
            sku_lower = p.sku.lower().strip()
            if sku_lower:
                if sku_lower in seen_skus:
                    errors.append(f"Duplicate SKU found: '{p.sku}' (casing ignored)")
                else:
                    seen_skus.add(sku_lower)
                    
    return errors
