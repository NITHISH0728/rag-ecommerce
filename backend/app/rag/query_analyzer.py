import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class QueryAnalysis(BaseModel):
    intent: str
    category: Optional[str] = None
    maximum_price: Optional[float] = None
    minimum_price: Optional[float] = None
    brand: Optional[str] = None
    minimum_rating: Optional[float] = None
    stock_status: Optional[str] = None
    use_cases: List[str] = []
    keywords: List[str] = []
    comparison_product_ids: List[str] = []
    featured: Optional[bool] = None
    requires_retrieval: bool = True

# List of supported categories matching the catalog taxonomy
CATEGORIES = ["Laptops", "Phones", "Monitors", "Keyboards", "Mice", "Audio", "Accessories", "Tablets"]
# List of known brands from catalog to resolve directly
BRANDS = [
    "Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "Samsung", "OnePlus",
    "Google", "Xiaomi", "Logitech", "Razer", "Keychron", "Corsair", "SteelSeries",
    "Sony", "Bose", "Sennheiser", "Audio-Technica", "JBL", "Anker"
]

def parse_price_value(value_str: str, multiplier_str: str) -> float:
    """Parses a price string value and multiplier (k, lakh, thousand) into a float."""
    # Strip commas
    val = float(value_str.replace(",", ""))
    mult = multiplier_str.lower().strip()
    
    if mult == "k" or mult == "thousand":
        return val * 1000
    if mult == "lakh":
        return val * 100000
    return val

def analyze_query_deterministically(message: str) -> QueryAnalysis:
    """
    Parses intent, filters, use cases, and stock requirements from the user query
    using deterministic regular expressions.
    """
    msg_lower = message.lower()
    
    # 1. Intent Classification
    intent = "product_recommendation"
    requires_retrieval = True
    
    # Greetings check
    if re.search(r"\b(hi|hello|hey|greetings|good\s+morning|good\s+afternoon)\b", msg_lower):
        intent = "greeting"
        requires_retrieval = False
    elif re.search(r"\b(help|what\s+can\s+you\s+do|features|capabilities)\b", msg_lower):
        intent = "help"
        requires_retrieval = False
    elif "compare" in msg_lower or "versus" in msg_lower or " vs " in msg_lower:
        intent = "product_comparison"
    elif "warranty" in msg_lower:
        intent = "warranty_question"
    elif "stock" in msg_lower or "available" in msg_lower:
        intent = "stock_question"
    elif "details" in msg_lower or "tell me about" in msg_lower or "specs of" in msg_lower:
        intent = "product_details"

    # 2. Extract Category
    category = None
    for cat in CATEGORIES:
        # Match singular/plural categories case-insensitively
        cat_pat = cat.lower()[:-1] if cat.lower().endswith("s") else cat.lower()
        if cat_pat in msg_lower:
            category = cat
            break
    # Special synonyms
    if "mouse" in msg_lower:
        category = "Mice"
    if "headphone" in msg_lower or "earbud" in msg_lower or "speaker" in msg_lower:
        category = "Audio"
    
    # Laptop series detection
    laptop_series = ["inspiron", "pavilion", "thinkpad", "macbook", "legion", "zephyrus", "yoga", "zenbook", "envy"]
    if category is None:
        for series in laptop_series:
            if series in msg_lower:
                category = "Laptops"
                break

    # 3. Extract Brand
    brand = None
    for b in BRANDS:
        if b.lower() in msg_lower:
            brand = b
            break

    # 4. Extract Price Constraints (under, below, cheap, max)
    maximum_price = None
    minimum_price = None
    
    # Match price range: "between 50000 and 70000" or "50k to 70k"
    range_match = re.search(
        r"between\s+(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|lakh|thousand)?\s+and\s+(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|lakh|thousand)?",
        msg_lower
    )
    if range_match:
        val1, mult1, val2, mult2 = range_match.groups()
        minimum_price = parse_price_value(val1, mult1 or "")
        maximum_price = parse_price_value(val2, mult2 or "")
    else:
        # Match maximum price bounds
        max_price_match = re.search(
            r"(?:under|below|less\s+than|budget|max|maximum|up\s+to|cheaper\s+than)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|lakh|thousand)?",
            msg_lower
        )
        if max_price_match:
            val, mult = max_price_match.groups()
            maximum_price = parse_price_value(val, mult or "")
            
        # Match minimum price bounds
        min_price_match = re.search(
            r"(?:above|over|more\s+than|minimum|at\s+least|starting\s+from)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|lakh|thousand)?",
            msg_lower
        )
        if min_price_match:
            val, mult = min_price_match.groups()
            minimum_price = parse_price_value(val, mult or "")

    # Match direct values like "under 1 lakh" or "₹60,000"
    if maximum_price is None:
        lakh_max = re.search(r"under\s+(\d+(?:\.\d+)?)\s*lakh", msg_lower)
        if lakh_max:
            maximum_price = float(lakh_max.group(1)) * 100000
        else:
            k_max = re.search(r"under\s+(\d+(?:\.\d+)?)\s*k", msg_lower)
            if k_max:
                maximum_price = float(k_max.group(1)) * 1000

    # 5. Extract Ratings: "above 4 stars", "4+ stars", "> 4.5"
    minimum_rating = None
    rating_match = re.search(r"(?:above|over|minimum|at\s+least|>\s*=?)\s*(\d+(?:\.\d+)?)\s*(?:star|\+)?", msg_lower)
    if rating_match:
        minimum_rating = float(rating_match.group(1))
    elif re.search(r"(\d+(?:\.\d+)?)\s*\+\s*(?:star|rating)", msg_lower):
        r_m = re.search(r"(\d+(?:\.\d+)?)\s*\+\s*(?:star|rating)", msg_lower)
        if r_m:
            minimum_rating = float(r_m.group(1))

    # 6. Extract Stock status requirements: "in stock", "available"
    stock_status = None
    if "out of stock" in msg_lower or "unavailable" in msg_lower:
        stock_status = "out_of_stock"
    elif "in stock" in msg_lower or "available" in msg_lower or "buy now" in msg_lower:
        stock_status = "in_stock"

    # 7. Extract Use Cases (Coding, College, Office, Gaming, Video Editing)
    use_cases = []
    if "coding" in msg_lower or "programming" in msg_lower or "developer" in msg_lower:
        use_cases.append("Coding")
    if "college" in msg_lower or "student" in msg_lower or "school" in msg_lower:
        use_cases.append("College")
    if "office" in msg_lower or "work" in msg_lower or "productivity" in msg_lower:
        use_cases.append("Office work")
    if "gaming" in msg_lower or "game" in msg_lower or "player" in msg_lower:
        use_cases.append("Gaming")
    if "video editing" in msg_lower or "creator" in msg_lower or "graphics" in msg_lower:
        use_cases.append("Video editing")
    if "travel" in msg_lower or "portable" in msg_lower or "lightweight" in msg_lower:
        use_cases.append("Travel")

    # 8. Extract Keywords
    keywords = [w for w in re.findall(r"\b\w{3,}\b", msg_lower) if w not in ["and", "for", "the", "with", "under"]]

    # 9. Extract explicit Product IDs references (e.g. LAP-001, MOU-005)
    product_ids = [pid.upper() for pid in re.findall(r"\b[a-zA-Z]{3}-\d{3}\b", message)]

    return QueryAnalysis(
        intent=intent,
        category=category,
        maximum_price=maximum_price,
        minimum_price=minimum_price,
        brand=brand,
        minimum_rating=minimum_rating,
        stock_status=stock_status,
        use_cases=use_cases,
        keywords=keywords,
        comparison_product_ids=product_ids,
        requires_retrieval=requires_retrieval
    )
