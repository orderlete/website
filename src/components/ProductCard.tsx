'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Star, ShoppingBag } from 'lucide-react';
import { useCartStore, Product } from '@/store/useCartStore';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, removeItem, items } = useCartStore();
  const quantity = items.find((item) => item.id === product.id)?.quantity || 0;
  const isMedical = product.category === 'medical';

  return (
    <div className={cn(
      "group relative bg-white rounded-[28px] border border-gray-100 p-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden"
    )}>
      {/* Image Wrapper */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-white border border-gray-50">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1550258276-85750239c096?w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550258276-85750239c096?w=800&q=80';
            }}
          />
            {/* Sponsored Badge - Top Left */}
            {product.is_ad && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <div className="bg-gray-900/95 backdrop-blur-md text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xl border border-white/10">
                   <Star size={8} fill="#f59e0b" className="text-amber-500" />
                   <span className="text-[7.5px] font-black uppercase tracking-[0.15em]">Promoted</span>
                </div>
              </div>
            )}

            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
              {Number(product.discount_percent || 0) > 10 ? (
                <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-[9px] font-black uppercase tracking-wider">-{product.discount_percent}%</span>
                </div>
              ) : null}
              {Number(product.rating || 0) > 0 ? (
                <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-black/5">
                  <Star size={10} fill="#f59e0b" className="text-amber-500" strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-gray-900">{Number(product.rating).toFixed(1)}</span>
                </div>
              ) : null}
            </div>
          
          {/* Quick Add Overlay on Hover */}
          {product.stock > 0 ? (
            <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out">
               <div className="bg-black/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl flex items-center justify-between">
                  <span className="text-[9px] font-black text-white ml-2 uppercase tracking-tight">Quick Add</span>
                  <button onClick={(e) => { e.preventDefault(); addItem(product); toast.success('Added!'); }} className="p-2 bg-white text-gray-900 rounded-xl active:scale-75 transition-all">
                     <Plus size={14} strokeWidth={3} />
                  </button>
               </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
               <div className="bg-gray-900/90 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-xl">Out of Stock</div>
            </div>
          )}
        </div>
      </Link>

      <div className={cn("p-2 pt-3 space-y-2 transition-opacity", product.stock === 0 && "opacity-50 pointer-events-none")}>
        <div className="space-y-0.5 min-h-[40px]">
          <h3 className="text-[13px] font-bold text-gray-900 leading-tight tracking-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
            {product.category}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
               <span className="text-[15px] font-black text-gray-900 tracking-tight">{formatPrice(product.price)}</span>
               {product.original_price && product.original_price > product.price && (
                 <span className="text-[10px] font-bold text-gray-400 line-through opacity-70 decoration-red-400/50">
                    {formatPrice(product.original_price)}
                 </span>
               )}
            </div>
          </div>
          
          <div className="flex items-center">
            {product.stock > 0 ? (
               <AnimatePresence mode="wait">
                 {quantity === 0 ? (
                   <motion.button
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     onClick={() => { addItem(product); toast.success('Added to tray'); }}
                     className="w-9 h-9 bg-gray-900 text-white rounded-xl shadow-lg active:scale-90 transition-all flex items-center justify-center"
                   >
                     <Plus size={16} strokeWidth={3} />
                   </motion.button>
                 ) : (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-1 py-1 border border-gray-100"
                   >
                     <button
                       onClick={() => removeItem(product.id)}
                       className="p-1 px-1.5 text-gray-400 hover:text-red-500 transition-colors"
                     >
                       <Minus size={14} strokeWidth={4} />
                     </button>
                     <span className="text-xs font-black text-gray-900 min-w-[14px] text-center">
                       {quantity}
                     </span>
                     <button
                       onClick={() => addItem(product)}
                       className="p-1 px-1.5 text-primary active:scale-125 transition-transform"
                     >
                       <Plus size={14} strokeWidth={4} />
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
