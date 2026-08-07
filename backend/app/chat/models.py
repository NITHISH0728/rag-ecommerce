from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AppliedFilters(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    minimum_price: Optional[float] = None
    maximum_price: Optional[float] = None
    minimum_rating: Optional[float] = None
    stock_status: Optional[str] = None
    featured: Optional[bool] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None
    filters: Optional[AppliedFilters] = None
    stream: bool = True
    selected_product_ids: Optional[List[str]] = None
    locale: Optional[str] = None

class ProductCitation(BaseModel):
    citation_id: str
    product_id: str
    product_name: str
    slug: str
    chunk_ids: List[str]
    matched_sections: List[str]
    source_type: str = "product_catalog"
    source_label: str = "Product catalog"

class RecommendedProduct(BaseModel):
    product_id: str
    slug: str
    name: str
    brand: str
    category: str
    price: int
    currency: str = "INR"
    rating: float
    stock: int
    stock_status: str
    warranty: str
    image: str
    reason: str

class RetrievalDebugInfo(BaseModel):
    chunks_retrieved: int
    unique_products_retrieved: int
    query_rewritten: Optional[str] = None
    retrieval_duration_ms: float

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    citations: List[ProductCitation] = []
    products: List[RecommendedProduct] = []
    applied_filters: Dict[str, Any] = {}
    retrieval_status: str  # "success", "no_match", "partial_match", "failed"
    grounded: bool = True
    follow_up_suggestions: List[str] = []
    debug_info: Optional[RetrievalDebugInfo] = None

class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    applied_filters: Optional[Dict[str, Any]] = None
    recommended_product_ids: Optional[List[str]] = None
    citation_ids: Optional[List[str]] = None

class ChatStreamEvent(BaseModel):
    event: str  # "token", "citations", "products", "completed", "error", etc.
    data: Any
