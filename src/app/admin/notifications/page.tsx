'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Megaphone, 
  Send, 
  Trash2, 
  Clock, 
  BadgePercent, 
  Info, 
  Loader2,
  Users,
  Search,
  CheckCircle2,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsAdmin() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [form, setForm] = useState({ 
    title: '', 
    message: '', 
    type: 'promo',
    user_id: null as string | null
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    const { data } = await supabase.from('notifications').select('*, profiles(name, phone)').order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('id, name, phone').limit(50);
    if (data) setUsers(data);
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.phone?.includes(userSearch)
  );

  async function handleSend() {
    if (!form.title || !form.message) {
      toast.error('Fill required fields');
      return;
    }
    setSending(true);
    try {
      const payload = { ...form, user_id: selectedUser?.id || null };
      const { error } = await supabase.from('notifications').insert(payload);
      if (error) throw error;
      toast.success(selectedUser ? `Alert pushed to ${selectedUser.name}` : 'Global broadcast active!');
      setForm({ title: '', message: '', type: 'promo', user_id: null });
      setSelectedUser(null);
      setUserSearch('');
      fetchNotifications();
    } catch (err) {
      toast.error('Push failed');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Removed');
    }
  }

  const inputClass = "w-full bg-gray-50 border border-transparent focus:border-gray-200 rounded-[20px] py-4 px-6 text-sm font-black text-gray-900 outline-none focus:bg-white transition-all";

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Intelligence Center</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Targeted Messaging & Alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
              {/* Audience Selector */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between pb-2">
                    <h2 className="text-lg font-black text-gray-900">Push Audience</h2>
                    <span className={cn(
                      "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                      selectedUser ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {selectedUser ? 'Selected User' : 'Global Broadcast'}
                    </span>
                 </div>
                 
                 {!selectedUser ? (
                    <div className="relative group">
                       <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         className={cn(inputClass, "pl-14")}
                         placeholder="Global by default. Search user to target..."
                         value={userSearch}
                         onChange={(e) => setUserSearch(e.target.value)}
                       />
                       {userSearch && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-20 max-h-[200px] overflow-y-auto no-scrollbar p-2">
                            {filteredUsers.map(u => (
                              <button key={u.id} onClick={() => setSelectedUser(u)} className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-colors">
                                 <div>
                                    <p className="text-sm font-black text-gray-900">{u.name}</p>
                                    <p className="text-[10px] text-gray-400 font-black">{u.phone}</p>
                                 </div>
                                 <Plus size={16} className="text-gray-200" />
                              </button>
                            ))}
                         </div>
                       )}
                    </div>
                 ) : (
                    <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-100 group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                             <Users size={18} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-blue-900">{selectedUser.name}</p>
                             <p className="text-[10px] font-black text-blue-800/60 uppercase tracking-widest">{selectedUser.phone}</p>
                          </div>
                       </div>
                       <button onClick={() => setSelectedUser(null)} className="p-2 text-blue-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 )}
              </div>

              {/* Composer */}
              <div className="space-y-5 pt-4 border-t border-gray-50">
                 <input className={inputClass} placeholder="Alert Subject" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                 <textarea className={cn(inputClass, "min-h-[120px] pt-4")} placeholder="Message payload..." value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
                 <div className="flex gap-3">
                    {['promo', 'alert', 'info'].map(t => (
                      <button key={t} onClick={() => setForm({...form, type: t as any})} className={cn("flex-1 py-3 px-2 rounded-2xl border text-[9px] font-black uppercase tracking-widest", form.type === t ? "bg-gray-900 text-white" : "bg-white border-gray-100 text-gray-400")}>{t}</button>
                    ))}
                 </div>
                 <button onClick={handleSend} disabled={sending} className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50">
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <><Megaphone size={18} /> PUSH NOW</>}
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[48px] border border-gray-100 p-10 space-y-8">
           <h2 className="text-xl font-black text-gray-900 uppercase">Alert Archive</h2>
           <div className="space-y-4">
              {loading ? <Loader2 className="animate-spin mx-auto opacity-10" /> : notifications.map(n => (
                <div key={n.id} className="p-6 bg-gray-50/50 border border-gray-50 rounded-[32px] flex items-start gap-5">
                   <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0", n.user_id ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600")}>
                      {n.user_id ? <Users size={20} /> : <Globe size={20} />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <h3 className="font-black text-gray-900 truncate pr-4">{n.title}</h3>
                         <button onClick={() => handleDelete(n.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <p className="text-[12px] text-gray-500 font-bold mb-2 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-3">
                         <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter", n.user_id ? "bg-blue-50 text-blue-400" : "bg-emerald-50 text-emerald-400")}>{n.user_id ? `Private -> ${n.profiles?.name}` : 'Broadcast'}</span>
                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
