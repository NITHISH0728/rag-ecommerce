import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductRepository } from '../repositories/productRepository';
import type { Product } from '../types/product';

interface WishlistStore {
  productIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  getResolvedWishlistProducts: () => Product[];
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addToWishlist: (productId: string) => {
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          return { productIds: [...state.productIds, productId] };
        });
      },

      removeFromWishlist: (productId: string) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      toggleWishlist: (productId: string) => {
        const { productIds, addToWishlist, removeFromWishlist } = get();
        if (productIds.includes(productId)) {
          removeFromWishlist(productId);
        } else {
          addToWishlist(productId);
        }
      },

      clearWishlist: () => {
        set({ productIds: [] });
      },

      isInWishlist: (productId: string) => {
        return get().productIds.includes(productId);
      },

      getWishlistCount: () => {
        return get().productIds.length;
      },

      getResolvedWishlistProducts: () => {
        const products: Product[] = [];
        get().productIds.forEach((id) => {
          const product = ProductRepository.getProductById(id);
          if (product) products.push(product);
        });
        return products;
      },
    }),
    {
      name: 'shopsmart-wishlist-storage',
    }
  )
);
