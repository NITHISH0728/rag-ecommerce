import type { Product, FilterOptions } from '../types/product';
import { productSchema } from '../schemas/productSchema';
import rawProductsData from '../data/products.json';
import { filterProductsList } from '../utils/productFilters';
import { searchProductsList } from '../utils/productSearch';

class ProductRepositoryClass {
  private products: Product[] = [];
  private invalidCount = 0;
  private validationErrors: string[] = [];
  private loaded = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.products = [];
    this.invalidCount = 0;
    this.validationErrors = [];

    if (!Array.isArray(rawProductsData) || rawProductsData.length === 0) {
      this.loaded = true;
      return;
    }

    rawProductsData.forEach((item, index) => {
      const result = productSchema.safeParse(item);
      if (result.success) {
        this.products.push(result.data as Product);
      } else {
        this.invalidCount++;
        const errDesc = `Item #${index} (${(item as any)?.name || 'unnamed'}): ` +
          result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        this.validationErrors.push(errDesc);
        console.warn(`[ProductRepository] Validation failure on record ${index}:`, errDesc);
      }
    });

    this.loaded = true;
  }

  public getDatasetStatusInfo() {
    return {
      connected: this.products.length > 0,
      productCount: this.products.length,
      invalidRecordCount: this.invalidCount,
      validationErrors: this.validationErrors,
      lastLoadedAt: this.loaded ? new Date().toISOString() : null,
    };
  }

  public getAllProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(productId: string): Product | undefined {
    return this.products.find((p) => p.productId === productId);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
  }

  public getProductsByCategory(category: string): Product[] {
    return this.products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  public getProductsByBrand(brand: string): Product[] {
    return this.products.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  public searchProducts(query: string): Product[] {
    return searchProductsList(this.products, query);
  }

  public filterProducts(filters: FilterOptions): Product[] {
    return filterProductsList(this.products, filters);
  }

  public getFeaturedProducts(): Product[] {
    return this.products.filter((p) => p.featured === true);
  }

  public getRelatedProducts(productId: string, limit = 4): Product[] {
    const target = this.getProductById(productId);
    if (!target) return [];

    return this.products
      .filter((p) => p.productId !== productId)
      .map((p) => {
        let score = 0;
        
        // 1. Same category
        if (p.category === target.category) {
          score += 50;
        }
        
        // 2. Similar tags
        const targetTags = new Set(target.tags || []);
        p.tags?.forEach((tag) => {
          if (targetTags.has(tag)) score += 10;
        });

        // 3. Similar use cases
        const targetUseCases = new Set(target.useCases || []);
        p.useCases?.forEach((uc) => {
          if (targetUseCases.has(uc)) score += 10;
        });

        // 4. Similar price band (within 30%)
        const priceDiffRatio = Math.abs(p.price - target.price) / target.price;
        if (priceDiffRatio <= 0.3) {
          score += 15;
        }

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, limit);
  }

  public getAvailableCategories(): string[] {
    const categories = new Set<string>();
    this.products.forEach((p) => categories.add(p.category));
    return Array.from(categories);
  }

  public getAvailableBrands(): string[] {
    const brands = new Set<string>();
    this.products.forEach((p) => brands.add(p.brand));
    return Array.from(brands);
  }

  public getPriceBounds(): { min: number; max: number } {
    if (this.products.length === 0) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;

    this.products.forEach((p) => {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    });

    return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max };
  }
}

export const ProductRepository = new ProductRepositoryClass();
