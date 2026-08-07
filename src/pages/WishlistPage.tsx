import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCartStore } from '../stores/useCartStore';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const WishlistPage: React.FC = () => {
  useDocumentTitle('Wishlist', 'Saved technology products shortlist.');

  const { clearWishlist, getResolvedWishlistProducts } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  const wishlistProducts = getResolvedWishlistProducts();

  const handleMoveAllToCart = () => {
    wishlistProducts.forEach((p) => addToCart(p.productId, 1));
    toast.success(`Moved ${wishlistProducts.length} items to your shopping bag.`);
  };

  if (wishlistProducts.length === 0) {
    return (
      <EmptyState
        variant="wishlist"
        actionLabel="Explore Hardware Catalog"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E5E5E2] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Saved Hardware
          </span>
          <h1 className="text-3xl font-extrabold text-[#111111] font-display mt-1">
            My Wishlist ({wishlistProducts.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMoveAllToCart}
            className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" /> Move All to Bag
          </button>
          <button
            onClick={clearWishlist}
            className="px-3 py-2 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#B91C1C] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            Clear Wishlist
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  );
};
