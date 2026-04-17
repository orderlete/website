'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    section: 'confectionary',
    display_order: 0,
    is_featured: false,
    featured_priority: '0'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    if (data) setCategories(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.image_url) {
      toast.error('Name and Image are required');
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      featured_priority: parseInt(formData.featured_priority) || 0
    };
    const { error } = await supabase.from('categories').insert(payload);
    
    if (error) {
      toast.error('Failed to add category');
    } else {
      toast.success('Category added!');
      setFormData({ name: '', image_url: '', section: 'confectionary', display_order: categories.length, is_featured: false, featured_priority: '0' });
      fetchCategories();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? Products in this category will not be deleted.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Deleted');
      fetchCategories();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Category Manager</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest opacity-60">Control your front-page circular icons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
           <form 
            onSubmit={handleAdd}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6 sticky top-8"
           >
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2.5 rounded-2xl bg-gray-900 text-white">
                    <Target size={18} />
                 </div>
                 <h2 className="font-black text-lg text-gray-900">Add Category</h2>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Label Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Donuts, Eggless..."
                      className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon Image URL</label>
                    <input 
                      type="text" 
                      value={formData.image_url}
                      onChange={e => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Website Section</label>
                    <select 
                      value={formData.section}
                      onChange={e => setFormData({...formData, section: e.target.value})}
                      className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:bg-white transition-all appearance-none"
                    >
                       <option value="confectionary">🍰 Confectionary (Cakes)</option>
                       <option value="medical">💊 Medical (Pharma)</option>
                    </select>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Featured & Ranking</label>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={cn("w-10 h-6 flex items-center rounded-full p-1 transition-colors", formData.is_featured ? "bg-primary" : "bg-gray-200")}>
                          <div className={cn("bg-white w-4 h-4 rounded-full shadow-md transform transition-transform", formData.is_featured ? "translate-x-4" : "translate-x-0")} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 uppercase">Is Featured</span>
                        <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="hidden" />
                      </label>
                      <div className={cn("transition-opacity", formData.is_featured ? "opacity-100" : "opacity-30 pointer-events-none")}>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority (1 = First)</label>
                        <input type="number" min="0" value={formData.featured_priority} onChange={e => setFormData({...formData, featured_priority: e.target.value})} placeholder="0" className="w-full bg-gray-50 rounded-2xl py-3 px-4 text-xs font-bold focus:bg-white outline-none mt-1" />
                      </div>
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-black py-4.5 rounded-[24px] shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : 'PUBLISH TO APP'}
              </button>
           </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                 {categories.map((cat) => (
                   <motion.div 
                    layout
                    key={cat.id}
                    className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 group relative overflow-hidden"
                   >
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                         <img src={cat.image_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-gray-900 truncate w-full px-2">{cat.name}</p>
                        <p className="text-[9px] font-black uppercase text-primary tracking-widest opacity-60">{cat.section}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                         <Trash2 size={14} />
                      </button>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
