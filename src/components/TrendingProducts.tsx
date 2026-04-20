import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/store/useCartStore';

interface TrendingProductsProps {
  categoryFilter?: 'confectionary' | 'medical';
  products: Product[];
}

export default function TrendingProducts({ categoryFilter, products }: TrendingProductsProps) {
  const trendingProducts = useMemo(() => {
    let list = products;
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter || (p as any)?.categories?.includes(categoryFilter));
    }
    // Sort by sales_count or rating to simulate trending
    return list
      .map(p => ({ ...p, _score: (p as any).sales_count || (p.rating ? p.rating * 10 : Math.random() * 50) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 8);
  }, [products, categoryFilter]);

  if (trendingProducts.length === 0) return null;

  return (
    <section className="mb-6 overflow-hidden bg-gradient-to-bl from-amber-50 via-yellow-50/50 to-orange-50 py-6 rounded-[32px] shadow-sm border border-yellow-100/50">
      <div className="px-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={16} strokeWidth={2.5} className="text-red-500 animate-pulse" />
          <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">
            Trending This Week
          </h3>
        </div>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar gap-3 px-5 pb-1 w-full relative">
        <AnimatePresence>
          {trendingProducts.map((product) => (
            <motion.div
              key={`trending-${product.id}`}
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
