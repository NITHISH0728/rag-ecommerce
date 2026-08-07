import type { CategoryDefinition } from '../types/product';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'laptops',
    slug: 'laptops',
    name: 'Laptops',
    description: 'High-performance notebooks, ultra-portables, and workstation laptops for pro workflows and gaming.',
    iconName: 'Laptop',
    popularBrands: ['Apple', 'Dell', 'Lenovo', 'Asus', 'HP'],
    featuredSpecs: ['Processor', 'RAM', 'Storage', 'Display', 'GPU'],
  },
  {
    id: 'smartphones',
    slug: 'smartphones',
    name: 'Smartphones',
    description: 'Flagship smartphones featuring cutting-edge camera systems, OLED displays, and all-day battery life.',
    iconName: 'Smartphone',
    popularBrands: ['Apple', 'Samsung', 'Google', 'OnePlus'],
    featuredSpecs: ['Chipset', 'Camera', 'Battery', 'Screen Size', 'Refresh Rate'],
  },
  {
    id: 'tablets',
    slug: 'tablets',
    name: 'Tablets',
    description: 'Versatile touch tablets for digital creation, note-taking, media consumption, and mobile computing.',
    iconName: 'Tablet',
    popularBrands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft'],
    featuredSpecs: ['Display', 'Stylus Support', 'Processor', 'Cellular'],
  },
  {
    id: 'monitors',
    slug: 'monitors',
    name: 'Monitors',
    description: 'Color-accurate 4K editorial displays, high-refresh gaming panels, and ultrawide productivity monitors.',
    iconName: 'Monitor',
    popularBrands: ['Dell', 'LG', 'ASUS', 'BenQ', 'Samsung'],
    featuredSpecs: ['Resolution', 'Refresh Rate', 'Panel Type', 'HDR', 'Ports'],
  },
  {
    id: 'keyboards',
    slug: 'keyboards',
    name: 'Keyboards',
    description: 'Precision mechanical keyboards, low-profile ergonomic wireless keyboards, and custom key switches.',
    iconName: 'Keyboard',
    popularBrands: ['Logitech', 'Keychron', 'Razer', 'Corsair'],
    featuredSpecs: ['Switch Type', 'Connectivity', 'Backlight', 'Layout'],
  },
  {
    id: 'mice',
    slug: 'mice',
    name: 'Mice & Trackpads',
    description: 'Ergonomic mice, ultra-light gaming sensors, and multi-device wireless precision pointer tools.',
    iconName: 'Mouse',
    popularBrands: ['Logitech', 'Razer', 'Apple', 'SteelSeries'],
    featuredSpecs: ['DPI Sensor', 'Weight', 'Connectivity', 'Battery Life'],
  },
  {
    id: 'headphones',
    slug: 'headphones',
    name: 'Headphones & Audio',
    description: 'Active noise-canceling headphones, studio monitors, wireless earbuds, and spatial audio systems.',
    iconName: 'Headphones',
    popularBrands: ['Sony', 'Bose', 'Apple', 'Sennheiser'],
    featuredSpecs: ['Noise Canceling', 'Battery Life', 'Driver Size', 'Codec'],
  },
  {
    id: 'accessories',
    slug: 'accessories',
    name: 'Accessories & Docks',
    description: 'Thunderbolt expansion docks, USB-C multi-ports, fast magnetic chargers, and protective sleeves.',
    iconName: 'Plug',
    popularBrands: ['Anker', 'Belkin', 'Satechi', 'CalDigit'],
    featuredSpecs: ['Power Output', 'Port Count', 'Data Transfer Speed'],
  },
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find((cat) => cat.slug.toLowerCase() === slug.toLowerCase());
}
