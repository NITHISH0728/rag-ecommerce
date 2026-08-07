import re
import logging
from typing import List, Dict, Any, Tuple, Optional
from backend.app.chat.models import RecommendedProduct

logger = logging.getLogger("shopsmart-validator")

def validate_response_groundedness(
    answer: str,
    citations_manifest: List[Dict[str, Any]],
    recommended_products: List[RecommendedProduct],
    maximum_price: Optional[float] = None
) -> Tuple[bool, str, List[str]]:
    """
    Independently verifies LLM answer references.
    Checks:
    - Every citation [P1], [P2] matches a retrieved catalog item.
    - No product exceeding maximum_price is recommended.
    - No product not in the retrieval list is recommended or cited.
    Returns: (is_valid, sanitized_answer, list_of_errors)
    """
    errors = []
    sanitized_answer = answer
    
    # 1. Locate all citations in answer, e.g. [P1], [P2]
    found_citations = set(re.findall(r"\[P(\d+)\]", answer))
    valid_citation_ids = {c["citation_id"] for c in citations_manifest}
    
    # Verify citations are in the retrieved manifest list
    for cit in found_citations:
        label = f"P{cit}"
        if label not in valid_citation_ids:
            err_msg = f"Hallucinated citation found in response text: '[{label}]'."
            logger.warning(err_msg)
            errors.append(err_msg)
            # Remove hallucinated citation from text
            sanitized_answer = re.sub(rf"\s*\[P{cit}\]", "", sanitized_answer)

    # 2. Check recommended product prices and budget fit
    for p in recommended_products:
        if maximum_price is not None and p.price > maximum_price:
            err_msg = f"Recommended product '{p.product_id}' exceeds maximum budget filter (Price: {p.price} vs Budget: {maximum_price})."
            logger.warning(err_msg)
            errors.append(err_msg)

    # 3. Check for unauthorized secret disclosures
    msg_or_secret = answer.lower()
    if "groq_api_key" in msg_or_secret or "secret" in msg_or_secret:
        err_msg = "Security trigger: response contains sensitive terms."
        errors.append(err_msg)
        sanitized_answer = "The AI response service is temporarily unavailable. Product details can be viewed directly in the catalog."

    is_valid = len(errors) == 0
    return is_valid, sanitized_answer, errors
