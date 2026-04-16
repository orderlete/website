'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Globe, 
  Loader2, 
  Navigation,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ZonesAdmin() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ pincode: '', area_name: '' });

  useEffect(() => {
    fetchZones();
  }, []);

  async function fetchZones() {
    setLoading(true);
    const { data } = await supabase.from('serviceable_zones').select('*').order('created_at', { ascending: false });
    if (data) setZones(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!form.pincode || !form.area_name) {
      toast.error('Please enter both pincode and area name');
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from('serviceable_zones').insert(form);
      if (error) throw error;
      toast.success(`${form.area_name} is now live!`);
      setForm({ pincode: '', area_name: '' });
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add zone');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(pincode: string) {
    const { error } = await supabase.from('serviceable_zones').delete().eq('pincode', pincode);
    if (!error) {
      setZones(prev => prev.filter(z => z.pincode !== pincode));
      toast.success('Zone removed');
    }
  }

  const inputClass = "w-full bg-gray-50 border border-transparent focus:border-gray-200 rounded-[20px] py-4 px-6 text-sm font-black text-gray-900 outline-none focus:bg-white transition-all";

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Geofence Manager</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Control Serviceable Areas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Add Zone */}
        <div className="lg:col-span-2">
           <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 sticky top-32">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                    <Navigation size={22} strokeWidth={2.5} />
                 </div>
                 <h2 className="text-xl font-black text-gray-900 tracking-tight">Expand Coverage</h2>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Pincode</label>
                    <input 
                      className={inputClass}
                      placeholder="e.g. 110001"
                      value={form.pincode}
                      onChange={(e) => setForm({...form, pincode: e.target.value.replace(/\D/g, '')})}
                      maxLength={6}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Internal Area Name</label>
                    <input 
                      className={inputClass}
                      placeholder="e.g. Downtown Central"
                      value={form.area_name}
                      onChange={(e) => setForm({...form, area_name: e.target.value})}
                    />
                 </div>

                 <button 
                   onClick={handleAdd}
                   disabled={adding}
                   className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                 >
                    {adding ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <Plus size={18} strokeWidth={3} />
                        Activate Zone
                      </>
                    )}
                 </button>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50 flex items-start gap-4">
                 <ShieldCheck size={20} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                 <p className="text-[10px] text-blue-800/60 font-bold leading-relaxed">
                   Once activated, users within this pincode will be able to successfully verify their location and proceed to checkout.
                 </p>
              </div>
           </div>
        </div>

        {/* Zones List */}
        <div className="lg:col-span-3 bg-white rounded-[48px] border border-gray-100 p-10 space-y-8 h-fit">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Live Zones</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                 <Globe size={12} className="animate-pulse" />
                 {zones.length} Active regions
              </div>
           </div>

           <div className="space-y-4">
              {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-100" size={40} /></div>
              ) : zones.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-10 gap-4">
                   <MapPin size={64} />
                   <p className="font-black uppercase tracking-widest">No Active Zones</p>
                </div>
              ) : (
                zones.map((zone) => (
                  <div key={zone.pincode} className="group bg-gray-50/30 border border-gray-50 p-6 rounded-[32px] hover:border-gray-200 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white border border-gray-100 rounded-[20px] flex items-center justify-center text-gray-900 shadow-sm transition-transform group-hover:scale-105">
                           <MapPin size={24} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-0.5">
                           <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">{zone.pincode}</h3>
                           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{zone.area_name}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                           <Activity size={10} />
                           Live
                        </div>
                        <button 
                          onClick={() => handleDelete(zone.pincode)}
                          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
