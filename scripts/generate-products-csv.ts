import * as fs from 'fs';
import * as path from 'path';
import { productSchema } from '../src/schemas/productSchema';

function escapeCsv(val: any): string {
  if (val === undefined || val === null) return '';
  let str = '';
  if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }
  str = str.replace(/"/g, '""');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
}

function generateCsv() {
  const productsJsonPath = path.resolve(import.meta.dirname, '../src/data/products.json');
  const productsCsvPath = path.resolve(import.meta.dirname, '../src/data/products.csv');

  if (!fs.existsSync(productsJsonPath)) {
    console.error(`Error: products.json not found at ${productsJsonPath}. Run generation first.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(productsJsonPath, 'utf-8');
  let products: any[] = [];
  try {
    products = JSON.parse(rawData);
  } catch (e: any) {
    console.error('Error parsing products.json:', e.message);
    process.exit(1);
  }

  // Validate every product first
  let invalid = false;
  products.forEach((p, idx) => {
    const check = productSchema.safeParse(p);
    if (!check.success) {
      invalid = true;
      console.error(`Validation failed for product at index ${idx} [${p.productId || 'unnamed'}]:`, check.error.errors);
    }
  });

  if (invalid) {
    console.error('CSV generation halted due to validation errors.');
    process.exit(1);
  }

  const headers = [
    'product_id',
    'name',
    'slug',
    'brand',
    'model',
    'sku',
    'category',
    'price',
    'original_price',
    'discount_percentage',
    'currency',
    'description',
    'short_description',
    'specifications_json',
    'rating',
    'review_count',
    'stock',
    'warranty',
    'use_cases_json',
    'tags_json',
    'images_json',
    'color_options_json',
    'highlights_json',
    'featured',
    'created_at',
    'updated_at'
  ];

  let csvContent = headers.join(',') + '\n';

  products.forEach((p) => {
    const row = [
      escapeCsv(p.productId),
      escapeCsv(p.name),
      escapeCsv(p.slug),
      escapeCsv(p.brand),
      escapeCsv(p.model),
      escapeCsv(p.sku),
      escapeCsv(p.category),
      escapeCsv(p.price),
      escapeCsv(p.originalPrice),
      escapeCsv(p.discountPercentage),
      escapeCsv(p.currency),
      escapeCsv(p.description),
      escapeCsv(p.shortDescription),
      escapeCsv(p.specifications),
      escapeCsv(p.rating),
      escapeCsv(p.reviewCount),
      escapeCsv(p.stock),
      escapeCsv(p.warranty),
      escapeCsv(p.useCases),
      escapeCsv(p.tags),
      escapeCsv(p.images),
      escapeCsv(p.colorOptions),
      escapeCsv(p.highlights),
      escapeCsv(p.featured),
      escapeCsv(p.createdAt),
      escapeCsv(p.updatedAt)
    ];
    csvContent += row.join(',') + '\n';
  });

  fs.writeFileSync(productsCsvPath, csvContent, 'utf-8');
  console.log(`Successfully generated products.csv at ${productsCsvPath}`);
}

generateCsv();
