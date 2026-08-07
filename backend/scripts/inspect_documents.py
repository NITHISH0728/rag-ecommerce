import os
import sys
import argparse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.ingestion.loader import load_products
from backend.app.ingestion.normalizer import normalize_product
from backend.app.ingestion.document_builder import build_product_document_text
from backend.app.ingestion.chunker import chunk_product_document
from backend.app.ingestion.hashing import calculate_text_hash

def main():
    parser = argparse.ArgumentParser(
        description="Inspect RAG document representations and chunking output for a product"
    )
    parser.add_argument(
        "--product-id",
        type=str,
        required=True,
        help="ID of the product to inspect (e.g. LAP-001)"
    )
    parser.add_argument(
        "--data-path",
        type=str,
        default="./data/products.json",
        help="Path to the products catalog JSON"
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=1200,
        help="Configured chunk character size threshold"
    )

    args = parser.parse_args()

    if not os.path.exists(args.data_path):
        print(f"Error: Catalog dataset not found at {args.data_path}")
        sys.exit(1)

    print(f"Loading products from {args.data_path}...")
    products, errors = load_products(args.data_path)
    
    # Locate product
    product = None
    for p in products:
        if p.product_id.upper() == args.product_id.upper():
            product = p
            break

    if not product:
        print(f"Error: Product with ID '{args.product_id}' not found in dataset.")
        sys.exit(1)

    # Normalize
    norm_product, warnings = normalize_product(product)
    
    # Build text
    doc_text = build_product_document_text(norm_product)
    doc_char_count = len(doc_text)
    estimated_tokens = round(doc_char_count / 4)

    # Chunk
    chunks = chunk_product_document(
        product_id=norm_product.product_id,
        document_text=doc_text,
        chunk_size=args.chunk_size
    )

    print("\n" + "=" * 60)
    print(f"INSPECTION FOR PRODUCT ID: {norm_product.product_id}")
    print("=" * 60)
    print(f"Name: {norm_product.name}")
    print(f"Category: {norm_product.category}")
    print(f"Brand: {norm_product.brand}")
    print(f"Original Text Length: {doc_char_count} chars (~{estimated_tokens} estimated tokens)")
    print(f"Total Chunks Generated: {len(chunks)}")
    print("=" * 60)

    print("\n--- FULL STRUCTURED TEXT DOCUMENT ---")
    print(doc_text)
    print("-" * 60)

    print("\n--- INDIVIDUAL CHUNK SPLITS ---")
    for i, chunk in enumerate(chunks):
        chunk_hash = calculate_text_hash(chunk.content)
        print(f"\n[Chunk #{i+1} Details]")
        print(f"  Chunk ID: {chunk.chunk_id}")
        print(f"  Section Label: {chunk.section_name}")
        print(f"  Character Length: {len(chunk.content)} chars")
        print(f"  Content Hash: {chunk_hash}")
        print(f"  --- CHUNK CONTENT START ---")
        # Print with indentation to separate visually
        for line in chunk.content.split("\n"):
            print(f"    | {line}")
        print(f"  --- CHUNK CONTENT END ---")
        
    print("\n" + "=" * 60)
    print("Inspection complete.")
    print("=" * 60)

if __name__ == "__main__":
    main()
