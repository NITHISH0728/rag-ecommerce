from typing import List, Optional, Dict, Any
from backend.app.core.logging_config import logger
from backend.app.vector_store.vector_store_interface import get_vector_store
from backend.app.vector_store.filters import VectorSearchFilters
from backend.app.vector_store.models import VectorSearchResult
from backend.app.providers.embedding_provider import get_provider

class SearchService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.provider = get_provider()

    def search_chunks(
        self,
        query: str,
        top_k: int = 8,
        filters: Optional[VectorSearchFilters] = None
    ) -> List[VectorSearchResult]:
        """
        Retrieves the top_k best matching document chunks based on semantic similarity.
        """
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty.")
            
        logger.info(f"Chunk search execution: '{query}' (top_k: {top_k})")
        
        # Generate embedding for the query
        query_embedding = self.provider.embed_query(query)
        
        # Execute query against vector store
        results = self.vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=top_k,
            filters=filters
        )
        return results

    def search_products(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[VectorSearchFilters] = None
    ) -> List[VectorSearchResult]:
        """
        Retrieves the top_k best matching products, ensuring product-level deduplication
        by grouping chunk results by product_id and keeping the highest scoring chunk.
        """
        if not query or not query.strip():
            raise ValueError("Query string cannot be empty.")
            
        logger.info(f"Product search execution: '{query}' (top_k: {top_k})")
        
        # Pull more chunks than requested to allow deduplication grouping
        temp_top_k = max(25, top_k * 4)
        
        # Generate embedding
        query_embedding = self.provider.embed_query(query)
        
        # Search
        raw_chunks = self.vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=temp_top_k,
            filters=filters
        )
        
        # Deduplicate by product_id while preserving rank order
        seen_products = set()
        deduplicated_results: List[VectorSearchResult] = []
        
        for chunk in raw_chunks:
            prod_id = chunk.product_id
            if not prod_id:
                # Fallback to metadata check
                prod_id = str(chunk.metadata.get("product_id", ""))
                
            if prod_id and prod_id not in seen_products:
                seen_products.add(prod_id)
                
                # Update rank index for the final deduped list
                chunk.rank = len(deduplicated_results) + 1
                deduplicated_results.append(chunk)
                
                if len(deduplicated_results) >= top_k:
                    break
                    
        return deduplicated_results
