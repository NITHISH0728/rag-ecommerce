import type { Product } from '../types/product';

export interface RagDocument {
  text: string;
  metadata: {
    productId: string;
    slug: string;
    category: string;
    brand: string;
    price: number;
    rating: number;
    stock: number;
  };
}

export function productToRagDocument(product: Product): RagDocument {
  const specsStr = Object.entries(product.specifications || {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const useCasesStr = (product.useCases || [])
    .map((uc) => `- ${uc}`)
    .join('\n');

  const tagsStr = (product.tags || [])
    .map((tag) => `#${tag}`)
    .join(' ');

  const availability = product.stock === 0
    ? 'Out of stock'
    : product.stock <= 5
    ? 'Low stock'
    : 'In stock';

  const text = [
    `Product: ${product.name}`,
    `Brand: ${product.brand}`,
    `Category: ${product.category}`,
    `Price: INR ${product.price}`,
    `Description: ${product.description}`,
    `Specifications:\n${specsStr}`,
    `Use cases:\n${useCasesStr}`,
    `Warranty: ${product.warranty}`,
    `Availability: ${availability}`,
    `Tags: ${tagsStr}`,
  ].join('\n');

  return {
    text,
    metadata: {
      productId: product.productId,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      price: product.price,
      rating: product.rating,
      stock: product.stock,
    },
  };
}
