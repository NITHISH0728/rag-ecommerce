import os
import sys
from typing import List, Dict, Set

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.vector_store.vector_store_interface import get_vector_store
from backend.app.ingestion.loader import load_products
from backend.app.ingestion.normalizer import normalize_product
from backend.app.ingestion.document_builder import build_product_document_text
from backend.app.ingestion.chunker import chunk_product_document
from backend.app.ingestion.hashing import calculate_text_hash

def main():
    data_path = "./data/products.json"
    if not os.path.exists(data_path):
        print(f"Error: products.json dataset not found at {data_path}")
        sys.exit(1)
        
    print(f"Running database consistency check against catalog: {data_path}")
    
    # 1. Load Products
    products, load_errors = load_products(data_path)
    if load_errors:
        print(f"Loader errors: {load_errors}")
        sys.exit(1)
        
    source_product_ids = set(p.product_id for p in products)
    
    # Pre-calculate active chunks from source products
    expected_chunks: Dict[str, Dict[str, Any]] = {}
    for p in products:
        norm_product, _ = normalize_product(p)
        doc_text = build_product_document_text(norm_product)
        chunk_results = chunk_product_document(
            product_id=norm_product.product_id,
            document_text=doc_text,
            chunk_size=settings.CHUNK_SIZE
        )
        
        for c in chunk_results:
            c_hash = calculate_text_hash(c.content)
            expected_chunks[c.chunk_id] = {
                "product_id": norm_product.product_id,
                "content_hash": c_hash,
                "price": norm_product.price,
                "stock": norm_product.stock
            }

    # 2. Get records from Vector Store
    store = get_vector_store()
    
    # Native client query
    from backend.app.vector_store.chroma_store import ChromaStore
    if not isinstance(store, ChromaStore):
        print("Error: Unsupported vector store instance.")
        sys.exit(1)
        
    results = store.collection.get(include=["metadatas"])
    stored_ids = results.get("ids", [])
    stored_metadatas = results.get("metadatas", [])
    
    stored_chunks: Dict[str, Dict[str, Any]] = {}
    for chunk_id, meta in zip(stored_ids, stored_metadatas):
        if meta:
            stored_chunks[chunk_id] = {
                "product_id": str(meta.get("product_id")),
                "content_hash": str(meta.get("content_hash")),
                "price": int(meta.get("price")) if meta.get("price") is not None else None,
                "stock": int(meta.get("stock")) if meta.get("stock") is not None else None
            }

    # 3. Perform consistency checks
    missing_products: Set[str] = set()
    hash_mismatches: List[str] = []
    metadata_mismatches: List[str] = []
    stale_stored_ids: List[str] = []
    
    # Verify every expected chunk exists in stored chunks
    for chunk_id, exp in expected_chunks.items():
        if chunk_id not in stored_chunks:
            missing_products.add(exp["product_id"])
        else:
            stored = stored_chunks[chunk_id]
            # Check Hash consistency
            if exp["content_hash"] != stored["content_hash"]:
                hash_mismatches.append(
                    f"Chunk '{chunk_id}': Source hash '{exp['content_hash'][:8]}' vs Stored hash '{stored['content_hash'][:8]}'"
                )
            # Check core metadata consistency (Price/Stock)
            if exp["price"] != stored["price"]:
                metadata_mismatches.append(f"Chunk '{chunk_id}': Price mismatch (Source: {exp['price']}, Stored: {stored['price']})")
            if exp["stock"] != stored["stock"]:
                metadata_mismatches.append(f"Chunk '{chunk_id}': Stock mismatch (Source: {exp['stock']}, Stored: {stored['stock']})")

    # Find stale chunks in storage
    for chunk_id, stored in stored_chunks.items():
        if chunk_id not in expected_chunks:
            stale_stored_ids.append(chunk_id)

    # 4. Report results
    print("\n================ DATA CONSISTENCY REPORT ================")
    print(f"Products in Catalog file: {len(source_product_ids)}")
    print(f"Active Chunks in Catalog: {len(expected_chunks)}")
    print(f"Chroma DB Collection Count: {store.count()}")
    print("-" * 57)
    
    success = True
    
    if missing_products:
        print(f"[ERROR] Missing products in DB (No vectors indexed):")
        for pid in sorted(missing_products):
            print(f"  - {pid}")
        success = False
    else:
        print("[OK] All source products have at least one vector indexed.")

    if hash_mismatches:
        print(f"[ERROR] Content hash mismatches (out-of-sync content): {len(hash_mismatches)} chunks")
        for mismatch in hash_mismatches[:5]:
            print(f"  - {mismatch}")
        success = False
    else:
        print("[OK] Content hashes are in sync between source files and database.")

    if metadata_mismatches:
        print(f"[ERROR] Metadata mismatches (out-of-sync fields): {len(metadata_mismatches)} values")
        for mismatch in metadata_mismatches[:5]:
            print(f"  - {mismatch}")
        success = False
    else:
        print("[OK] Core product metadata fields are in sync.")

    if stale_stored_ids:
        print(f"[WARNING] Stale chunk records found in DB (stale deletions pending): {len(stale_stored_ids)} chunks")
        for sid in stale_stored_ids[:5]:
            print(f"  - {sid}")
        # warnings do not necessarily fail the build
    else:
        print("[OK] No stale chunk records exist in the database.")

    print("-" * 57)
    print(f"Verification Verdict: {'PASSED' if success else 'FAILED'}")
    print("=========================================================\n")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
