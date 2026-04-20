'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Search, 
  Megaphone, 
  Image as ImageIcon, 
  Tag, 
  Eye, 
  EyeOff,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Banner } from '@/components/CustomBanner';
import { Product } from '@/store/useCartStore';

export default function AdvertisePage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'products'>('banners');
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isAddingProductAd, setIsAddingProductAd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Banner Form
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    priority: 1,
    bg_color: '#000000',
    alignment: 'center-center',
    image_alignment: 'center',
    overlay_opacity: 0.8,
    has_border: false
  });

  useEffect(() => {
    if (editingBanner) {
      setNewBanner({
        title: editingBanner.title || '',
        subtitle: editingBanner.subtitle || '',
        image_url: editingBanner.image_url || '',
        link_url: editingBanner.link_url || '',
        priority: editingBanner.priority || 1,
        bg_color: editingBanner.bg_color || '#000000',
        alignment: editingBanner.alignment || 'center-center',
        image_alignment: (editingBanner as any).image_alignment || 'center',
        overlay_opacity: (editingBanner as any).overlay_opacity ?? 0.8,
        has_border: (editingBanner as any).has_border ?? false
      });
      setIsAddingBanner(true);
    }
  }, [editingBanner]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: b } = await supabase.from('banners').select('*').order('priority');
      if (b) setBanners(b);

      const { data: p } = await supabase.from('products').select('*').order('name');
      if (p) setProducts(p as Product[]);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        const { error } = await supabase.from('banners').update(newBanner).eq('id', editingBanner.id);
        if (error) throw error;
        toast.success('Banner updated successfully');
      } else {
        const { data, error } = await supabase.from('banners').insert([newBanner]).select();
        if (error) throw error;
        setBanners([...banners, data[0]]);
        toast.success('Banner added successfully');
      }
      setIsAddingBanner(false);
      setEditingBanner(null);
      setNewBanner({ title: '', subtitle: '', image_url: '', link_url: '', priority: 1, bg_color: '#000000' });
      fetchData();
    } catch (err: any) {
      console.error('Save Banner Error:', err);
      toast.error(`Failed to save banner: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await supabase.from('banners').delete().eq('id', id);
      setBanners(banners.filter(b => b.id !== id));
      toast.success('Banner deleted');
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  const toggleProductAd = async (product: Product) => {
    try {
      const newIsAd = !product.is_ad;
      const { error } = await supabase
        .from('products')
        .update({ 
          is_ad: newIsAd, 
          ad_created_at: newIsAd ? new Date().toISOString() : null 
        })
        .eq('id', product.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_ad: newIsAd } : p
      ));
      toast.success(newIsAd ? 'Ad activated' : 'Ad deactivated');
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Advertising</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Promote products and manage display banners</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[22px] border border-gray-100 shadow-xl shadow-gray-200/40">
           <button 
             onClick={() => setActiveTab('banners')}
             className={cn(
               "px-8 py-3 rounded-[18px] text-sm font-black transition-all flex items-center gap-3",
               activeTab === 'banners' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
             )}
           >
             <ImageIcon size={18} strokeWidth={2.5} />
             Banners
           </button>
           <button 
             onClick={() => setActiveTab('products')}
             className={cn(
               "px-8 py-3 rounded-[18px] text-sm font-black transition-all flex items-center gap-3",
               activeTab === 'products' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
             )}
           >
             <TrendingUp size={18} strokeWidth={2.5} />
             Product Ads
           </button>
        </div>
      </div>

      {activeTab === 'banners' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Banners</h2>
            <button 
              onClick={() => setIsAddingBanner(true)}
              className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 active:scale-95 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              Create Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {banners.map((banner) => (
                <motion.div 
                  key={banner.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/20"
                >
                  <div className="aspect-[16/8] w-full overflow-hidden bg-gray-50">
                    <img src={banner.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button 
                         onClick={() => setEditingBanner(banner)}
                         className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-lg hover:bg-gray-900 hover:text-white transition-all"
                       >
                         <Tag size={16} strokeWidth={2.5} />
                       </button>
                       <button 
                         onClick={() => handleDeleteBanner(banner.id)}
                         className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                       >
                         <Trash2 size={16} strokeWidth={2.5} />
                       </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                       <span className="bg-gray-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                         Priority {banner.priority}
                       </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-1">{banner.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{banner.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Promotions</h2>
            <div className="relative group min-w-[300px]">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} strokeWidth={2.5} />
               <input 
                 type="text" 
                 placeholder="Search products..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-gray-900/5 transition-all shadow-sm"
               />
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product</th>
                  <th className="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={cn("group transition-colors", product.is_ad ? "bg-amber-50/30" : "hover:bg-gray-50")}>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden p-1">
                          <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">{product.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{product.price}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       {product.is_ad ? (
                         <div className="flex items-center gap-2 text-amber-600">
                           <TrendingUp size={14} strokeWidth={3} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Active Ad</span>
                         </div>
                       ) : (
                         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Inactive</span>
                       )}
                    </td>
                    <td className="px-10 py-6 text-right">
                       <button 
                         onClick={() => toggleProductAd(product)}
                         className={cn(
                           "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                           product.is_ad 
                            ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" 
                            : "bg-gray-900 text-white shadow-xl shadow-gray-200"
                         )}
                       >
                         {product.is_ad ? 'Stop Ad' : 'Start Ad'}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD BANNER */}
      <AnimatePresence>
        {isAddingBanner && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingBanner(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleAddBanner} className="p-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter">New Display Banner</h3>
                  <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[9px]">Will be displayed in the Essentials section</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title (Optional)</label>
                     <input 
                       type="text" 
                       value={newBanner.title}
                       onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all"
                       placeholder="eg: Festive Offer"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subtitle (Optional)</label>
                     <input 
                       type="text" 
                       value={newBanner.subtitle}
                       onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all"
                       placeholder="eg: Flat 50% OFF"
                     />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                     <input 
                       required
                       type="url" 
                       value={newBanner.image_url}
                       onChange={(e) => setNewBanner({...newBanner, image_url: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all"
                       placeholder="https://..."
                     />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redirect Link (Product/Category URL)</label>
                     <input 
                       type="text" 
                       value={newBanner.link_url}
                       onChange={(e) => setNewBanner({...newBanner, link_url: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all"
                       placeholder="eg: /product/123 or /medical"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                     <select 
                       value={newBanner.priority}
                       onChange={(e) => setNewBanner({...newBanner, priority: parseInt(e.target.value)})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all appearance-none"
                     >
                       <option value={1}>Priority 1 (Top)</option>
                       <option value={2}>Priority 2 (Mid-Grid 1)</option>
                       <option value={3}>Priority 3 (Mid-Grid 2)</option>
                       <option value={4}>Priority 4 (Bottom-Grid)</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Overlay Color</label>
                     <input 
                       type="color" 
                       value={newBanner.bg_color}
                       onChange={(e) => setNewBanner({...newBanner, bg_color: e.target.value})}
                       className="w-full h-12 bg-gray-50 border-none rounded-2xl outline-none cursor-pointer p-1"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Content Alignment</label>
                     <select 
                       value={newBanner.alignment}
                       onChange={(e) => setNewBanner({...newBanner, alignment: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all appearance-none"
                     >
                       <option value="top-left">Top Left</option>
                       <option value="top-center">Top Center</option>
                       <option value="top-right">Top Right</option>
                       <option value="center-left">Center Left</option>
                       <option value="center-center">Center Center</option>
                       <option value="center-right">Center Right</option>
                       <option value="bottom-left">Bottom Left</option>
                       <option value="bottom-center">Bottom Center</option>
                       <option value="bottom-right">Bottom Right</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Background Image Focus</label>
                     <select 
                       value={newBanner.image_alignment}
                       onChange={(e) => setNewBanner({...newBanner, image_alignment: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-gray-900/5 transition-all appearance-none"
                     >
                       <option value="center">Center Focus (Default)</option>
                       <option value="top">Focus on Top Area</option>
                       <option value="bottom">Focus on Bottom Area</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Overlay Opacity ({newBanner.overlay_opacity})</label>
                     <input 
                       type="range" 
                       min="0"
                       max="1"
                       step="0.1"
                       value={newBanner.overlay_opacity}
                       onChange={(e) => setNewBanner({...newBanner, overlay_opacity: parseFloat(e.target.value)})}
                       className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900"
                     />
                   </div>
                   <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                     <input 
                       type="checkbox" 
                       id="has_border"
                       checked={newBanner.has_border}
                       onChange={(e) => setNewBanner({...newBanner, has_border: e.target.checked})}
                       className="w-5 h-5 rounded-md border-gray-300 text-gray-900 focus:ring-gray-900"
                     />
                     <label htmlFor="has_border" className="text-xs font-black text-gray-900 uppercase tracking-tight cursor-pointer">Add Premium Border Area</label>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     type="button"
                     onClick={() => setIsAddingBanner(false)}
                     className="flex-1 px-8 py-5 rounded-[22px] text-xs font-black uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 px-8 py-5 rounded-[22px] text-xs font-black uppercase tracking-widest bg-gray-900 text-white shadow-xl shadow-gray-900/20 active:scale-95 transition-all"
                   >
                     Add Banner
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
