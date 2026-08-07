import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../../types/product';
import { ProductImage } from '../common/ProductImage';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCompareStore } from '../../stores/useCompareStore';
import { cn } from '../../utils/cn';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
}) => {
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.productId));
  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const isInCompare = useCompareStore((s) => s.isInCompare(product.productId));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.productId, 1);
    toast.success(`Added "${product.name}" to your bag.`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.productId);
    toast.info(
      isInWishlist
        ? `Removed "${product.name}" from wishlist.`
        : `Saved "${product.name}" to wishlist.`
    );
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = toggleCompare(product.productId);
    if (!success) {
      toast.warning('Maximum 4 products allowed in comparison board.');
    } else {
      toast.info(
        isInCompare
          ? `Removed "${product.name}" from compare.`
          : `Added "${product.name}" to compare.`
      );
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="editorial-card p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center group">
        <Link to={`/products/${product.productId}`} className="w-full sm:w-48 shrink-0">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            category={product.category}
            className="w-full h-40 rounded-xl"
          />
        </Link>

        <div className="flex-1 min-w-0 space-y-2 text-left w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#626262]">
              {product.brand} &bull; {product.category}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-[#111111]">
                <Star className="w-3.5 h-3.5 fill-[#B45309] text-[#B45309]" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount !== undefined && (
                  <span className="text-[#8A8A8A]">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          <Link
            to={`/products/${product.productId}`}
            className="text-base font-bold text-[#111111] hover:text-[#2563EB] transition-colors font-display block line-clamp-1"
          >
            {product.name}
          </Link>

          <p className="text-xs text-[#626262] line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-[#8A8A8A]">
            <span>Warranty: {product.warranty}</span>
            <span>&bull;</span>
            <span className={product.stock > 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end justify-between gap-4 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[#E5E5E2] pt-4 sm:pt-0 sm:pl-6">
          <div className="text-left sm:text-right">
            <span className="text-xs text-[#8A8A8A] block">Price</span>
            <span className="text-xl font-bold text-[#111111]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWishlist}
              className={cn(
                'p-2.5 rounded-xl border border-[#E5E5E2] transition-colors cursor-pointer',
                isInWishlist
                  ? 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30'
                  : 'bg-white text-[#111111] hover:bg-[#F7F7F5]'
              )}
              title="Wishlist"
            >
              <Heart className={cn('w-4 h-4', isInWishlist && 'fill-[#B91C1C]')} />
            </button>

            <button
              onClick={handleCompare}
              className={cn(
                'p-2.5 rounded-xl border border-[#E5E5E2] transition-colors cursor-pointer',
                isInCompare
                  ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                  : 'bg-white text-[#111111] hover:bg-[#F7F7F5]'
              )}
              title="Compare"
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] disabled:bg-[#E5E5E2] disabled:text-[#8A8A8A] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Bag
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-card p-4 flex flex-col justify-between group relative">
      {/* Top Action Floating Icons */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={handleWishlist}
          className={cn(
            'p-2 rounded-full backdrop-blur-md border border-[#E5E5E2] transition-all cursor-pointer shadow-xs',
            isInWishlist
              ? 'bg-white text-[#B91C1C]'
              : 'bg-white/80 text-[#8A8A8A] hover:text-[#111111]'
          )}
          title="Save to Wishlist"
        >
          <Heart className={cn('w-4 h-4', isInWishlist && 'fill-[#B91C1C]')} />
        </button>

        <button
          onClick={handleCompare}
          className={cn(
            'p-2 rounded-full backdrop-blur-md border border-[#E5E5E2] transition-all cursor-pointer shadow-xs',
            isInCompare
              ? 'bg-white text-[#2563EB]'
              : 'bg-white/80 text-[#8A8A8A] hover:text-[#111111]'
          )}
          title="Add to Compare"
        >
          <Scale className="w-4 h-4" />
        </button>
      </div>

      <div>
        <Link to={`/products/${product.productId}`} className="block overflow-hidden rounded-xl mb-4">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            category={product.category}
            className="w-full aspect-square group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs text-[#8A8A8A]">
            <span className="font-bold uppercase tracking-wider text-[#626262]">
              {product.brand}
            </span>
            {product.rating > 0 && (
              <span className="flex items-center gap-1 font-semibold text-[#111111]">
                <Star className="w-3 h-3 fill-[#B45309] text-[#B45309]" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.productId}`}
            className="text-sm font-bold text-[#111111] hover:text-[#2563EB] transition-colors font-display line-clamp-1 block"
          >
            {product.name}
          </Link>

          <p className="text-xs text-[#626262] line-clamp-2 leading-relaxed min-h-[32px]">
            {product.shortDescription || product.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5E5E2] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block">
            Price
          </span>
          <span className="text-base font-bold text-[#111111]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="p-2.5 rounded-xl bg-[#111111] text-white hover:bg-[#2563EB] disabled:bg-[#E5E5E2] disabled:text-[#8A8A8A] transition-colors cursor-pointer shadow-xs"
          title="Add to Bag"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
