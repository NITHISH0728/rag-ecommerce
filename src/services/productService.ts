import type { Product, FilterOptions } from '../types/product';
import { ProductRepository } from '../repositories/productRepository';

export class ProductService {
  public static async fetchAllProducts(): Promise<Product[]> {
    return ProductRepository.getAllProducts();
  }

  public static async fetchProductById(productId: string): Promise<Product | undefined> {
    return ProductRepository.getProductById(productId);
  }

  public static async fetchProductBySlug(slug: string): Promise<Product | undefined> {
    return ProductRepository.getProductBySlug(slug);
  }

  public static async fetchProductsByCategory(category: string): Promise<Product[]> {
    return ProductRepository.getProductsByCategory(category);
  }

  public static async searchProducts(query: string): Promise<Product[]> {
    return ProductRepository.searchProducts(query);
  }

  public static async filterProducts(filters: FilterOptions): Promise<Product[]> {
    return ProductRepository.filterProducts(filters);
  }

  public static async fetchFeaturedProducts(): Promise<Product[]> {
    return ProductRepository.getFeaturedProducts();
  }

  public static async fetchRelatedProducts(productId: string, limit?: number): Promise<Product[]> {
    return ProductRepository.getRelatedProducts(productId, limit);
  }
}
