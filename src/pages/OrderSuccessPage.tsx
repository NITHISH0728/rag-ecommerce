import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ProductImage } from '../components/common/ProductImage';

export const OrderSuccessPage: React.FC = () => {
  useDocumentTitle('Order Confirmation', 'Thank you for your order!');
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#111111] font-display">No Order Details Found</h2>
        <p className="text-sm text-[#626262]">Please check your account page for past order history.</p>
        <Link
          to="/"
          className="inline-flex px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB]"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-center py-6">
      <div className="w-20 h-20 rounded-3xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-[#111111] font-display">
          Thank you for your order!
        </h1>
        <p className="text-sm text-[#626262]">
          Order Reference: <span className="font-bold text-[#111111] font-mono">{order.orderId}</span>
        </p>
      </div>

      {/* Summary Box */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5E2] shadow-xs text-left space-y-4">
        <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E2] pb-3">
          Order Details
        </h3>

        <div className="space-y-3">
          {order.items.map(({ product, quantity }: any) => (
            <div key={product.productId} className="flex items-center gap-3 text-xs">
              <ProductImage
                src={product.images?.[0]}
                alt={product.name}
                category={product.category}
                className="w-12 h-12 rounded-xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[#111111] block truncate">{product.name}</span>
                <span className="text-[#8A8A8A]">Qty: {quantity} &bull; ₹{product.price} each</span>
              </div>
              <span className="font-bold text-[#111111]">
                ₹{(product.price * quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#E5E5E2] flex justify-between items-baseline">
          <span className="text-sm font-bold text-[#111111]">Total Paid</span>
          <span className="text-xl font-extrabold text-[#111111] font-display">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/account"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-[#E5E5E2] text-[#111111] text-sm font-semibold hover:bg-[#F7F7F5]"
        >
          View Account Orders
        </Link>
      </div>
    </div>
  );
};
