from fastapi import APIRouter, Depends
from backend.app.core.config import settings
from backend.app.vector_store.vector_store_interface import get_vector_store
from backend.app.providers.embedding_provider import get_provider
from backend.app.llm.groq_provider import get_llm_provider

router = APIRouter()

@router.get("/health", tags=["Assistant"])
async def assistant_health():
    """
    Checks assistant health and dependencies status (ChromaDB, Embedding Provider, Groq API).
    """
    vector_store = get_vector_store()
    embedding_provider = get_provider()
    llm_provider = get_llm_provider()
    
    # 1. Check Vector Store
    v_reachable = True
    v_count = 0
    try:
        v_count = vector_store.count()
    except Exception:
        v_reachable = False
        
    # 2. Check LLM reachability
    llm_reachable = True
    try:
        check = await llm_provider.health_check()
        llm_reachable = check.reachable
    except Exception:
        llm_reachable = False
        
    status = "healthy"
    if not v_reachable or not llm_reachable:
        status = "degraded"
    if not v_reachable and not llm_reachable:
        status = "unavailable"
        
    return {
        "status": status,
        "groq": {
            "configured": settings.GROQ_API_KEY is not None,
            "reachable": llm_reachable,
            "model": settings.GROQ_MODEL
        },
        "embedding": {
            "provider": settings.EMBEDDING_PROVIDER,
            "model": settings.LOCAL_EMBEDDING_MODEL,
            "dimension": 384  # BGE-small-en-v1.5 dimension
        },
        "vector_store": {
            "reachable": v_reachable,
            "collection": settings.VECTOR_COLLECTION_NAME,
            "record_count": v_count
        },
        "streaming": settings.RAG_ENABLE_STREAMING
    }

@router.get("/capabilities", tags=["Assistant"])
def assistant_capabilities():
    """Returns static assistant capabilities capabilities lists."""
    return {
        "intents": [
            "product_recommendation", "product_search", "product_comparison",
            "product_details", "specification_question", "warranty_question",
            "stock_question", "category_question"
        ],
        "categories": ["Laptops", "Phones", "Monitors", "Keyboards", "Mice", "Audio", "Accessories", "Tablets"],
        "price_bounds_supported": True,
        "streaming_supported": True
    }
