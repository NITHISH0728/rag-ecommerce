from typing import List, Dict, Any
from backend.app.chat.models import ProductCitation

def build_product_citations(
    citations_manifest: List[Dict[str, Any]]
) -> List[ProductCitation]:
    """
    Constructs public ProductCitation schemas for the frontend to consume.
    """
    citations = []
    for item in citations_manifest:
        citations.append(
            ProductCitation(
                citation_id=item["citation_id"],
                product_id=item["product_id"],
                product_name=item["product_name"],
                slug=item["slug"],
                chunk_ids=item["chunk_ids"],
                matched_sections=item["matched_sections"],
                source_type="product_catalog",
                source_label="Product catalog"
            )
        )
    return citations
