'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/useCartStore';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { supabase } from '@/lib/supabase';
import { ProductSkeleton } from '@/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, ChevronRight, Zap, Target } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  image_url: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainCat, setActiveMainCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerText, setBannerText] = useState('Artisanal Cakes Delivered in 15 Mins');
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: settings } = await supabase.from('settings').select('*');
        if (settings) {
          const banner = settings.find(s => s.key === 'banner_text')?.value;
          if (banner) setBannerText(banner);
        }

        const { data: cats } = await supabase.from('categories').select('*').eq('section', 'confectionary')
          .order('is_featured', { ascending: false })
          .order('featured_priority', { ascending: true })
          .order('display_order');
        if (cats && cats.length > 0) setCategories(cats);

        const { data, error } = await supabase.from('products').select('*').contains('categories', ['confectionary'])
          .order('is_featured', { ascending: false })
          .order('featured_priority', { ascending: true })
          .order('sales_count', { ascending: false })
          .order('created_at', { ascending: false });
        
        let finalProducts = [];
        if (error || !data || data.length === 0) {
          finalProducts = MOCK_PRODUCTS.filter(p => (p as any).category === 'confectionary');
        } else {
          finalProducts = data as Product[];
        }
        setProducts(finalProducts);
      } catch (err) {
        setProducts(MOCK_PRODUCTS.filter(p => (p as any).category === 'confectionary'));
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = products;
    
    if (activeMainCat) {
      result = result.filter(p => 
        (p as any).subcategories?.includes(activeMainCat) || 
        p.name.toLowerCase().includes(activeMainCat.toLowerCase())
      );
    }
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(result);
  }, [products, activeMainCat, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        placeholder="Search for cakes, desserts..."
      />
      
      <main className="flex flex-col">
        {/* Banner Section */}
        <div className="px-5 mb-6 mt-2">
           <div className="relative rounded-[28px] overflow-hidden aspect-[16/8] shadow-2xl shadow-orange-100 group">
              <img 
                src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-6">
                 <h2 className="text-xl font-black text-white leading-tight mb-1 uppercase tracking-tight">{bannerText}</h2>
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Premium Selection</p>
              </div>
           </div>
        </div>

        {/* Smaller Circular Categories */}
        <section className="mb-6 overflow-hidden">
           <div className="px-5 flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                {user?.name || 'Hey'}, what's on your mind?
              </h3>
           </div>
           
           <div className="flex overflow-x-auto no-scrollbar gap-4 px-5 pb-1">
              <div 
                onClick={() => setActiveMainCat(null)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              >
                <div className={cn(
                  "w-[60px] h-[60px] rounded-full flex items-center justify-center border transition-all shadow-sm",
                  !activeMainCat ? "bg-gray-900 border-gray-900 text-white scale-105" : "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                   <Target size={20} />
                </div>
                <span className={cn("text-[10px] font-black tracking-tight", !activeMainCat ? "text-gray-900" : "text-gray-400")}>All</span>
              </div>

              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => setActiveMainCat(cat.name)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
                >
                  <div className={cn(
                    "w-[68px] h-[68px] rounded-full overflow-hidden border-2 transition-all p-1",
                    activeMainCat === cat.name 
                      ? "border-primary bg-primary/5 scale-105 shadow-lg shadow-orange-100" 
                      : "border-gray-50 bg-gray-50"
                  )}>
                    <img src={cat.image_url} className="w-full h-full object-cover rounded-full" alt={cat.name} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black tracking-tight",
                    activeMainCat === cat.name ? "text-primary" : "text-gray-400"
                  )}>
                    {cat.name}
                  </span>
                </div>
              ))}
           </div>
        </section>

        {/* Product Grid */}
        <section className="px-5 mb-8">
           <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-0.5">
                 <h3 className="text-[15px] font-black text-gray-900 tracking-tight uppercase">
                   {activeMainCat || 'Freshly Baked Treats'}
                 </h3>
                 <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Fastest delivery near you</span>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-3 pb-24">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <ProductSkeleton key={`skeleton-${i}`} />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300 gap-4 text-center">
                     <ShoppingBag size={32} className="opacity-10" />
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">No matching treats found</p>
                  </div>
                ) : (
                  filteredProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
        </section>
      </main>
    </div>
  );
}
