'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/useCartStore';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { supabase } from '@/lib/supabase';
import { ProductSkeleton } from '@/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Target, Zap, Clock, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import RecentlyViewed from '@/components/RecentlyViewed';
import RecommendedForYou from '@/components/RecommendedForYou';
import TrendingProducts from '@/components/TrendingProducts';
import RoutineRecommended from '@/components/RoutineRecommended';
import EssentialsBanner from '@/components/EssentialsBanner';
import CustomBanner, { Banner } from '@/components/CustomBanner';

interface Category {
  id: string;
  name: string;
  image_url: string;
  discount_percent: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
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
          .eq('section', 'confectionary')
          .order('is_featured', { ascending: false })
          .order('featured_priority', { ascending: true })
          .order('display_order');
        if (cats && cats.length > 0) setCategories(cats);

        const { data: bannerData } = await supabase.from('banners').select('*').eq('is_active', true).order('priority');
        if (bannerData) setBanners(bannerData);

        const { data, error } = await supabase.from('products').select('*').contains('categories', ['confectionary'])
          .order('is_ad', { ascending: false })
          .order('ad_created_at', { ascending: false })
          .order('sales_count', { ascending: false })
          .order('rating', { ascending: false })
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        let finalProducts = [];
        if (error || !data || data.length === 0) {
          finalProducts = MOCK_PRODUCTS.filter(p => (p as any).category === 'confectionary')
            .sort((a, b) => ((b as any).sales_count || 0) - ((a as any).sales_count || 0) || ((b as any).rating || 0) - ((a as any).rating || 0));
        } else {
          finalProducts = data as Product[];
        }

        if (cats && cats.length > 0) {
          finalProducts = finalProducts.map(p => {
            let maxDiscount = (p as any).discount_percent || 0;
            if ((p as any).subcategories && (p as any).subcategories.length > 0) {
              (p as any).subcategories.forEach((sub: string) => {
                const catMatch = cats.find(c => c.name === sub);
                if (catMatch && catMatch.discount_percent && catMatch.discount_percent > maxDiscount) {
                  maxDiscount = catMatch.discount_percent;
                }
              });
            }
            if (maxDiscount > 0) {
              const originalPrice = p.original_price || p.price;
              return {
                ...p,
                original_price: originalPrice,
                price: Math.round(originalPrice * (1 - maxDiscount / 100)),
                discount_percent: maxDiscount
              };
            }
            return p;
          });
        }
        setProducts(finalProducts);
      } catch (err) {
        setProducts(MOCK_PRODUCTS.filter(p => (p as any).category === 'confectionary'));
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    // Realtime Subscriptions
    const bannersChannel = supabase
      .channel('banners-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => fetchData())
      .subscribe();

    const productsChannel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
      .subscribe();

    fetchData();

    return () => {
      supabase.removeChannel(bannersChannel);
      supabase.removeChannel(productsChannel);
    };
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
        (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (p.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        ((p as any).categories?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())) || false) ||
        ((p as any).subcategories?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) || false)
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, activeMainCat, products]);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search for cakes, desserts..."
      />

      <main className="flex flex-col">
        {!searchQuery && (
          <>
            {/* Step 1: Essentials Dynamic Banner */}
            <EssentialsBanner products={products} categoryFilter="confectionary" />

            {/* Step 2: Custom Banners Priority 1 */}
            {banners.filter(b => b.priority === 1).map(banner => (
              <CustomBanner key={banner.id} banner={banner} />
            ))}

            {/* Step 3: Circular Categories */}
            <section className="mb-8 overflow-hidden">
              <div className="px-5 flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">
                   What's on your mind?
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
                      <img 
                        src={cat.image_url} 
                        className="w-full h-full object-cover rounded-full" 
                        alt={cat.name} 
                      />
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

            <RecentlyViewed categoryFilter="confectionary" />

            {/* New Interactive: Flash Deals */}
            <section className="mb-10 bg-gray-900 py-10">
               <div className="px-5 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                        <Zap size={20} fill="currentColor" />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-white tracking-tight leading-none uppercase">Flash Deals</h3>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Starting at ₹49</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                     <Clock size={12} className="text-primary" />
                     <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">Ends In 2h</span>
                  </div>
               </div>
               
               <div className="flex overflow-x-auto no-scrollbar gap-5 px-5">
                  {products.filter(p => (p.discount_percent || 0) > 10).slice(0, 6).map((product) => (
                     <div key={`flash-${product.id}`} className="w-[160px] flex-shrink-0 group">
                        <ProductCard product={product} />
                     </div>
                  ))}
               </div>
            </section>

            {/* New Interactive: Best Sellers */}
            <section className="mb-10 px-5">
               <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-2">
                        <Star size={16} fill="#10b981" className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Top Rated Selection</span>
                     </div>
                     <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">Fan Favorites <br/> This Week</h2>
                     <div className="grid grid-cols-2 gap-4">
                        {products.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 2).map(p => (
                           <ProductCard key={`fav-${p.id}`} product={p} />
                        ))}
                     </div>
                  </div>
                  <TrendingUp className="absolute -bottom-10 -right-10 w-40 h-40 text-emerald-100" />
               </div>
            </section>
          </>
        )}

        {/* Product Grid */}
        <section className="px-5 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-[17px] font-black text-gray-900 tracking-tight leading-none">
                {activeMainCat || 'EXPLORE COLLECTION'}
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Verified by Food Safety</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-24">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} />
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300 gap-4 text-center">
                  <ShoppingBag size={32} className="opacity-10 text-primary" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">No items found</p>
                </div>
              ) : (
                filteredProducts.map((product, i) => (
                  <React.Fragment key={product.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: (i % 6) * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>

                    {/* After 3 Rows - Personalized Insert */}
                    {i === 5 && (
                      <div className="col-span-2 -mx-5 px-0 py-4 my-4 bg-gray-50/50">
                        <RoutineRecommended products={products} categoryFilter="confectionary" />
                      </div>
                    )}

                    {/* Priority 2 Banners */}
                    {i === 5 && banners.filter(b => b.priority === 2).map(banner => (
                      <div key={banner.id} className="col-span-2 -mx-5 mt-4">
                        <CustomBanner banner={banner} />
                      </div>
                    ))}

                    {/* Banners Priority 3 */}
                    {i === 11 && banners.filter(b => b.priority === 3).map(banner => (
                      <div key={banner.id} className="col-span-2 -mx-5 mt-4">
                        <CustomBanner banner={banner} />
                      </div>
                    ))}

                    {/* Curated Section */}
                    {i === 11 && (
                      <div className="col-span-2 -mx-5 px-0 py-4 my-2">
                        <RecommendedForYou products={products} categoryFilter="confectionary" />
                      </div>
                    )}

                     {/* Banners Priority 4 */}
                    {i === 17 && banners.filter(b => b.priority === 4).map(banner => (
                      <div key={banner.id} className="col-span-2 -mx-5 mt-4">
                        <CustomBanner banner={banner} />
                      </div>
                    ))}

                    {/* Trending Section */}
                    {i === 17 && (
                      <div className="col-span-2 -mx-5 px-0 py-4 my-2">
                        <TrendingProducts products={products} categoryFilter="confectionary" />
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
