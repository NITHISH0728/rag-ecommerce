import logging
from typing import List, Dict, Any, Optional
from backend.app.chat.history import ConversationSession

logger = logging.getLogger("shopsmart-rewriter")

def rewrite_query_with_context(
    message: str,
    session: ConversationSession
) -> str:
    """
    Rewrites short or reference-based user queries (e.g., "Which is better?", "hp options")
    by incorporating context from the conversation history (e.g., active product IDs, category).
    """
    msg_lower = message.lower()
    recent_msgs = session.get_recent_messages()
    
    # If there is no conversation history, nothing to rewrite
    if not recent_msgs:
        return message

    last_recommended = session.get_last_recommended_product_ids()
    last_filters = session.get_last_applied_filters()
    
    # 1. Handle explicit comparison of previous items: "Compare them", "Which is better?"
    if any(phrase in msg_lower for phrase in ["which is better", "which one is better", "compare them", "compare the top two", "first two"]):
        if last_recommended:
            products_str = ", ".join(last_recommended[:3])
            rewritten = f"Compare specifications, pros and cons of products: {products_str}"
            logger.info(f"Rewrote query to comparison: '{rewritten}'")
            return rewritten

    # 2. Handle specific field checks on previous product references: "does the first one have 16gb ram?", "warranty of the second"
    ref_match = None
    if "first one" in msg_lower or "cheapest one" in msg_lower:
        ref_match = 0
    elif "second one" in msg_lower or "alternative" in msg_lower:
        ref_match = 1 if len(last_recommended) > 1 else 0
    elif "third one" in msg_lower:
        ref_match = 2 if len(last_recommended) > 2 else None

    if ref_match is not None and last_recommended:
        pid = last_recommended[ref_match]
        # Rewrite to combine query and referenced product ID
        rewritten = f"Product ID {pid}: {message}"
        logger.info(f"Rewrote query for product reference '{pid}': '{rewritten}'")
        return rewritten

    # 3. Handle brand/constraint modifications on top of previous filters: "Only HP", "show Dell options"
    # Check if this is a short query indicating a constraint change (e.g. <= 4 words)
    words = msg_lower.split()
    if len(words) <= 4 and last_filters.get("category"):
        category = last_filters["category"]
        rewritten = f"Recommend {message} in category {category}"
        logger.info(f"Rewrote query with category context '{category}': '{rewritten}'")
        return rewritten

    # Default to returning the original query if no rewriting rules are matched
    return message
