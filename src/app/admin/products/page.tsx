'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Edit3, 
  X, 
  Search, 
  Tag,
  Layers,
  Check,
  Type,
  AlignLeft,
  Stars
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    about: '',
    price: '',
    image_url: '',
    categories: ['confectionary'],
    subcategories: [] as string[],
    features: [] as string[],
    stock: '10',
    is_featured: false,
    featured_priority: '0',
    rating: '4.8',
    review_count: '15',
    discount_percent: '0'
  });

  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let result = products;
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.categories?.includes(categoryFilter));
    }
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [products, categoryFilter, searchQuery]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    } catch (err) { console.error(err); }
  }

  async function handleSave(e: React.FormEvent) {
    if (loading) return;
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image_url) {
      toast.error('Fill required fields');
      return;
    }

    setLoading(true);
    const payload = {
      name: formData.name,
      subtitle: formData.subtitle,
      about: formData.about,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      categories: formData.categories,
      subcategories: formData.subcategories,
      features: formData.features,
      stock: parseInt(formData.stock),
      is_featured: formData.is_featured,
      featured_priority: parseInt(formData.featured_priority) || 0,
      rating: parseFloat(formData.rating) || 4.8,
      review_count: parseInt(formData.review_count) || 15,
      discount_percent: parseInt(formData.discount_percent) || 0
    };

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) toast.error('Update failed');
      else {
        toast.success('Product updated!');
        setEditingId(null);
        resetForm();
      }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('Failed to add');
      else {
        toast.success('Product added!');
        resetForm();
      }
    }
    fetchProducts();
  }

  const resetForm = () => {
    setFormData({ 
      name: '', subtitle: '', about: '', price: '', image_url: '', 
      categories: ['confectionary'], subcategories: [], features: [], stock: '10',
      is_featured: false, featured_priority: '0', rating: '4.8', review_count: '15',
      discount_percent: '0'
    });
    setEditingId(null);
  };

  const addFeature = () => {
    if (!featureInput) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, featureInput]
    }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const toggleSubcategory = (sub: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(sub)
        ? prev.subcategories.filter(s => s !== sub)
        : [...prev.subcategories, sub]
    }));
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      subtitle: p.subtitle || '',
      about: p.about || '',
      price: p.price.toString(),
      image_url: p.image_url,
      categories: p.categories || [],
      subcategories: p.subcategories || [],
      features: p.features || [],
      stock: p.stock?.toString() || '10',
      is_featured: p.is_featured || false,
      featured_priority: p.featured_priority?.toString() || '0',
      rating: p.rating?.toString() || '4.8',
      review_count: p.review_count?.toString() || '15',
      discount_percent: p.discount_percent?.toString() || '0'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableSubcategories = categories.filter(c => formData.categories.includes(c.section));

  return (
    <div className="space-y-8 pb-32">
      <div>
         <h1 className="text-3xl font-black text-gray-900 tracking-tight">Full Product Page Config</h1>
         <p className="text-gray-400 text-sm font-bold uppercase tracking-widest opacity-60">Design the detailed user view</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6 sticky top-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-2xl text-white", editingId ? "bg-orange-500" : "bg-gray-900")}>
                     {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <h2 className="font-black text-lg text-gray-900">{editingId ? 'Edit Product' : 'New Product'}</h2>
               </div>
               {editingId && (
                 <button type="button" onClick={resetForm} className="p-1 text-gray-400 hover:text-red-500"><X size={20} /></button>
               )}
            </div>

            <div className="space-y-5">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Header Title</label>
                  <div className="relative">
                    <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Belgian Truffle Cake" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:bg-white outline-none" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Page Subtitle</label>
                  <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="e.g. Dark Chocolate with Gold Dust" className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white outline-none" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="10" className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white outline-none" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rating</label>
                    <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} placeholder="4.8" className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reviews</label>
                    <input type="number" value={formData.review_count} onChange={e => setFormData({...formData, review_count: e.target.value})} placeholder="15" className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white outline-none" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount % (Green Tag if &gt; 10%)</label>
                  <input type="number" value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: e.target.value})} placeholder="0" className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl py-4 px-6 text-sm font-black focus:bg-white outline-none" />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About / Detailed Description</label>
                  <div className="relative">
                    <AlignLeft size={16} className="absolute left-4 top-4 text-gray-300" />
                    <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} placeholder="Describe your product in detail..." className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:bg-white outline-none min-h-[120px] resize-none" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Features (Bullet Points)</label>
                  <div className="flex gap-2">
                    <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="e.g. Sugar Free" className="flex-1 bg-gray-50 rounded-xl py-3 px-4 text-xs font-bold outline-none" />
                    <button type="button" onClick={addFeature} className="bg-gray-900 text-white p-3 rounded-xl"><Plus size={16} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((f, i) => (
                      <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                        {f} <X size={12} className="cursor-pointer" onClick={() => removeFeature(i)} />
                      </span>
                    ))}
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Featured & Ranking</label>
                  <div className="grid grid-cols-2 gap-4">
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

               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility Settings</label>
                  <div className="flex flex-wrap gap-2">
                    {['confectionary', 'medical'].map(cat => (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border", formData.categories.includes(cat) ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-100 text-gray-400")}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSubcategories.map(cat => (
                      <button key={cat.id} type="button" onClick={() => toggleSubcategory(cat.name)} className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all border", formData.subcategories.includes(cat.name) ? "bg-primary border-primary text-white" : "bg-white border-gray-100 text-gray-400")}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Photo URL</label>
                  <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-[11px] font-bold focus:bg-white outline-none" />
               </div>
            </div>

            <button type="submit" disabled={loading} className={cn("w-full text-white font-black py-4.5 rounded-[24px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all", editingId ? "bg-orange-500 shadow-orange-200" : "bg-gray-900 shadow-gray-200")}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'SAVE PAGE DESIGN' : 'PUBLISH PAGE')}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="text" placeholder="Filter pages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-100 rounded-[28px] py-5 pl-16 pr-8 font-bold text-sm shadow-sm outline-none" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                 {filteredProducts.map((p) => (
                    <motion.div layout key={p.id} className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl transition-all">
                       <div className="relative aspect-video rounded-[24px] overflow-hidden bg-gray-50">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                             <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-900">{p.categories?.[0]}</div>
                             {p.subtitle && <div className="bg-primary/90 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{p.subtitle}</div>}
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => {
                                const newStock = p.stock === 0 ? 10 : 0;
                                supabase.from('products').update({ stock: newStock }).eq('id', p.id).then(fetchProducts);
                                toast.success(newStock === 0 ? 'Marked Out of Stock' : 'Marked In Stock');
                             }} className={cn("p-3 bg-white rounded-2xl shadow-2xl transition-colors", p.stock === 0 ? "text-emerald-500" : "text-amber-500")}>
                                <Check size={18} />
                             </button>
                             <button onClick={() => startEdit(p)} className="p-3 bg-white rounded-2xl text-gray-900 hover:text-primary shadow-2xl"><Edit3 size={18} /></button>
                             <button onClick={() => { if(confirm('Delete?')) supabase.from('products').delete().eq('id', p.id).then(fetchProducts); }} className="p-3 bg-white rounded-2xl text-gray-900 hover:text-red-500 shadow-2xl"><Trash2 size={18} /></button>
                          </div>
                          {p.stock === 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                               <div className="bg-red-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">Out of Stock</div>
                            </div>
                          )}
                       </div>
                       <div className="px-1 space-y-1">
                          <div className="flex items-center justify-between">
                             <h3 className="font-black text-gray-900 text-lg leading-tight truncate pr-4">{p.name}</h3>
                             <span className="font-black text-gray-900 text-xl whitespace-nowrap">{formatPrice(p.price)}</span>
                          </div>
                          <p className="text-gray-400 font-bold text-xs truncate uppercase tracking-widest">{p.features?.length || 0} Dynamic Features Loaded</p>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
