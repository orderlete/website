'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bell, X, ShieldCheck } from 'lucide-react';

export const triggerSimulatedSMS = (phone: string, code: string) => {
  const event = new CustomEvent('simulated-sms', { detail: { phone, code } });
  window.dispatchEvent(event);
};

export default function SimulatedSMS() {
  const [activeSMS, setActiveSMS] = useState<{ phone: string; code: string } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setActiveSMS(e.detail);
      // Auto hide after 8 seconds
      setTimeout(() => setActiveSMS(null), 8000);
    };
    window.addEventListener('simulated-sms', handler);
    return () => window.removeEventListener('simulated-sms', handler);
  }, []);

  return (
    <AnimatePresence>
      {activeSMS && (
        <motion.div 
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[360px]"
        >
          <div className="bg-gray-900 border border-white/10 rounded-[28px] p-5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] backdrop-blur-xl flex items-start gap-4 ring-1 ring-white/20">
             <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 border border-white/10">
                <MessageSquare size={20} />
             </div>
             
             <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Incoming Message</span>
                   <span className="text-[9px] font-black text-gray-600 uppercase">Just Now</span>
                </div>
                <h4 className="text-sm font-black text-white tracking-tight">System Verification</h4>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                   Your Orderlete access code is: <span className="text-emerald-400 text-lg font-black bg-white/5 px-2 py-0.5 rounded-lg ml-1 tracking-widest">{activeSMS.code}</span>. Do not share this with anyone.
                </p>
             </div>

             <button 
               onClick={() => setActiveSMS(null)}
               className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-600"
             >
                <X size={16} />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
