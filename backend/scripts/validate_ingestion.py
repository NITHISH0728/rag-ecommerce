import os
import sys
import re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.ingestion.loader import load_products
from backend.app.ingestion.normalizer import normalize_product
from backend.app.ingestion.document_builder import build_product_document_text
from backend.app.ingestion.chunker import chunk_product_document
from backend.app.ingestion.hashing import calculate_text_hash

def validate_ingestion():
    data_path = "./data/products.json"
    if not os.path.exists(data_path):
        print(f"Error: products.json not found at {data_path}")
        sys.exit(1)
        
    print(f"Validating RAG Document Generation pipeline against: {data_path}")
    
    products, load_errors = load_products(data_path)
    if load_errors:
        print(f"Error: Loader encountered validation failures: {load_errors}")
        sys.exit(1)
        
    seen_chunk_ids = set()
    errors = []
    
    for p in products:
        # Normalize
        norm_product, warnings = normalize_product(p)
        
        # Build text
        doc_text = build_product_document_text(norm_product)
        if not doc_text.strip():
            errors.append(f"Product {p.product_id}: Document text is empty")
            
        # Check accidental API keys in content
        if "sk-" in doc_text.lower() or "aiza" in doc_text.lower():
            errors.append(f"Product {p.product_id}: Potential API key leak detected in text content.")
            
        # Check images embedded as text (should not contain large base64 or png names directly other than normal image paths)
        if "data:image/" in doc_text:
            errors.append(f"Product {p.product_id}: Raw image data/base64 found in document text.")

        # Chunk
        chunks = chunk_product_document(
            product_id=norm_product.product_id,
            document_text=doc_text,
            chunk_size=settings.CHUNK_SIZE
        )
        
        if not chunks:
            errors.append(f"Product {p.product_id}: No chunks were created.")
            
        for chunk in chunks:
            # Check stable ID format (e.g. ID::chunk-000)
            expected_prefix = f"{norm_product.product_id}::chunk-"
            if not chunk.chunk_id.startswith(expected_prefix):
                errors.append(f"Product {p.product_id}: Invalid chunk ID format '{chunk.chunk_id}'")
                
            if chunk.chunk_id in seen_chunk_ids:
                errors.append(f"Duplicate chunk ID detected: '{chunk.chunk_id}'")
            seen_chunk_ids.add(chunk.chunk_id)
            
            # Check empty content
            if not chunk.content.strip():
                errors.append(f"Chunk '{chunk.chunk_id}': Content is empty")
                
            # Check content hash
            chash = calculate_text_hash(chunk.content)
            if not chash or len(chash) != 64:
                errors.append(f"Chunk '{chunk.chunk_id}': Content hash is invalid or missing")
                
    if errors:
        print(f"\nIngestion Validation Failed! Found {len(errors)} errors:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
        
    print("\n----------------------------------------")
    print(f"Validated {len(products)} products generation.")
    print(f"Total chunks verified: {len(seen_chunk_ids)}")
    print("0 validation errors.")
    print("0 duplicate chunk IDs.")
    print("All documents passed pre-ingestion check.")
    print("----------------------------------------")
    sys.exit(0)

if __name__ == "__main__":
    validate_ingestion()
