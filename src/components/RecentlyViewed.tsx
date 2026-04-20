import React from 'react';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import ProductCard from './ProductCard';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecentlyViewedProps {
  categoryFilter?: 'confectionary' | 'medical';
}

export default function RecentlyViewed({ categoryFilter }: RecentlyViewedProps) {
  const { items } = useRecentlyViewedStore();

  const filteredItems = categoryFilter 
    ? items.filter(item => item.category === categoryFilter || (item as any)?.categories?.includes(categoryFilter)) 
    : items;

  if (filteredItems.length === 0) return null;

  return (
    <section className="mb-6 overflow-hidden bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 py-6 rounded-[32px] mx-2 shadow-inner border border-white/50">
      <div className="px-5 mb-4 flex items-center gap-2">
        <Clock size={16} strokeWidth={2.5} className="text-gray-400" />
        <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">
          Recently Viewed
        </h3>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar gap-3 px-5 pb-1 w-full relative">
        <AnimatePresence>
          {filteredItems.map((product) => (
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
