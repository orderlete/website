'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Package, 
  Clock, 
  CheckCircle2, 
  Star,
  Loader2,
  Heart,
  Settings as SettingsIcon,
  Trash2,
  Lock,
  Save,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Info,
  X,
  Hash
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewModal from '@/components/ReviewModal';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // States for account editing
  const [editName, setEditName] = useState(user?.name || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editPincode, setEditPincode] = useState(user?.pincode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchOrders();
    setEditName(user.name);
    setEditAddress(user.address);
    setEditPincode(user.pincode || '');
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('phone', user?.phone)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          name: editName, 
          address: editAddress,
          pincode: editPincode 
        })
        .eq('id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      setUser(data);
      toast.success('Identity Updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 4) {
      toast.error('Password too short (min 4 chars)');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password: newPassword })
        .eq('id', user?.id);
      
      if (error) throw error;
      toast.success('Security password updated');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: THIS IS PERMANENT. Are you sure you want to delete your entire account and order history?')) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);
      
      if (error) throw error;
      
      handleLogout();
      toast.success('Account permanently erased');
    } catch (err) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('auth-storage');
    setUser(null);
    router.push('/auth');
    toast.success('Session End');
  };

  const inputClass = "w-full bg-gray-50 border border-transparent focus:border-gray-100 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 outline-none focus:bg-white transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header Profile Section */}
      <div className="bg-gray-900 pt-16 pb-24 px-8 rounded-b-[60px] relative overflow-hidden">
         <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center border border-white/10 backdrop-blur-md relative">
               <User size={48} className="text-white" />
               <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
               </div>
            </div>
            <div className="text-center space-y-1">
               <h1 className="text-2xl font-black text-white tracking-tight">{user?.name || 'Golden Guest'}</h1>
               <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{user?.phone || 'Account Verified'}</p>
            </div>
         </div>
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20" />
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
      </div>

      <main className="px-5 -mt-10 relative z-10 space-y-8 max-w-lg mx-auto">
         {/* Segmented Control */}
         <div className="bg-white p-2 rounded-[28px] shadow-2xl shadow-gray-200 border border-gray-100 flex gap-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'orders' ? "bg-gray-900 text-white shadow-xl" : "text-gray-400 hover:bg-gray-50"
              )}
            >
               <Package size={14} /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'profile' ? "bg-gray-900 text-white shadow-xl" : "text-gray-400 hover:bg-gray-50"
              )}
            >
               <SettingsIcon size={14} /> Account Info
            </button>
         </div>

         <AnimatePresence mode="wait">
           {activeTab === 'orders' ? (
             <motion.div 
               key="orders-tab"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-6"
             >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                     <Loader2 size={40} className="animate-spin" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Fetching history</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                     <ShoppingBag size={48} className="mx-auto text-gray-100" />
                     <p className="text-sm font-bold text-gray-300">No orders yet!</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 space-y-6">
                       <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                          <div className="space-y-1">
                             <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Order #{(order.id.slice(0, 8)).toUpperCase()}</p>
                             <p className="text-xs font-black text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={cn(
                             "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                             order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                             {order.status}
                          </span>
                       </div>
                       <div className="space-y-3">
                          {order.order_items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                  <img src={item.products?.image_url} className="w-full h-full object-cover" alt="" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-gray-900 truncate tracking-tight">{item.products?.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">QTY: {item.quantity}</p>
                               </div>
                               <span className="text-sm font-black text-gray-900">{formatPrice(item.price)}</span>
                            </div>
                          ))}
                       </div>
                       <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <h4 className="text-lg font-black text-gray-900">{formatPrice(order.total_amount)}</h4>
                          {order.status === 'delivered' && (
                            <button 
                              onClick={() => { setSelectedOrder(order); setIsReviewOpen(true); }}
                              className="px-6 py-3 bg-gray-900 text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-gray-200"
                            >
                               <Star size={14} fill="currentColor" className="text-secondary" />
                               Rate Order
                            </button>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </motion.div>
           ) : (
             <motion.div 
               key="profile-tab"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-8"
             >
                {/* Identity Form */}
                <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center">
                         <MapPin size={18} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900">Personal Data</h3>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Display Name</label>
                         <input 
                           className={inputClass}
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Current Pincode</label>
                         <input 
                           className={inputClass}
                           value={editPincode}
                           onChange={(e) => setEditPincode(e.target.value)}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Delivery Address</label>
                         <textarea 
                           className={cn(inputClass, "min-h-[100px] py-4 resize-none")}
                           value={editAddress}
                           onChange={(e) => setEditAddress(e.target.value)}
                         />
                      </div>
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="w-full bg-gray-900 text-white py-4.5 rounded-[22px] font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
                      </button>
                   </div>
                </div>

                {/* Password Form */}
                <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-6">
                   <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl flex items-center justify-center">
                         <Lock size={18} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900">Security Key</h3>
                   </div>
                   
                   <div className="space-y-4">
                      <input 
                        type="password"
                        placeholder="New Password"
                        className={inputClass}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <input 
                        type="password"
                        placeholder="Confirm New Password"
                        className={inputClass}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button 
                        onClick={handleChangePassword}
                        disabled={isUpdating}
                        className="w-full bg-gray-50 text-gray-900 py-4.5 rounded-[22px] font-black text-[11px] uppercase tracking-widest border border-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         Update Password
                      </button>
                   </div>
                </div>

                <div className="space-y-3">
                   {[
                      { icon: ShieldCheck, label: 'Privacy Policy', sub: 'How we protect your data', action: () => router.push('/pages/privacy') },
                      { icon: FileText, label: 'Terms of Use', sub: 'Rules of the platform', action: () => router.push('/pages/terms') },
                      { icon: Info, label: 'Support Center', sub: 'Need help? Contact us', action: () => router.push('/pages/contact') },
                   ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={item.action}
                        className="w-full bg-white p-5 rounded-[28px] border border-gray-50 flex items-center justify-between group active:scale-95 transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                               <item.icon size={18} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                               <p className="text-sm font-black text-gray-900 tracking-tight">{item.label}</p>
                               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.sub}</p>
                            </div>
                         </div>
                         <ChevronRight size={16} className="text-gray-200" />
                      </button>
                   ))}
                </div>

                {/* Account Actions */}
                <div className="space-y-3">
                   <button 
                     onClick={handleLogout}
                     className="w-full bg-white py-5 rounded-[28px] border border-gray-100 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-600 active:scale-95 transition-all"
                   >
                      <LogOut size={16} strokeWidth={3} /> Logout Session
                   </button>
                   <button 
                     onClick={handleDeleteAccount}
                     disabled={isDeleting}
                     className="w-full bg-red-50 py-5 rounded-[28px] border border-red-100 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-red-500 active:scale-95 transition-all"
                   >
                      {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} strokeWidth={3} /> Erase Account Forever</>}
                   </button>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </main>

      {/* Review Modal */}
      {selectedOrder && (
        <ReviewModal 
          order={selectedOrder} 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
