import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '../stores/useCartStore';
import { ProductImage } from '../components/common/ProductImage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const checkoutSchema = z.object({
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  fullName: z.string().min(2, 'Full name is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, '6-digit PIN code is required'),
  paymentMethod: z.enum(['upi', 'card', 'cod']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  useDocumentTitle('Checkout', 'Complete your hardware order safely.');

  const navigate = useNavigate();
  const { getResolvedItems, getCartTotal, clearCart } = useCartStore();

  const resolvedItems = getResolvedItems();
  const subtotal = getCartTotal();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'upi',
    },
  });

  const selectedPayment = watch('paymentMethod');

  if (resolvedItems.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#111111] font-display">Your bag is empty</h2>
        <p className="text-sm text-[#626262]">Add technology products to your bag before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-flex px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const onSubmit = (data: CheckoutFormData) => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderSummary = {
      orderId,
      items: resolvedItems,
      total: subtotal,
      shippingAddress: data,
      createdAt: new Date().toISOString(),
    };

    // Save demo order to localStorage for Account page
    const existingOrders = JSON.parse(localStorage.getItem('shopsmart_demo_orders') || '[]');
    localStorage.setItem('shopsmart_demo_orders', JSON.stringify([orderSummary, ...existingOrders]));

    clearCart();
    toast.success('Demo order placed successfully!');
    navigate('/order-success', { state: { order: orderSummary } });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E5E5E2] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Demo Checkout
          </span>
          <h1 className="text-3xl font-extrabold text-[#111111] font-display mt-1">
            Express Checkout
          </h1>
        </div>
      </div>

      {/* Main Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                {errors.email && (
                  <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                {errors.phone && (
                  <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
              2. Delivery Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                {errors.fullName && (
                  <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  {...register('streetAddress')}
                  placeholder="Flat / Building / Street"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
                {errors.streetAddress && (
                  <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.streetAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="Mumbai"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                  {errors.city && (
                    <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    {...register('state')}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                  {errors.state && (
                    <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#111111] block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    {...register('pincode')}
                    placeholder="400001"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                  {errors.pincode && (
                    <p className="text-xs text-[#B91C1C] mt-1 font-medium">{errors.pincode.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
              3. Payment Method (Demo Choices)
            </h3>

            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E5E2] text-xs text-[#626262]">
              <span className="font-bold text-[#B45309] block">Demonstration Notice</span>
              This is a client-side architecture demo. No actual payment details or credit cards will be charged or stored.
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'upi', label: 'UPI Instant', desc: 'GooglePay / PhonePe' },
                { id: 'card', label: 'Credit/Debit Card', desc: 'Demo Card Flow' },
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay at Doorstep' },
              ].map((pm) => (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setValue('paymentMethod', pm.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPayment === pm.id
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-[#F7F7F5] text-[#111111] border-[#E5E5E2] hover:border-[#111111]'
                  }`}
                >
                  <span className="text-xs font-bold block">{pm.label}</span>
                  <span className="text-[10px] opacity-70 block">{pm.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Order Summary & Submit Button */}
        <div className="lg:col-span-5 bg-white border border-[#E5E5E2] rounded-2xl p-6 space-y-6 shadow-xs sticky top-24">
          <h3 className="text-base font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
            Order Items ({resolvedItems.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {resolvedItems.map(({ product, quantity }) => (
              <div key={product.productId} className="flex items-center gap-3 text-xs">
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  category={product.category}
                  className="w-10 h-10 rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[#111111] truncate block">{product.name}</span>
                  <span className="text-[#8A8A8A]">Qty: {quantity}</span>
                </div>
                <span className="font-bold text-[#111111]">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E5E5E2] space-y-2 text-xs text-[#626262]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#111111]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="text-[#15803D] font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#111111] pt-2 border-t border-[#E5E5E2]">
              <span>Final Total</span>
              <span className="text-xl font-extrabold text-[#111111]">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
