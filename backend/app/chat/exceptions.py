class ChatError(Exception):
    """Base exception for all chat-related errors."""
    pass
class ChatValidationError(ChatError):
    """Raised when request message fails input validation constraints."""
    pass

class ConversationNotFoundError(ChatError):
    """Raised when conversation ID is missing or invalid."""
    pass

class SessionExpiredError(ChatError):
    """Raised when session TTL has expired."""
    pass

class MessageTooLongError(ChatError):
    """Raised when user message exceeds length limits."""
    pass
