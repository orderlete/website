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

export default function MedicalPage() {
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
          .eq('section', 'medical')
          .order('is_featured', { ascending: false })
          .order('featured_priority', { ascending: true })
          .order('display_order');
        if (cats && cats.length > 0) setCategories(cats);

        const { data: bannerData } = await supabase.from('banners').select('*').eq('is_active', true).order('priority');
        if (bannerData) setBanners(bannerData);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .contains('categories', ['medical'])
          .order('is_ad', { ascending: false })
          .order('ad_created_at', { ascending: false })
          .order('sales_count', { ascending: false })
          .order('rating', { ascending: false })
          .order('is_featured', { ascending: false })
          .order('featured_priority', { ascending: true })
          .order('created_at', { ascending: false });

        let finalProducts = [];
        if (error || !data || data.length === 0) {
          finalProducts = MOCK_PRODUCTS.filter(p => (p as any).category === 'medical')
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
        (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (p.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        ((p as any).categories?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())) || false) ||
        ((p as any).subcategories?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) || false)
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
        {!searchQuery && (
          <>
            {/* Step 1: Essentials Dynamic Banner */}
            <EssentialsBanner products={products} categoryFilter="medical" />

            {/* Step 2: Custom Banners Priority 1 */}
            {banners.filter(b => b.priority === 1).map(banner => (
              <CustomBanner key={banner.id} banner={banner} />
            ))}

            {/* Pharma Section */}
            <div className="px-5 mb-6 mt-2 flex flex-col gap-4">
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

            {/* Categories */}
            <section className="mb-6 overflow-hidden">
              <div className="px-5 flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">
                  Medical Specialties
                </h3>
              </div>

              <div className="flex overflow-x-auto no-scrollbar gap-4 px-5 pb-1">
                <div
                  onClick={() => setActiveMainCat(null)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                >
                  <div className={cn(
                    "w-[60px] h-[60px] rounded-full flex items-center justify-center border transition-all shadow-sm",
                    !activeMainCat ? "bg-blue-600 border-blue-600 text-white scale-100" : "bg-gray-50 border-gray-100 text-gray-400"
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
                        ? "border-blue-600 bg-blue-50 scale-102 shadow-lg shadow-blue-100"
                        : "border-gray-50 bg-gray-50"
                    )}>
                      <img 
                        src={cat.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80'} 
                        className="w-full h-full object-cover rounded-full" 
                        alt={cat.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80';
                        }}
                      />
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

            <RecentlyViewed categoryFilter="medical" />
          </>
        )}

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
                  <React.Fragment key={product.id}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (i % 6) * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>

                    {/* After 3 Rows (6 Products) - Routine Recommended */}
                    {i === 5 && (
                      <div className="col-span-2 -mx-5 px-0 py-4 my-2">
                        <RoutineRecommended products={products} categoryFilter="medical" />
                      </div>
                    )}

                    {/* Priority 2 Banners after 6 products AND Routine session */}
                    {i === 5 && banners.filter(b => b.priority === 2).map(banner => (
                      <div key={banner.id} className="col-span-2 -mx-5 mt-4">
                        <CustomBanner banner={banner} />
                      </div>
                    ))}

                    {/* Banners Priority 3 (after 12 products) */}
                    {i === 11 && banners.filter(b => b.priority === 3).map(banner => (
                      <div key={banner.id} className="col-span-2 -mx-5 mt-4">
                        <CustomBanner banner={banner} />
                      </div>
                    ))}

                    {/* Curated For You (after 12 total) */}
                    {i === 11 && (
                      <div className="col-span-2 -mx-5 px-0 py-4 my-2">
                        <RecommendedForYou products={products} categoryFilter="medical" />
                      </div>
                    )}

                    {/* Banners Priority 4 (after 18 products) */}
                    {i === 17 && banners.filter(b => b.priority === 4).map(banner => (
                      <div key={banner.id} className="col-span-2 -mx-5 mt-4">
                        <CustomBanner banner={banner} />
                      </div>
                    ))}

                    {/* Trending Products (after 18 total) */}
                    {i === 17 && (
                      <div className="col-span-2 -mx-5 px-0 py-4 my-2">
                        <TrendingProducts products={products} categoryFilter="medical" />
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
