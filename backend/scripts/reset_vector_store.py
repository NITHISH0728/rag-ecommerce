import os
import sys
import argparse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.vector_store.vector_store_interface import get_vector_store
from backend.app.core.config import settings

def main():
    parser = argparse.ArgumentParser(
        description="Reset ShopSmart AI Vector Store Collection"
    )
    parser.add_argument(
        "--confirm",
        type=str,
        required=True,
        help="Reset confirmation passphrase. Must be 'RESET_SHOPSMART_VECTOR_STORE'."
    )

    args = parser.parse_args()

    expected_passphrase = "RESET_SHOPSMART_VECTOR_STORE"
    if args.confirm != expected_passphrase:
        print(f"Error: Confirmation phrase '{args.confirm}' is invalid.")
        print(f"Please use: --confirm {expected_passphrase}")
        sys.exit(1)

    print(f"Executing complete vector store collection reset for '{settings.VECTOR_COLLECTION_NAME}'...")
    
    try:
        store = get_vector_store()
        before_count = store.count()
        
        # Reset collection
        store.reset_collection(confirmation=args.confirm)
        
        print("\n----------------------------------------")
        print("Vector database collection reset completed.")
        print(f"Removed document count: {before_count}")
        print("Active database connection is now empty and ready.")
        print("----------------------------------------")
        sys.exit(0)
    except Exception as e:
        print(f"Error: Failed to reset collection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
