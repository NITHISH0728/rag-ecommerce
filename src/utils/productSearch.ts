import type { Product } from '../types/product';

export function searchProductsList(products: Product[], query: string): Product[] {
  if (!query || query.trim() === '') {
    return products;
  }

  const normalized = query.toLowerCase().trim();
  const terms = normalized.split(/\s+/);

  // Filter products that contain all terms
  const matched = products.filter((product) => {
    const searchableText = [
      product.name,
      product.brand,
      product.model || '',
      product.category,
      product.description,
      product.shortDescription || '',
      ...(product.tags || []),
      ...(product.useCases || []),
      ...Object.entries(product.specifications || {}).map(([k, v]) => `${k} ${v}`),
    ]
      .join(' ')
      .toLowerCase();

    return terms.every((term) => searchableText.includes(term));
  });

  // Score matched products to prioritize results
  return matched
    .map((product) => {
      let score = 0;
      const nameLower = product.name.toLowerCase();
      const brandLower = product.brand.toLowerCase();
      const modelLower = (product.model || '').toLowerCase();
      const catLower = product.category.toLowerCase();

      // Full query matches
      if (nameLower.includes(normalized)) {
        score += nameLower.startsWith(normalized) ? 100 : 50;
      }
      if (brandLower.includes(normalized)) {
        score += brandLower.startsWith(normalized) ? 80 : 40;
      }
      if (modelLower.includes(normalized)) {
        score += modelLower.startsWith(normalized) ? 60 : 30;
      }
      if (catLower.includes(normalized)) {
        score += 40;
      }

      // Individual term matches
      terms.forEach((term) => {
        if (nameLower.includes(term)) score += 10;
        if (brandLower.includes(term)) score += 8;
        if (modelLower.includes(term)) score += 6;
        if (catLower.includes(term)) score += 5;

        // Tags
        product.tags?.forEach((tag) => {
          if (tag.toLowerCase().includes(term)) score += 4;
        });

        // Use Cases
        product.useCases?.forEach((uc) => {
          if (uc.toLowerCase().includes(term)) score += 3;
        });

        // Specifications
        Object.entries(product.specifications || {}).forEach(([k, v]) => {
          const valStr = String(v).toLowerCase();
          const keyStr = k.toLowerCase();
          if (valStr.includes(term)) score += 2;
          if (keyStr.includes(term)) score += 1;
        });
      });

      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}
