import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getCategoryBySlug } from '../data/categories';
import { ProductRepository } from '../repositories/productRepository';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export const CategoryDetailPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const categoryDef = getCategoryBySlug(categorySlug || '');

  useDocumentTitle(
    categoryDef ? `${categoryDef.name} Catalog` : 'Category Not Found',
    categoryDef?.description
  );

  if (!categoryDef) {
    return (
      <EmptyState
        variant="product-not-found"
        title="Category Not Found"
        description="The category requested does not exist in our hardware taxonomy."
        actionLabel="Back to Categories"
        actionHref="/categories"
      />
    );
  }

  const categoryProducts = ProductRepository.getProductsByCategory(categoryDef.name);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A]">
        <Link to="/" className="hover:text-[#111111]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/categories" className="hover:text-[#111111]">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111]">{categoryDef.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E5E5E2] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> All Categories
          </Link>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F7F7F5] border border-[#E5E5E2] text-[#626262]">
            {categoryProducts.length} Items Found
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] font-display">
          {categoryDef.name}
        </h1>
        <p className="text-sm text-[#626262] max-w-2xl leading-relaxed">
          {categoryDef.description}
        </p>

        {/* Feature Specs Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A] mr-2">
            Schema Spec Attributes:
          </span>
          {categoryDef.featuredSpecs.map((spec) => (
            <span
              key={spec}
              className="px-3 py-1 rounded-md bg-[#F7F7F5] border border-[#E5E5E2] text-xs font-medium text-[#111111]"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          variant="catalog"
          title={`No ${categoryDef.name} products available yet`}
          description={`Run Phase 2 product dataset ingestion to populate ${categoryDef.name} records.`}
          actionLabel="View All Products"
          actionHref="/products"
        />
      )}
    </div>
  );
};
