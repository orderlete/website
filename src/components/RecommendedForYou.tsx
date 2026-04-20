import React, { useEffect, useState } from 'react';
import { useUserPreferencesStore } from '@/store/useUserPreferencesStore';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/store/useCartStore';

interface RecommendedForYouProps {
  categoryFilter?: 'confectionary' | 'medical';
  products: Product[]; // Pass all products to filter from
}

export default function RecommendedForYou({ categoryFilter, products }: RecommendedForYouProps) {
  const { getTopCategories } = useUserPreferencesStore();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Get top categories
    const topCategories = getTopCategories(5);

    // Filter products based on top categories and section
    let potentialProducts = products;
    
    if (categoryFilter) {
      potentialProducts = potentialProducts.filter(
        p => p.category === categoryFilter || (p as any)?.categories?.includes(categoryFilter)
      );
    }

    if (topCategories.length > 0) {
      // Find products that match top categories
      const scoredProducts = potentialProducts.map(p => {
        let score = 0;
        const pCats = [p.category, ...((p as any).categories || []), ...((p as any).subcategories || [])];
        topCategories.forEach((tc, idx) => {
          if (pCats.includes(tc)) {
            // Higher rank gives more score
            score += (5 - idx);
          }
        });
        return { product: p, score };
      });

      // Sort by score
      const sorted = scoredProducts
        .filter(sp => sp.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(sp => sp.product);

      // Take top 10 unique elements
      const uniqueRecs = Array.from(new Set(sorted)).slice(0, 10);
      setRecommendedProducts(uniqueRecs);
    }
  }, [products, categoryFilter, getTopCategories]);

  if (recommendedProducts.length === 0) return null;

  return (
    <section className="mb-6 overflow-hidden bg-gradient-to-tr from-orange-50 to-rose-50 py-6 rounded-[32px] shadow-sm border border-orange-100/50">
      <div className="px-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} strokeWidth={2.5} className="text-orange-500 animate-pulse" />
          <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">
            Curated For You
          </h3>
        </div>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar gap-3 px-5 pb-1 w-full relative">
        <AnimatePresence>
          {recommendedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="min-w-[150px] w-[150px] flex-shrink-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
