import React, { useMemo } from 'react';
import { Sun, Moon, Coffee, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/store/useCartStore';
import ProductCard from './ProductCard';

interface EssentialsBannerProps {
  products: Product[];
  categoryFilter?: 'confectionary' | 'medical';
}

export default function EssentialsBanner({ products, categoryFilter }: EssentialsBannerProps) {
  const { essentials, theme } = useMemo(() => {
    let list = products;
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter || (p as any)?.categories?.includes(categoryFilter));
    }

    const hour = new Date().getHours();
    let themeObj = {
      title: 'Night Owl Cravings',
      subtitle: 'Midnight essentials just for you',
      Icon: Moon,
      bgClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
      textColor: 'text-indigo-100',
      iconColor: 'text-indigo-400',
      shadowClass: 'shadow-indigo-900/50',
      targetCategories: ['dinner', 'relax', 'sleep', 'midnight snacks', 'desserts', 'pain relief']
    };

    if (hour >= 5 && hour < 11) {
      themeObj = {
        title: 'Morning Essentials',
        subtitle: 'Start your day right',
        Icon: Coffee,
        bgClass: 'bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600',
        textColor: 'text-teal-50',
        iconColor: 'text-teal-200',
        shadowClass: 'shadow-emerald-500/50',
        targetCategories: ['breakfast', 'bakery', 'vitamins', 'coffee', 'tea', 'morning']
      };
    } else if (hour >= 11 && hour < 17) {
      themeObj = {
        title: 'Afternoon Pick-Me-Up',
        subtitle: 'Recharge your energy levels',
        Icon: Sun,
        bgClass: 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600',
        textColor: 'text-orange-50',
        iconColor: 'text-amber-200',
        shadowClass: 'shadow-orange-500/50',
        targetCategories: ['lunch', 'cake', 'energy', 'snacks', 'drinks']
      };
    } else if (hour >= 17 && hour < 22) {
      themeObj = {
        title: 'Evening Essentials',
        subtitle: 'Wind down and enjoy',
        Icon: Sparkles,
        bgClass: 'bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600',
        textColor: 'text-rose-50',
        iconColor: 'text-pink-300',
        shadowClass: 'shadow-pink-500/50',
        targetCategories: ['dinner', 'desserts', 'pastries', 'relax', 'beauty']
      };
    }

    const scored = list.map(p => {
      let score = Math.random() * 5;
      const cats = [p.category, ...(p.tags || []), ...((p as any).subcategories || [])];
      cats.forEach(c => {
        if (typeof c === 'string' && themeObj.targetCategories.includes(c.toLowerCase())) {
          score += 100;
        }
      });
      return { product: p, score };
    });

    const topProducts = scored.sort((a, b) => b.score - a.score).slice(0, 4).map(s => s.product);

    return { essentials: topProducts, theme: themeObj };
  }, [products, categoryFilter]);

  if (essentials.length === 0) return null;

  return (
    <div className="px-5 mb-8 mt-2">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-[40px] overflow-hidden ${theme.bgClass} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ${theme.shadowClass} p-8 pb-24`}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <theme.Icon size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-white leading-none uppercase tracking-tighter">
                {theme.title}
              </h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.textColor} opacity-60 mt-1`}>
                {theme.subtitle}
              </p>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/20 rounded-full blur-[60px] pointer-events-none" 
        />
        
        {/* Subtle Sparkle Icons in BG */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <Sparkles size={24} className="absolute top-10 right-1/4 text-white animate-pulse" />
          <Sparkles size={16} className="absolute bottom-20 left-1/3 text-white animate-bounce" />
        </div>
      </motion.div>

      {/* Overlapping Products Grid */}
      <div className="px-2 -mt-20 relative z-20">
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-4">
          {essentials.map((product) => (
            <motion.div 
              key={product.id} 
              whileHover={{ y: -10 }}
              className="min-w-[155px] w-[155px] flex-shrink-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
