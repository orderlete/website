'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, ShieldCheck, FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CMSPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      const { data } = await supabase.from('cms_pages').select('*').eq('slug', slug).single();
      if (data) setPage(data);
      setLoading(false);
    }
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-200" size={40} />
      </div>
    );
  }

  if (!page) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-4">
          <Info size={48} className="text-gray-200" />
          <h1 className="text-xl font-black text-gray-900">Page Not Found</h1>
          <button onClick={() => router.back()} className="text-primary font-black uppercase tracking-widest text-[10px]">Go Back</button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-8 border-b border-gray-50 flex items-center gap-6 sticky top-0 bg-white/90 backdrop-blur-md z-10">
         <button 
           onClick={() => router.back()}
           className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 active:scale-90 transition-all"
         >
            <ArrowLeft size={18} strokeWidth={2.5} />
         </button>
         <h1 className="text-xl font-black text-gray-900">{page.title}</h1>
      </header>

      <main className="px-8 py-10 max-w-2xl mx-auto space-y-10">
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="prose prose-sm max-w-none text-gray-500 font-bold leading-relaxed space-y-4 whitespace-pre-wrap"
         >
           {page.content}
         </motion.div>

         <div className="pt-20 pb-10 border-t border-gray-50 flex flex-col items-center gap-4 opacity-30">
            <ShieldCheck size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Orderlete Verified Policy</p>
         </div>
      </main>
    </div>
  );
}
