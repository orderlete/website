'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Phone, 
  Plus, 
  Trash2, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Clock, 
  Loader2,
  CheckCircle2,
  PhoneCall,
  Lock
} from 'lucide-react';
import { cn, hashPassword } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsAdmin() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNumber, setNewNumber] = useState({ phone: '', label: '' });

  useEffect(() => {
    fetchNumbers();
  }, []);

  async function fetchNumbers() {
    setLoading(true);
    const { data } = await supabase.from('contact_numbers').select('*').order('created_at');
    if (data) setNumbers(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newNumber.phone || !newNumber.label) {
      toast.error('Fill phone and label');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('contact_numbers').insert(newNumber);
      if (error) throw error;
      toast.success('New line added');
      setNewNumber({ phone: '', label: '' });
      fetchNumbers();
    } catch (err) {
      toast.error('Failed to add number');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('contact_numbers').delete().eq('id', id);
    if (!error) {
      setNumbers(prev => prev.filter(n => n.id !== id));
      toast.success('Line removed');
    }
  }

  const inputClass = "w-full bg-gray-50 border border-transparent focus:border-gray-200 rounded-[20px] py-4 px-6 text-sm font-black text-gray-900 outline-none focus:bg-white transition-all";

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Global Config</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Control Core System States</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
           <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 sticky top-32">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                    <PhoneCall size={22} strokeWidth={2.5} />
                 </div>
                 <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Helplines</h2>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Phone Number</label>
                    <input 
                      className={inputClass}
                      placeholder="e.g. +91 9876543210"
                      value={newNumber.phone}
                      onChange={(e) => setNewNumber({...newNumber, phone: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Display Label</label>
                    <input 
                      className={inputClass}
                      placeholder="e.g. Pharmacy Expert"
                      value={newNumber.label}
                      onChange={(e) => setNewNumber({...newNumber, label: e.target.value})}
                    />
                 </div>

                 <button 
                   onClick={handleAdd}
                   disabled={saving}
                   className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                 >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <Plus size={18} strokeWidth={3} />
                        Register Support Line
                      </>
                    )}
                 </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex items-start gap-4">
                 <ShieldCheck size={20} className="text-gray-400 shrink-0" strokeWidth={2.5} />
                 <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                   Changes here propagate instantly to the Medical section, Auth recovery, and Support pages.
                 </p>
              </div>

              {/* Console Security */}
              <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl space-y-7 ring-1 ring-white/10">
                 <div className="flex items-center gap-4 text-white">
                    <div className="p-3 bg-white/10 rounded-xl">
                       <Lock size={20} className="text-primary" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black tracking-tight leading-none">Console Security</h2>
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Master Authorization Key</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="relative group">
                       <input 
                         type="password"
                         id="new_admin_pass"
                         className="w-full bg-white/5 border border-white/5 focus:border-white/10 rounded-[20px] py-4 px-6 text-sm font-bold text-white outline-none transition-all placeholder:text-gray-600"
                         placeholder="Set New Master Key"
                       />
                       <button 
                         onClick={async () => {
                           const val = (document.getElementById('new_admin_pass') as HTMLInputElement).value;
                           if(!val) return toast.error('Key cannot be empty');
                           setSaving(true);
                           try {
                              const hashed = await hashPassword(val);
                              const { error } = await supabase.from('settings').update({ value: hashed }).eq('key', 'admin_password');
                              if(!error) toast.success('Master Key Rotated');
                              else throw error;
                           } catch(e) { toast.error('Rotation Failed'); }
                           setSaving(false);
                         }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-orange-900/20"
                       >
                          Rotate
                       </button>
                    </div>
                    <p className="text-[9px] text-gray-600 font-bold italic leading-relaxed px-2">
                       Safety: Rotating the key will affect all future sessions. Keep it secure.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[48px] border border-gray-100 p-10 space-y-8 h-fit">
           <h2 className="text-xl font-black text-gray-900 uppercase">Live Routing Table</h2>
           
           <div className="space-y-4">
              {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-100" size={40} /></div>
              ) : numbers.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-10 gap-4">
                   <Phone size={64} />
                   <p className="font-black uppercase tracking-widest">No Active Numbers</p>
                </div>
              ) : (
                numbers.map((n) => (
                  <div key={n.id} className="group bg-gray-50/30 border border-gray-50 p-6 rounded-[32px] hover:border-gray-200 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white border border-gray-100 rounded-[20px] flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-105">
                           <Phone size={24} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-0.5">
                           <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">{n.phone}</h3>
                           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{n.label}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                           Live
                        </div>
                        <button 
                          onClick={() => handleDelete(n.id)}
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
