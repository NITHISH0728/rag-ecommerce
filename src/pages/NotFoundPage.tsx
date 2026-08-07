import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 Page Not Found', 'The requested page does not exist.');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-12">
      <div className="w-20 h-20 rounded-3xl bg-[#111111] text-white flex items-center justify-center font-extrabold text-2xl font-display shadow-xl">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#111111] font-display">
          Page Not Found
        </h1>
        <p className="text-sm text-[#626262] leading-relaxed">
          The page or product route you are searching for does not exist in ShopSmart AI or has been relocated.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 rounded-xl bg-white border border-[#E5E5E2] text-[#111111] text-xs font-semibold hover:bg-[#F7F7F5] transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Browse Products
        </Link>
      </div>
    </div>
  );
};
