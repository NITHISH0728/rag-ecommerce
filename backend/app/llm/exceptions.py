class LLMError(Exception):
    """Base exception for all LLM errors."""
    pass

class LLMConfigurationError(LLMError):
    """Raised when LLM configuration is missing or invalid."""
    pass

class LLMConnectionError(LLMError):
    """Raised when connection to the LLM API fails."""
    pass

class LLMTimeoutError(LLMError):
    """Raised when the LLM request times out."""
    pass

class LLMRateLimitError(LLMError):
    """Raised when LLM requests are rate-limited."""
    pass

class LLMResponseParsingError(LLMError):
    """Raised when LLM output cannot be parsed into expected structure."""
    pass
