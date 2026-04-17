'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const { fetchStatus } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    fetchStatus(); // Ensure store status is loaded
    
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
          exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 touch-none"
        >
          <motion.div 
            className="flex flex-col items-center gap-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-32 h-32 flex items-center justify-center relative"
            >
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center gap-2"
            >
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">ORDERLETE</h1>
              <div className="flex items-center gap-1 opacity-40">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
