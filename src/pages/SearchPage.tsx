import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ProductRepository } from '../repositories/productRepository';
import type { Product } from '../types/product';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [results, setResults] = useState<Product[]>([]);

  useDocumentTitle(
    queryParam ? `Search: "${queryParam}"` : 'Catalog Search',
    'Search tech products, brands, and specifications.'
  );

  const datasetStatus = ProductRepository.getDatasetStatusInfo();

  useEffect(() => {
    setSearchTerm(queryParam);
    if (queryParam.trim()) {
      const matched = ProductRepository.searchProducts(queryParam);
      setResults(matched);
    } else {
      setResults([]);
    }
  }, [queryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header Form */}
      <div className="p-8 rounded-3xl bg-white border border-[#E5E5E2] shadow-xs space-y-4 max-w-3xl mx-auto text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Full-Text Indexing
        </span>
        <h1 className="text-3xl font-extrabold text-[#111111] font-display">
          Search Technology Catalog
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, brand, category, specs..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="p-1 text-[#8A8A8A] hover:text-[#111111] absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {queryParam && (
          <p className="text-xs text-[#626262]">
            Found {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;
            <span className="font-bold text-[#111111]">{queryParam}</span>&rdquo;
          </p>
        )}
      </div>

      {/* Results Container */}
      {!datasetStatus.connected ? (
        <EmptyState
          variant="catalog"
          actionLabel="View Products"
          actionHref="/products"
        />
      ) : !queryParam.trim() ? (
        <div className="py-12 text-center text-sm text-[#626262]">
          Enter a search query above to explore technology products in the active repository.
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={`No results matching "${queryParam}"`}
          description="Try searching for broad technology terms like 'Laptops', 'Apple', 'OLED', or 'Keyboards'."
          actionLabel="Clear Search"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
