import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductRepository } from '../../repositories/productRepository';
import type { Product } from '../../types/product';
import { ProductImage } from '../common/ProductImage';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const datasetStatus = ProductRepository.getDatasetStatusInfo();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const matched = ProductRepository.searchProducts(query);
      setResults(matched);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigate(`/products/${productId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white border border-[#E5E5E2] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-[#E5E5E2] px-6 py-4">
          <Search className="w-5 h-5 text-[#8A8A8A] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search technology products, specifications, brands..."
            className="w-full text-base sm:text-lg text-[#111111] placeholder-[#8A8A8A] bg-transparent border-none outline-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#8A8A8A] hover:bg-[#EFEFEC] hover:text-[#111111] mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#626262] hover:bg-[#EFEFEC] hover:text-[#111111] transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline mr-1">Esc</span>
            <X className="w-5 h-5 inline" />
          </button>
        </form>

        {/* Results / Empty Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!datasetStatus.connected ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] flex items-center justify-center mb-3 text-[#2563EB]">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-[#111111] mb-1">
                Product catalog not connected yet
              </h4>
              <p className="text-xs text-[#626262] max-w-md">
                Search architecture is ready to query real imported dataset values once connected in Phase 2.
              </p>
            </div>
          ) : query.trim() === '' ? (
            <div className="py-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#626262]">
                  Suggested Queries
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Laptops with M3 Pro',
                  'Noise Canceling Headphones',
                  'Ergonomic Mechanical Keyboard',
                  '4K Color Accurate Display',
                  'Smartphones with 120Hz OLED',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E5E5E2] text-xs font-medium text-[#111111] hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[#626262] mb-2">No products found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#8A8A8A]">Try searching for broad terms like &ldquo;Laptop&rdquo;, &ldquo;Apple&rdquo;, or &ldquo;Monitors&rdquo;.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#626262] uppercase tracking-wider mb-2">
                <span>Products ({results.length})</span>
                <button
                  onClick={handleSearchSubmit}
                  className="text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  View all results <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {results.slice(0, 5).map((product) => (
                <div
                  key={product.productId}
                  onClick={() => handleSelectProduct(product.productId)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F7F7F5] border border-transparent hover:border-[#E5E5E2] cursor-pointer transition-all"
                >
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    category={product.category}
                    className="w-12 h-12 rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#626262] uppercase">
                      {product.brand} &bull; {product.category}
                    </div>
                    <div className="text-sm font-bold text-[#111111] truncate">
                      {product.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#111111]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-[#15803D]">In Stock</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
