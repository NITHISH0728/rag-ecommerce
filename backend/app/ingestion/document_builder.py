from backend.app.models.product import Product

def build_product_document_text(product: Product) -> str:
    """
    Transforms a normalized Product object into a highly structured, deterministic
    RAG document text string.
    """
    lines = []
    
    # 1. Header Information
    lines.append(f"Product Name: {product.name}")
    lines.append(f"Product ID: {product.product_id}")
    lines.append(f"Brand: {product.brand}")
    lines.append(f"Category: {product.category}")
    
    if product.model:
        lines.append(f"Model: {product.model}")
        
    lines.append(f"Price: {product.currency} {product.price}")
    lines.append(f"Rating: {product.rating} out of 5")
    
    # Stock status derivation
    if product.stock == 0:
        availability = "Out of stock"
    elif product.stock <= 5:
        availability = "Low stock"
    else:
        availability = "In stock"
        
    lines.append(f"Availability: {availability}")
    lines.append(f"Stock Quantity: {product.stock}")
    lines.append(f"Warranty: {product.warranty}")
    
    # 2. Descriptions
    lines.append("")
    lines.append("Short Description:")
    lines.append(product.short_description)
    
    lines.append("")
    lines.append("Full Description:")
    lines.append(product.description)
    
    # 3. Specifications
    lines.append("")
    lines.append("Key Specifications:")
    for k, v in product.specifications.items():
        lines.append(f"- {k}: {v}")
        
    # 4. Highlights (if present)
    if product.highlights and len(product.highlights) > 0:
        lines.append("")
        lines.append("Highlights:")
        for h in product.highlights:
            lines.append(f"- {h}")
            
    # 5. Use Cases
    lines.append("")
    lines.append("Recommended Use Cases:")
    for uc in product.use_cases:
        lines.append(f"- {uc}")
        
    # 6. Tags
    lines.append("")
    lines.append("Search Tags:")
    for tag in product.tags:
        lines.append(f"- {tag}")
        
    return "\n".join(lines)
