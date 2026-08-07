import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { ProductImage } from '../components/common/ProductImage';
import { EmptyState } from '../components/common/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Product } from '../types/product';

export const CartPage: React.FC = () => {
  useDocumentTitle('Shopping Bag', 'Review items in your shopping bag and proceed to checkout.');

  const navigate = useNavigate();
  const { updateQuantity, removeFromCart, clearCart, getResolvedItems, getCartTotal } =
    useCartStore();

  const resolvedItems = getResolvedItems();
  const subtotal = getCartTotal();

  if (resolvedItems.length === 0) {
    return (
      <EmptyState
        variant="cart"
        actionLabel="Explore Tech Products"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#E5E5E2] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Order Review
          </span>
          <h1 className="text-3xl font-extrabold text-[#111111] font-display mt-1">
            Shopping Bag ({resolvedItems.length})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-[#8A8A8A] hover:text-[#B91C1C] transition-colors cursor-pointer"
        >
          Clear Bag
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {resolvedItems.map(({ product, quantity }: { product: Product; quantity: number }) => (
            <div
              key={product.productId}
              className="editorial-card p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center"
            >
              <Link to={`/products/${product.productId}`} className="w-full sm:w-32 shrink-0">
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  category={product.category}
                  className="w-full h-28 rounded-xl"
                />
              </Link>

              <div className="flex-1 min-w-0 space-y-1 text-left w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#626262]">
                  {product.brand} &bull; {product.category}
                </span>
                <Link
                  to={`/products/${product.productId}`}
                  className="text-base font-bold text-[#111111] hover:text-[#2563EB] transition-colors font-display block truncate"
                >
                  {product.name}
                </Link>
                <div className="text-xs text-[#8A8A8A]">
                  Unit Price: ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E2]">
                <div className="flex items-center border border-[#E5E5E2] rounded-xl bg-white">
                  <button
                    onClick={() => updateQuantity(product.productId, quantity - 1)}
                    className="px-2.5 py-1 text-xs font-bold text-[#111111] hover:bg-[#F7F7F5] rounded-l-xl cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-[#111111]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.productId, quantity + 1)}
                    className="px-2.5 py-1 text-xs font-bold text-[#111111] hover:bg-[#F7F7F5] rounded-r-xl cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#111111] block">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeFromCart(product.productId)}
                    className="text-[11px] text-[#8A8A8A] hover:text-[#B91C1C] transition-colors flex items-center gap-1 mt-0.5 ml-auto cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white border border-[#E5E5E2] rounded-2xl p-6 space-y-6 shadow-xs sticky top-24">
          <h3 className="text-lg font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-4">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-[#626262]">
            <div className="flex justify-between">
              <span>Subtotal ({resolvedItems.length} items)</span>
              <span className="font-bold text-[#111111]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-[#15803D] font-bold">Free Delivery</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Taxes</span>
              <span className="text-[#8A8A8A]">Calculated at checkout</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E2] flex items-baseline justify-between">
            <span className="text-sm font-bold text-[#111111] font-display">Total Amount</span>
            <span className="text-2xl font-extrabold text-[#111111] font-display">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-[11px] text-[#8A8A8A] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#15803D]" /> Secure Client Checkout Flow
          </div>
        </div>
      </div>
    </div>
  );
};
