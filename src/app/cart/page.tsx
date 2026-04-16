'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, ArrowLeft, Trash2, Minus, Plus, ArrowRight, Sparkles, ReceiptText } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const router = useRouter();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-48 h-48 bg-gray-50 rounded-[48px] flex items-center justify-center text-gray-200"
        >
          <ShoppingBag size={80} strokeWidth={1.5} />
        </motion.div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Tray is Empty</h2>
           <p className="text-gray-400 text-[13px] font-bold uppercase tracking-widest max-w-[200px] mx-auto opacity-60">Add some treats to get started</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="bg-gray-900 text-white font-black px-12 py-4.5 rounded-[24px] shadow-2xl shadow-gray-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-gray-50 rounded-2xl text-gray-900 hover:bg-gray-100 transition-colors active:scale-90">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">My Basket</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Review your items</p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl border border-primary/20">
           <span className="text-[11px] font-black uppercase tracking-widest">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
        </div>
      </header>

      <main className="p-5 space-y-8">
        {/* Cart Items */}
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 group"
              >
                <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                       <h3 className="font-black text-gray-900 text-[15px] truncate pr-4">{item.name}</h3>
                       <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                          {Array.isArray(item.categories) ? item.categories[0] : (item as any).category}
                       </p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="font-black text-gray-900 text-lg">{formatPrice(item.price)}</p>
                    
                    <div className="flex items-center bg-gray-900 rounded-2xl p-1 shadow-lg shadow-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-white hover:bg-white/10 active:scale-90 transition-all"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span className="w-8 text-center text-[13px] font-black text-white">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-white hover:bg-white/10 active:scale-90 transition-all"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bill Summary */}
        <section className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <ReceiptText size={20} className="text-gray-400" />
             <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Bill Breakdown</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold text-sm">Item Total</span>
              <span className="font-black text-gray-900">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold text-sm">Handling Fee</span>
              <span className="text-emerald-500 font-black text-[11px] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">FREE</span>
            </div>
            <div className="h-px bg-gray-200/50" />
            <div className="flex justify-between items-center pt-2">
              <span className="font-black text-gray-900 text-lg">Amount to Pay</span>
              <span className="text-2xl font-black text-primary tracking-tighter">{formatPrice(total)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Button */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-50 p-5 z-50">
         <button 
           onClick={() => router.push('/checkout')}
           className="w-full bg-gray-900 text-white rounded-[24px] p-5 flex items-center justify-between shadow-2xl shadow-gray-300 active:scale-[0.98] transition-all group"
         >
            <div className="flex flex-col items-start leading-none gap-1 pl-2">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Ready to Ship</span>
               <span className="text-[17px] font-black tracking-tight uppercase">Checkout Now</span>
            </div>
            <div className="flex items-center gap-4">
               <span className="font-black text-xl">{formatPrice(total)}</span>
               <div className="bg-white/10 p-2.5 rounded-xl group-hover:translate-x-1 transition-transform">
                 <ArrowRight size={20} strokeWidth={2.5} />
               </div>
            </div>
         </button>
      </div>
    </div>
  );
}
