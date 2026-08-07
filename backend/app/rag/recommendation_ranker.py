import logging
from typing import List, Dict, Any, Optional
from backend.app.vector_store.models import VectorSearchResult

logger = logging.getLogger("shopsmart-ranker")

class RecommendationRanker:
    def __init__(self):
        # Configure scoring weights (sums to 100%)
        self.weights = {
            "semantic": 0.45,
            "use_case": 0.20,
            "specs": 0.15,
            "budget": 0.10,
            "rating": 0.05,
            "availability": 0.05
        }

    def rank_products(
        self,
        results: List[VectorSearchResult],
        requested_use_cases: List[str],
        maximum_price: Optional[float] = None,
        keywords: Optional[List[str]] = None
    ) -> List[VectorSearchResult]:
        """
        Ranks unique product chunks using a multi-factor score weight heuristic.
        Excludes products above the hard maximum budget.
        """
        if not results:
            return []

        ranked_results = []
        keywords = [k.lower() for k in (keywords or [])]

        for item in results:
            meta = item.metadata
            price = float(meta.get("price", 0))

            # Hard budget filter enforcement
            if maximum_price is not None and price > maximum_price:
                logger.debug(f"Excluding product '{item.product_id}' since price {price} exceeds limit {maximum_price}.")
                continue

            # Calculate individual factor scores (0.0 to 1.0)
            
            # 1. Semantic Vector Score (Chroma distance metric mapped to similarity)
            semantic_score = item.similarity_score
            
            # 2. Use-cases overlap
            use_case_score = 0.0
            p_use_cases = str(meta.get("use_cases", "")).lower().split("|")
            if requested_use_cases:
                overlap = sum(1 for uc in requested_use_cases if uc.lower() in p_use_cases)
                use_case_score = overlap / len(requested_use_cases)
            else:
                use_case_score = 1.0  # neutral if none requested

            # 3. Spec keywords matching (e.g. RAM, SSD values matched in document text)
            specs_score = 0.0
            if keywords:
                doc_lower = item.document.lower()
                matches = sum(1 for kw in keywords if kw in doc_lower)
                specs_score = matches / len(keywords)
            else:
                specs_score = 1.0

            # 4. Budget fit: prefer items closer to but below budget, but don't bias overly to cheapest
            budget_score = 1.0
            if maximum_price is not None:
                # Closer to budget gets higher score (budget efficiency)
                budget_score = price / maximum_price

            # 5. Rating score: map stars (1-5) to 0.0-1.0
            rating = float(meta.get("rating", 0.0))
            rating_score = min(1.0, max(0.0, rating / 5.0))

            # 6. Availability score: in_stock = 1.0, low_stock = 0.7, out_of_stock = 0.0
            stock_status = str(meta.get("stock_status", "in_stock")).lower()
            if stock_status == "in_stock":
                avail_score = 1.0
            elif stock_status == "low_stock":
                avail_score = 0.7
            else:
                avail_score = 0.0

            # Compute composite weighted score
            composite_score = (
                self.weights["semantic"] * semantic_score +
                self.weights["use_case"] * use_case_score +
                self.weights["specs"] * specs_score +
                self.weights["budget"] * budget_score +
                self.weights["rating"] * rating_score +
                self.weights["availability"] * avail_score
            )

            # Assign composite score to similarity_score for sorting
            item.similarity_score = composite_score
            ranked_results.append(item)

        # Sort descending by composite score
        ranked_results.sort(key=lambda x: x.similarity_score, reverse=True)
        return ranked_results
