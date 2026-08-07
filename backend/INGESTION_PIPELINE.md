# ShopSmart AI - Product Ingestion and Embedding Pipeline (Phase 3)

This document provides a comprehensive overview of the ingestion and embedding architecture built to load catalog dataset records, chunk them, generate embeddings, and populate a local persistent ChromaDB collection for future semantic and RAG searches.

---

## 1. Pipeline Architecture

The ingestion pipeline is designed as an idempotent, incremental pipeline structured in the following sequential phases:

```
[products.json] or [products.csv]
             ↓
        1. Loader (Read file path, validate UTF-8 & structure)
             ↓
        2. Validator (Dataset level checks: unique IDs, unique slugs, unique SKUs)
             ↓
        3. Normalizer (Clean whitespace, uniform categories, lower tag casing)
             ↓
        4. Document Builder (Deterministic text formatting)
             ↓
        5. Chunker (Divide text at logical section boundaries)
             ↓
        6. Hash Checker (Calculate SHA-256 content hashes)
             ↓
        7. Change Classifier (Check vector store; isolate New/Updated/Stale chunks)
             ↓
        8. Embedder (Compute vector embeddings in batches using provider APIs)
             ↓
        9. Vector Writer (Upsert chunks to ChromaDB & prune removed stale records)
             ↓
        10. Verification & Report Generation (Compute execution metrics)
```

---

## 2. Configuration & Environmental Variables

Configuration is strongly typed via Pydantic Settings (`backend/app/core/config.py`). It reads variables from a local `.env` file or environment:

| Environment Variable | Description | Default Value |
| :--- | :--- | :--- |
| `APP_ENV` | Running environment (`development` / `production`) | `development` |
| `PRODUCT_DATA_PATH` | Path to the source technology catalog JSON/CSV | `./data/products.json` |
| `EMBEDDING_PROVIDER` | Embeddings provider (`openai` or `gemini`) | `openai` |
| `OPENAI_API_KEY` | OpenAI API Credential key | (None) |
| `OPENAI_EMBEDDING_MODEL` | OpenAI Model identifier | `text-embedding-3-small` |
| `GOOGLE_API_KEY` | Google AI SDK key | (None) |
| `GEMINI_EMBEDDING_MODEL` | Gemini Model identifier | `models/embedding-001` |
| `EMBEDDING_BATCH_SIZE` | Size of batch chunks sent per API request | `50` |
| `CHUNK_SIZE` | Max character length of a single chunk | `1200` |
| `CHUNK_OVERLAP` | Character overlap count (for generic splits) | `150` |
| `VECTOR_COLLECTION_NAME` | ChromaDB collection identifier name | `shopsmart-products` |
| `VECTOR_DB_PATH` | Storage directory for persistent SQLite database | `./storage/chroma` |
| `INGESTION_MAX_RETRIES` | Max attempts for embedding batches | `3` |
| `INGESTION_LOG_LEVEL` | Log level threshold (`INFO` / `DEBUG` / `WARNING`) | `INFO` |

---

## 3. Normalization & Verification

The pipeline ensures high quality data formatting:
1. **Whitespace**: Collapses multiple internal spaces and strips leading/trailing characters.
2. **Category**: Maps input categories to the 8 standard names case-insensitively (e.g. `laptops` -> `Laptops`).
3. **Tags**: Forces tags to lowercase and replaces spaces/underscores with hyphens (e.g. `Student Laptop` -> `student-laptop`).
4. **Duplicates**: Uniqueness checks prevent duplicate `product_id`, `slug`, and `sku` values from corrupting the index.

---

## 4. Document Builder & Chunker Strategy

### Document Layout
Each product is formatted into a deterministic text block:
```text
Product Name: LuminaBook Pro 16 Ultimate
Product ID: LAP-001
Brand: Apple
Category: Laptops
Model: LuminaBook Pro 16
Price: INR 189999
Rating: 4.8 out of 5
Availability: In stock
Stock Quantity: 15
Warranty: Limited 1-year warranty

Short Description:
Premium 16-inch display laptop configured for software engineers, designers...

Full Description:
A premium 16-inch laptop engineered for creative professionals...

Key Specifications:
- Processor: Apple M3 Pro (12-Core)
- RAM: 36 GB Unified
- Storage: 1 TB NVMe SSD

Highlights:
- Liquid Retina XDR Display
- Apple Silicon M3 Pro

Recommended Use Cases:
- Coding
- Video editing

Search Tags:
- premium-laptop
- m3-pro
```

### Chunking Logic
- If the entire formatted text fits within `CHUNK_SIZE` (1200 characters), it is stored as **one single chunk** to preserve full context.
- If it exceeds the limit, the document splits along double newline (`\n\n`) paragraph boundaries. This prevents splitting key-value specification lines or breaking descriptions in half.
- Every chunk inherits the product's primary metadata and has a deterministic, sequential chunk ID (`ID::chunk-000`, `ID::chunk-001`), ensuring stable identifier indexing.

---

## 5. Incremental Ingestion & Change Classification

To minimize API costs and rates:
1. The pipeline calculates a deterministic SHA-256 hash of each chunk's content.
2. It queries ChromaDB to fetch existing IDs and hashes.
3. Chunks are classified into:
   - **New**: Document ID not present in ChromaDB.
   - **Updated**: Document ID exists, but calculated content hash has changed.
   - **Unchanged**: Document ID and content hash match (skipped from embedding).
   - **Removed**: Document ID exists in ChromaDB, but has no matching record in the active source dataset.
4. Only **New** and **Updated** chunks are sent to the embedding APIs. Passing `--force-reembed` overrides cache checking.

---

## 6. CLI Execution Commands

Execute commands from the `backend/` directory:

### Run Dry-Run (Cost & Chunk Estimation)
Simulates loading, validating, normalizing, chunking, and change classification. No APIs are queried and no database writes occur:
```bash
python scripts/ingest_products.py --dry-run
```

### Perform Vector Ingestion (Default OpenAI)
Ingests the products using OpenAI embeddings and saves them to local ChromaDB:
```bash
python scripts/ingest_products.py
```

### Force Complete Re-Embedding
Bypasses cache checks, re-embedding every chunk and overwrite existing vectors:
```bash
python scripts/ingest_products.py --force-reembed
```

### Override Provider to Gemini
Runs the ingestion using Gemini embeddings model:
```bash
python scripts/ingest_products.py --provider gemini
```

### Inspect Chunk Representation for a Product
Displays the raw text representation and chunks generated for a specific product ID:
```bash
python scripts/inspect_documents.py --product-id LAP-001
```

### Verify Vector Integrity Post-Ingestion
Runs verification checks to confirm schema rules (no duplicates, no raw images, no empty chunks):
```bash
python scripts/validate_ingestion.py
```

---

## 7. Testing

Unit tests are written with `pytest` and mock external provider APIs to prevent paid API calls. To execute unit tests:

```bash
pytest tests/
```
