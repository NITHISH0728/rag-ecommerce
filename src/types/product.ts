export type SpecificationValue = string | number | boolean;

export interface Product {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  model?: string;
  sku?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: 'INR';
  description: string;
  shortDescription: string;
  specifications: Record<string, SpecificationValue>;
  rating: number;
  reviewCount?: number;
  stock: number;
  warranty: string;
  useCases: string[];
  tags: string[];
  images: string[];
  colorOptions?: string[];
  highlights?: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  searchQuery?: string;
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  warranty?: string[];
  tags?: string[];
  useCases?: string[];
}

export type SortOption =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'name-asc';

export interface CategoryDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  popularBrands: string[];
  featuredSpecs: string[];
}

export interface DatasetStatusInfo {
  connected: boolean;
  productCount: number;
  invalidRecordCount: number;
  validationErrors: string[];
  lastLoadedAt: string | null;
}
