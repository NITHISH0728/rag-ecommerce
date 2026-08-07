# ShopSmart AI - Dataset Integration Guide

This guide provides instructions for managing, validating, and exporting the technology catalog dataset inside **ShopSmart AI**, and explains the pipeline preparation for the future FastAPI + ChromaDB RAG assistant backend.

---

## 1. Dataset Purpose & Disclaimer

### Purpose
The catalog consists of **80 technology products** distributed across 8 core categories. It is designed to demonstrate:
- Structured e-commerce catalog operations (filtering, sorting, paging, comparison).
- Multi-attribute full-text and semantic search.
- Use-case and budget-based retrieval queries.
- Clean text documents for Retrieval-Augmented Generation (RAG) chunking.

### Disclaimer
> [!IMPORTANT]
> **Demonstration Data Notice**: All prices, ratings, stock counts, warranties, and review counts are demonstration values for testing and presentation purposes. They do not represent live retailer pricing, official manufacturer inventory, or current market availability.

---

## 2. Dataset Locations

- **JSON Dataset**: `src/data/products.json` (canonical source of truth)
- **CSV Export**: `src/data/products.csv` (serialized for database import)
- **Metadata**: `src/data/datasetMetadata.json` (describes dataset metrics and classifications)

---

## 3. Product Schema Specification

Every product in the catalog conforms to the following TypeScript interface (`src/types/product.ts`) and is verified at runtime by the Zod schema (`src/schemas/productSchema.ts`).

```typescript
type Product = {
  productId: string;           // Unique, stable, readable identifier (e.g., "LAP-001")
  name: string;                // Full product display title
  slug: string;                // Unique, lowercase, hyphenated URL-friendly slug
  brand: string;               // Brand name (e.g., "Dell", "Apple", "Logitech")
  model?: string;              // Optional specific model name
  sku?: string;                // Optional unique stock-keeping unit ID
  category: string;            // Must match one of the 8 normalized categories exactly
  price: number;               // Numeric price in INR (integer, no symbols or commas)
  originalPrice?: number;      // Optional higher comparison price (before discount)
  discountPercentage?: number; // Optional percentage (automatically calculated from price/originalPrice)
  currency: "INR";             // Hardcoded to "INR"
  description: string;         // Extended overview text (50-110 words)
  shortDescription: string;    // Concise card-level description (12-28 words)
  specifications: Record<string, string | number | boolean>; // Dynamic structured key-value specification pairs
  rating: number;              // Product score between 3.6 and 4.9
  reviewCount?: number;        // Optional integer count of customer reviews
  stock: number;               // Current inventory quantity (integer between 0 and 120)
  warranty: string;            // Standardized duration text (e.g. "1 year", "3 years")
  useCases: string[];          // List of 2 to 6 target use-cases (e.g., ["Coding", "Gaming"])
  tags: string[];              // List of 4 to 10 lowercase, hyphenated search tags
  images: string[];            // Local fallback or absolute image path list
  colorOptions?: string[];     // Optional array of color names
  highlights?: string[];       // Optional bullet points of key features
  featured: boolean;           // Showcases the product on the Home page featured grid
  createdAt: string;           // ISO 8601 creation timestamp
  updatedAt: string;           // ISO 8601 updated timestamp (must be equal to or later than createdAt)
};
```

---

## 4. Normalized Categories

Only the following 8 category values are permitted in the catalog:
- `Laptops`
- `Smartphones`
- `Tablets`
- `Monitors`
- `Keyboards`
- `Mice`
- `Headphones`
- `Accessories`

---

## 5. Development CLI Commands

Scripts are provided in `package.json` to manage, validate, and regenerate the files:

### Validate Products
Runs a TypeScript validation process using Zod, verifying all fields, pricing relationships, and duplicate constraints:
```bash
npm run validate:products
```

### Regenerate CSV Export
Parses `products.json`, runs Zod validation, serializes arrays and specifications to nested JSON, and writes a clean CSV table:
```bash
npm run generate:csv
```

### Regrow / Reset Dataset
Runs the dataset generation compiler to rebuild products, metadata, and CSV files:
```bash
npm run generate:dataset
```

---

## 6. How-To Operations

### How to Add a New Product
1. Open `scripts/generate-dataset.ts` (or add to `src/data/products.json` if editing final assets directly).
2. Create a new entry using a unique ID format (e.g., `LAP-021` or `ACC-008`).
3. Formulate unique values for `productId`, `slug`, and `sku`.
4. Ensure the category matches one of the 8 normalized values exactly.
5. Provide a minimum of 2 use-cases and 4 tags.
6. Run the generation and validation scripts to update JSON and CSV outputs.

### How to Change a Price
1. Edit the product's `price` field in the dataset.
2. If `originalPrice` exists, ensure it remains greater than `price`.
3. If using `scripts/generate-dataset.ts`, the `discountPercentage` is calculated automatically. If modifying the JSON directly, recalculate:
   $$\text{discountPercentage} = \text{Math.round}\left(\frac{\text{originalPrice} - \text{price}}{\text{originalPrice}} \times 100\right)$$
4. Validate the changes by running `npm run validate:products`.

### How to Update Stock
1. Locate the product in the catalog.
2. Modify the integer value of `stock`.
   - `stock = 0`: Displays "Out of stock" (purchases are disabled automatically).
   - `stock <= 5`: Displays "Low Stock (X units left)".
   - `stock > 5`: Displays "In Stock".
3. The shopping cart stores stock caps automatically to prevent ordering more than available inventory.

### How to Add a Category
1. Open `src/data/categories.ts` and append a new `CategoryDefinition`.
2. Update the Zod schema category enum in `src/schemas/productSchema.ts` to include the new name.
3. Update the `Product` TypeScript definition if necessary.

---

## 7. RAG Pipeline Preparation

To prepare the catalog for retrieval-augmented generation and vector database embeddings, use the built-in serialization utility:
`src/utils/productToRagDocument.ts`

This helper transforms raw product objects into optimized text blocks:

```typescript
import { productToRagDocument } from './utils/productToRagDocument';

const document = productToRagDocument(laptopProduct);
console.log(document.text);
// Output:
// Product: LuminaBook Pro 16 Ultimate
// Brand: Apple
// Category: Laptops
// Price: INR 189999
// Description: ...
// Specifications:
// - Processor: Apple M3 Pro (12-Core)
// - RAM: 36 GB Unified
// Use cases:
// - Coding
// - Video editing
// Warranty: Limited 1-year warranty
// Availability: In stock
// Tags: #premium-laptop #m3-pro #coding

console.log(document.metadata);
// Output: { productId: "LAP-001", slug: "luminabook-pro-16-ultimate", ... }
```

You can feed these text strings directly to your embedding API (e.g. OpenAI `text-embedding-3-small` or HuggingFace models) and store the vectors in ChromaDB alongside the metadata filters.

---

## 8. Transitioning to FastAPI + PostgreSQL later

When migrating from local file data to a live relational database and search API:

1. Import the generated `products.csv` into a PostgreSQL table.
2. Expose standard REST endpoints from FastAPI (e.g., `/api/v1/products`).
3. Modify `src/services/productService.ts` to query the live API:
   ```typescript
   export class ProductService {
     public static async fetchAllProducts(): Promise<Product[]> {
       const response = await fetch('https://api.shopsmart.ai/v1/products');
       return response.json();
     }
   }
   ```
4. Component files query `ProductService` instead of directly loading files, allowing the app to transition seamlessly without any UI component refactoring.
