import type { Product, SortOption } from '../types/product';

export function sortProductsList(products: Product[], sortOption: SortOption): Product[] {
  const copy = [...products];

  switch (sortOption) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'recommended':
    default:
      // Featured first, then higher rating, then ID
      return copy.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
  }
}
