'use client';

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Truck, Wallet, CheckCircle2, Phone, Shield, Zap, PartyPopper, Loader2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { storeStatus } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(!user?.address);
  const [addressFields, setAddressFields] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    landmark: user?.landmark || '',
    pincode: user?.pincode || '',
  });
  const router = useRouter();
  const total = getTotal();
  const deliveryFee = total < 300 ? 30 : 0;
  const finalTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (storeStatus === 'closed') {
      toast.error('Store is closed. Cannot place order.');
      return;
    }
    if (!addressFields.address || !addressFields.phone) {
      toast.error('Please provide delivery details');
      setIsEditingAddress(true);
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        toast.error('Please log in to place an order.');
        router.push('/auth');
        setLoading(false);
        return;
      }

      // Verify the user profile still exists in the DB (prevents stale session foreign key errors)
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!dbProfile) {
        toast.error('Session expired. Please log in again.');
        router.push('/auth');
        setLoading(false);
        return;
      }

      const payload = {
        user_id: dbProfile.id, 
        phone: addressFields.phone,
        total_amount: finalTotal,
        status: 'placed',
        address: `${addressFields.address}${addressFields.landmark ? ', ' + addressFields.landmark : ''}`,
        pincode: addressFields.pincode,
        customer_name: addressFields.name
      };

      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setSuccess(true);
      clearCart();
      toast.success('Order placed successfully!', { icon: '🎉' });
    } catch (err: any) {
      console.error("Order Placement Error:", err);
      toast.error(`Order failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-8 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-emerald-50 rounded-[40px] flex items-center justify-center"
        >
          <CheckCircle2 size={56} className="text-emerald-500" strokeWidth={2.5} />
        </motion.div>
        
        <div className="space-y-2">
           <h1 className="text-3xl font-black text-foreground">ORDER CONFIRMED</h1>
           <p className="text-muted font-bold text-sm px-4">Your order has been successfully placed.</p>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="bg-foreground text-white px-10 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl"
        >
          CONTINUE SHOPPING
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-4">
        <ShoppingBag size={48} className="text-gray-200" />
        <h1 className="text-xl font-black text-foreground">Your cart is empty</h1>
        <button onClick={() => router.push('/')} className="text-primary font-bold">Go back to shop</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="px-5 py-6 flex items-center gap-4 border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 border border-gray-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Checkout</h1>
      </header>

      <main className="p-5 space-y-8">
        {/* Address Card */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest">Delivery Address</h2>
              <button onClick={() => setIsEditingAddress(!isEditingAddress)} className="text-[11px] font-black text-primary border-b border-primary/20 pb-0.5">
                 {isEditingAddress ? 'SAVE' : 'CHANGE'}
              </button>
           </div>
           
           <div className="bg-orange-50/50 border border-orange-100 rounded-[32px] p-6 space-y-4">
              <div className="flex gap-4">
                 <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                    <MapPin size={20} />
                 </div>
                 <div className="flex-1 space-y-3">
                    {isEditingAddress ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Name" 
                          value={addressFields.name}
                          onChange={(e) => setAddressFields({...addressFields, name: e.target.value})}
                          className="w-full bg-white border border-orange-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input 
                          type="text" 
                          placeholder="Address" 
                          value={addressFields.address}
                          onChange={(e) => setAddressFields({...addressFields, address: e.target.value})}
                          className="w-full bg-white border border-orange-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-black text-foreground text-[15px]">{addressFields.name || 'Anonymous'}</p>
                        <p className="text-[12px] text-gray-500 font-bold leading-relaxed">{addressFields.address || 'Click change to add address'}</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </section>

        {/* Payment Summary */}
        <section className="space-y-4">
           <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest">Payment Summary</h2>
           <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-500">Bill Total</span>
                  <span className="text-gray-900">{formatPrice(total)}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-500">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-500">FREE</span>
                  ) : (
                    <span className="text-gray-900">{formatPrice(deliveryFee)}</span>
                  )}
               </div>
               <div className="h-px bg-gray-200" />
               <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-black">To Pay</span>
                  <span className="text-xl font-black text-gray-900">{formatPrice(finalTotal)}</span>
               </div>
           </div>
        </section>

        {/* Safe Checkout Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-400">
           <Shield size={14} />
           <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout Enabled</span>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-5 z-50">
         <button 
           onClick={handlePlaceOrder}
           disabled={loading}
           className="w-full bg-foreground text-white py-4.5 rounded-2xl font-black tracking-tight shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
         >
           {loading ? <Loader2 className="animate-spin" size={20} /> : 'PLACE ORDER'}
         </button>
      </div>
    </div>
  );
}
