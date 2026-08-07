import re
from backend.app.core.config import settings
from backend.app.chat.exceptions import ChatValidationError

def normalize_and_validate_message(message: str) -> str:
    """
    Validates, strips, and normalizes user message text.
    Handles length checks, empty checks, and currency preservation.
    """
    if not message:
        raise ChatValidationError("Message cannot be empty.")
        
    # Check length
    if len(message) > settings.CHAT_MAX_MESSAGE_LENGTH:
        raise ChatValidationError(f"Message length exceeds the limit of {settings.CHAT_MAX_MESSAGE_LENGTH} characters.")
        
    # Strip leading/trailing whitespace
    cleaned = message.strip()
    if not cleaned:
        raise ChatValidationError("Message cannot contain only whitespace.")

    # Reject binary / control characters (preserve tab, newline, carriage return, and printable)
    # Check for invalid characters using regex
    if re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", cleaned):
        raise ChatValidationError("Binary or control character sequences are not allowed in queries.")
        
    # Normalize multiple space sequences to a single space
    cleaned = re.sub(r"\s+", " ", cleaned)
    
    # We do NOT lowercase the query to preserve model names (e.g. LAP-001) and specifications
    return cleaned
