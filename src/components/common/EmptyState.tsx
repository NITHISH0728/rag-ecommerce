import React from 'react';
import { type LucideIcon, PackageX, Database, Search, ShoppingBag, Heart, Scale, MessageSquareOff, UserX, FileQuestion } from 'lucide-react';
import { cn } from '../../utils/cn';

export type EmptyStateVariant =
  | 'catalog'
  | 'no-results'
  | 'cart'
  | 'wishlist'
  | 'compare'
  | 'ai-service'
  | 'orders'
  | 'product-not-found'
  | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CONFIGS: Record<
  Exclude<EmptyStateVariant, 'custom'>,
  { title: string; description: string; icon: LucideIcon }
> = {
  catalog: {
    title: 'Product catalog not connected yet.',
    description: 'Run the product dataset integration phase to populate this section with validated catalog data.',
    icon: Database,
  },
  'no-results': {
    title: 'No matching products found',
    description: 'Try adjusting your search criteria, clearing active filters, or browsing our broad categories.',
    icon: Search,
  },
  cart: {
    title: 'Your shopping bag is empty',
    description: 'Explore our technology product catalog and save items to your bag for seamless checkout.',
    icon: ShoppingBag,
  },
  wishlist: {
    title: 'Your wishlist is empty',
    description: 'Save products you are interested in comparing or purchasing later by clicking the heart icon.',
    icon: Heart,
  },
  compare: {
    title: 'No products in comparison',
    description: 'Add up to 4 technology products to compare specifications, prices, and warranties side-by-side.',
    icon: Scale,
  },
  'ai-service': {
    title: 'The AI retrieval service is not connected yet.',
    description: 'The RAG backend pipeline (FastAPI + ChromaDB) will be connected in Phase 2 for live catalog querying.',
    icon: MessageSquareOff,
  },
  orders: {
    title: 'No past orders found',
    description: 'When you place demo orders through the ShopSmart AI checkout, they will appear here.',
    icon: UserX,
  },
  'product-not-found': {
    title: 'Product not found',
    description: 'The product record you are searching for does not exist in the active catalog or was removed.',
    icon: FileQuestion,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'custom',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  className = '',
  children,
}) => {
  const config = variant !== 'custom' ? VARIANT_CONFIGS[variant] : null;

  const displayTitle = title || config?.title || 'No data available';
  const displayDescription = description || config?.description || '';
  const IconComponent = icon || config?.icon || PackageX;

  return (
    <div
      className={cn(
        'w-full py-16 px-6 rounded-2xl bg-white border border-[#E5E5E2] text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E2] flex items-center justify-center mb-5 text-[#2563EB]">
        <IconComponent className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-[#111111] tracking-tight mb-2 font-display">
        {displayTitle}
      </h3>

      {displayDescription && (
        <p className="text-sm text-[#626262] max-w-md mx-auto leading-relaxed mb-6">
          {displayDescription}
        </p>
      )}

      {children}

      {(actionLabel && (onAction || actionHref)) && (
        <div className="mt-2">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors duration-200 shadow-sm"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors duration-200 shadow-sm cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
