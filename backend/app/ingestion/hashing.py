import json
import hashlib
from typing import Any, Dict

def calculate_text_hash(text: str) -> str:
    """
    Computes a stable SHA-256 hash of a string.
    """
    stripped_text = text.strip()
    return hashlib.sha256(stripped_text.encode("utf-8")).hexdigest()

def calculate_dict_hash(data: Dict[str, Any], ignore_keys: list = None) -> str:
    """
    Computes a stable SHA-256 hash of a dictionary by sorting keys.
    Optional ignore_keys can be passed to exclude volatile fields (e.g. timestamps).
    """
    if ignore_keys is None:
        ignore_keys = []
        
    filtered = {
        k: v for k, v in data.items() 
        if k not in ignore_keys
    }
    
    # Serialize to deterministic JSON string by sorting keys
    serialized = json.dumps(filtered, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
