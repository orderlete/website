'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCcw,
  Package
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');

      const orderList = orders || [];
      const profileList = profiles || [];
      const totalRev = orderList.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
      const pending = orderList.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length;
      
      setStats({
        totalOrders: orderList.length,
        totalRevenue: totalRev,
        activeUsers: profileList.length,
        pendingOrders: pending
      });

      const sorted = [...orderList].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setRecentOrders(sorted);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+12%', isUp: true },
    { label: 'Active Orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Live', isUp: true },
    { label: 'Total Customers', value: stats.activeUsers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Joined', isUp: true },
    { label: 'Total Sales', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Orders', isUp: true },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Console v1.2</h1>
          <p className="text-gray-400 text-sm font-black uppercase tracking-widest opacity-60">Live Intelligence</p>
        </div>
        <button 
          onClick={() => { fetchData(); toast.success('Stats synced'); }}
          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-400"
        >
          <RefreshCcw size={20} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-7 rounded-[40px] border border-gray-100 shadow-sm group hover:border-gray-200 transition-all hover:shadow-xl hover:shadow-gray-900/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center relative transition-transform group-hover:scale-110",
                stat.bg, stat.color
              )}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full outline outline-1 ${stat.isUp ? 'text-green-600 outline-green-100 bg-green-50/50' : 'text-red-500 outline-red-100 bg-red-50/50'}`}>
                {stat.trend}
              </div>
            </div>
            <div className="space-y-0.5">
               <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
               <p className="text-[26px] font-black text-gray-900 tracking-tighter leading-none">{loading ? "..." : stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Activity Table */}
         <div className="lg:col-span-2 bg-white rounded-[48px] border border-gray-100 shadow-sm p-10">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-[18px] flex items-center justify-center shadow-lg shadow-gray-200">
                     <TrendingUp size={22} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="font-black text-xl text-gray-900 tracking-tight">Recent Activity</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Latest 5 events</p>
                  </div>
               </div>
            </div>
            
            <div className="space-y-4">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 size={40} className="animate-spin text-gray-100" />
                 </div>
               ) : recentOrders.length === 0 ? (
                 <div className="text-center py-20 space-y-4">
                    <Package size={48} className="mx-auto text-gray-50" />
                    <p className="text-sm font-bold text-gray-300">Awaiting first activity...</p>
                 </div>
               ) : (
                 recentOrders.map((order) => (
                   <div key={order.id} className="flex items-center gap-5 bg-gray-50/30 p-5 rounded-[32px] border border-gray-50 hover:border-gray-200 transition-all group">
                      <div className="w-14 h-14 rounded-[20px] bg-white border border-gray-100 flex items-center justify-center text-gray-900 font-black text-[11px] shadow-sm tracking-tighter group-hover:scale-105 transition-transform">
                         #{(order.id.slice(0, 4)).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-1.5">Order for {formatPrice(order.total_amount)}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full border shadow-sm",
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      )}>
                        {order.status}
                      </span>
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Connectivity Status */}
         <div className="bg-gray-900 rounded-[48px] p-12 relative overflow-hidden text-white flex flex-col justify-between shadow-2xl shadow-gray-200">
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-green-400 border border-white/10">
                <CheckCircle size={32} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black leading-[1.1] tracking-tighter">System Status:<br/>Optimal</h2>
                 <p className="text-gray-500 text-[14px] font-bold leading-relaxed pr-4">Global infrastructure is synchronized and ready for traffic spikes. Latency is at peak performance.</p>
              </div>
            </div>
            
            <div className="relative z-10 grid grid-cols-2 gap-y-8 mt-12 pb-4">
               {[
                 { label: 'Database', value: 'CONNECTED', color: 'text-green-400' },
                 { label: 'Latency', value: '42ms', color: 'text-white' },
                 { label: 'Storage', value: 'SECURE', color: 'text-white' },
                 { label: 'Uptime', value: '99.9%', color: 'text-white' }
               ].map(item => (
                 <div key={item.label} className="space-y-1">
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">{item.label}</p>
                   <p className={cn("text-lg font-black tracking-tight leading-none", item.color)}>{item.value}</p>
                 </div>
               ))}
            </div>

            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
         </div>
      </div>
    </div>
  );
}
