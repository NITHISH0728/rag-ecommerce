import os
import sys
import shutil
import json
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.vector_store.vector_store_interface import get_vector_store

def main():
    db_path = os.path.abspath(settings.VECTOR_DB_PATH)
    lock_file = os.path.join(db_path, ".ingestion.lock")
    
    # Check concurrent write lock
    if os.path.exists(lock_file):
        print("Error: An active ingestion write operation is currently in progress.")
        print("Backup aborted to prevent database corruption.")
        sys.exit(1)

    # Initialize store to count records
    store = get_vector_store()
    record_count = store.count()
    meta = store.get_collection_metadata()

    # Format timestamped directory path
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H%M%SZ")
    backup_dir = os.path.abspath(os.path.join("backups", "chroma", timestamp))
    
    if os.path.exists(backup_dir):
        print(f"Error: Backup folder '{backup_dir}' already exists.")
        sys.exit(1)

    print(f"Creating timestamped vector store backup at: {backup_dir} ...")
    
    try:
        # 1. Copy persistent database directory safely
        # Exclude temporary lock files if any
        shutil.copytree(
            src=db_path,
            dst=os.path.join(backup_dir, "chroma"),
            ignore=shutil.ignore_patterns(".ingestion.lock")
        )
        
        # 2. Write manifest details
        manifest = {
            "application": "ShopSmart AI",
            "backup_timestamp": datetime.utcnow().isoformat() + "Z",
            "collection_name": settings.VECTOR_COLLECTION_NAME,
            "record_count": record_count,
            "database_source_path": db_path,
            "collection_metadata": meta
        }
        
        with open(os.path.join(backup_dir, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, default=str)
            
        # 3. Verify backup files exist
        sqlite_file = os.path.join(backup_dir, "chroma", "chroma.sqlite3")
        manifest_file = os.path.join(backup_dir, "manifest.json")
        
        if os.path.exists(sqlite_file) and os.path.exists(manifest_file):
            print("\n----------------------------------------")
            print("Vector database backup completed.")
            print(f"Location: {backup_dir}")
            print(f"Records saved: {record_count}")
            print("Files verified successfully.")
            print("----------------------------------------")
            sys.exit(0)
        else:
            print("Error: Backup files verification failed. Output files missing.")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: Failed to perform backup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
