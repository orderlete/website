'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Phone, X, ChevronRight, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CallActionProps {
  trigger: React.ReactNode;
  title?: string;
}

export default function CallAction({ trigger, title = "Support Center" }: CallActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numbers, setNumbers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNumbers() {
      const { data } = await supabase.from('contact_numbers').select('*').eq('is_active', true);
      if (data) setNumbers(data);
    }
    if (isOpen) fetchNumbers();
  }, [isOpen]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    setIsOpen(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-[48px] p-8 pb-12 shadow-2xl space-y-8"
            >
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Select a line to connect</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                     <X size={20} strokeWidth={2.5} />
                  </button>
               </div>

               <div className="space-y-4">
                  {numbers.length === 0 ? (
                    <div className="py-10 text-center opacity-20">
                       <PhoneCall size={48} className="mx-auto" />
                    </div>
                  ) : numbers.map((n) => (
                    <button 
                      key={n.id}
                      onClick={() => handleCall(n.phone)}
                      className="w-full bg-gray-50/50 hover:bg-emerald-50 border border-gray-50 hover:border-emerald-100 p-6 rounded-[32px] flex items-center justify-between group transition-all active:scale-95"
                    >
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                             <Phone size={20} strokeWidth={3} />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-black text-gray-900 group-hover:text-emerald-900 transition-colors uppercase tracking-tight">{n.label}</p>
                             <p className="text-[12px] font-black text-gray-400 group-hover:text-emerald-600/60 transition-colors">{n.phone}</p>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-gray-200 group-hover:text-emerald-200" />
                    </button>
                  ))}
               </div>

               <div className="pt-4 flex flex-col items-center gap-4">
                  <div className="px-4 py-2 bg-gray-900 rounded-full flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Lines Open 24/7</span>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
