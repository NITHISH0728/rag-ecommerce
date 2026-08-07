import { z } from 'zod';

export const productSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().optional(),
  sku: z.string().optional(),
  category: z.enum([
    'Laptops',
    'Smartphones',
    'Tablets',
    'Monitors',
    'Keyboards',
    'Mice',
    'Headphones',
    'Accessories',
  ]),
  price: z.number().gt(0, 'Price must be greater than zero'),
  originalPrice: z.number().gt(0, 'Original price must be greater than zero').optional(),
  discountPercentage: z.number().nonnegative('Discount percentage must be non-negative').optional(),
  currency: z.literal('INR'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  specifications: z.record(z.union([z.string(), z.number(), z.boolean()]))
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Specifications cannot be empty',
    }),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
  reviewCount: z.number().int().nonnegative('Review count must be non-negative').optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  warranty: z.string().min(1, 'Warranty is required'),
  useCases: z.array(z.string()).min(2, 'At least two use cases are required'),
  tags: z.array(z.string()).min(4, 'At least four tags are required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  colorOptions: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  featured: z.boolean(),
  createdAt: z.string().min(1, 'Created timestamp is required'),
  updatedAt: z.string().min(1, 'Updated timestamp is required'),
}).refine(
  (data) => {
    if (data.originalPrice !== undefined) {
      return data.originalPrice > data.price;
    }
    return true;
  },
  {
    message: 'Original price must be greater than price',
    path: ['originalPrice'],
  }
).refine(
  (data) => {
    if (data.originalPrice !== undefined && data.discountPercentage !== undefined) {
      const calculatedPct = Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100);
      return Math.abs(data.discountPercentage - calculatedPct) <= 1; // Allow small rounding difference
    }
    return true;
  },
  {
    message: 'Discount percentage must be calculated correctly',
    path: ['discountPercentage'],
  }
).refine(
  (data) => {
    const createdDate = new Date(data.createdAt);
    const updatedDate = new Date(data.updatedAt);
    return updatedDate >= createdDate;
  },
  {
    message: 'updatedAt cannot be earlier than createdAt',
    path: ['updatedAt'],
  }
);

export const productsArraySchema = z.array(productSchema);

export type ProductSchemaType = z.infer<typeof productSchema>;
