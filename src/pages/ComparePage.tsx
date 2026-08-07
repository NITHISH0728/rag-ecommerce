import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCompareStore, MAX_COMPARE_ITEMS } from '../stores/useCompareStore';
import { useCartStore } from '../stores/useCartStore';
import { ProductImage } from '../components/common/ProductImage';
import { EmptyState } from '../components/common/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ComparePage: React.FC = () => {
  useDocumentTitle('Product Comparison', 'Compare technology product specifications side-by-side.');

  const { removeFromCompare, clearCompare, getResolvedCompareProducts } = useCompareStore();
  const addToCart = useCartStore((s) => s.addToCart);

  const products = getResolvedCompareProducts();

  // 1. Collect Union of Specification Keys
  const allSpecKeys = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.specifications) {
        Object.keys(p.specifications).forEach((k) => set.add(k));
      }
    });
    return Array.from(set).sort();
  }, [products]);

  if (products.length === 0) {
    return (
      <EmptyState
        variant="compare"
        actionLabel="Explore Products to Compare"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E5E5E2] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Specification Matrix
          </span>
          <h1 className="text-3xl font-extrabold text-[#111111] font-display mt-1">
            Product Comparison ({products.length}/{MAX_COMPARE_ITEMS})
          </h1>
          <p className="text-xs text-[#626262] mt-1">
            Normalized specification keys derived directly from active product dataset schema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length < MAX_COMPARE_ITEMS && (
            <Link
              to="/products"
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#111111] hover:bg-[#F7F7F5] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" /> Add Product
            </Link>
          )}
          <button
            onClick={clearCompare}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#B91C1C] hover:bg-[#F7F7F5]"
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-3xl border border-[#E5E5E2] bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#E5E5E2] bg-[#FAF9F6]">
              <th className="p-6 text-xs font-bold uppercase tracking-wider text-[#8A8A8A] w-1/5">
                Product Details
              </th>
              {products.map((product) => (
                <th key={product.productId} className="p-6 text-left border-l border-[#E5E5E2] w-1/4">
                  <div className="space-y-3 relative">
                    <button
                      onClick={() => removeFromCompare(product.productId)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-[#EFEFEC] text-[#8A8A8A] hover:bg-[#111111] hover:text-white transition-colors"
                      title="Remove from Compare"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      category={product.category}
                      className="w-full aspect-square rounded-2xl"
                    />

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#626262] block">
                        {product.brand} &bull; {product.category}
                      </span>
                      <Link
                        to={`/products/${product.productId}`}
                        className="text-sm font-bold text-[#111111] hover:text-[#2563EB] font-display line-clamp-2 block mt-1"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-extrabold text-[#111111]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => {
                          addToCart(product.productId, 1);
                          toast.success(`Added "${product.name}" to bag.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Bag
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E5E2] text-xs">
            {/* Standard Attributes */}
            <tr>
              <td className="p-4 font-bold text-[#111111] bg-[#FAF9F6]">Category</td>
              {products.map((p) => (
                <td key={p.productId} className="p-4 border-l border-[#E5E5E2] text-[#626262]">
                  {p.category}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#111111] bg-[#FAF9F6]">Rating</td>
              {products.map((p) => (
                <td key={p.productId} className="p-4 border-l border-[#E5E5E2] text-[#111111] font-semibold">
                  {p.rating > 0 ? `★ ${p.rating.toFixed(1)}` : 'Not Rated'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#111111] bg-[#FAF9F6]">Stock State</td>
              {products.map((p) => (
                <td
                  key={p.productId}
                  className={`p-4 border-l border-[#E5E5E2] font-semibold ${
                    p.stock > 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#111111] bg-[#FAF9F6]">Warranty</td>
              {products.map((p) => (
                <td key={p.productId} className="p-4 border-l border-[#E5E5E2] text-[#626262]">
                  {p.warranty}
                </td>
              ))}
            </tr>

            {/* Dynamic Normalized Specification Keys */}
            {allSpecKeys.length > 0 && (
              <>
                <tr className="bg-[#EFEFEC]/50">
                  <td
                    colSpan={products.length + 1}
                    className="p-3 text-[11px] font-bold uppercase tracking-widest text-[#2563EB]"
                  >
                    Technical Specifications
                  </td>
                </tr>

                {allSpecKeys.map((key) => (
                  <tr key={key}>
                    <td className="p-4 font-bold text-[#111111] bg-[#FAF9F6] capitalize">
                      {key}
                    </td>
                    {products.map((p) => {
                      const val = p.specifications?.[key];
                      const exists = val !== undefined && val !== null && val !== '';
                      return (
                        <td
                          key={p.productId}
                          className={`p-4 border-l border-[#E5E5E2] ${
                            exists ? 'text-[#111111] font-medium' : 'text-[#8A8A8A] italic'
                          }`}
                        >
                          {exists ? String(val) : 'Not specified'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}

            {/* Use Cases Row */}
            <tr className="bg-[#EFEFEC]/50">
              <td
                colSpan={products.length + 1}
                className="p-3 text-[11px] font-bold uppercase tracking-widest text-[#2563EB]"
              >
                Intended Use Cases
              </td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-[#111111] bg-[#FAF9F6]">Use Cases</td>
              {products.map((p) => (
                <td key={p.productId} className="p-4 border-l border-[#E5E5E2]">
                  {p.useCases && p.useCases.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.useCases.map((uc) => (
                        <span
                          key={uc}
                          className="px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E2] text-[10px] text-[#626262]"
                        >
                          {uc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#8A8A8A] italic">Not specified</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
