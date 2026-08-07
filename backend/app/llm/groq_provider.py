import time
import logging
from typing import List, AsyncIterator, Optional
import groq
from groq import AsyncGroq
from backend.app.core.config import settings
from backend.app.llm.llm_provider import LLMProvider
from backend.app.llm.models import LLMMessage, LLMResponse, LLMStreamChunk, LLMHealthResult
from backend.app.llm.exceptions import (
    LLMConfigurationError, LLMConnectionError,
    LLMTimeoutError, LLMRateLimitError, LLMError
)

logger = logging.getLogger("shopsmart-llm")

class GroqLLMProvider(LLMProvider):
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise LLMConfigurationError("GROQ_API_KEY environment variable is not configured.")
        
        # Initialize client once at service startup
        self.client = AsyncGroq(
            api_key=settings.GROQ_API_KEY,
            timeout=settings.GROQ_TIMEOUT_SECONDS,
            max_retries=settings.GROQ_MAX_RETRIES
        )
        self.model_name = settings.GROQ_MODEL

    def _map_groq_error(self, e: Exception) -> Exception:
        """Helper to map official Groq SDK errors to internal custom errors."""
        if isinstance(e, groq.APIStatusError):
            if e.status_code == 429:
                return LLMRateLimitError(f"Groq API rate limit reached: {e.message}")
            if e.status_code == 408 or "timeout" in str(e).lower():
                return LLMTimeoutError(f"Groq API timeout: {e.message}")
            return LLMConnectionError(f"Groq API connection error: {e.message}")
        if isinstance(e, groq.APITimeoutError):
            return LLMTimeoutError(f"Groq request timed out: {e}")
        if isinstance(e, groq.APIConnectionError):
            return LLMConnectionError(f"Groq connection failure: {e}")
        return LLMError(f"Unhandled LLM error: {e}")

    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.1,
        max_tokens: int = 1200
    ) -> LLMResponse:
        logger.debug(f"Executing Groq completion for model '{self.model_name}' (temp: {temperature})")
        start_time = time.time()
        
        formatted_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
        
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=formatted_messages,
                model=self.model_name,
                temperature=temperature,
                max_tokens=max_tokens
            )
            latency = time.time() - start_time
            content = chat_completion.choices[0].message.content or ""
            return LLMResponse(
                content=content,
                raw_response=chat_completion,
                latency_seconds=latency
            )
        except Exception as e:
            mapped_err = self._map_groq_error(e)
            logger.error(f"Groq generate failure: {mapped_err}")
            raise mapped_err

    async def stream(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.1,
        max_tokens: int = 1200
    ) -> AsyncIterator[LLMStreamChunk]:
        logger.debug(f"Executing Groq streaming completion for model '{self.model_name}'")
        formatted_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
        
        try:
            stream_conn = await self.client.chat.completions.create(
                messages=formatted_messages,
                model=self.model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            async for chunk in stream_conn:
                # Extract choices delta content
                if chunk.choices:
                    delta = chunk.choices[0].delta
                    text = delta.content or ""
                    finish = chunk.choices[0].finish_reason
                    yield LLMStreamChunk(text=text, finish_reason=finish)
        except Exception as e:
            mapped_err = self._map_groq_error(e)
            logger.error(f"Groq stream failure: {mapped_err}")
            raise mapped_err

    async def health_check(self) -> LLMHealthResult:
        """Performs a lightweight query check at startup/diagnostic."""
        test_msg = [LLMMessage(role="user", content="Ping")]
        try:
            # We use a tiny completion to test token verification and latency
            res = await self.generate(test_msg, max_tokens=10)
            if res.content:
                return LLMHealthResult(reachable=True)
            return LLMHealthResult(reachable=False, error_message="Empty response content returned.")
        except Exception as e:
            return LLMHealthResult(reachable=False, error_message=str(e))

    def get_model_name(self) -> str:
        return self.model_name

    def get_provider_name(self) -> str:
        return "groq"

_provider_instance: Optional[LLMProvider] = None

def get_llm_provider() -> LLMProvider:
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = GroqLLMProvider()
    return _provider_instance
