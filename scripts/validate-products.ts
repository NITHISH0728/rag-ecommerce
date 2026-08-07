import * as fs from 'fs';
import * as path from 'path';
import { productSchema } from '../src/schemas/productSchema';

function validateProducts() {
  const productsJsonPath = path.resolve(import.meta.dirname, '../src/data/products.json');
  
  if (!fs.existsSync(productsJsonPath)) {
    console.error(`Error: products.json not found at ${productsJsonPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(productsJsonPath, 'utf-8');
  let products: any[] = [];
  
  try {
    products = JSON.parse(rawData);
  } catch (e: any) {
    console.error('Error: Failed to parse products.json as valid JSON.', e.message);
    process.exit(1);
  }

  if (!Array.isArray(products)) {
    console.error('Error: products.json must contain a JSON array.');
    process.exit(1);
  }

  console.log(`Loaded ${products.length} products from products.json. Starting validation...`);

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenSkus = new Set<string>();
  let invalidCount = 0;

  products.forEach((p, index) => {
    // 1. Zod Validation
    const validationResult = productSchema.safeParse(p);
    
    if (!validationResult.success) {
      invalidCount++;
      const pId = p.productId || `Index-${index}`;
      console.error(`\n[Validation Error] Product ID: ${pId}`);
      validationResult.error.errors.forEach((err) => {
        console.error(`  Field: "${err.path.join('.')}" -> Error: ${err.message}`);
      });
      return;
    }

    const validatedProduct = validationResult.data;

    // 2. Uniqueness Checks
    const { productId, slug, sku } = validatedProduct;

    if (seenIds.has(productId)) {
      invalidCount++;
      console.error(`\n[Duplicate Error] Product ID "${productId}" is not unique.`);
    } else {
      seenIds.add(productId);
    }

    if (seenSlugs.has(slug)) {
      invalidCount++;
      console.error(`\n[Duplicate Error] Slug "${slug}" is not unique.`);
    } else {
      seenSlugs.add(slug);
    }

    if (sku) {
      if (seenSkus.has(sku)) {
        invalidCount++;
        console.error(`\n[Duplicate Error] SKU "${sku}" is not unique.`);
      } else {
        seenSkus.add(sku);
      }
    }
  });

  if (invalidCount > 0) {
    console.error(`\nValidation failed. Found ${invalidCount} validation/uniqueness errors.`);
    process.exit(1);
  }

  console.log('\n----------------------------------------');
  console.log(`Validated ${products.length} products.`);
  console.log('0 invalid products.');
  console.log('0 duplicate product IDs.');
  console.log('0 duplicate slugs.');
  console.log('All product records passed validation.');
  console.log('----------------------------------------');
}

validateProducts();
