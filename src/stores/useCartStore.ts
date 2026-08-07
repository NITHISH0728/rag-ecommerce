import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductRepository } from '../repositories/productRepository';
import type { Product } from '../types/product';

export interface CartItemState {
  productId: string;
  quantity: number;
}

export interface ResolvedCartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItemState[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  getResolvedItems: () => ResolvedCartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (productId: string, quantity = 1) => {
        const product = ProductRepository.getProductById(productId);
        if (!product || product.stock <= 0) return;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === productId
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
            updated[existingIndex].quantity = newQty;
            return { items: updated };
          } else {
            const newQty = Math.min(product.stock, quantity);
            return { items: [...state.items, { productId, quantity: newQty }] };
          }
        });
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        const product = ProductRepository.getProductById(productId);
        if (!product) return;

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const cappedQty = Math.min(product.stock, quantity);
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: cappedQty } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          const product = ProductRepository.getProductById(item.productId);
          if (!product) return total;
          return total + product.price * item.quantity;
        }, 0);
      },

      getResolvedItems: () => {
        const resolved: ResolvedCartItem[] = [];
        get().items.forEach((item) => {
          const product = ProductRepository.getProductById(item.productId);
          if (product) {
            resolved.push({ product, quantity: item.quantity });
          }
        });
        return resolved;
      },
    }),
    {
      name: 'shopsmart-cart-storage',
    }
  )
);
