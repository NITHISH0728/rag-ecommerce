import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  Scale,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ProductRepository } from '../repositories/productRepository';
import { ProductImage } from '../components/common/ProductImage';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCompareStore } from '../stores/useCompareStore';
import { cn } from '../utils/cn';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // Try lookup by ID or Slug
  const product =
    ProductRepository.getProductById(productId || '') ||
    ProductRepository.getProductBySlug(productId || '');

  useDocumentTitle(
    product ? product.name : 'Product Not Found',
    product?.shortDescription || product?.description
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = product ? useWishlistStore((s) => s.isInWishlist(product.productId)) : false;
  const toggleCompare = useCompareStore((s) => s.toggleCompare);
  const isInCompare = product ? useCompareStore((s) => s.isInCompare(product.productId)) : false;

  if (!product) {
    return (
      <EmptyState
        variant="product-not-found"
        title="Product Record Not Found"
        description="The requested product ID does not exist in the active catalog repository."
        actionLabel="Explore All Products"
        actionHref="/products"
      />
    );
  }

  const relatedProducts = ProductRepository.getRelatedProducts(product.productId, 4);

  const handleAddToCart = () => {
    addToCart(product.productId, quantity);
    toast.success(`Added ${quantity} x "${product.name}" to your bag.`);
  };

  const handleBuyNow = () => {
    addToCart(product.productId, quantity);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product.productId);
    toast.info(
      isInWishlist
        ? `Removed "${product.name}" from wishlist.`
        : `Saved "${product.name}" to wishlist.`
    );
  };

  const handleCompare = () => {
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

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [''];

  return (
    <div className="space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A]">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-[#111111]">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/categories/${product.category.toLowerCase()}`} className="hover:text-[#111111]">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Gallery Region */}
        <div className="lg:col-span-6 space-y-4">
          <ProductImage
            src={galleryImages[selectedImageIndex]}
            alt={product.name}
            category={product.category}
            className="w-full aspect-square rounded-3xl border border-[#E5E5E2] shadow-sm"
          />

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0',
                    selectedImageIndex === idx ? 'border-[#2563EB]' : 'border-[#E5E5E2] opacity-70'
                  )}
                >
                  <ProductImage
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    category={product.category}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                {product.brand} &bull; {product.category}
              </span>
              {product.featured && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#111111] text-white text-[10px] font-bold uppercase tracking-wider">
                  Featured Pro
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight font-display">
              {product.name}
            </h1>

            {/* Rating & Review Count */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#111111] pt-1">
                <div className="flex items-center text-[#B45309]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold">{product.rating.toFixed(1)}</span>
                </div>
                {product.reviewCount !== undefined && (
                  <span className="text-[#8A8A8A]">
                    ({product.reviewCount} customer reviews)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-xs flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#8A8A8A] block uppercase font-bold tracking-wider">
                Price (Inclusive of taxes)
              </span>
              <span className="text-3xl font-extrabold text-[#111111] font-display">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-bold',
                product.stock > 0
                  ? 'bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20'
                  : 'bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/20'
              )}
            >
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-[#626262] leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Quantity + Main Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Quantity
              </span>
              <div className="flex items-center border border-[#E5E5E2] rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-bold text-[#111111] hover:bg-[#F7F7F5] rounded-l-xl"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-[#111111]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="px-3 py-1.5 text-sm font-bold text-[#111111] hover:bg-[#F7F7F5] rounded-r-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-4 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB] disabled:bg-[#E5E5E2] disabled:text-[#8A8A8A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-4 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] disabled:bg-[#E5E5E2] disabled:text-[#8A8A8A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                Buy Now
              </button>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleWishlist}
                className={cn(
                  'flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  isInWishlist
                    ? 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30'
                    : 'bg-white text-[#111111] border-[#E5E5E2] hover:bg-[#F7F7F5]'
                )}
              >
                <Heart className={cn('w-4 h-4', isInWishlist && 'fill-[#B91C1C]')} />
                <span>{isInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={handleCompare}
                className={cn(
                  'flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  isInCompare
                    ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                    : 'bg-white text-[#111111] border-[#E5E5E2] hover:bg-[#F7F7F5]'
                )}
              >
                <Scale className="w-4 h-4" />
                <span>{isInCompare ? 'In Compare Board' : 'Add to Compare'}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Warranty Strip */}
          <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E2] grid grid-cols-3 gap-2 text-center text-xs text-[#626262]">
            <div className="space-y-1">
              <Truck className="w-4 h-4 text-[#2563EB] mx-auto" />
              <span className="block font-bold text-[#111111]">Free Shipping</span>
              <span className="text-[10px] text-[#8A8A8A]">Calculated at Checkout</span>
            </div>
            <div className="space-y-1 border-x border-[#E5E5E2]">
              <ShieldCheck className="w-4 h-4 text-[#15803D] mx-auto" />
              <span className="block font-bold text-[#111111]">Warranty</span>
              <span className="text-[10px] text-[#8A8A8A]">{product.warranty}</span>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-4 h-4 text-[#B45309] mx-auto" />
              <span className="block font-bold text-[#111111]">Return Policy</span>
              <span className="text-[10px] text-[#8A8A8A]">14-Day Replacement</span>
            </div>
          </div>

          {/* AI Question Shortcut Trigger */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0A0A0A] to-[#1F1F1F] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-[#2563EB]" />
              <div>
                <h4 className="text-xs font-bold">Have technical questions about {product.brand}?</h4>
                <p className="text-[11px] text-[#AAAAAA]">Ask our AI assistant about specifications & use-cases.</p>
              </div>
            </div>
            <Link
              to={`/ai-assistant?prompt=${encodeURIComponent(`Explain specifications for ${product.name}`)}`}
              className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Ask AI
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications & Description Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-[#E5E5E2]">
        {/* Full Specifications Table */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xl font-bold text-[#111111] font-display">
            Full Specifications
          </h3>

          {Object.keys(product.specifications || {}).length > 0 ? (
            <div className="rounded-2xl border border-[#E5E5E2] overflow-hidden bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F7F7F5]'}
                    >
                      <td className="py-3 px-4 font-bold text-[#111111] border-r border-[#E5E5E2] w-1/3">
                        {key}
                      </td>
                      <td className="py-3 px-4 text-[#626262]">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#8A8A8A] italic">
              No additional specifications provided in dataset record.
            </p>
          )}

          {/* Description */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xl font-bold text-[#111111] font-display">
              Product Overview
            </h3>
            <p className="text-sm text-[#626262] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Use Cases & Tags Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {product.useCases && product.useCases.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] space-y-3">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Recommended Use-Cases
              </h4>
              <div className="space-y-2">
                {product.useCases.map((uc) => (
                  <div key={uc} className="flex items-center gap-2 text-xs font-medium text-[#111111]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" /> {uc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] space-y-3">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Product Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-[#F7F7F5] border border-[#E5E5E2] text-xs font-medium text-[#626262]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-[#E5E5E2]">
          <h3 className="text-2xl font-bold text-[#111111] font-display">
            Related Hardware in {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
