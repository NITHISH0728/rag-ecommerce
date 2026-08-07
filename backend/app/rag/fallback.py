from typing import Optional, List
from backend.app.chat.models import ChatResponse, AppliedFilters

def generate_no_match_response(
    conversation_id: str,
    message_id: str,
    category: Optional[str] = None,
    maximum_price: Optional[float] = None,
    brand: Optional[str] = None,
    stock_status: Optional[str] = None,
    use_cases: Optional[List[str]] = None
) -> ChatResponse:
    """
    Generates a deterministic natural-language fallback response when no products match.
    Provides clear reasoning and recommendations for relaxed constraints.
    """
    constraints = []
    relaxations = []
    
    if category:
        constraints.append(f"category: {category}")
    if maximum_price:
        constraints.append(f"price at or below ₹{maximum_price:,.2f}")
        relaxations.append("increase your budget limit")
    if brand:
        constraints.append(f"brand: {brand}")
        relaxations.append("allow other technology brands")
    if stock_status == "in_stock":
        constraints.append("in-stock availability")
        relaxations.append("allow out-of-stock products")
    if use_cases:
        constraints.append(f"use cases: {', '.join(use_cases)}")
        relaxations.append("relax use case filters")

    constraints_str = ", ".join(constraints) if constraints else "current query constraints"
    relaxation_suggestion = ""
    if relaxations:
        relaxation_suggestion = f" You can try to: {', '.join(relaxations)} to see matching options."

    answer = (
        f"No products in the catalog satisfied all of these criteria: {constraints_str}."
        f"{relaxation_suggestion} Let me know if you would like to browse general catalog items instead."
    )

    applied = AppliedFilters(
        category=category,
        brand=brand,
        maximum_price=maximum_price,
        stock_status=stock_status
    )

    return ChatResponse(
        conversation_id=conversation_id,
        message_id=message_id,
        answer=answer,
        citations=[],
        products=[],
        applied_filters=applied.model_dump(exclude_none=True),
        retrieval_status="no_match",
        grounded=True,
        follow_up_suggestions=["Show general catalog products", "Cheapest laptops available"]
    )
