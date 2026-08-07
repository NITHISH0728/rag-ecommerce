import os
import sys
import asyncio
import argparse
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.chat.models import ChatRequest, AppliedFilters
from backend.app.chat.service import get_chat_service

async def run_chat_test():
    parser = argparse.ArgumentParser(
        description="ShopSmart RAG AI Assistant Terminal Client"
    )
    parser.add_argument(
        "message",
        type=str,
        help="User query text (e.g., 'laptop for coding under 60k')"
    )
    parser.add_argument(
        "--stream",
        action="store_true",
        help="Stream response tokens in real-time"
    )
    parser.add_argument(
        "--session-id",
        type=str,
        default="terminal_test_session",
        help="Stable session identifier"
    )
    parser.add_argument(
        "--category",
        type=str,
        help="Overlay category filter"
    )
    parser.add_argument(
        "--brand",
        type=str,
        help="Overlay brand filter"
    )
    parser.add_argument(
        "--min-price",
        type=float,
        help="Overlay minimum price constraint"
    )
    parser.add_argument(
        "--max-price",
        type=float,
        help="Overlay maximum price constraint"
    )
    parser.add_argument(
        "--min-rating",
        type=float,
        help="Overlay minimum rating constraint"
    )
    parser.add_argument(
        "--stock-status",
        type=str,
        choices=["in_stock", "low_stock", "out_of_stock"],
        help="Overlay stock availability status"
    )

    args = parser.parse_args()

    # Build filters
    filters = AppliedFilters(
        category=args.category,
        brand=args.brand,
        minimum_price=args.min_price,
        maximum_price=args.max_price,
        minimum_rating=args.min_rating,
        stock_status=args.stock_status
    )

    request = ChatRequest(
        message=args.message,
        session_id=args.session_id,
        conversation_id=args.session_id,
        filters=filters,
        stream=args.stream
    )

    chat_service = get_chat_service()

    print("\n" + "=" * 60)
    print("SHOPSMART RAG CHAT TERMINAL CLIENT")
    print("=" * 60)
    print(f"User Query: '{args.message}'")
    print(f"Session ID: {args.session_id}")
    print(f"Streaming:  {args.stream}")
    print("=" * 60)

    try:
        if args.stream:
            print("Response Stream:")
            # Execute and parse event streams
            async for event in chat_service.process_chat_stream(request):
                if event.event == "token":
                    # Print token text directly without newline
                    sys.stdout.write(event.data["text"])
                    sys.stdout.flush()
                elif event.event in ("citations", "products"):
                    # Yielded at the end
                    pass
                elif event.event == "completed":
                    print("\n\nStream completed successfully.")
        else:
            print("Calling RAG orchestrator REST endpoint...")
            response = await chat_service.process_chat(request)
            print("\nAssistant Answer:")
            print(response.answer)
            
            if response.citations:
                print("\nCitations:")
                for c in response.citations:
                    print(f"  - [{c.citation_id}] {c.product_name} ({c.product_id})")
            
            if response.products:
                print("\nRecommended Product Cards:")
                for p in response.products:
                    print(f"  - {p.brand} {p.name} (Price: {p.price} INR, Stock: {p.stock_status})")
                    print(f"    Reason: {p.reason}")

    except Exception as e:
        print(f"\nError: RAG query execution failed: {e}")

    print("=" * 60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_chat_test())
