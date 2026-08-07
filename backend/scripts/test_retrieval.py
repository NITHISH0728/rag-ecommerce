import os
import sys
import argparse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.retrieval.search_service import SearchService
from backend.app.vector_store.filters import VectorSearchFilters
from backend.app.retrieval.result_mapper import map_search_results_to_api

def main():
    parser = argparse.ArgumentParser(
        description="Test ShopSmart AI Semantic Retrieval Pipeline"
    )
    parser.add_argument(
        "query",
        type=str,
        help="Semantic query text (e.g. 'laptop for coding')"
    )
    parser.add_argument(
        "--category",
        type=str,
        help="Filter by category"
    )
    parser.add_argument(
        "--brand",
        type=str,
        help="Filter by brand"
    )
    parser.add_argument(
        "--min-price",
        type=float,
        help="Minimum price filter"
    )
    parser.add_argument(
        "--max-price",
        type=float,
        help="Maximum price filter"
    )
    parser.add_argument(
        "--min-rating",
        type=float,
        help="Minimum rating filter"
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["chunk", "product"],
        default="product",
        help="Search mode: 'chunk' returns raw sections, 'product' runs deduplication"
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of top results to return"
    )

    args = parser.parse_args()

    # Build filters
    filters = VectorSearchFilters(
        category=args.category,
        brand=args.brand,
        minimum_price=args.min_price,
        maximum_price=args.max_price,
        minimum_rating=args.min_rating
    )

    print("\n" + "=" * 60)
    print("SEMANTIC SEARCH RETRIEVAL TEST")
    print("=" * 60)
    print(f"Query: '{args.query}'")
    print(f"Mode: {args.mode.upper()}")
    print(f"Top K: {args.top_k}")
    
    # Print filters if active
    filter_dict = {k: v for k, v in filters.model_dump().items() if v is not None}
    if filter_dict:
        print(f"Active Filters: {filter_dict}")
    print("=" * 60)

    # Execute search
    search_service = SearchService()
    try:
        if args.mode == "product":
            results = search_service.search_products(
                query=args.query,
                top_k=args.top_k,
                filters=filters
            )
        else:
            results = search_service.search_chunks(
                query=args.query,
                top_k=args.top_k,
                filters=filters
            )
            
        # Map to clean API format
        api_results = map_search_results_to_api(results)
        
        if not api_results:
            print("No matching records found in vector store.")
            sys.exit(0)

        for i, item in enumerate(api_results):
            print(f"\n[Rank #{item['rank']}] Relevance Score: {item['similarityScore']:.2%}")
            print(f"  Product Name: {item['name']} ({item['productId']})")
            print(f"  Category: {item['category']} | Brand: {item['brand']}")
            print(f"  Price: {item['price']} INR | Stock Status: {item['stockStatus']}")
            print("  Matched Excerpt:")
            # Display matching excerpt with indentation
            for line in item["documentExcerpt"].split("\n")[:12]:
                print(f"    | {line}")
            if len(item["documentExcerpt"].split("\n")) > 12:
                print("    | ... [truncated]")
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: Retrieval query failed: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("Search complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
