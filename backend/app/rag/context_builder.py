import logging
from typing import List, Dict, Any, Tuple, Optional
from backend.app.core.config import settings
from backend.app.vector_store.models import VectorSearchResult

logger = logging.getLogger("shopsmart-context-builder")

def build_rag_context(
    results: List[VectorSearchResult],
    maximum_price: Optional[float] = None,
    use_cases: Optional[List[str]] = None
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Builds a structured context string from ranked VectorSearchResults.
    Limits context characters to settings.RAG_MAX_CONTEXT_CHARACTERS.
    Returns: (context_string, product_citation_manifest)
    """
    if not results:
        return "No retrieved catalog products match the query.", []

    manifest = []
    paragraphs = []
    
    # We assign stable labels: P1, P2, P3...
    for idx, item in enumerate(results):
        label = f"P{idx + 1}"
        meta = item.metadata
        
        # Build structured representation
        prod_id = item.product_id or str(meta.get("product_id", ""))
        name = meta.get("name", "")
        brand = meta.get("brand", "")
        category = meta.get("category", "")
        price = meta.get("price")
        rating = meta.get("rating")
        stock_status = meta.get("stock_status", "in_stock")
        stock_qty = meta.get("stock", 0)
        warranty = meta.get("warranty", "Not specified")
        
        # Parse tags & use-cases back
        p_use_cases = [x.strip() for x in str(meta.get("use_cases", "")).split("|") if x.strip()]
        p_tags = [x.strip() for x in str(meta.get("tags", "")).split("|") if x.strip()]

        spec_lines = []
        # Try to locate specs in the document or split lines
        doc_lines = item.document.split("\n")
        specs_started = False
        for line in doc_lines:
            if "specifications" in line.lower() or "specs:" in line.lower():
                specs_started = True
                continue
            if specs_started and line.strip().startswith("-"):
                spec_lines.append(line.strip())
            elif specs_started and not line.strip().startswith("-") and line.strip():
                # End of specs
                break

        specs_str = "\n".join(spec_lines) if spec_lines else "- Not detailed in catalog"

        p_text = f"[{label}]\n"
        p_text += f"Product ID: {prod_id}\n"
        p_text += f"Name: {name}\n"
        p_text += f"Brand: {brand}\n"
        p_text += f"Category: {category}\n"
        p_text += f"Price: INR {price}\n"
        p_text += f"Rating: {rating}\n"
        p_text += f"Stock Status: {stock_status}\n"
        p_text += f"Stock Quantity: {stock_qty}\n"
        p_text += f"Warranty: {warranty}\n"
        p_text += f"Description Excerpt: {item.document[:300]}...\n"
        p_text += f"Specifications:\n{specs_str}\n"
        if p_use_cases:
            p_text += f"Use Cases:\n" + "\n".join([f"- {uc}" for uc in p_use_cases]) + "\n"
        if p_tags:
            p_text += f"Tags:\n" + "\n".join([f"- {t}" for t in p_tags]) + "\n"
        p_text += f"Source Chunk: {item.id}\n"
        
        # Check if adding this paragraph exceeds character limits
        current_context_len = sum(len(p) for p in paragraphs) + len(p_text)
        if current_context_len > settings.RAG_MAX_CONTEXT_CHARACTERS:
            logger.warning(f"RAG context limit reached. Excluding lower-ranked product '{prod_id}' from prompt.")
            break
            
        paragraphs.append(p_text)
        
        # Extract matched sections for citation
        matched_sections = ["overview"]
        if spec_lines:
            matched_sections.append("specifications")
            
        manifest.append({
            "citation_id": label,
            "product_id": prod_id,
            "product_name": name,
            "slug": meta.get("slug", ""),
            "chunk_ids": [item.id],
            "matched_sections": matched_sections
        })

    context_str = "RETRIEVED PRODUCT CATALOG CONTEXT\n\n" + "\n\n".join(paragraphs)
    
    # Append hard filters context
    context_str += "\n\nUSER CONSTRAINTS\n"
    if category:
        context_str += f"- Category: {category}\n"
    if maximum_price:
        context_str += f"- Maximum Price: INR {maximum_price}\n"
    if use_cases:
        context_str += "- Required Use Cases:\n" + "\n".join([f"  - {uc}" for uc in use_cases]) + "\n"
        
    return context_str, manifest
