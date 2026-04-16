'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Save, 
  Eye, 
  ShieldCheck, 
  Loader2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PagesAdmin() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    const { data } = await supabase.from('cms_pages').select('*').order('slug');
    if (data) {
      setPages(data);
      if (data.length > 0) {
        setSelectedPage(data[0]);
        setContent(data[0].content);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (selectedPage) {
      setContent(selectedPage.content);
    }
  }, [selectedPage]);

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cms_pages')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('slug', selectedPage.slug);
      
      if (error) throw error;
      toast.success(`${selectedPage.title} Updated Live`);
      fetchPages();
    } catch (err) {
      toast.error('Failed to update page');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full bg-white border border-gray-100 rounded-[28px] p-8 text-sm font-bold text-gray-700 outline-none focus:border-gray-300 min-h-[500px] shadow-sm resize-none whitespace-pre-wrap";

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Global CMS</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Legal, Privacy & Compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Page List */}
        <div className="lg:col-span-1 space-y-3">
           {loading ? <Loader2 className="animate-spin mx-auto opacity-10" /> : pages.map(p => (
             <button 
               key={p.slug}
               onClick={() => setSelectedPage(p)}
               className={cn(
                 "w-full p-6 rounded-[32px] border text-left transition-all flex items-center justify-between group",
                 selectedPage?.slug === p.slug ? "bg-gray-900 border-gray-900 shadow-xl" : "bg-white border-gray-50 hover:bg-gray-50"
               )}
             >
                <div className="space-y-1">
                   <p className={cn("text-xs font-black uppercase tracking-widest", selectedPage?.slug === p.slug ? "text-primary" : "text-gray-400")}>{p.slug}</p>
                   <h3 className={cn("text-sm font-black tracking-tight", selectedPage?.slug === p.slug ? "text-white" : "text-gray-900")}>{p.title}</h3>
                </div>
                <ChevronRight size={16} className={cn("transition-transform group-hover:translate-x-1", selectedPage?.slug === p.slug ? "text-white/20" : "text-gray-200")} />
             </button>
           ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-6">
           {selectedPage && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900">
                         <FileText size={20} />
                      </div>
                      <div>
                         <h2 className="text-lg font-black text-gray-900">{selectedPage.title}</h2>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <Clock size={10} /> Last Edit: {new Date(selectedPage.updated_at).toLocaleString()}
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <a 
                        href={`/pages/${selectedPage.slug}`} 
                        target="_blank" 
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-900 transition-colors"
                      >
                         <ExternalLink size={20} />
                      </a>
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                         {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Deploy Changes</>}
                      </button>
                   </div>
                </div>

                <div className="relative">
                   <textarea
                     className={inputClass}
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="Write your policy content here..."
                   />
                   <div className="absolute top-8 right-8 flex items-center gap-2 opacity-10 pointer-events-none">
                      <ShieldCheck size={24} />
                      <span className="text-xs font-black uppercase tracking-widest">Master CMS Access</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
