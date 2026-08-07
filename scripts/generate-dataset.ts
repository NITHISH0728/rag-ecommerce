import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { productSchema } from '../src/schemas/productSchema';

// Define Product Type matching the schema
interface ProductInput {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  model?: string;
  sku?: string;
  category: 'Laptops' | 'Smartphones' | 'Tablets' | 'Monitors' | 'Keyboards' | 'Mice' | 'Headphones' | 'Accessories';
  price: number;
  originalPrice?: number;
  currency: 'INR';
  description: string;
  shortDescription: string;
  specifications: Record<string, string | number | boolean>;
  rating: number;
  reviewCount?: number;
  stock: number;
  warranty: string;
  useCases: string[];
  tags: string[];
  images: string[];
  colorOptions?: string[];
  highlights?: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const products: ProductInput[] = [];

// Helper to push and calculate discount percentage
function addProduct(p: ProductInput) {
  let discountPercentage: number | undefined = undefined;
  if (p.originalPrice !== undefined) {
    discountPercentage = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }
  
  const finalProduct = {
    ...p,
    discountPercentage
  };
  products.push(finalProduct);
}

// ----------------------------------------------------
// 1. LAPTOPS (20 Products: LAP-001 to LAP-020)
// ----------------------------------------------------
addProduct({
  productId: 'LAP-001',
  name: 'LuminaBook Pro 16 Ultimate',
  slug: 'luminabook-pro-16-ultimate',
  brand: 'Apple',
  model: 'LuminaBook Pro 16',
  sku: 'SKU-LAP-001',
  category: 'Laptops',
  price: 189999,
  originalPrice: 199999,
  currency: 'INR',
  description: 'A premium 16-inch laptop engineered for creative professionals, software developers, and video editors. Featuring a high-fidelity Liquid Retina display and advanced silicon processing, it handles intensive rendering, multi-threaded coding, and virtualization workloads with ease, keeping energy consumption low.',
  shortDescription: 'Premium 16-inch display laptop configured for software engineers, designers, and creative directors needing high-power performance.',
  specifications: {
    'Processor': 'Apple M3 Pro (12-Core)',
    'RAM': '36 GB Unified',
    'Storage': '1 TB NVMe SSD',
    'Display': '16.2-inch Liquid Retina XDR',
    'Graphics': 'Apple 18-Core GPU',
    'Operating System': 'macOS Sonoma',
    'Weight': '2.14 kg',
    'Battery': '100 Wh',
    'Connectivity': 'Wi-Fi 6E, Bluetooth 5.3'
  },
  rating: 4.8,
  reviewCount: 42,
  stock: 15,
  warranty: 'Limited 1-year warranty',
  useCases: ['Coding', 'Video editing', '3D design', 'Business'],
  tags: ['premium-laptop', 'm3-pro', 'coding', 'lightweight', 'macbook', '1tb-ssd'],
  images: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Space Grey', 'Silver'],
  highlights: ['Liquid Retina XDR Display', 'Apple Silicon M3 Pro', 'Up to 22 Hours Battery Life'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

addProduct({
  productId: 'LAP-002',
  name: 'ShopSmart CreatorBook 14',
  slug: 'shopsmart-creatorbook-14',
  brand: 'ASUS',
  model: 'CreatorBook 14',
  sku: 'SKU-LAP-002',
  category: 'Laptops',
  price: 84999,
  originalPrice: 92999,
  currency: 'INR',
  description: 'An elegant 14-inch laptop tailored for students, content creators, and remote professionals. The high-resolution OLED screen offers exceptional color accuracy, making it ideal for photo editing and media production, while the efficient processor ensures smooth daily multitasking.',
  shortDescription: 'Compact 14-inch OLED laptop ideal for graphic design, academic research, and travel-oriented productivity.',
  specifications: {
    'Processor': 'Intel Core Ultra 7',
    'RAM': '16 GB LPDDR5X',
    'Storage': '512 GB PCIe Gen4 SSD',
    'Display': '14-inch 2.8K OLED 120Hz',
    'Graphics': 'Intel Arc Graphics',
    'Operating System': 'Windows 11 Home',
    'Weight': '1.39 kg',
    'Battery': '75 Wh',
    'Connectivity': 'Wi-Fi 6E, Bluetooth 5.3'
  },
  rating: 4.5,
  reviewCount: 88,
  stock: 22,
  warranty: '1 year',
  useCases: ['College', 'Office work', 'Graphic design', 'Travel'],
  tags: ['oled-display', 'lightweight', 'intel-arc', 'productivity', 'travel-ready'],
  images: [
    'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Pine Grey', 'Celadon Blue'],
  highlights: ['2.8K 120Hz OLED Panel', 'Intel Core Ultra Power', 'Ultralight Chassis'],
  featured: true,
  createdAt: '2026-07-02T09:00:00.000Z',
  updatedAt: '2026-08-02T12:00:00.000Z'
});

addProduct({
  productId: 'LAP-003',
  name: 'Dell Inspiron 15 Student Edition',
  slug: 'dell-inspiron-15-student-edition',
  brand: 'Dell',
  model: 'Inspiron 15',
  sku: 'SKU-LAP-003',
  category: 'Laptops',
  price: 48999,
  originalPrice: 54999,
  currency: 'INR',
  description: 'A practical and reliable 15.6-inch laptop configured for students, office users, and entry-level developers. Its 16GB memory supports multitasking across tabs, while the 512GB solid-state drive provides sufficient local storage for coursework, documents, and code repositories.',
  shortDescription: 'Reliable 15.6-inch office and college laptop with a full-size keyboard and balanced performance specifications.',
  specifications: {
    'Processor': 'AMD Ryzen 5 7530U',
    'RAM': '16 GB DDR4',
    'Storage': '512 GB NVMe SSD',
    'Display': '15.6-inch Full HD WVA',
    'Graphics': 'AMD Radeon Graphics',
    'Operating System': 'Windows 11 Home',
    'Weight': '1.68 kg',
    'Battery': '54 Wh',
    'Connectivity': 'Wi-Fi 6, Bluetooth 5.2'
  },
  rating: 4.1,
  reviewCount: 156,
  stock: 45,
  warranty: '1 year',
  useCases: ['College', 'Office work', 'Coding'],
  tags: ['student-laptop', 'budget-friendly', 'full-size-keyboard', 'ryzen-powered'],
  images: [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Platinum Silver', 'Carbon Black'],
  highlights: ['ComfortView Display Tech', 'AMD Ryzen Processor', 'Fast Charging Support'],
  featured: false,
  createdAt: '2026-07-03T11:00:00.000Z',
  updatedAt: '2026-08-03T10:00:00.000Z'
});

addProduct({
  productId: 'LAP-004',
  name: 'ThinkPad T14 Enterprise Workhorse',
  slug: 'thinkpad-t14-enterprise-workhorse',
  brand: 'Lenovo',
  model: 'ThinkPad T14 Gen 4',
  sku: 'SKU-LAP-004',
  category: 'Laptops',
  price: 112000,
  currency: 'INR',
  description: 'The standard choice for corporate deployments and professional software development. This laptop features robust military-grade durability, the iconic tactile keyboard, dual hardware security modules, and exceptional thermal performance for long coding sessions.',
  shortDescription: 'Durable 14-inch professional business laptop with superior keyboard acoustics and hardware security features.',
  specifications: {
    'Processor': 'Intel Core i5-1340P',
    'RAM': '16 GB DDR5 (Upgradeable)',
    'Storage': '512 GB PCIe Gen4 SSD',
    'Display': '14-inch WUXGA IPS Anti-Glare',
    'Graphics': 'Intel UHD Graphics',
    'Operating System': 'Windows 11 Pro',
    'Weight': '1.37 kg',
    'Battery': '52.5 Wh',
    'Connectivity': 'Wi-Fi 6E, Bluetooth 5.1'
  },
  rating: 4.6,
  reviewCount: 37,
  stock: 12,
  warranty: '3 years',
  useCases: ['Coding', 'Office work', 'Business', 'Travel'],
  tags: ['business-laptop', 'thinkpad', 'durable', 'windows-pro', 'coding'],
  images: [
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Thunder Black'],
  highlights: ['MIL-STD 810H Certified', 'Tactile Keyboard with TrackPoint', 'dTPM 2.0 Security Chip'],
  featured: false,
  createdAt: '2026-07-04T08:00:00.000Z',
  updatedAt: '2026-08-04T09:00:00.000Z'
});

addProduct({
  productId: 'LAP-005',
  name: 'ROG Strix Scar 16 Elite Gaming',
  slug: 'rog-strix-scar-16-elite-gaming',
  brand: 'ASUS',
  model: 'ROG Strix Scar 16',
  sku: 'SKU-LAP-005',
  category: 'Laptops',
  price: 245000,
  originalPrice: 255000,
  currency: 'INR',
  description: 'An absolute powerhouse designed for AAA gaming and 3D modeling. Powered by Intel flagship processing and dedicated graphics, it features advanced liquid metal cooling, a high refresh rate display, and customizable RGB accents to complete the ultimate gaming station setup.',
  shortDescription: 'High-end gaming laptop containing top-tier dedicated graphics and a ultra-smooth 240Hz refresh rate display panel.',
  specifications: {
    'Processor': 'Intel Core i9-14900HX',
    'RAM': '32 GB DDR5 Dual-Channel',
    'Storage': '2 TB PCIe Gen4 SSD',
    'Display': '16-inch QHD+ 240Hz ROG Nebula',
    'Graphics': 'NVIDIA GeForce RTX 4080 (12GB)',
    'Operating System': 'Windows 11 Home',
    'Weight': '2.65 kg',
    'Battery': '90 Wh',
    'Connectivity': 'Wi-Fi 7, Bluetooth 5.4'
  },
  rating: 4.9,
  reviewCount: 29,
  stock: 8,
  warranty: '2 years',
  useCases: ['Gaming', 'Video editing', '3D design'],
  tags: ['gaming-laptop', 'rtx-4080', 'i9-processor', '240hz-display', '2tb-ssd'],
  images: [
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Eclipse Gray'],
  highlights: ['RTX 4080 Desktop Grade GPU', '240Hz ROG Nebula Display', 'Tri-Fan Thermal Technology'],
  featured: true,
  createdAt: '2026-07-05T14:00:00.000Z',
  updatedAt: '2026-08-05T11:00:00.000Z'
});

// Programmatic Laptops generator to reach 20 in total
const laptopBrands = ['HP', 'Lenovo', 'Dell', 'ASUS', 'MSI', 'Acer'];
const laptopProcessors = ['Intel Core i5', 'AMD Ryzen 5', 'Intel Core i7', 'AMD Ryzen 7'];
const laptopRAMs = ['8 GB DDR4', '16 GB DDR4', '16 GB DDR5', '32 GB DDR5'];
const laptopStorages = ['512 GB NVMe SSD', '1 TB NVMe SSD'];

for (let i = 6; i <= 20; i++) {
  const brand = laptopBrands[i % laptopBrands.length];
  const processor = laptopProcessors[i % laptopProcessors.length];
  const ram = laptopRAMs[i % laptopRAMs.length];
  const storage = laptopStorages[i % laptopStorages.length];
  const idStr = String(i).padStart(3, '0');
  
  // Decide some out of stock and low stock
  let stockVal = 30;
  if (i === 10) stockVal = 0; // Out of stock
  if (i === 15) stockVal = 3; // Low stock

  addProduct({
    productId: `LAP-${idStr}`,
    name: `${brand} EliteBook V${i}`,
    slug: `${brand.toLowerCase()}-elitebook-v${i}`,
    brand: brand,
    model: `EliteBook V${i}`,
    sku: `SKU-LAP-${idStr}`,
    category: 'Laptops',
    price: 45000 + (i * 4500),
    originalPrice: 49000 + (i * 4500),
    currency: 'INR',
    description: `A standard multi-purpose laptop designed for corporate business tasking, spreadsheet editing, and online conferencing. It delivers a balanced computing architecture with a processor running ${ram} memory and a responsive ${storage} for user storage.`,
    shortDescription: `Reliable ${brand} laptop running a solid processor with ${ram} and ${storage} for general work.`,
    specifications: {
      'Processor': processor,
      'RAM': ram,
      'Storage': storage,
      'Display': '15.6-inch Anti-Glare Full HD',
      'Graphics': 'Integrated Mobile Graphics',
      'Operating System': 'Windows 11 Home',
      'Weight': '1.75 kg',
      'Battery': '45 Wh',
      'Connectivity': 'Wi-Fi 6, Bluetooth 5.1'
    },
    rating: Number((3.8 + (i % 10) * 0.1).toFixed(1)),
    reviewCount: 15 + i * 4,
    stock: stockVal,
    warranty: '1 year',
    useCases: ['College', 'Office work', 'Coding'],
    tags: ['laptop', 'productivity', 'office-work', 'windows-laptop'],
    images: [`/images/products/laptops/lap-${idStr}.webp`],
    featured: false,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 2. SMARTPHONES (15 Products: PHN-001 to PHN-015)
// ----------------------------------------------------
addProduct({
  productId: 'PHN-001',
  name: 'LuminaPhone Flagship Edition',
  slug: 'luminaphone-flagship-edition',
  brand: 'Apple',
  model: 'LuminaPhone Pro',
  sku: 'SKU-PHN-001',
  category: 'Smartphones',
  price: 139999,
  originalPrice: 144999,
  currency: 'INR',
  description: 'The pinnacle of mobile design featuring a solid titanium frame, dynamic display cutout, and an advanced telephoto triple camera system. Seamlessly integrated with proprietary software, it processes massive graphic requests, records cinema-grade videos, and sustains battery life for a full day of usage.',
  shortDescription: 'Titanium framework premium mobile phone with a triple camera system and high density OLED panel.',
  specifications: {
    'Display': '6.7-inch Super Retina OLED 120Hz',
    'Processor': 'A17 Pro Bionic',
    'RAM': '8 GB RAM',
    'Storage': '256 GB',
    'Rear Camera': '48 MP + 12 MP + 12 MP Triple Camera',
    'Front Camera': '12 MP TrueDepth',
    'Battery': '4441 mAh',
    'Charging': '27 W Wired, 15 W Wireless',
    'Operating System': 'iOS 17',
    'Connectivity': '5G, Wi-Fi 6E, Bluetooth 5.3'
  },
  rating: 4.8,
  reviewCount: 94,
  stock: 25,
  warranty: '1 year',
  useCases: ['Photography', 'Content creation', 'Everyday use', 'Business'],
  tags: ['ios-phone', 'premium-phone', 'triple-camera', 'titanium-body'],
  images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Natural Titanium', 'Blue Titanium', 'White Titanium'],
  highlights: ['Titanium Architecture Design', 'Photonic Engine Triple Camera', 'ProMotion 120Hz Display'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

addProduct({
  productId: 'PHN-002',
  name: 'Galaxy Prime Ultra Z',
  slug: 'galaxy-prime-ultra-z',
  brand: 'Samsung',
  model: 'Galaxy Ultra Z',
  sku: 'SKU-PHN-002',
  category: 'Smartphones',
  price: 124999,
  currency: 'INR',
  description: 'A premium camera phone equipped with a 200MP sensor, 100x zoom magnification, and a built-in stylus pen. Perfect for mobile multitasking, sketching, and high-fidelity video rendering on the go. The dynamic display adapts refresh rates dynamically to preserve cell power.',
  shortDescription: 'Top-tier Android phone featuring a built-in stylus, 200MP camera sensor, and vibrant AMOLED panel.',
  specifications: {
    'Display': '6.8-inch Dynamic AMOLED 2X',
    'Processor': 'Snapdragon 8 Gen 3',
    'RAM': '12 GB RAM',
    'Storage': '512 GB',
    'Rear Camera': '200 MP + 50 MP + 12 MP + 10 MP Quad Camera',
    'Front Camera': '12 MP',
    'Battery': '5000 mAh',
    'Charging': '45 W Wired, 15 W Wireless',
    'Operating System': 'Android 14',
    'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.3'
  },
  rating: 4.7,
  reviewCount: 110,
  stock: 18,
  warranty: '1 year',
  useCases: ['Photography', 'Mobile gaming', 'Business', 'Content creation'],
  tags: ['galaxy-phone', 'android-flagship', 'stylus-included', '200mp-camera'],
  images: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Titanium Gray', 'Titanium Black'],
  highlights: ['200 Megapixel Quad Camera', 'Integrated S Pen Stylus', 'Snapdragon 8 Gen 3 Chip'],
  featured: true,
  createdAt: '2026-07-02T10:00:00.000Z',
  updatedAt: '2026-08-02T10:00:00.000Z'
});

// Programmatic smartphones to reach 15
const phoneBrands = ['OnePlus', 'Google', 'Nothing', 'Motorola', 'Xiaomi'];
const phoneOS = ['Android 14', 'Android 14 (Stock)', 'Nothing OS 2.5', 'Android 14', 'MIUI/HyperOS'];

for (let i = 3; i <= 15; i++) {
  const brand = phoneBrands[i % phoneBrands.length];
  const os = phoneOS[i % phoneOS.length];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 35;
  if (i === 7) stockVal = 0; // Out of stock
  if (i === 11) stockVal = 4; // Low stock

  addProduct({
    productId: `PHN-${idStr}`,
    name: `${brand} Nova ${i} Pro`,
    slug: `${brand.toLowerCase()}-nova-${i}-pro`,
    brand: brand,
    model: `Nova ${i} Pro`,
    sku: `SKU-PHN-${idStr}`,
    category: 'Smartphones',
    price: 25000 + (i * 5000),
    originalPrice: 28000 + (i * 5000),
    currency: 'INR',
    description: `A highly balanced mid-range smartphone carrying 5G connectivity, a multi-sensor rear camera cluster, and high-speed fast charging. It runs on ${os} with optimal RAM memory to keep applications load times low.`,
    shortDescription: `Modern ${brand} smartphone configured with 5G speed, large display panel, and long battery life.`,
    specifications: {
      'Display': '6.5-inch IPS LCD 90Hz',
      'Processor': 'MediaTek Dimensity 8000',
      'RAM': '8 GB RAM',
      'Storage': '128 GB',
      'Rear Camera': '64 MP Dual Camera',
      'Front Camera': '16 MP',
      'Battery': '5000 mAh',
      'Charging': '33 W Fast Charging',
      'Operating System': os,
      'Connectivity': '5G, Wi-Fi, Bluetooth'
    },
    rating: Number((3.9 + (i % 10) * 0.08).toFixed(1)),
    reviewCount: 45 + i * 3,
    stock: stockVal,
    warranty: '1 year',
    useCases: ['Everyday use', 'Battery-focused use', 'Mobile gaming'],
    tags: ['smartphone', '5g-mobile', 'fast-charging', 'budget-phone'],
    images: [`/images/products/smartphones/phn-${idStr}.webp`],
    featured: i === 5 || i === 10,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 3. TABLETS (8 Products: TAB-001 to TAB-008)
// ----------------------------------------------------
addProduct({
  productId: 'TAB-001',
  name: 'Lumina Pad Air Touch',
  slug: 'lumina-pad-air-touch',
  brand: 'Apple',
  model: 'iPad Air 11',
  sku: 'SKU-TAB-001',
  category: 'Tablets',
  price: 59900,
  originalPrice: 62900,
  currency: 'INR',
  description: 'An ultrathin 11-inch tablet packing dynamic processor power. Designed for students, designers, and notes cataloging, its crisp Liquid Retina display supports pixel-precise digital sketch tools, and matches high responsiveness for gaming and spreadsheets.',
  shortDescription: 'Thin 11-inch professional stylus-ready tablet for study, creative drawing, and media streaming.',
  specifications: {
    'Display': '11-inch Liquid Retina Display',
    'Processor': 'Apple M2 Silicon',
    'RAM': '8 GB Unified Memory',
    'Storage': '128 GB Flash Storage',
    'Camera': '12 MP Wide Rear Camera',
    'Battery': '28.9 Wh',
    'Weight': '462 g',
    'Connectivity': 'Wi-Fi 6E, Bluetooth 5.3'
  },
  rating: 4.7,
  reviewCount: 65,
  stock: 20,
  warranty: '1 year',
  useCases: ['College', 'Graphic design', 'Travel'],
  tags: ['tablet', 'ipad-air', 'm2-tablet', 'drawing-canvas'],
  images: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Space Grey', 'Starlight', 'Purple'],
  highlights: ['Liquid Retina TrueTone Display', 'Powerful M2 Silicon Processor', 'Apple Pencil Pro Compatible'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

for (let i = 2; i <= 8; i++) {
  const brand = ['Samsung', 'Lenovo', 'Xiaomi', 'OnePlus'][i % 4];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 24;
  if (i === 4) stockVal = 0; // Out of stock
  if (i === 6) stockVal = 2; // Low stock

  addProduct({
    productId: `TAB-${idStr}`,
    name: `${brand} Tab S-Pro ${i}`,
    slug: `${brand.toLowerCase()}-tab-s-pro-${i}`,
    brand: brand,
    model: `Tab S-Pro ${i}`,
    sku: `SKU-TAB-${idStr}`,
    category: 'Tablets',
    price: 18000 + (i * 6000),
    originalPrice: 20000 + (i * 6000),
    currency: 'INR',
    description: `A highly versatile multimedia tablet designed for document editing, high-definition streaming, and academic reading. The lightweight chassis contains a long-lasting battery, clear stereo speakers, and micro-SD expansion slots for localized storage.`,
    shortDescription: `Convenient ${brand} touch screen tablet suitable for study, streaming media, and office notes.`,
    specifications: {
      'Display': '10.5-inch IPS Panel',
      'Processor': 'Octa-Core Processor',
      'RAM': '6 GB RAM',
      'Storage': '128 GB Internal',
      'Camera': '8 MP Auto-Focus Rear',
      'Battery': '7040 mAh',
      'Weight': '480 g',
      'Connectivity': 'Wi-Fi, Bluetooth'
    },
    rating: Number((4.0 + (i % 8) * 0.1).toFixed(1)),
    reviewCount: 30 + i * 5,
    stock: stockVal,
    warranty: '1 year',
    useCases: ['College', 'Office work', 'Travel'],
    tags: ['tablet', 'touchscreen', 'media-player', 'study-companion'],
    images: [`/images/products/tablets/tab-${idStr}.webp`],
    featured: i === 3,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 4. MONITORS (8 Products: MON-001 to MON-008)
// ----------------------------------------------------
addProduct({
  productId: 'MON-001',
  name: 'LuminaScreen Pro 27 4K',
  slug: 'luminascreen-pro-27-4k',
  brand: 'Dell',
  model: 'LuminaScreen 27',
  sku: 'SKU-MON-001',
  category: 'Monitors',
  price: 36999,
  originalPrice: 39999,
  currency: 'INR',
  description: 'An elite 27-inch 4K IPS display color-calibrated for designers, photographers, and video editors. Featuring a USB-C interface providing power delivery, it functions as a hardware expansion dock while reducing desk cable clutter. High contrast ratio makes every pixel details visible.',
  shortDescription: 'Color-accurate 27-inch 4K IPS display monitor with USB-C video input and power hub features.',
  specifications: {
    'Display Size': '27-inch',
    'Resolution': '3840 x 2160 (4K UHD)',
    'Panel Type': 'IPS',
    'Refresh Rate': '60 Hz',
    'Response Time': '5 ms',
    'Color Gamut': '99% sRGB, 95% DCI-P3',
    'Ports': 'USB-C (90W PD), HDMI 2.0, DisplayPort 1.4',
    'Stand Adjustment': 'Height, Pivot, Swivel, Tilt'
  },
  rating: 4.6,
  reviewCount: 48,
  stock: 14,
  warranty: '3 years',
  useCases: ['Office work', 'Graphic design', 'Video editing', 'Programming'],
  tags: ['4k-monitor', 'ips-panel', 'usb-c-hub', 'color-accurate', 'display-monitor'],
  images: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Platinum Silver'],
  highlights: ['Ultra HD 4K Resolution', '90W USB-C Power Delivery', 'IPS Wide Viewing Angles'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

for (let i = 2; i <= 8; i++) {
  const brand = ['LG', 'BenQ', 'ASUS', 'Samsung'][i % 4];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 16;
  if (i === 3) stockVal = 0; // Out of stock
  if (i === 7) stockVal = 1; // Low stock

  addProduct({
    productId: `MON-${idStr}`,
    name: `${brand} DisplayMax ${i}-GenCurved`,
    slug: `${brand.toLowerCase()}-displaymax-${i}-gencurved`,
    brand: brand,
    model: `DisplayMax ${i}`,
    sku: `SKU-MON-${idStr}`,
    category: 'Monitors',
    price: 12000 + (i * 4000),
    originalPrice: 14000 + (i * 4000),
    currency: 'INR',
    description: `A robust computer display designed to extend workstation setups. With a flicker-free panel and blue-light reduction, it ensures comfortable usage during extended programming or data-analysis work sessions.`,
    shortDescription: `Comfortable computer display monitor with anti-glare filters and adjustable ergonomic stands.`,
    specifications: {
      'Display Size': '24-inch',
      'Resolution': '1920 x 1080 (Full HD)',
      'Panel Type': 'IPS',
      'Refresh Rate': '75 Hz',
      'Response Time': '4 ms',
      'Color Gamut': '99% sRGB',
      'Ports': 'HDMI, VGA, DisplayPort',
      'Stand Adjustment': 'Tilt Only'
    },
    rating: Number((4.1 + (i % 8) * 0.09).toFixed(1)),
    reviewCount: 22 + i * 6,
    stock: stockVal,
    warranty: '3 years',
    useCases: ['Office work', 'Programming', 'Multi-monitor setup'],
    tags: ['monitor', 'ergonomic', 'ips-display', 'computer-accessories'],
    images: [`/images/products/monitors/mon-${idStr}.webp`],
    featured: i === 5,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 5. KEYBOARDS (8 Products: KEY-001 to KEY-008)
// ----------------------------------------------------
addProduct({
  productId: 'KEY-001',
  name: 'TactileClick Mechanical Pro',
  slug: 'tactileclick-mechanical-pro',
  brand: 'Keychron',
  model: 'K2 v2',
  sku: 'SKU-KEY-001',
  category: 'Keyboards',
  price: 7499,
  originalPrice: 8499,
  currency: 'INR',
  description: 'A premium compact mechanical keyboard featuring hot-swappable switches, wireless Bluetooth pairing, and an aluminum frame. Tactile click feedback provides a satisfying, highly precise typing experience for coding and document editing, while macOS/Windows dual layout compatibility lets you transition between systems instantly.',
  shortDescription: 'Hot-swappable wireless mechanical keyboard configured with long battery life and premium tactile switches.',
  specifications: {
    'Layout': '75% Compact',
    'Connection': 'Bluetooth 5.1 / USB-C Wired',
    'Switch Type': 'Gateron G-Pro Brown Mechanical',
    'Backlighting': 'White LED',
    'Compatibility': 'macOS / Windows / Android',
    'Battery': '4000 mAh'
  },
  rating: 4.7,
  reviewCount: 154,
  stock: 35,
  warranty: '1 year',
  useCases: ['Coding', 'Office work', 'Gaming'],
  tags: ['mechanical-keyboard', 'wireless-keyboard', 'hot-swappable', 'keychron', 'tactile-typing'],
  images: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Classic Charcoal', 'Space Gray'],
  highlights: ['Hot-Swappable Switch Sockets', 'Bluetooth & Wired Dual Mode', 'Premium Aluminium Frame'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

for (let i = 2; i <= 8; i++) {
  const brand = ['Logitech', 'Razer', 'Corsair', 'Keychron'][i % 4];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 48;
  if (i === 5) stockVal = 0; // Out of stock
  if (i === 8) stockVal = 5; // Low stock

  addProduct({
    productId: `KEY-${idStr}`,
    name: `${brand} Typist-Series Keyboard ${i}`,
    slug: `${brand.toLowerCase()}-typist-series-keyboard-${i}`,
    brand: brand,
    model: `Typist ${i}`,
    sku: `SKU-KEY-${idStr}`,
    category: 'Keyboards',
    price: 1500 + (i * 1200),
    originalPrice: 1800 + (i * 1200),
    currency: 'INR',
    description: `A daily keyboard designed with low-profile keys to promote comfortable ergonomic hand positioning. Quiet-click mechanisms prevent disturbing co-workers in public workspace setups.`,
    shortDescription: `Quiet-typing keyboard with ergonomic adjustments and splash-resistant construction.`,
    specifications: {
      'Layout': 'Full size',
      'Connection': 'USB wired',
      'Switch Type': 'Membrane switches',
      'Backlighting': 'None',
      'Compatibility': 'Windows and macOS',
      'Cable Length': '1.5 m'
    },
    rating: Number((3.7 + (i % 8) * 0.15).toFixed(1)),
    reviewCount: 30 + i * 10,
    stock: stockVal,
    warranty: '1 year',
    useCases: ['Office work', 'College'],
    tags: ['keyboard', 'silent-keys', 'computer-input', 'office-desktop'],
    images: [`/images/products/keyboards/key-${idStr}.webp`],
    featured: i === 4,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 6. MICE (7 Products: MOU-001 to MOU-007)
// ----------------------------------------------------
addProduct({
  productId: 'MOU-001',
  name: 'PrecisionPointer Ergonomic Mouse',
  slug: 'precisionpointer-ergonomic-mouse',
  brand: 'Logitech',
  model: 'MX Master 3S',
  sku: 'SKU-MOU-001',
  category: 'Mice',
  price: 9499,
  originalPrice: 10999,
  currency: 'INR',
  description: 'An advanced ergonomic mouse featuring high-speed electromagnetic scrolling, an 8000 DPI tracking sensor, and quiet click switches. Built to support multi-device workflows, it can transition across three computing screens seamlessly, reducing forearm muscle strain during prolonged design or programming tasks.',
  shortDescription: 'Advanced ergonomic wireless mouse with silent clicks, rapid metal scrolling, and multi-device connection.',
  specifications: {
    'Sensor DPI': '8000 DPI (Adjustable)',
    'Connectivity': 'Bluetooth / Logi Bolt Wireless',
    'Button Count': '7 Buttons',
    'Scroll Wheel': 'MagSpeed Electromagnetic SmartWheel',
    'Battery Life': 'Up to 70 days on full charge',
    'Weight': '141 g'
  },
  rating: 4.8,
  reviewCount: 220,
  stock: 40,
  warranty: '1 year',
  useCases: ['Office work', 'Graphic design', 'Video editing', 'Programming'],
  tags: ['ergonomic-mouse', 'wireless-mouse', 'logitech', 'multi-device-mouse', 'productivity-mouse'],
  images: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Graphite Black', 'Pale Gray'],
  highlights: ['8K DPI Glass Tracking Sensor', 'MagSpeed Quiet-Scroller Wheel', 'USB-C Quick-Charge Power'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

for (let i = 2; i <= 7; i++) {
  const brand = ['Logitech', 'Razer', 'Corsair'][i % 3];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 55;
  if (i === 3) stockVal = 0; // Out of stock
  if (i === 6) stockVal = 3; // Low stock

  addProduct({
    productId: `MOU-${idStr}`,
    name: `${brand} PointerForce v${i}`,
    slug: `${brand.toLowerCase()}-pointerforce-v${i}`,
    brand: brand,
    model: `PointerForce ${i}`,
    sku: `SKU-MOU-${idStr}`,
    category: 'Mice',
    price: 999 + (i * 900),
    originalPrice: 1200 + (i * 900),
    currency: 'INR',
    description: `A standard wireless computer mouse built with optical sensors to provide reliable daily navigation. The compact body fits easily inside laptop bags for travel convenience.`,
    shortDescription: `Compact optical wireless mouse designed for general computing tasks and remote study.`,
    specifications: {
      'Sensor DPI': '1600 DPI',
      'Connectivity': '2.4 GHz USB Wireless Dongle',
      'Button Count': '3 Buttons',
      'Scroll Wheel': 'Standard rubber scroller',
      'Battery Life': 'Up to 12 months (AA battery)',
      'Weight': '85 g'
    },
    rating: Number((3.6 + (i % 7) * 0.18).toFixed(1)),
    reviewCount: 40 + i * 8,
    stock: stockVal,
    warranty: '1 year',
    useCases: ['Everyday use', 'Office work', 'Travel'],
    tags: ['mouse', 'wireless-pointer', 'usb-dongle', 'office-accessories'],
    images: [`/images/products/mice/mou-${idStr}.webp`],
    featured: false,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 7. HEADPHONES (7 Products: AUD-001 to AUD-007)
// ----------------------------------------------------
addProduct({
  productId: 'AUD-001',
  name: 'LuminaAudio ANC Studio Over-Ear',
  slug: 'luminaaudio-anc-studio-over-ear',
  brand: 'Sony',
  model: 'LuminaAudio WH-01',
  sku: 'SKU-AUD-001',
  category: 'Headphones',
  price: 24999,
  originalPrice: 29999,
  currency: 'INR',
  description: 'Premium active noise-canceling headphones configured for video editors, music producers, and office workers. Integrating high-fidelity audio drivers, it eliminates distracting environment hums, while soft memory foam ear cups ensure comfort during extended usage.',
  shortDescription: 'Active noise-canceling wireless headphones with studio sound tuning, high density battery, and fold-flat design.',
  specifications: {
    'Driver Size': '40 mm Dynamic Dome',
    'Frequency Range': '4 Hz - 40,000 Hz',
    'Noise Canceling': 'Dual Noise Sensor Processor',
    'Battery Life': 'Up to 30 hours (ANC On)',
    'Codec Support': 'LDAC, AAC, SBC',
    'Connectivity': 'Bluetooth 5.2 / 3.5mm Stereo Cable'
  },
  rating: 4.8,
  reviewCount: 180,
  stock: 15,
  warranty: '1 year',
  useCases: ['Office work', 'Video editing', 'Travel', 'Everyday use'],
  tags: ['noise-cancelling', 'wireless-headphones', 'anc-headphones', 'sony-audio', 'studio-sound'],
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Midnight Black', 'Platinum Silver'],
  highlights: ['Industry-leading Active Noise Cancel', 'Hi-Res Audio LDAC Codec Support', 'Speak-to-Chat Automatic Pause'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

for (let i = 2; i <= 7; i++) {
  const brand = ['JBL', 'Bose', 'Sennheiser'][i % 3];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 32;
  if (i === 4) stockVal = 0; // Out of stock
  if (i === 5) stockVal = 2; // Low stock

  addProduct({
    productId: `AUD-${idStr}`,
    name: `${brand} SoundPro Plus ${i}`,
    slug: `${brand.toLowerCase()}-soundpro-plus-${i}`,
    brand: brand,
    model: `SoundPro ${i}`,
    sku: `SKU-AUD-${idStr}`,
    category: 'Headphones',
    price: 2500 + (i * 2200),
    originalPrice: 3000 + (i * 2200),
    currency: 'INR',
    description: `Highly responsive in-ear wireless earphones delivering deep bass response. The water-resistant construction makes it appropriate for outdoor exercise sessions.`,
    shortDescription: `Water-resistant wireless earphones delivering clear spatial sound and long battery life.`,
    specifications: {
      'Driver Size': '12 mm',
      'Frequency Range': '20 Hz - 20,000 Hz',
      'Noise Canceling': 'Passive isolating seal',
      'Battery Life': 'Up to 8 hours playback',
      'Codec Support': 'AAC, SBC',
      'Connectivity': 'Bluetooth 5.0'
    },
    rating: Number((3.9 + (i % 7) * 0.15).toFixed(1)),
    reviewCount: 35 + i * 9,
    stock: stockVal,
    warranty: '1 year',
    useCases: ['Everyday use', 'Travel'],
    tags: ['headphones', 'earbuds', 'water-resistant', 'bluetooth-audio'],
    images: [`/images/products/headphones/aud-${idStr}.webp`],
    featured: i === 3,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// 8. ACCESSORIES (7 Products: ACC-001 to ACC-007)
// ----------------------------------------------------
addProduct({
  productId: 'ACC-001',
  name: 'MultiPort USB-C Hub 8-in-1',
  slug: 'multiport-usb-c-hub-8-in-1',
  brand: 'Anker',
  model: '8-in-1 Hub',
  sku: 'SKU-ACC-001',
  category: 'Accessories',
  price: 4999,
  originalPrice: 5999,
  currency: 'INR',
  description: 'An essential expansion accessory that transforms a single laptop USB-C port into a dynamic workstation hub. Packing high-definition HDMI video support, USB data connectors, and high-speed memory card reader slots, it fulfills daily connectivity requirements.',
  shortDescription: 'Aluminium 8-in-1 USB-C docking hub with HDMI 4K video output and fast power delivery pass-through.',
  specifications: {
    'Input Connection': 'USB-C male cable',
    'Output Ports': '1x HDMI 4K, 2x USB-A 3.0, 1x USB-C Power Delivery, 1x SD Slot, 1x MicroSD Slot, 1x Ethernet Port',
    'Power Pass-through': 'Up to 100W PD charging input',
    'Material': 'Aluminium alloy casing',
    'Cable Length': '15 cm'
  },
  rating: 4.5,
  reviewCount: 140,
  stock: 60,
  warranty: '6 months',
  useCases: ['Office work', 'Programming', 'Travel'],
  tags: ['usb-c-hub', 'multiport-adapter', 'laptop-accessories', 'anker-power'],
  images: [
    'https://images.unsplash.com/photo-1616440342230-017fb6ce55f6?auto=format&fit=crop&w=1000&q=80&fm=avif',
    'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=1000&q=80&fm=avif'
  ],
  colorOptions: ['Space Grey', 'Anodized Silver'],
  highlights: ['4K HDMI Video Transmission', '100W Fast Charging Inset', 'Gigabit Ethernet Connection'],
  featured: true,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z'
});

for (let i = 2; i <= 7; i++) {
  const brand = ['Anker', 'Belkin', 'SanDisk'][i % 3];
  const idStr = String(i).padStart(3, '0');
  
  let stockVal = 80;
  if (i === 3) stockVal = 0; // Out of stock
  if (i === 5) stockVal = 4; // Low stock

  addProduct({
    productId: `ACC-${idStr}`,
    name: `${brand} PowerSafe Cable ${i}m`,
    slug: `${brand.toLowerCase()}-powersafe-cable-${i}m`,
    brand: brand,
    model: `PowerSafe ${i}M`,
    sku: `SKU-ACC-${idStr}`,
    category: 'Accessories',
    price: 699 + (i * 300),
    originalPrice: 799 + (i * 300),
    currency: 'INR',
    description: `A highly durable nylon-braided connectivity cable designed to handle high data transfer speeds and quick device charging rates. Tested to sustain over 10,000 bends for durability.`,
    shortDescription: `Braided fast-charging adapter cable with durable strain-relief collars.`,
    specifications: {
      'Cable Type': 'USB-C to USB-C',
      'Data Speed': 'Up to 480 Mbps',
      'Charging Power': 'Supports up to 60W charging',
      'Material': 'Double-braided nylon jacket',
      'Length': `${i} meters`
    },
    rating: Number((3.8 + (i % 7) * 0.16).toFixed(1)),
    reviewCount: 50 + i * 15,
    stock: stockVal,
    warranty: '6 months',
    useCases: ['Everyday use', 'Office work', 'Travel'],
    tags: ['cable', 'usb-c-cable', 'charging-accessories', 'durable-braid'],
    images: [`/images/products/accessories/acc-${idStr}.webp`],
    featured: false,
    createdAt: `2026-07-06T10:00:00.000Z`,
    updatedAt: `2026-08-01T10:00:00.000Z`
  });
}

// ----------------------------------------------------
// Validation Check
// ----------------------------------------------------
console.log(`Successfully generated ${products.length} products.`);

// Validate using Zod schema to ensure no runtime validation errors
let errorsCount = 0;
products.forEach((p, idx) => {
  const check = productSchema.safeParse(p);
  if (!check.success) {
    errorsCount++;
    console.error(`Validation failed at index ${idx} [${p.productId}]:`, check.error.errors);
  }
});

if (errorsCount === 0) {
  console.log('All generated products successfully passed Zod validation.');
} else {
  console.error(`Zod validation failed for ${errorsCount} products.`);
  process.exit(1);
}

// ----------------------------------------------------
// Write Output Files
// ----------------------------------------------------
const dataDir = path.resolve(import.meta.dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Write products.json
fs.writeFileSync(
  path.join(dataDir, 'products.json'),
  JSON.stringify(products, null, 2),
  'utf-8'
);
console.log('Wrote products.json');

// 2. Write datasetMetadata.json
const metadata = {
  name: 'ShopSmart AI Demonstration Product Catalog',
  version: '1.0.0',
  currency: 'INR',
  recordCount: products.length,
  generatedAt: new Date().toISOString(),
  dataClassification: 'Curated demonstration data',
  disclaimer: 'Prices, ratings, stock, warranties, and review figures are demonstration values and are not live retailer data.'
};

fs.writeFileSync(
  path.join(dataDir, 'datasetMetadata.json'),
  JSON.stringify(metadata, null, 2),
  'utf-8'
);
console.log('Wrote datasetMetadata.json');

// Helper to escape CSV cell values
function escapeCsv(val: any): string {
  if (val === undefined || val === null) return '';
  let str = '';
  if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }
  // Replace double quotes with escaped double quotes
  str = str.replace(/"/g, '""');
  // Enclose in double quotes if it contains comma, double quote or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
}

// 3. Write products.csv
const headers = [
  'product_id',
  'name',
  'slug',
  'brand',
  'model',
  'sku',
  'category',
  'price',
  'original_price',
  'discount_percentage',
  'currency',
  'description',
  'short_description',
  'specifications_json',
  'rating',
  'review_count',
  'stock',
  'warranty',
  'use_cases_json',
  'tags_json',
  'images_json',
  'color_options_json',
  'highlights_json',
  'featured',
  'created_at',
  'updated_at'
];

let csvContent = headers.join(',') + '\n';

products.forEach((p) => {
  const row = [
    escapeCsv(p.productId),
    escapeCsv(p.name),
    escapeCsv(p.slug),
    escapeCsv(p.brand),
    escapeCsv(p.model),
    escapeCsv(p.sku),
    escapeCsv(p.category),
    escapeCsv(p.price),
    escapeCsv(p.originalPrice),
    escapeCsv(p.discountPercentage),
    escapeCsv(p.currency),
    escapeCsv(p.description),
    escapeCsv(p.shortDescription),
    escapeCsv(p.specifications),
    escapeCsv(p.rating),
    escapeCsv(p.reviewCount),
    escapeCsv(p.stock),
    escapeCsv(p.warranty),
    escapeCsv(p.useCases),
    escapeCsv(p.tags),
    escapeCsv(p.images),
    escapeCsv(p.colorOptions),
    escapeCsv(p.highlights),
    escapeCsv(p.featured),
    escapeCsv(p.createdAt),
    escapeCsv(p.updatedAt)
  ];
  csvContent += row.join(',') + '\n';
});

fs.writeFileSync(
  path.join(dataDir, 'products.csv'),
  csvContent,
  'utf-8'
);
console.log('Wrote products.csv');
