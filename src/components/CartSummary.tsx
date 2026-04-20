'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSummary() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = getTotal();

  const hideOnPaths = ['/cart', '/checkout', '/auth', '/admin', '/product/'];
  const shouldHide = !pathname || hideOnPaths.some(p => pathname.startsWith(p)) || itemCount === 0;

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-[88px] inset-x-0 z-40 px-5 pointer-events-none">
       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         exit={{ y: 20, opacity: 0 }}
         className="pointer-events-auto"
       >
         <button 
           onClick={() => router.push('/cart')}
           className="w-full bg-emerald-600 text-white p-4 rounded-[24px] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all border border-white/20"
         >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
               </div>
               <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                     {itemCount} {itemCount === 1 ? 'Item' : 'Items'} added
                  </span>
                  <span className="text-[16px] font-black">{formatPrice(total)}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-2 font-black text-[12px] uppercase tracking-widest pl-4 border-l border-white/20">
               View Cart
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
         </button>
       </motion.div>
    </div>
  );
}
