import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductRepository } from '../repositories/productRepository';
import type { Product } from '../types/product';

interface CompareStore {
  productIds: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  getCompareCount: () => number;
  getResolvedCompareProducts: () => Product[];
}

export const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addToCompare: (productId: string) => {
        const { productIds } = get();
        if (productIds.includes(productId)) return true;
        if (productIds.length >= MAX_COMPARE_ITEMS) return false;
        set({ productIds: [...productIds, productId] });
        return true;
      },

      removeFromCompare: (productId: string) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      toggleCompare: (productId: string) => {
        const { isInCompare, removeFromCompare, addToCompare } = get();
        if (isInCompare(productId)) {
          removeFromCompare(productId);
          return true;
        } else {
          return addToCompare(productId);
        }
      },

      clearCompare: () => {
        set({ productIds: [] });
      },

      isInCompare: (productId: string) => {
        return get().productIds.includes(productId);
      },

      getCompareCount: () => {
        return get().productIds.length;
      },

      getResolvedCompareProducts: () => {
        const products: Product[] = [];
        get().productIds.forEach((id) => {
          const product = ProductRepository.getProductById(id);
          if (product) products.push(product);
        });
        return products;
      },
    }),
    {
      name: 'shopsmart-compare-storage',
    }
  )
);
