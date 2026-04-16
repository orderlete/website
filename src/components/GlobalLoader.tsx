'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if splash has already been shown in this session
    let hasShownSplash = false;
    try {
      hasShownSplash = sessionStorage.getItem('orderlete_splash_shown') === 'true';
    } catch (e) {}
    
    if (hasShownSplash) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        try {
          sessionStorage.setItem('orderlete_splash_shown', 'true');
        } catch (e) {}
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 touch-none"
        >
          <motion.div 
            className="flex flex-col items-center gap-10"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-44 h-44 bg-white rounded-[56px] flex items-center justify-center shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] relative border border-gray-50 p-8"
            >
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
               <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-4 -right-4 text-orange-400"
               >
                 <Sparkles size={32} />
               </motion.div>
            </motion.div>
            
            <div className="flex gap-2.5">
              {"ORDERLETE".split("").map((char, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.08), type: "spring" }}
                  className="text-5xl font-black text-gray-900 tracking-tighter"
                >
                  {char}
                </motion.span>
              ))}
            </div>
            
            <div className="absolute bottom-16 flex flex-col items-center gap-4">
               <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-40">System Initializing</span>
               <div className="w-16 h-[3px] bg-gray-50 overflow-hidden relative rounded-full">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-y-0 w-1/2 bg-primary"
                  />
               </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
