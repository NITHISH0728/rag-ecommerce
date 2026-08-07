import React, { useState } from 'react';
import { Laptop, Smartphone, Tablet, Monitor, Keyboard, Mouse, Headphones, Plug, Cpu, Box } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category = '',
  className = '',
  aspectRatio = 'square',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const normalizedCategory = category.toLowerCase();

  const getCategoryIcon = () => {
    if (normalizedCategory.includes('laptop')) return Laptop;
    if (normalizedCategory.includes('phone') || normalizedCategory.includes('mobile')) return Smartphone;
    if (normalizedCategory.includes('tablet')) return Tablet;
    if (normalizedCategory.includes('monitor') || normalizedCategory.includes('display')) return Monitor;
    if (normalizedCategory.includes('keyboard')) return Keyboard;
    if (normalizedCategory.includes('mice') || normalizedCategory.includes('mouse')) return Mouse;
    if (normalizedCategory.includes('headphone') || normalizedCategory.includes('audio')) return Headphones;
    if (normalizedCategory.includes('accessory') || normalizedCategory.includes('dock') || normalizedCategory.includes('plug')) return Plug;
    if (normalizedCategory.includes('chip') || normalizedCategory.includes('processor')) return Cpu;
    return Box;
  };

  const IconComponent = getCategoryIcon();

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  }[aspectRatio];

  const hasValidSrc = src && src.trim() !== '' && !imageError;

  return (
    <div
      className={cn(
        'relative bg-[#EFEFEC]/60 border border-[#E5E5E2] rounded-xl overflow-hidden flex items-center justify-center select-none',
        aspectClasses,
        className
      )}
    >
      {hasValidSrc ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#EFEFEC] animate-pulse flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-[#8A8A8A]/40" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#FAF9F6] to-[#EFEFEC]/80">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-center mb-3">
            <IconComponent className="w-7 h-7 text-[#2563EB]/80" />
          </div>
          <span className="text-xs font-medium text-[#626262] uppercase tracking-wider line-clamp-1 max-w-[80%]">
            {category || 'Technology Product'}
          </span>
        </div>
      )}
    </div>
  );
};
