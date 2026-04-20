'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Bell, 
  X, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Info,
  BadgePercent,
  Megaphone
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'alert' | 'info';
  user_id?: string;
  created_at: string;
}

export default function Header({ searchQuery, setSearchQuery, placeholder = "Search snacks, drinks..." }: any) {
  const { user } = useAuthStore();
  const { storeStatus } = useSettingsStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const fetchSuggestions = async () => {
        // Fetch products that match the name
        const { data } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${searchQuery}%`)
          .limit(5);
        if (data) setSuggestions(data);
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchNotifications();
    // Real-time subscription for notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload.new as Notification;
        // Only show if it matches current user OR is public (null user_id)
        if (!newNotif.user_id || newNotif.user_id === user?.id) {
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (data) setNotifications(data);
  }

  return (
    <div className="sticky top-0 z-50 bg-white">
      {/* Top Banner - Mini */}
      {storeStatus === 'closed' ? (
        <div className="bg-red-500 text-white px-5 py-2.5 flex items-center justify-center overflow-hidden relative">
           <span className="text-[11px] font-black uppercase tracking-[0.2em]">Store is currently closed.</span>
        </div>
      ) : (
        <div className="bg-gray-900 text-white px-5 py-2.5 flex items-center justify-between overflow-hidden relative">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Live Tracking Enabled</span>
           </div>
           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Express Delivery</span>
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
        </div>
      )}

      <header className="px-5 py-5 border-b border-gray-50 flex flex-col gap-5 bg-white/95 backdrop-blur-xl">
        <div className="flex items-center justify-between">
           {/* Location Picker */}
           <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                 <MapPin size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col -gap-1">
                 <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivering To</span>
                    <ChevronDown size={14} className="text-gray-300" strokeWidth={3} />
                 </div>
                 <span className="text-[15px] font-black text-gray-900 tracking-tight truncate max-w-[140px]">
                    {user?.address?.split(',')[0] || 'Home: Select Address'}
                 </span>
              </div>
           </div>

           {/* Notification Bell */}
           <button 
             onClick={() => { setIsNotificationsOpen(true); setUnreadCount(0); }}
             className="relative w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 transition-all active:scale-90 border border-gray-100"
           >
              <Bell size={20} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                   {unreadCount}
                </span>
              )}
           </button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" strokeWidth={2.5} />
           <input 
             type="text" 
             placeholder={placeholder}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             onFocus={() => setIsSearchFocused(true)}
             onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
             className="w-full bg-surface border border-transparent focus:bg-white focus:border-gray-200 rounded-[22px] py-4.5 pl-14 pr-6 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-900 text-white rounded-xl shadow-lg opacity-0 group-focus-within:opacity-100 transition-all translate-x-4 group-focus-within:translate-x-0">
              <ArrowRight size={14} strokeWidth={3} />
           </div>

           {/* Autocomplete Suggestions */}
           <AnimatePresence>
             {isSearchFocused && searchQuery.length > 1 && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden z-[60] p-2"
               >
                 <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                   {suggestions.length > 0 ? (
                     suggestions.map((item: any) => (
                       <button
                         key={item.id}
                         onClick={() => { setSearchQuery(item.name); setIsSearchFocused(false); }}
                         className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all text-left group"
                       >
                         <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 leading-none">{item.name}</p>
                            {item.category && (
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-50">
                                {Array.isArray(item.category) ? item.category[0] : item.category}
                              </p>
                            )}
                         </div>
                         <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                       </button>
                     ))
                   ) : (
                     <div className="p-10 text-center space-y-2 opacity-30">
                        <Search size={32} className="mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No matching products</p>
                     </div>
                   )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </header>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-[340px] bg-white h-full shadow-2xl flex flex-col"
            >
               <div className="p-8 pb-6 flex items-center justify-between border-b border-gray-50">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-black tracking-tight">Inbox</h2>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Latest Updates</p>
                  </div>
                  <button onClick={() => setIsNotificationsOpen(false)} className="p-2.5 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 active:scale-90 transition-all">
                     <X size={20} strokeWidth={2.5} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                       <Megaphone size={64} strokeWidth={1.5} />
                       <p className="text-[11px] font-black uppercase tracking-widest">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={notif.id} 
                        className="bg-gray-50/50 border border-gray-50 p-5 rounded-[28px] space-y-3 group hover:border-gray-200 transition-all"
                      >
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              notif.type === 'promo' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                            )}>
                               {notif.type === 'promo' ? <BadgePercent size={20} strokeWidth={2.5} /> : <Info size={20} strokeWidth={2.5} />}
                            </div>
                            <h3 className="text-sm font-black text-gray-900 tracking-tight">{notif.title}</h3>
                         </div>
                         <p className="text-[12px] text-gray-500 font-bold leading-relaxed">{notif.message}</p>
                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block pt-2">
                           {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </motion.div>
                    ))
                  )}
               </div>
               
               <div className="p-8 border-t border-gray-50 opacity-20">
                  <p className="text-[10px] text-gray-400 font-bold text-center">End of notifications</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
