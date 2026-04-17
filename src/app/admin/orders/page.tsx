'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  User, 
  MapPin, 
  Loader2, 
  ArrowRight,
  X,
  Phone
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { updateOrderStatusAdmin } from '../actions';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        toast.success('🔔 New Order received!', { duration: 5000 });
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    try {
      toast.loading(`Processing...`, { id: `loading-${id}` });
      const result = await updateOrderStatusAdmin(id, status);
      
      toast.dismiss(`loading-${id}`);
      
      if (!result.success) {
        toast.error('Action Failed: ' + result.error);
        return;
      }
      
      toast.success(`Order ${status}`);
      const updated = orders.map(o => o.id === id ? { ...o, status } : o);
      setOrders(updated);
      setSelectedOrder(updated.find(o => o.id === id));
    } catch (err: any) {
      toast.dismiss(`loading-${id}`);
      toast.error('Network Error: Make sure your server is online.');
    }
  }

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'placed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'confirmed': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const OrderDetails = ({ order }: { order: any }) => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-black text-gray-900 tracking-tight">Order Details</h2>
         <button onClick={() => setSelectedOrder(null)} className="lg:hidden p-2 text-gray-400">
            <X size={24} />
         </button>
      </div>

      <div className="space-y-6">
         <div className="space-y-4">
            <div className="flex gap-4">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                  <User size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Identity</p>
                  <p className="text-sm font-bold text-gray-800">{order.customer_name || 'Guest User'}</p>
                  <p className="text-[11px] font-black text-gray-500">{order.phone || 'No Contact'}</p>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                  <MapPin size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Route</p>
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">{order.address}</p>
                  {order.pincode && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-[9px] font-black rounded-lg">Pincode: {order.pincode}</span>
                  )}
               </div>
            </div>
         </div>

         <div className="h-px bg-gray-100" />

         <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Manifest ({order.order_items?.length})</p>
            <div className="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar">
               {order.order_items?.map((item: any) => (
                 <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-gray-900">{item.products?.name || 'Product'}</span>
                       <span className="text-[10px] text-gray-400 font-bold">{item.quantity} × {formatPrice(item.price)}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="h-px bg-gray-100" />

         <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fulfillment Control</p>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => updateStatus(order.id, 'confirmed')} className="bg-orange-50 text-orange-600 text-[10px] font-black p-4 rounded-xl border border-orange-100 active:scale-95 transition-all">CONFIRM</button>
               <button onClick={() => updateStatus(order.id, 'shipped')} className="bg-purple-50 text-purple-600 text-[10px] font-black p-4 rounded-xl border border-purple-100 active:scale-95 transition-all">SHIP</button>
               <button onClick={() => updateStatus(order.id, 'delivered')} className="bg-emerald-600 text-white text-[10px] font-black p-4 rounded-xl shadow-lg shadow-emerald-100 col-span-2 active:scale-95 transition-all">MARK DELIVERED</button>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Order Stream</h1>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">Real-time Fulfillment Manifest</p>
        </div>
        <button onClick={fetchOrders} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all active:scale-90">
          <Clock size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-100" size={48} /></div>
           ) : orders.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-20"><ShoppingBag size={64} /><p className="font-black uppercase tracking-widest mt-4">Safe & Quiet</p></div>
           ) : (
             <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    layoutId={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "bg-white p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden",
                      selectedOrder?.id === order.id ? "border-gray-900 ring-4 ring-gray-900/5 shadow-2xl" : "border-gray-50 hover:border-gray-200 shadow-sm"
                    )}
                  >
                     <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 font-black text-xs">
                              #{order.id.slice(0, 4).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-lg font-black text-gray-900">{formatPrice(order.total_amount)}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={cn("text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border", getStatusStyle(order.status))}>
                              {order.status}
                           </span>
                           <ArrowRight size={16} className="text-gray-200" />
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
           )}
        </div>

        {/* Sidebar for Desktop / Drawer for Mobile */}
        <div className="hidden lg:block">
           {selectedOrder ? (
              <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl sticky top-8">
                 <OrderDetails order={selectedOrder} />
              </div>
           ) : (
              <div className="h-[400px] border-2 border-dashed border-gray-100 rounded-[48px] flex flex-col items-center justify-center text-center p-10 opacity-30">
                 <Package size={64} className="mb-4" />
                 <p className="text-sm font-black uppercase tracking-widest">Select manifest</p>
              </div>
           )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
         {selectedOrder && (
           <div className="fixed inset-0 z-[100] lg:hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                 <OrderDetails order={selectedOrder} />
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
