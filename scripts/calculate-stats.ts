import * as fs from 'fs';
import * as path from 'path';

function calculateStats() {
  const file = path.resolve(import.meta.dirname, '../src/data/products.json');
  const products = JSON.parse(fs.readFileSync(file, 'utf-8'));

  const stats: any = {
    total: products.length,
    byCategory: {},
    byBrand: {},
    pricesByCategory: {},
    ratingsByCategory: {},
    featuredCount: 0,
    outOfStockCount: 0,
    lowStockCount: 0
  };

  products.forEach((p: any) => {
    // Categories
    stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
    
    // Brands
    stats.byBrand[p.brand] = (stats.byBrand[p.brand] || 0) + 1;

    // Featured
    if (p.featured) stats.featuredCount++;

    // Stock
    if (p.stock === 0) {
      stats.outOfStockCount++;
    } else if (p.stock <= 5) {
      stats.lowStockCount++;
    }

    // Min / Max prices
    if (!stats.pricesByCategory[p.category]) {
      stats.pricesByCategory[p.category] = { min: p.price, max: p.price };
    } else {
      const catPrice = stats.pricesByCategory[p.category];
      if (p.price < catPrice.min) catPrice.min = p.price;
      if (p.price > catPrice.max) catPrice.max = p.price;
    }

    // Ratings
    if (!stats.ratingsByCategory[p.category]) {
      stats.ratingsByCategory[p.category] = { total: p.rating, count: 1 };
    } else {
      stats.ratingsByCategory[p.category].total += p.rating;
      stats.ratingsByCategory[p.category].count += 1;
    }
  });

  console.log('Total Count:', stats.total);
  console.log('By Category:', stats.byCategory);
  console.log('By Brand:', stats.byBrand);
  console.log('Featured Count:', stats.featuredCount);
  console.log('Out of Stock:', stats.outOfStockCount);
  console.log('Low Stock:', stats.lowStockCount);
  console.log('Price Bounds:', stats.pricesByCategory);
  
  Object.keys(stats.ratingsByCategory).forEach((cat) => {
    const r = stats.ratingsByCategory[cat];
    console.log(`Avg Rating for ${cat}:`, (r.total / r.count).toFixed(2));
  });
}

calculateStats();
