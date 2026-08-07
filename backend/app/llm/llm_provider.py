from abc import ABC, abstractmethod
from typing import List, AsyncIterator
from backend.app.llm.models import LLMMessage, LLMResponse, LLMStreamChunk, LLMHealthResult

class LLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.1,
        max_tokens: int = 1200
    ) -> LLMResponse:
        """Sends messages to the LLM and returns the final response."""
        pass

    @abstractmethod
    def stream(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.1,
        max_tokens: int = 1200
    ) -> AsyncIterator[LLMStreamChunk]:
        """Streams response tokens from the LLM."""
        pass

    @abstractmethod
    async def health_check(self) -> LLMHealthResult:
        """Verifies if the LLM provider API key and endpoint are working."""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Returns the configured model name."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns the LLM provider name (e.g. 'groq')."""
        pass
