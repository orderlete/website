'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/useCartStore';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { supabase } from '@/lib/supabase';
import CallAction from '@/components/CallAction';
import { ProductSkeleton } from '@/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, HeartPulse, Pill, Zap, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

interface Category {
  id: string;
  name: string;
  image_url: string;
}

export default function MedicalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainCat, setActiveMainCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .eq('section', 'medical')
          .order('display_order');
        if (cats && cats.length > 0) setCategories(cats);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .contains('categories', ['medical']);

        let finalProducts = [];
        if (error || !data || data.length === 0) {
          finalProducts = MOCK_PRODUCTS.filter(p => (p as any).category === 'medical');
        } else {
          finalProducts = data as Product[];
        }
        setProducts(finalProducts);
      } catch (err) {
        setProducts(MOCK_PRODUCTS.filter(p => (p as any).category === 'medical'));
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
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [products, activeMainCat, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        placeholder="Medicines, Lab Tests..."
      />
      
      <main className="flex flex-col">
        {/* Pharma Banner - More Compact */}
        <div className="px-5 mb-6 mt-2 flex flex-col gap-4">
           {/* Pharma Banner */}
           <div className="relative rounded-[28px] overflow-hidden aspect-[16/7] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-6 shadow-2xl shadow-blue-50 group">
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="space-y-1">
                    <span className="text-[9px] text-blue-200 font-black uppercase tracking-widest bg-white/10 w-fit px-2 py-0.5 rounded-full">Pharmacy</span>
                    <h2 className="text-xl font-black text-white leading-tight">Express Medical <br/> Delivery</h2>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-white rounded-xl flex items-center gap-2">
                       <Zap size={12} className="text-blue-600" fill="currentColor" />
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">10 MINS</span>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
           </div>

           <CallAction 
             title="Medical Experts"
             trigger={
               <div className="bg-emerald-50 rounded-[28px] border border-emerald-100/50 p-5 flex items-center justify-between shadow-sm cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Activity size={24} />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[12px] font-black text-emerald-900 tracking-tight">Need Custom Medicine?</p>
                        <p className="text-[9px] font-bold text-emerald-800/60 uppercase tracking-widest">Talk to our pharmacist</p>
                     </div>
                  </div>
                  <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                     CALL NOW
                  </div>
               </div>
             } 
           />
        </div>

        {/* Smaller Circular Categories */}
        <section className="mb-6 overflow-hidden">
           <div className="px-5 flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                {user?.name || 'Friend'}, find your essentials
              </h3>
           </div>
           
           <div className="flex overflow-x-auto no-scrollbar gap-4 px-5 pb-1">
              <div 
                onClick={() => setActiveMainCat(null)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              >
                <div className={cn(
                  "w-[60px] h-[60px] rounded-full flex items-center justify-center border transition-all shadow-sm",
                  !activeMainCat ? "bg-blue-600 border-blue-600 text-white scale-105" : "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                   <Pill size={20} />
                </div>
                <span className={cn("text-[10px] font-black tracking-tight", !activeMainCat ? "text-blue-600" : "text-gray-400")}>Rx</span>
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
                      ? "border-blue-600 bg-blue-50 scale-105 shadow-lg shadow-blue-100" 
                      : "border-gray-50 bg-gray-50"
                  )}>
                    <img src={cat.image_url} className="w-full h-full object-cover rounded-full" alt={cat.name} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black tracking-tight",
                    activeMainCat === cat.name ? "text-blue-600" : "text-gray-400"
                  )}>
                    {cat.name}
                  </span>
                </div>
              ))}
           </div>
        </section>

        {/* Medical Grid */}
        <section className="px-5 mb-8">
           <div className="flex flex-col mb-4">
              <h3 className="text-[15px] font-black text-gray-900 tracking-tight uppercase">
                {activeMainCat || 'All Medicines'}
              </h3>
           </div>
           
           <div className="grid grid-cols-2 gap-3 pb-24">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <ProductSkeleton key={`skeleton-${i}`} />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300 gap-4 text-center">
                     <ShoppingBag size={32} className="opacity-10 text-blue-500" />
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">No medicines found</p>
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
