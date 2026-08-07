import re
from typing import List, Tuple, Dict
from backend.app.models.product import Product, SpecificationValue

def clean_whitespace(val: str) -> str:
    if not val:
        return ""
    # Strip leading/trailing and collapse internal multiple spaces into single space
    return re.sub(r'\s+', ' ', val.strip())

def normalize_product(p: Product) -> Tuple[Product, List[str]]:
    """
    Normalizes a Product record's attributes.
    Returns the normalized Product model instance and a list of warning strings.
    """
    warnings: List[str] = []
    
    # 1. Name & Brand
    clean_name = clean_whitespace(p.name)
    if clean_name != p.name:
        warnings.append(f"Product {p.product_id}: Normalized name spacing.")
        
    clean_brand = clean_whitespace(p.brand)
    
    # 2. Category normalization
    clean_cat = clean_whitespace(p.category)
    allowed_categories = {
        "Laptops", "Smartphones", "Tablets", "Monitors",
        "Keyboards", "Mice", "Headphones", "Accessories"
    }
    
    # Match case-insensitively to auto-fix casing
    cat_match = None
    for allowed in allowed_categories:
        if clean_cat.lower() == allowed.lower():
            cat_match = allowed
            break
            
    if cat_match:
        if clean_cat != cat_match:
            warnings.append(f"Product {p.product_id}: Normalized category casing from '{p.category}' to '{cat_match}'.")
            clean_cat = cat_match
    else:
        # If no match, leave it for Pydantic/Validator to reject, but clean whitespace
        pass

    # 3. Model & SKU
    clean_model = clean_whitespace(p.model) if p.model else None
    clean_sku = clean_whitespace(p.sku) if p.sku else None

    # 4. Description & Short Description
    clean_desc = clean_whitespace(p.description)
    clean_short_desc = clean_whitespace(p.short_description)

    # 5. Specifications
    clean_specs: Dict[str, SpecificationValue] = {}
    for k, v in p.specifications.items():
        clean_key = clean_whitespace(k)
        if isinstance(v, str):
            clean_val: SpecificationValue = clean_whitespace(v)
        else:
            clean_val = v
        clean_specs[clean_key] = clean_val

    # 6. Warranty
    clean_warranty = clean_whitespace(p.warranty)

    # 7. Use cases
    clean_use_cases: List[str] = []
    seen_use_cases = set()
    for uc in p.use_cases:
        cleaned_uc = clean_whitespace(uc)
        if cleaned_uc and cleaned_uc.lower() not in seen_use_cases:
            clean_use_cases.append(cleaned_uc)
            seen_use_cases.add(cleaned_uc.lower())
    if len(clean_use_cases) != len(p.use_cases):
        warnings.append(f"Product {p.product_id}: Removed duplicate use cases.")

    # 8. Tags
    # Normalize to lowercase and replace spaces/underscores with hyphens
    clean_tags: List[str] = []
    seen_tags = set()
    for tag in p.tags:
        # Strip, lowercase, replace spaces/underscores/etc with single hyphen
        t_cleaned = tag.strip().lower()
        t_cleaned = re.sub(r'[\s_]+', '-', t_cleaned)
        t_cleaned = re.sub(r'-+', '-', t_cleaned) # collapse multiple hyphens
        
        if t_cleaned and t_cleaned not in seen_tags:
            clean_tags.append(t_cleaned)
            seen_tags.add(t_cleaned)
            
    if clean_tags != p.tags:
        warnings.append(f"Product {p.product_id}: Normalized tag casing/characters.")

    # 9. Optional fields color_options & highlights
    clean_colors = [clean_whitespace(c) for c in p.color_options] if p.color_options else None
    clean_highlights = [clean_whitespace(h) for h in p.highlights] if p.highlights else None

    # Return a new Product instance with normalized attributes
    normalized = Product(
        productId=p.product_id,
        name=clean_name,
        slug=p.slug, # Slugs must not change unless invalid, keep it as is
        brand=clean_brand,
        model=clean_model,
        sku=clean_sku,
        category=clean_cat,
        price=p.price,
        originalPrice=p.original_price,
        discountPercentage=p.discount_percentage,
        currency=p.currency,
        description=clean_desc,
        shortDescription=clean_short_desc,
        specifications=clean_specs,
        rating=p.rating,
        reviewCount=p.review_count,
        stock=p.stock,
        warranty=clean_warranty,
        useCases=clean_use_cases,
        tags=clean_tags,
        images=p.images, # Keep image paths exactly as is
        colorOptions=clean_colors,
        highlights=clean_highlights,
        featured=p.featured,
        createdAt=p.created_at,
        updatedAt=p.updated_at
    )
    
    return normalized, warnings
