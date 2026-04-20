'use client';

import React from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useWishlistStore } from '@/store/useWishlistStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="px-5 py-6 flex items-center gap-4 border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 border border-gray-100 rounded-xl active:scale-95 transition-all">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-black text-gray-900 uppercase tracking-tighter">My Favorites</h1>
      </header>

      <main className="p-5 pb-24">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
             <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center text-red-500">
                <Heart size={40} className="opacity-20" />
             </div>
             <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900">Your wishlist is empty</h2>
                <p className="text-sm font-bold text-gray-400 px-8">Save items you love to find them easily later.</p>
             </div>
             <button 
               onClick={() => router.push('/')}
               className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all"
             >
                START BROWSING
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {items.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
