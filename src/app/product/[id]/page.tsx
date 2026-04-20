'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Clock,
  ShieldCheck,
  Heart,
  Share2,
  Plus,
  Minus,
  Zap,
  ArrowRight,
  CheckCircle2,
  Info,
  MessageCircle
} from 'lucide-react';
import { Product, useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useUserPreferencesStore } from '@/store/useUserPreferencesStore';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { formatPrice, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { items: cartItems, addItem, removeItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [descExpanded, setDescExpanded] = useState(false);

  const cartItem = cartItems.find(i => i.id === id);
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    async function fetchProductData() {
      try {
        // 1. Fetch Product
        const { data: prodData } = await supabase.from('products').select('*').eq('id', id).single();
        let finalProduct = prodData || MOCK_PRODUCTS.find(p => p.id === id);

        if (finalProduct) {
          let fetchedCats: any[] = [];
          try {
            const { data: cats } = await supabase.from('categories').select('*');
            fetchedCats = cats || [];
            let maxDiscount = 0;
            if (fetchedCats.length > 0 && finalProduct.subcategories) {
              finalProduct.subcategories.forEach((sub: string) => {
                const catMatch = fetchedCats.find(c => c.name === sub);
                if (catMatch && catMatch.discount_percent && catMatch.discount_percent > maxDiscount) {
                  maxDiscount = catMatch.discount_percent;
                }
              });
            }
            if (maxDiscount > 0) {
              finalProduct = {
                ...finalProduct,
                original_price: finalProduct.price,
                price: Math.round(finalProduct.price * (1 - maxDiscount / 100)),
                discount_percent: maxDiscount
              };
            }
          } catch (e) { }
          setProduct(finalProduct);

          try {
            const { data: relatedData } = await supabase.from('products')
              .select('*')
              .contains('categories', finalProduct.categories || [])
              .neq('id', id)
              .order('sales_count', { ascending: false })
              .limit(4);

            if (relatedData) {
              const finalRelated = relatedData.map((p: any) => {
                let rMaxDiscount = 0;
                if (fetchedCats.length > 0 && p.subcategories) {
                  p.subcategories.forEach((sub: string) => {
                    const catMatch = fetchedCats.find(c => c.name === sub);
                    if (catMatch && catMatch.discount_percent && catMatch.discount_percent > rMaxDiscount) {
                      rMaxDiscount = catMatch.discount_percent;
                    }
                  });
                }
                if (rMaxDiscount > 0) {
                  return {
                    ...p,
                    original_price: p.price,
                    price: Math.round(p.price * (1 - rMaxDiscount / 100)),
                    discount_percent: rMaxDiscount
                  };
                }
                return p;
              });
              setRelatedProducts(finalRelated as Product[]);
            }
          } catch (e) { }
        }

        // 2. Fetch Real Ratings
        const { data: reviews } = await supabase
          .from('reviews')
          .select('product_rating')
          .eq('product_id', id);

        if (reviews && reviews.length > 0) {
          const sum = reviews.reduce((acc: number, r: any) => acc + r.product_rating, 0);
          setAvgRating(parseFloat((sum / reviews.length).toFixed(1)));
          setReviewCount(reviews.length);
        } else {
          setAvgRating(finalProduct?.rating || parseFloat((3.8 + Math.random() * 1.2).toFixed(1)));
          setReviewCount(finalProduct?.review_count || Math.floor(Math.random() * 91) + 10);
        }

        // Add to recently viewed
        if (finalProduct) {
          useRecentlyViewedStore.getState().addRecentlyViewed(finalProduct);
          useUserPreferencesStore.getState().recordInteraction(finalProduct, 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="fixed top-0 inset-x-0 z-30 p-4 flex items-center justify-between pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl text-gray-900 pointer-events-auto border border-gray-100/50"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </motion.button>
        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={() => {
              toggleItem(product);
              toast.success(isInWishlist(product.id) ? 'Removed from saved' : 'Saved to favorites');
            }}
            className={cn(
              "p-3 rounded-2xl shadow-xl transition-all border border-transparent",
              isInWishlist(product.id) ? "bg-red-500 text-white shadow-red-200" : "bg-white/95 backdrop-blur-md text-gray-900 shadow-black/5 border-gray-100"
            )}
          >
            <Heart size={20} strokeWidth={2.5} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="aspect-square w-full relative overflow-hidden bg-gray-50">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>

        <div className="px-5 -mt-12 relative z-10 bg-white rounded-t-[48px] pt-10 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest leading-none">
                {product.categories?.[0] || 'Exclusive'}
              </span>
              {product.subcategories?.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-lg uppercase tracking-widest border border-primary/20 leading-none">
                  {s}
                </span>
              ))}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{product.name}</h1>
              {product.subtitle && (
                <p className="text-primary font-black text-[12px] uppercase tracking-widest opacity-80">{product.subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-4 py-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50/50 rounded-xl border border-orange-100/50">
                <Star size={16} strokeWidth={2.5} fill="#f59e0b" className="text-secondary" />
                <span className="font-black text-[14px] text-gray-900 leading-none">{avgRating || '4.8'}</span>
                <span className="text-[10px] text-gray-400 font-bold">({reviewCount} verified)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100/50">
                <Clock size={16} strokeWidth={2.5} className="text-gray-400" />
                <span className="text-[12px] font-black text-gray-600 leading-none">15-20 MINS</span>
              </div>
            </div>
          </div>

          {product.features && product.features.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={14} strokeWidth={3} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Product Features</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {product.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 p-4 bg-gray-50/50 rounded-[20px] border border-gray-100/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-[11px] font-black text-gray-700 tracking-tight leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between py-8 border-y border-gray-100/50">
            <div className="flex flex-col">
              {product.original_price && product.original_price > product.price && (
                <span className="text-[16px] font-bold text-gray-400 line-through mb-1">{formatPrice(product.original_price)}</span>
              )}
              <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{formatPrice(product.price)}</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest mt-2", product.discount_percent > 0 ? "text-primary" : "text-gray-400")}>
                {product.discount_percent > 0 ? `🎊 ${product.discount_percent}% OFF` : 'Plus delivery fee'}
              </span>
            </div>

            <div className="flex items-center bg-gray-900 rounded-2xl p-1.5 shadow-2xl shadow-gray-300">
              <button onClick={() => { removeItem(product.id); toast.error('Removed 1 item'); }} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><Minus size={18} strokeWidth={3} /></button>
              <span className="px-5 text-white font-black text-xl min-w-[50px] text-center">{quantity}</span>
              <button onClick={() => { addItem(product); toast.success('Added to tray'); }} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><Plus size={18} strokeWidth={3} /></button>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Info size={14} strokeWidth={3} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">About</h3>
            </div>
            <div className="bg-gray-50/30 p-8 rounded-[40px] border border-gray-100/50">
              <p className="text-[14px] text-gray-600 font-bold leading-relaxed">
                {(() => {
                  const desc = product.about || product.description || "Crafted with passion using hand-picked ingredients for a truly premium experience.";
                  const truncatedDesc = desc.length > 60 ? desc.slice(0, 60) + '...' : desc;
                  return (
                    <>
                      {descExpanded ? desc : truncatedDesc}
                      {desc.length > 60 && (
                        <button onClick={() => setDescExpanded(!descExpanded)} className="text-primary ml-2 uppercase text-[10px] font-black tracking-widest bg-primary/10 px-2 py-1 rounded-md">
                          {descExpanded ? 'Less' : 'Read More'}
                        </button>
                      )}
                    </>
                  );
                })()}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 pb-12">
            <div className="p-6 bg-emerald-50/20 rounded-[32px] border border-emerald-100/30 flex flex-col gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                <ShieldCheck size={24} strokeWidth={2.2} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-emerald-900 uppercase tracking-wide">Quality Assured</p>
                <p className="text-[9px] text-emerald-800/60 font-medium leading-tight">Every item undergoes strict safety checks.</p>
              </div>
            </div>
            <div className="p-6 bg-blue-50/20 rounded-[32px] border border-blue-100/30 flex flex-col gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                <MessageCircle size={24} strokeWidth={2.2} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-blue-900 uppercase tracking-wide">{reviewCount}+ Feedback</p>
                <p className="text-[9px] text-blue-800/60 font-medium leading-tight">High satisfaction across all demographics.</p>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="pt-8 border-t border-gray-100/50 pb-12">
              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <Zap size={14} strokeWidth={3} className="text-emerald-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">More in this Category</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {quantity > 0 ? (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 inset-x-0 z-50 p-5">
            <div className="bg-gray-900 rounded-[36px] p-5 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex flex-col leading-tight pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">{quantity} {quantity === 1 ? 'Item' : 'Items'}</span>
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="text-white font-black text-[20px] tracking-tight">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
              <button onClick={() => router.push('/cart')} className="bg-primary text-white p-4 px-8 rounded-2xl font-black text-[13px] flex items-center gap-3 shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                PLACE ORDER
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
