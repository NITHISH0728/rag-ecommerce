import re

# Custom exception for prompt injection
class PromptInjectionDetectedError(ValueError):
    pass

# Suspicious phrases associated with prompt injection or bypass attempts
SUSPICIOUS_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"reveal\s+(your\s+)?(system\s+)?prompt",
    r"output\s+(your\s+)?(system\s+)?prompt",
    r"print\s+(your\s+)?(system\s+)?prompt",
    r"forget\s+(all\s+)?(previous\s+)?instructions",
    r"bypass\s+grounding",
    r"system\s+rules",
    r"system\s+prompt",
    r"you\s+are\s+now\s+a\s+different\s+assistant",
    r"act\s+as\s+a\s+developer",
    r"pretend\s+the\s+price\s+is",
    r"fake\s+price",
    r"secret\s+key",
    r"api_key",
    r"groq_api_key",
    r"openai_api_key",
    r"show\s+the\s+prompt"
]

def scan_for_prompt_injection(message: str) -> None:
    """
    Scans the user query for prompt injection markers.
    Raises PromptInjectionDetectedError if a risk is detected.
    """
    msg_lower = message.lower()
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, msg_lower):
            raise PromptInjectionDetectedError("Potential prompt injection attempt or system command detected. Query rejected.")
