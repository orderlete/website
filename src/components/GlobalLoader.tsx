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
            className="flex flex-col items-center justify-center relative w-40 h-40"
          >
             {/* Spinning Ring */}
             <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-r-2 border-transparent border-t-primary rounded-full"
             />
             <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="absolute inset-2 border-b-2 border-l-2 border-transparent border-b-primary/40 rounded-full"
             />
             
             {/* Center Logo */}
             <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-20 h-20 relative z-10"
             >
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
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
