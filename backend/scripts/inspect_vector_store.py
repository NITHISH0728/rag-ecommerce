import os
import sys
import argparse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.vector_store.vector_store_interface import get_vector_store
from backend.app.vector_store.filters import VectorSearchFilters

def main():
    parser = argparse.ArgumentParser(
        description="Inspect ShopSmart AI Vector Store Collection"
    )
    parser.add_argument(
        "--count",
        action="store_true",
        help="Print total chunk count in vector collection"
    )
    parser.add_argument(
        "--list-products",
        action="store_true",
        help="List unique product IDs present in store"
    )
    parser.add_argument(
        "--product-id",
        type=str,
        help="Filter chunks by a specific product ID"
    )
    parser.add_argument(
        "--category",
        type=str,
        help="Filter chunks by a category"
    )
    parser.add_argument(
        "--brand",
        type=str,
        help="Filter chunks by a brand"
    )
    parser.add_argument(
        "--show-metadata",
        action="store_true",
        help="Display metadata dictionary for retrieved chunks"
    )
    parser.add_argument(
        "--show-document",
        action="store_true",
        help="Display document content text for chunks"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Maximum records to display"
    )

    args = parser.parse_args()

    store = get_vector_store()
    
    # 1. Total Count print
    total_count = store.count()
    print(f"Collection Name: {settings.VECTOR_COLLECTION_NAME}")
    print(f"Total Vector Chunks: {total_count}")
    
    if args.count:
        sys.exit(0)

    # 2. Get Metadata to print configuration info
    meta = store.get_collection_metadata()
    print(f"Collection Meta: Provider '{meta.get('embedding_provider')}' | Model '{meta.get('embedding_model')}'")
    print("=" * 60)

    # Retrieve all IDs and metadata to inspect
    # Chroma get returns a dictionary of ids and metadatas
    # We query with a limit or filter
    query_where = {}
    if args.product_id:
        query_where["product_id"] = args.product_id
    if args.category:
        query_where["category"] = args.category
    if args.brand:
        query_where["brand"] = args.brand

    # ChromaDB native get
    from backend.app.vector_store.chroma_store import ChromaStore
    if isinstance(store, ChromaStore):
        results = store.collection.get(
            where=query_where if query_where else None,
            limit=args.limit,
            include=["metadatas", "documents", "embeddings"]
        )
        
        ids = results.get("ids", [])
        metadatas = results.get("metadatas", [])
        documents = results.get("documents", [])
        embeddings = results.get("embeddings", [])
        
        if args.list_products:
            # Gather all unique product IDs
            all_results = store.collection.get(include=["metadatas"])
            all_metadatas = all_results.get("metadatas", [])
            prod_ids = set(str(m.get("product_id")) for m in all_metadatas if m)
            print("Unique Product IDs in Vector Collection:")
            for p_id in sorted(prod_ids):
                print(f" - {p_id}")
            print(f"Total Unique Products: {len(prod_ids)}")
            sys.exit(0)

        if not ids:
            print("No matching vector chunks found in collection.")
            sys.exit(0)

        print(f"Displaying top {len(ids)} matching vector chunks:")
        for idx in range(len(ids)):
            cid = ids[idx]
            cmeta = metadatas[idx] or {}
            cdoc = documents[idx] if documents else ""
            cembed = embeddings[idx] if embeddings else []
            
            print(f"\n[Chunk ID: {cid}]")
            print(f"  Product ID: {cmeta.get('product_id')}")
            print(f"  Category: {cmeta.get('category')} | Brand: {cmeta.get('brand')}")
            print(f"  Price: {cmeta.get('price')} INR")
            if cembed:
                # Show norm or first few dimensions
                print(f"  Embedding Vector: {len(cembed)} dimensions (First 5 values: {cembed[:5]})")
            
            if args.show_metadata:
                print("  Metadata details:")
                for k, v in cmeta.items():
                    print(f"    - {k}: {v}")
                    
            if args.show_document:
                print("  Document excerpt:")
                for line in cdoc.split("\n"):
                    print(f"    | {line}")
            print("-" * 50)
            
    print("=" * 60)

if __name__ == "__main__":
    main()
