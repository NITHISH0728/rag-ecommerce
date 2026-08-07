import uuid
import time
import json
import logging
from datetime import datetime
from typing import AsyncIterator, List, Dict, Any, Tuple, Optional
from backend.app.core.config import settings
from backend.app.chat.models import (
    ChatRequest, ChatResponse, ChatStreamEvent,
    RecommendedProduct, ProductCitation, AppliedFilters, RetrievalDebugInfo
)
from backend.app.chat.history import ConversationSession, ChatHistoryMessage
from backend.app.security.input_guard import normalize_and_validate_message
from backend.app.security.prompt_injection import scan_for_prompt_injection
from backend.app.rag.query_analyzer import analyze_query_deterministically
from backend.app.rag.query_rewriter import rewrite_query_with_context
from backend.app.retrieval.search_service import SearchService
from backend.app.vector_store.filters import VectorSearchFilters
from backend.app.vector_store.models import VectorSearchResult
from backend.app.rag.recommendation_ranker import RecommendationRanker
from backend.app.rag.context_builder import build_rag_context
from backend.app.rag.prompt_builder import PromptBuilder
from backend.app.rag.response_validator import validate_response_groundedness
from backend.app.rag.citation_builder import build_product_citations
from backend.app.rag.fallback import generate_no_match_response
from backend.app.llm.groq_provider import get_llm_provider
from backend.app.llm.models import LLMMessage
from backend.app.ingestion.loader import load_products

logger = logging.getLogger("shopsmart-orchestrator")

class RAGOrchestrator:
    def __init__(self):
        self.search_service = SearchService()
        self.ranker = RecommendationRanker()
        self.prompt_builder = PromptBuilder()
        self.llm = get_llm_provider()
        
        # Pre-cache catalog products index for fast lookup during formatting
        self.catalog_products: Dict[str, Any] = {}
        self._load_catalog_index()

    def _load_catalog_index(self):
        try:
            products_list, _ = load_products(settings.PRODUCT_DATA_PATH)
            for p in products_list:
                self.catalog_products[p.product_id] = p
            logger.info(f"Orchestrator indexed {len(self.catalog_products)} products from catalog.")
        except Exception as e:
            logger.error(f"Failed to load catalog products: {e}")

    def _apply_filter_precedence(
        self,
        request: ChatRequest,
        analysis: Any,
        session: ConversationSession
    ) -> VectorSearchFilters:
        """
        Calculates active filter constraints following explicit precedence:
        1. API Request Filters
        2. Extracted Query Filters
        3. Contextual Session Filters
        """
        category = None
        brand = None
        min_price = None
        max_price = None
        min_rating = None
        stock_status = None
        featured = None

        # Resolve session context
        last_filters = session.get_last_applied_filters()

        # Category
        if request and request.filters and request.filters.category:
            category = request.filters.category
        elif analysis.category:
            category = analysis.category
        else:
            category = last_filters.get("category")

        # Brand
        if request and request.filters and request.filters.brand:
            brand = request.filters.brand
        elif analysis.brand:
            brand = analysis.brand
        else:
            brand = last_filters.get("brand")

        # Prices
        if request and request.filters and request.filters.maximum_price is not None:
            max_price = request.filters.maximum_price
        elif analysis.maximum_price is not None:
            max_price = analysis.maximum_price
        else:
            max_price = last_filters.get("maximum_price")

        if request and request.filters and request.filters.minimum_price is not None:
            min_price = request.filters.minimum_price
        elif analysis.minimum_price is not None:
            min_price = analysis.minimum_price
        else:
            min_price = last_filters.get("minimum_price")

        # Rating
        if request and request.filters and request.filters.minimum_rating is not None:
            min_rating = request.filters.minimum_rating
        elif analysis.minimum_rating is not None:
            min_rating = analysis.minimum_rating
        else:
            min_rating = last_filters.get("minimum_rating")

        # Stock status
        if request and request.filters and request.filters.stock_status:
            stock_status = request.filters.stock_status
        elif analysis.stock_status:
            stock_status = analysis.stock_status
        else:
            # Default to in_stock unless out_of_stock is requested
            stock_status = last_filters.get("stock_status", "in_stock")

        # Featured
        if request and request.filters and request.filters.featured is not None:
            featured = request.filters.featured
        elif analysis.featured is not None:
            featured = analysis.featured

        return VectorSearchFilters(
            category=category,
            brand=brand,
            minimum_price=min_price,
            maximum_price=max_price,
            minimum_rating=min_rating,
            stock_status=stock_status,
            featured=featured
        )

    def _map_to_cards(self, results: List[VectorSearchResult]) -> List[RecommendedProduct]:
        cards = []
        for r in results:
            p_id = r.product_id
            product = self.catalog_products.get(p_id)
            if product:
                cards.append(
                    RecommendedProduct(
                        product_id=product.product_id,
                        slug=product.slug,
                        name=product.name,
                        brand=product.brand,
                        category=product.category,
                        price=product.price,
                        currency=product.currency,
                        rating=product.rating,
                        stock=product.stock,
                        stock_status="out_of_stock" if product.stock == 0 else ("low_stock" if product.stock <= 5 else "in_stock"),
                        warranty=product.warranty,
                        image=product.images[0] if product.images else "/images/placeholder.webp",
                        reason=f"Matches {product.brand} {product.category} requirements."
                    )
                )
        return cards

    async def execute(
        self,
        request: ChatRequest,
        session: ConversationSession
    ) -> ChatResponse:
        message_id = f"msg_{uuid.uuid4().hex}"
        conv_id = request.conversation_id or f"conv_{uuid.uuid4().hex}"
        
        # 1. Input Validation and Normalization
        message = normalize_and_validate_message(request.message)
        scan_for_prompt_injection(message)
        
        # 2. Query Analysis
        analysis = analyze_query_deterministically(message)
        
        # 3. Active filter resolution
        active_filters = self._apply_filter_precedence(request, analysis, session)
        
        if not analysis.requires_retrieval:
            # Greetings or help direct response
            logger.info("General query does not require retrieval. Executing direct greeting prompt.")
            sys_prompt = self.prompt_builder.build_system_prompt()
            messages = [
                LLMMessage(role="system", content=sys_prompt),
                LLMMessage(role="user", content=message)
            ]
            res = await self.llm.generate(messages)
            
            # Save User Message and response to session history
            session.add_message(ChatHistoryMessage(role="user", content=message))
            session.add_message(ChatHistoryMessage(role="assistant", content=res.content))
            
            return ChatResponse(
                conversation_id=conv_id,
                message_id=message_id,
                answer=res.content,
                citations=[],
                products=[],
                applied_filters={},
                retrieval_status="success",
                grounded=True,
                follow_up_suggestions=["Show me laptops", "Find a gaming mouse"]
            )

        # 4. Query Rewriting
        rewritten = rewrite_query_with_context(message, session)
        
        # 5. Chroma DB retrieval
        retrieval_start = time.time()
        # Retrieve chunks (deduplication occurs later in ranker/context grouping)
        # Search service generates query embeddings dynamically
        raw_chunks = self.search_service.search_chunks(
            query=rewritten,
            top_k=settings.RAG_TOP_K_CHUNKS,
            filters=active_filters
        )
        retrieval_duration = (time.time() - retrieval_start) * 1000
        
        # 6. Rank products & Apply constraints
        ranked_chunks = self.ranker.rank_products(
            results=raw_chunks,
            requested_use_cases=analysis.use_cases,
            maximum_price=active_filters.maximum_price,
            keywords=analysis.keywords
        )

        # Deduplicate chunk results by keeping the highest scoring chunk per product
        unique_results: List[VectorSearchResult] = []
        seen_products = set()
        for c in ranked_chunks:
            if c.product_id not in seen_products:
                seen_products.add(c.product_id)
                unique_results.append(c)
                if len(unique_results) >= settings.RAG_TOP_K_PRODUCTS:
                    break

        # 7. No matches fallback
        if not unique_results:
            logger.info("Zero matching products found. Returning deterministic no-match fallback.")
            return generate_no_match_response(
                conversation_id=conv_id,
                message_id=message_id,
                category=active_filters.category,
                maximum_price=active_filters.maximum_price,
                brand=active_filters.brand,
                stock_status=active_filters.stock_status,
                use_cases=analysis.use_cases
            )

        # 8. Build Context
        context_str, manifest = build_rag_context(
            results=unique_results,
            maximum_price=active_filters.maximum_price,
            use_cases=analysis.use_cases
        )

        # 9. Format History Context
        history_lines = []
        for msg in session.get_recent_messages():
            history_lines.append(f"{msg.role.upper()}: {msg.content}")
        history_context = "\n".join(history_lines)

        # 10. Build Prompts & Generate Response
        sys_prompt = self.prompt_builder.build_system_prompt()
        user_prompt = self.prompt_builder.build_user_prompt(
            user_question=message,
            intent=analysis.intent,
            applied_filters=json.dumps(active_filters.model_dump(exclude_none=True)),
            retrieved_context=context_str,
            conversation_context=history_context
        )

        messages = [
            LLMMessage(role="system", content=sys_prompt),
            LLMMessage(role="user", content=user_prompt)
        ]

        logger.info(f"Generating LLM response (context length: {len(context_str)} chars)...")
        res = await self.llm.generate(messages)
        
        # 11. Format Recommended Product Cards
        cards = self._map_to_cards(unique_results)

        # 12. Response Validation
        is_valid, sanitized_answer, val_errors = validate_response_groundedness(
            answer=res.content,
            citations_manifest=manifest,
            recommended_products=cards,
            maximum_price=active_filters.maximum_price
        )

        # 13. Citations formatting
        citations = build_product_citations(manifest)

        # Save to conversation memory
        session.add_message(
            ChatHistoryMessage(
                role="user",
                content=message,
                applied_filters=active_filters.model_dump(exclude_none=True)
            )
        )
        session.add_message(
            ChatHistoryMessage(
                role="assistant",
                content=sanitized_answer,
                applied_filters=active_filters.model_dump(exclude_none=True),
                recommended_product_ids=[c.product_id for c in cards]
            )
        )

        debug = RetrievalDebugInfo(
            chunks_retrieved=len(raw_chunks),
            unique_products_retrieved=len(unique_results),
            query_rewritten=rewritten if rewritten != message else None,
            retrieval_duration_ms=retrieval_duration
        )

        return ChatResponse(
            conversation_id=conv_id,
            message_id=message_id,
            answer=sanitized_answer,
            citations=citations,
            products=cards,
            applied_filters=active_filters.model_dump(exclude_none=True),
            retrieval_status="success",
            grounded=is_valid,
            follow_up_suggestions=["Compare these options", "Show only in-stock"],
            debug_info=debug
        )

    async def execute_stream(
        self,
        request: ChatRequest,
        session: ConversationSession
    ) -> AsyncIterator[ChatStreamEvent]:
        message_id = f"msg_{uuid.uuid4().hex}"
        conv_id = request.conversation_id or f"conv_{uuid.uuid4().hex}"
        
        # Yield retrieval_started event
        yield ChatStreamEvent(event="retrieval_started", data={"message_id": message_id})

        # 1. Input validation
        try:
            message = normalize_and_validate_message(request.message)
            scan_for_prompt_injection(message)
        except Exception as e:
            yield ChatStreamEvent(event="error", data={"code": "validation_error", "message": str(e)})
            return

        # 2. Query Analysis
        analysis = analyze_query_deterministically(message)
        active_filters = self._apply_filter_precedence(request, analysis, session)

        yield ChatStreamEvent(event="filters_applied", data=active_filters.model_dump(exclude_none=True))

        if not analysis.requires_retrieval:
            sys_prompt = self.prompt_builder.build_system_prompt()
            messages = [
                LLMMessage(role="system", content=sys_prompt),
                LLMMessage(role="user", content=message)
            ]
            
            yield ChatStreamEvent(event="generation_started", data={})
            answer_tokens = []
            async for chunk in self.llm.stream(messages):
                answer_tokens.append(chunk.text)
                yield ChatStreamEvent(event="token", data={"text": chunk.text})
                
            full_answer = "".join(answer_tokens)
            session.add_message(ChatHistoryMessage(role="user", content=message))
            session.add_message(ChatHistoryMessage(role="assistant", content=full_answer))
            
            yield ChatStreamEvent(event="completed", data={
                "conversation_id": conv_id,
                "message_id": message_id,
                "grounded": True
            })
            return

        # 3. Retrieve
        rewritten = rewrite_query_with_context(message, session)
        raw_chunks = self.search_service.search_chunks(
            query=rewritten,
            top_k=settings.RAG_TOP_K_CHUNKS,
            filters=active_filters
        )
        
        # Rank & Deduplicate
        ranked_chunks = self.ranker.rank_products(
            results=raw_chunks,
            requested_use_cases=analysis.use_cases,
            maximum_price=active_filters.maximum_price,
            keywords=analysis.keywords
        )
        
        unique_results = []
        seen_products = set()
        for c in ranked_chunks:
            if c.product_id not in seen_products:
                seen_products.add(c.product_id)
                unique_results.append(c)
                if len(unique_results) >= settings.RAG_TOP_K_PRODUCTS:
                    break

        yield ChatStreamEvent(event="products_retrieved", data={"count": len(unique_results)})

        if not unique_results:
            fallback = generate_no_match_response(
                conversation_id=conv_id,
                message_id=message_id,
                category=active_filters.category,
                maximum_price=active_filters.maximum_price,
                brand=active_filters.brand,
                stock_status=active_filters.stock_status,
                use_cases=analysis.use_cases
            )
            # Yield final results and complete stream
            yield ChatStreamEvent(event="token", data={"text": fallback.answer})
            yield ChatStreamEvent(event="completed", data={
                "conversation_id": conv_id,
                "message_id": message_id,
                "grounded": True
            })
            return

        # 4. Context & Prompts
        context_str, manifest = build_rag_context(
            results=unique_results,
            maximum_price=active_filters.maximum_price,
            use_cases=analysis.use_cases
        )

        history_lines = []
        for msg in session.get_recent_messages():
            history_lines.append(f"{msg.role.upper()}: {msg.content}")
        history_context = "\n".join(history_lines)

        sys_prompt = self.prompt_builder.build_system_prompt()
        user_prompt = self.prompt_builder.build_user_prompt(
            user_question=message,
            intent=analysis.intent,
            applied_filters=json.dumps(active_filters.model_dump(exclude_none=True)),
            retrieved_context=context_str,
            conversation_context=history_context
        )

        messages = [
            LLMMessage(role="system", content=sys_prompt),
            LLMMessage(role="user", content=user_prompt)
        ]

        yield ChatStreamEvent(event="generation_started", data={})

        answer_tokens = []
        async for chunk in self.llm.stream(messages):
            answer_tokens.append(chunk.text)
            yield ChatStreamEvent(event="token", data={"text": chunk.text})

        full_answer = "".join(answer_tokens)
        cards = self._map_to_cards(unique_results)
        
        # Validate
        is_valid, sanitized_answer, _ = validate_response_groundedness(
            answer=full_answer,
            citations_manifest=manifest,
            recommended_products=cards,
            maximum_price=active_filters.maximum_price
        )
        
        citations = build_product_citations(manifest)
        citations_data = [c.model_dump() for c in citations]
        products_data = [p.model_dump() for p in cards]

        # Yield citations, cards and suggestions
        yield ChatStreamEvent(event="citations", data={"citations": citations_data})
        yield ChatStreamEvent(event="products", data={"products": products_data})
        yield ChatStreamEvent(event="suggestions", data={"suggestions": ["Compare these", "Show cheaper ones"]})

        # Save to memory
        session.add_message(
            ChatHistoryMessage(
                role="user",
                content=message,
                applied_filters=active_filters.model_dump(exclude_none=True)
            )
        )
        session.add_message(
            ChatHistoryMessage(
                role="assistant",
                content=sanitized_answer,
                applied_filters=active_filters.model_dump(exclude_none=True),
                recommended_product_ids=[c.product_id for c in cards]
            )
        )

        yield ChatStreamEvent(event="completed", data={
            "conversation_id": conv_id,
            "message_id": message_id,
            "grounded": is_valid
        })

_orchestrator_instance: Optional[RAGOrchestrator] = None

def get_rag_orchestrator() -> RAGOrchestrator:
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = RAGOrchestrator()
    return _orchestrator_instance
