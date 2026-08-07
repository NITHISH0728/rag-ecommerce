from typing import Dict, Any, List
from backend.app.vector_store.models import VectorSearchResult

def map_search_result_to_api(result: VectorSearchResult) -> Dict[str, Any]:
    """
    Maps a VectorSearchResult model into a clean dictionary structure
    for public API presentation (hiding system specifics if necessary,
    and reconstructing array structures from flattened strings).
    """
    meta = result.metadata
    
    # Reconstruct array tags/use-cases from pipe-delimited strings
    use_cases = []
    if "use_cases" in meta:
        uc_val = meta["use_cases"]
        if isinstance(uc_val, str) and uc_val.strip():
            use_cases = [x.strip() for x in uc_val.split("|") if x.strip()]
            
    tags = []
    if "tags" in meta:
        tag_val = meta["tags"]
        if isinstance(tag_val, str) and tag_val.strip():
            tags = [x.strip() for x in tag_val.split("|") if x.strip()]

    # Format output dictionary conforming to frontend expectations
    return {
        "id": result.id,
        "productId": result.product_id,
        "name": meta.get("name", ""),
        "slug": meta.get("slug", ""),
        "brand": meta.get("brand", ""),
        "category": meta.get("category", ""),
        "price": meta.get("price"),
        "currency": meta.get("currency", "INR"),
        "rating": meta.get("rating"),
        "stock": meta.get("stock"),
        "stockStatus": meta.get("stock_status"),
        "warranty": meta.get("warranty"),
        "featured": meta.get("featured"),
        "useCases": use_cases,
        "tags": tags,
        "documentExcerpt": result.document,
        "similarityScore": result.similarity_score,
        "rank": result.rank
    }

def map_search_results_to_api(results: List[VectorSearchResult]) -> List[Dict[str, Any]]:
    return [map_search_result_to_api(r) for r in results]
