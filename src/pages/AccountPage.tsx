import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, MapPin } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { EmptyState } from '../components/common/EmptyState';

export const AccountPage: React.FC = () => {
  useDocumentTitle('My Account', 'Manage your profile, saved wishlist, and demo order history.');

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('shopsmart_demo_orders');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        setOrders([]);
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E5E5E2] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            User Portal
          </span>
          <h1 className="text-3xl font-extrabold text-[#111111] font-display mt-1">
            Account Dashboard
          </h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-[#E5E5E2] rounded-2xl p-4 space-y-1 shadow-xs">
          {[
            { id: 'profile', label: 'Profile Overview', icon: User },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'wishlist', label: 'Wishlist Shortcut', icon: Heart, href: '/wishlist' },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          ].map((item) => (
            item.href ? (
              <Link
                key={item.id}
                to={item.href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-[#626262] hover:bg-[#F7F7F5] transition-colors"
              >
                <item.icon className="w-4 h-4 text-[#2563EB]" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#626262] hover:bg-[#F7F7F5]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          ))}
        </aside>

        {/* Content Container */}
        <main className="lg:col-span-9 bg-white border border-[#E5E5E2] rounded-2xl p-6 sm:p-8 shadow-xs">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
                Profile Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
                  <span className="text-[#8A8A8A] block uppercase font-bold text-[10px]">User Profile</span>
                  <span className="font-bold text-[#111111] text-sm block">ShopSmart Demo User</span>
                  <span className="text-[#626262]">user@shopsmart.ai</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
                  <span className="text-[#8A8A8A] block uppercase font-bold text-[10px]">Dataset Integration</span>
                  <span className="font-bold text-[#15803D] text-sm block">Phase 2 Architecture Ready</span>
                  <span className="text-[#626262]">FastAPI & ChromaDB Schema Compliant</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
                Demo Orders History
              </h3>

              {orders.length === 0 ? (
                <EmptyState
                  variant="orders"
                  actionLabel="Explore Catalog"
                  actionHref="/products"
                />
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-[#E5E5E2] pb-2 font-bold text-[#111111]">
                        <span>Ref: {ord.orderId}</span>
                        <span>₹{ord.total.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[#626262]">
                        Items: {ord.items?.length || 0} hardware records &bull; Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#111111] font-display border-b border-[#E5E5E2] pb-3">
                Saved Addresses
              </h3>
              <p className="text-xs text-[#626262]">No saved delivery addresses yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
