'use client';

import React, { useState } from 'react';
import { Star, X, Loader2, Package, Truck, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ order, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [productRating, setProductRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      // For each item in the order, we save a review
      // In a real app, we might have one review per order, but here we'll save it for the first product or as order-wide
      // Let's assume order-wide for simplicity, linked to the first product if available
      
      const { data: items } = await supabase.from('order_items').select('product_id').eq('order_id', order.id);
      const product_id = items?.[0]?.product_id;

      const { error } = await supabase.from('reviews').insert({
        order_id: order.id,
        product_id: product_id || null,
        product_rating: productRating,
        delivery_rating: deliveryRating,
        comment: comment,
        user_id: order.user_id
      });

      if (error) throw error;

      toast.success('Thank you for your feedback! 🎉');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Could not submit review');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 space-y-8 overflow-hidden"
      >
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Rate Your Experience</h2>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Order #{(order.id.slice(0, 8)).toUpperCase()}</p>
           </div>
           <button onClick={onClose} className="p-2 bg-gray-50 rounded-2xl text-gray-400"><X size={20} /></button>
        </div>

        <div className="space-y-10">
           {/* Product Rating */}
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-orange-50 text-primary rounded-xl">
                    <Package size={18} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Product Quality</h3>
              </div>
              <div className="flex items-center justify-between px-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                    key={star} 
                    onClick={() => setProductRating(star)}
                    className="transition-transform active:scale-90"
                   >
                     <Star 
                      size={40} 
                      strokeWidth={2.5} 
                      className={cn(star <= productRating ? "text-secondary fill-secondary" : "text-gray-100")} 
                     />
                   </button>
                 ))}
              </div>
           </div>

           {/* Delivery Rating */}
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Truck size={18} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Delivery Partner</h3>
              </div>
              <div className="flex items-center justify-between px-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                    key={star} 
                    onClick={() => setDeliveryRating(star)}
                    className="transition-transform active:scale-90"
                   >
                     <Star 
                      size={40} 
                      strokeWidth={2.5} 
                      className={cn(star <= deliveryRating ? "text-blue-500 fill-blue-500" : "text-gray-100")} 
                     />
                   </button>
                 ))}
              </div>
           </div>

           {/* Comment */}
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl">
                    <MessageSquare size={18} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Any Comments?</h3>
              </div>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)"
                className="w-full bg-gray-50 rounded-3xl p-6 text-sm font-bold min-h-[120px] outline-none focus:ring-4 focus:ring-gray-900/5 transition-all text-gray-900 resize-none"
              />
           </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'SUBMIT FEEDBACK'}
        </button>
      </motion.div>
    </div>
  );
}
