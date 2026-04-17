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

  return (
    <div className="group relative bg-white rounded-[32px] border border-gray-100/50 p-2.5 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-100 overflow-hidden">
      {/* Image Wrapper */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[1/1] w-full overflow-hidden rounded-[24px] bg-gray-50">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
           <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.review_count && product.review_count > 0 ? (
              <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-black/5">
                <Star size={10} fill="#f59e0b" className="text-secondary" strokeWidth={3} />
                <span className="text-[10px] font-black text-gray-900">{product.rating?.toFixed(1) || '0.0'}</span>
              </div>
            ) : (
              <div className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center shadow-lg border border-white/20">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Fresh Arrival</span>
              </div>
            )}
           </div>
          
          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-900 ml-2 uppercase tracking-widest">Quick Add</span>
                <div onClick={(e) => { e.preventDefault(); addItem(product); toast.success('Added!'); }} className="p-2 bg-gray-900 text-white rounded-xl active:scale-90 transition-all">
                   <Plus size={16} strokeWidth={3} />
                </div>
             </div>
          </div>
        </div>
      </Link>

      <div className="p-3 space-y-3">
        <div className="space-y-0.5 min-h-[44px]">
          <h3 className="text-[14px] font-black text-gray-900 leading-[1.3] tracking-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
            {product.category}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[16px] font-black text-gray-900">{formatPrice(product.price)}</span>
          
          <div className="flex items-center bg-gray-50 rounded-2xl p-0.5 border border-gray-100/50">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { addItem(product); toast.success('Added to tray'); }}
                  className="p-2 bg-gray-900 text-white rounded-[14px] shadow-lg shadow-gray-200 active:scale-90 transition-transform"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  className="flex items-center gap-3 px-1"
                >
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>
                  <span className="text-[13px] font-black text-gray-900 min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(product)}
                    className="p-1.5 text-primary active:scale-125 transition-transform"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
