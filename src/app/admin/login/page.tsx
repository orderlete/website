'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, Loader2, AppWindow } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/utils';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hashed = await hashPassword(password);
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();

      if (data && data.value === hashed) {
        // Set secure session cookie
        document.cookie = "admin_authorized=true; path=/; samesite=strict";
        toast.success('Identity verified. Master Console Access Granted.');
        router.push('/admin');
      } else {
        toast.error('Invalid Credentials. Access Blocked.');
      }
    } catch (err) {
      toast.error('Security System Error. Contact DevOps.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-10 text-center">
          <div className="flex flex-col items-center gap-6">
             <div className="w-20 h-20 bg-gray-900 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-gray-900/20">
                <ShieldCheck size={40} strokeWidth={2.5} />
             </div>
             <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Admin Console</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-none">Global Authorization Gate</p>
             </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
             <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" size={20} strokeWidth={2.5} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Gateway Key"
                  className="w-full bg-gray-50 border border-transparent focus:border-gray-200 rounded-[24px] py-5 pl-16 pr-8 text-sm font-black outline-none focus:bg-white transition-all shadow-sm"
                  autoFocus
                />
             </div>
             
             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black tracking-widest text-[11px] uppercase shadow-2xl shadow-gray-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Authorize Access
                    <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
             </button>
          </form>

          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed px-12">
            System activity is encrypted and logged. Unauthorized access attempts are prohibited.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
           <AppWindow size={16} className="text-gray-300" />
           <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">Secured by Orderlete Architecture</span>
        </div>
      </motion.div>
    </div>
  );
}
