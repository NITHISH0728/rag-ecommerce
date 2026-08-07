# ShopSmart AI - Python Ingestion Backend

This directory contains the Python-based data engineering ingestion pipeline for **ShopSmart AI**. It loads the technology product catalog, validates schema constraints, normalizes contents, splits documents into logical chunks, calculates content hashes, generates embeddings, and indexes them in a persistent local ChromaDB vector store.

---

## Setup Instructions

### 1. Create and Activate a Virtual Environment
From the `backend/` directory:

On Windows (PowerShell):
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

On macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure the Environment
Copy `.env.example` to `.env` and fill in your API credentials:
```bash
cp .env.example .env
```
Ensure you set your selected provider (e.g. `openai` or `gemini`) and configure `OPENAI_API_KEY` or `GOOGLE_API_KEY` appropriately.

---

## Running the Pipeline

All commands should be executed inside the virtual environment from the `backend/` directory:

### Dry-Run Mode (Safe Verification)
Simulate parsing, chunking, and change classification without calling APIs or writing to SQLite files:
```bash
python scripts/ingest_products.py --dry-run
```

### Regular Ingestion
Generate embeddings and write updates to ChromaDB:
```bash
python scripts/ingest_products.py
```

### Force Complete Re-Embedding
Bypass hash cache checks and re-embed all active chunks:
```bash
python scripts/ingest_products.py --force-reembed
```

---

## Inspection & Integrity Scripts

### Inspect Document Chunks
Visualize the text document layout and chunk boundaries for a specific product:
```bash
python scripts/inspect_documents.py --product-id LAP-001
```

### Validate Ingestion Format
Verify that no duplicate chunk IDs, raw base64 graphics, or empty content leaks exist in the generated dataset:
```bash
python scripts/validate_ingestion.py
```

---

## Running Tests
Run the automated test suite with mock API interfaces:
```bash
pytest tests/
```
