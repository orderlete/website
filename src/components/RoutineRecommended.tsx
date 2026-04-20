import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { Sun, Moon, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/store/useCartStore';

interface RoutineRecommendedProps {
  categoryFilter?: 'confectionary' | 'medical';
  products: Product[];
}

export default function RoutineRecommended({ categoryFilter, products }: RoutineRecommendedProps) {
  
  const { routineProducts, timeDetails } = useMemo(() => {
    let list = products;
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter || (p as any)?.categories?.includes(categoryFilter));
    }

    const hour = new Date().getHours();
    let timeLabel = '';
    let Icon = Coffee;
    let bgColor = 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100/50';

    // Mock logic to select specific categories according to time
    let preferredCategories: string[] = [];

    if (hour >= 5 && hour < 11) {
      timeLabel = 'Your Morning Routine';
      Icon = Coffee;
      bgColor = 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100/50';
      preferredCategories = ['breakfast', 'bakery', 'vitamins', 'pain relief'];
    } else if (hour >= 11 && hour < 17) {
      timeLabel = 'Your Afternoon Picks';
      Icon = Sun;
      bgColor = 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100/50';
      preferredCategories = ['lunch', 'cake', 'desserts', 'energy'];
    } else {
      timeLabel = 'Your Evening Essentials';
      Icon = Moon;
      bgColor = 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100/50';
      preferredCategories = ['pastries', 'dinner', 'sleep', 'relax', 'cookies'];
    }

    const scored = list.map(p => {
      let score = Math.random() * 10;
      const cats = [p.category, ...(p.tags || []), ...((p as any).subcategories || [])];
      
      cats.forEach(c => {
        if (typeof c === 'string' && preferredCategories.includes(c.toLowerCase())) {
          score += 50;
        }
      });
      // Give some boost to random items simulating past orders at this time
      if (Math.random() > 0.8) score += 30; 

      return { product: p, score };
    });

    const recommended = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => s.product);

    return { 
      routineProducts: recommended,
      timeDetails: { label: timeLabel, Icon, bgColor } 
    };
  }, [products, categoryFilter]);

  if (routineProducts.length === 0) return null;

  return (
    <section className={`mb-8 overflow-hidden py-8 rounded-[40px] mx-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border-2 ${timeDetails.bgColor}`}>
      <div className="px-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <timeDetails.Icon size={20} strokeWidth={2.5} className="text-gray-900 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-black text-gray-900 tracking-tight uppercase">
              {timeDetails.label}
            </h3>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Based on your routine</p>
          </div>
        </div>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar gap-4 px-5 pb-2 w-full relative">
        <AnimatePresence>
          {routineProducts.map((product) => (
            <motion.div
              key={`routine-${product.id}`}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              className="min-w-[155px] w-[155px] flex-shrink-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
