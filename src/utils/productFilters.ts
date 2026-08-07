import type { Product, FilterOptions } from '../types/product';

export function filterProductsList(products: Product[], filters: FilterOptions): Product[] {
  return products.filter((product) => {
    // 1. Search Query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchTag = product.tags?.some((t) => t.toLowerCase().includes(q));
      const matchUseCase = product.useCases?.some((u) => u.toLowerCase().includes(q));

      if (!matchName && !matchBrand && !matchCategory && !matchDesc && !matchTag && !matchUseCase) {
        return false;
      }
    }

    // 2. Categories filter
    if (filters.categories && filters.categories.length > 0) {
      const catMatch = filters.categories.some(
        (c) => c.toLowerCase() === product.category.toLowerCase()
      );
      if (!catMatch) return false;
    }

    // 3. Brands filter
    if (filters.brands && filters.brands.length > 0) {
      const brandMatch = filters.brands.some(
        (b) => b.toLowerCase() === product.brand.toLowerCase()
      );
      if (!brandMatch) return false;
    }

    // 4. Price range
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }

    // 5. Rating
    if (filters.minRating !== undefined && product.rating < filters.minRating) {
      return false;
    }

    // 6. In Stock Only
    if (filters.inStockOnly && product.stock <= 0) {
      return false;
    }

    // 7. Warranty filter
    if (filters.warranty && filters.warranty.length > 0) {
      const warrantyMatch = filters.warranty.some((w) =>
        product.warranty.toLowerCase().includes(w.toLowerCase())
      );
      if (!warrantyMatch) return false;
    }

    return true;
  });
}
