import React from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Plug,
  ArrowRight,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CATEGORIES } from '../data/categories';
import { ProductRepository } from '../repositories/productRepository';

export const CategoriesPage: React.FC = () => {
  useDocumentTitle('Categories Overview', 'Explore technology product categories and series.');

  const datasetStatus = ProductRepository.getDatasetStatusInfo();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return Laptop;
      case 'Smartphone': return Smartphone;
      case 'Tablet': return Tablet;
      case 'Monitor': return Monitor;
      case 'Keyboard': return Keyboard;
      case 'Mouse': return Mouse;
      case 'Headphones': return Headphones;
      case 'Plug': default: return Plug;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5E5E2] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Hardware Taxonomies
        </span>
        <h1 className="text-3xl font-extrabold text-[#111111] font-display">
          Product Categories
        </h1>
        <p className="text-sm text-[#626262] max-w-xl">
          Browse specialized hardware categories. Each category maps to strict specification schemas in Phase 2 dataset integration.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((cat) => {
          const IconComponent = getCategoryIcon(cat.iconName);
          const categoryProducts = ProductRepository.getProductsByCategory(cat.name);

          return (
            <div
              key={cat.id}
              className="editorial-card p-6 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E2] group-hover:bg-[#111111] group-hover:text-white flex items-center justify-center text-[#111111] transition-colors">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFEFEC] border border-[#E5E5E2] text-[#626262]">
                    {datasetStatus.connected
                      ? `${categoryProducts.length} Products`
                      : '0 Products'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#111111] group-hover:text-[#2563EB] transition-colors font-display">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#626262] mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Popular Brands & Key Specs */}
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.popularBrands.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-0.5 rounded-md bg-[#F7F7F5] border border-[#E5E5E2] text-[11px] font-medium text-[#111111]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5E2]">
                <Link
                  to={`/categories/${cat.slug}`}
                  className="w-full py-3 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 group-hover:shadow-sm"
                >
                  <span>Browse {cat.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
