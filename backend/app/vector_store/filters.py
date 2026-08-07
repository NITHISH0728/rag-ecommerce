from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class VectorSearchFilters(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    minimum_price: Optional[float] = None
    maximum_price: Optional[float] = None
    minimum_rating: Optional[float] = None
    stock_status: Optional[str] = None
    featured: Optional[bool] = None
    product_id: Optional[str] = None
    slug: Optional[str] = None
    warranty: Optional[str] = None
    tags: Optional[str] = None
    use_cases: Optional[str] = None

def build_chroma_where(filters: Optional[VectorSearchFilters]) -> Optional[Dict[str, Any]]:
    """
    Translates VectorSearchFilters into a ChromaDB-compatible 'where' clause dictionary.
    Handles single filters directly and combines multiple filters using the '$and' operator.
    """
    if not filters:
        return None

    conditions: List[Dict[str, Any]] = []

    # Direct equals matching
    if filters.category:
        conditions.append({"category": filters.category})
    if filters.brand:
        conditions.append({"brand": filters.brand})
    if filters.stock_status:
        conditions.append({"stock_status": filters.stock_status})
    if filters.featured is not None:
        conditions.append({"featured": filters.featured})
    if filters.product_id:
        conditions.append({"product_id": filters.product_id})
    if filters.slug:
        conditions.append({"slug": filters.slug})
    if filters.warranty:
        conditions.append({"warranty": filters.warranty})

    # Numeric range/comparison matching
    if filters.minimum_price is not None:
        conditions.append({"price": {"$gte": int(filters.minimum_price)}})
    if filters.maximum_price is not None:
        conditions.append({"price": {"$lte": int(filters.maximum_price)}})
    if filters.minimum_rating is not None:
        conditions.append({"rating": {"$gte": float(filters.minimum_rating)}})

    # Note: tags and use_cases are stored in ChromaDB metadata as "|"-joined strings.
    # Because ChromaDB where operators do not support a substring contains operator natively,
    # we filter tags/use_cases exactly if they are supplied.
    if filters.tags:
        conditions.append({"tags": filters.tags})
    if filters.use_cases:
        conditions.append({"use_cases": filters.use_cases})

    if not conditions:
        return None

    if len(conditions) == 1:
        return conditions[0]

    return {"$and": conditions}
