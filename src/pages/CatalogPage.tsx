import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Grid,
  List,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ProductRepository } from '../repositories/productRepository';
import { CATEGORIES } from '../data/categories';
import type { FilterOptions, SortOption } from '../types/product';
import { sortProductsList } from '../utils/productSort';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export const CatalogPage: React.FC = () => {
  useDocumentTitle('Product Catalog', 'Browse and filter verified technology products.');

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const sortOption = (searchParams.get('sort') as SortOption) || 'recommended';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const [minPrice] = useState<number | undefined>(undefined);
  const [maxPrice] = useState<number | undefined>(undefined);

  const datasetStatus = ProductRepository.getDatasetStatusInfo();
  const availableBrands = ProductRepository.getAvailableBrands();

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory) count++;
    if (selectedBrand) count++;
    if (inStockOnly) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    return count;
  }, [searchQuery, selectedCategory, selectedBrand, inStockOnly, minPrice, maxPrice]);

  const filteredProducts = useMemo(() => {
    const filters: FilterOptions = {
      searchQuery,
      categories: selectedCategory ? [selectedCategory] : undefined,
      brands: selectedBrand ? [selectedBrand] : undefined,
      inStockOnly,
      minPrice,
      maxPrice,
    };

    const rawFiltered = ProductRepository.filterProducts(filters);
    return sortProductsList(rawFiltered, sortOption);
  }, [searchQuery, selectedCategory, selectedBrand, inStockOnly, minPrice, maxPrice, sortOption]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E5E2] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Hardware Directory
          </span>
          <h1 className="text-3xl font-extrabold text-[#111111] font-display mt-1">
            Technology Catalog
          </h1>
          <p className="text-xs text-[#626262] mt-1">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}{' '}
            {datasetStatus.connected ? `from verified dataset` : `(Dataset offline)`}
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Field */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E5E5E2] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 pr-8 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#111111] appearance-none focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-[#E5E5E2] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#111111] text-white' : 'text-[#8A8A8A] hover:text-[#111111]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#111111] text-white' : 'text-[#8A8A8A] hover:text-[#111111]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#111111] flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#111111] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Chips Strip */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-[#626262] uppercase tracking-wider mr-2">
            Active Filters:
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E2] text-xs font-medium text-[#111111]">
              Search: &ldquo;{searchQuery}&rdquo;
              <X className="w-3 h-3 cursor-pointer text-[#8A8A8A]" onClick={() => updateParam('q', null)} />
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E2] text-xs font-medium text-[#111111]">
              Category: {selectedCategory}
              <X className="w-3 h-3 cursor-pointer text-[#8A8A8A]" onClick={() => updateParam('category', null)} />
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E2] text-xs font-medium text-[#111111]">
              Brand: {selectedBrand}
              <X className="w-3 h-3 cursor-pointer text-[#8A8A8A]" onClick={() => updateParam('brand', null)} />
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E2] text-xs font-medium text-[#111111]">
              In Stock Only
              <X className="w-3 h-3 cursor-pointer text-[#8A8A8A]" onClick={() => updateParam('inStock', null)} />
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 ml-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E5E5E2] rounded-2xl p-6 space-y-6 shadow-xs sticky top-24">
          <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-4">
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider font-display flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2563EB]" /> Filters
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-[#8A8A8A] hover:text-[#111111]"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Category
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !selectedCategory ? 'bg-[#111111] text-white font-bold' : 'text-[#626262] hover:bg-[#F7F7F5]'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#111111] text-white font-bold'
                      : 'text-[#626262] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div className="space-y-3 border-t border-[#E5E5E2] pt-4">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Brand
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('brand', null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedBrand ? 'bg-[#111111] text-white font-bold' : 'text-[#626262] hover:bg-[#F7F7F5]'
                  }`}
                >
                  All Brands
                </button>
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => updateParam('brand', brand)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedBrand.toLowerCase() === brand.toLowerCase()
                        ? 'bg-[#111111] text-white font-bold'
                        : 'text-[#626262] hover:bg-[#F7F7F5]'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* In Stock Toggle */}
          <div className="border-t border-[#E5E5E2] pt-4">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                In Stock Only
              </span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </aside>

        {/* Product Cards Container */}
        <main className="lg:col-span-9 w-full">
          {!datasetStatus.connected ? (
            <EmptyState
              variant="catalog"
              actionLabel="View Dataset Setup Guide"
              actionHref="/products"
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              variant="no-results"
              onAction={clearAllFilters}
              actionLabel="Clear All Filters"
            />
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-4">
              <h3 className="text-base font-bold text-[#111111]">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#626262]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Category</h4>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    updateParam('category', cat.name);
                    setMobileFilterOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-[#111111]"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
