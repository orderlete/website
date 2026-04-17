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
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 bg-[#0a0a0c] z-[9999] flex flex-col items-center justify-center p-6 touch-none overflow-hidden"
        >
          {/* Glowing Backdrops */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

          <motion.div 
            className="flex flex-col items-center gap-12 relative z-10"
          >
            {/* Logo Wrapper */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-48 h-48 bg-white/5 backdrop-blur-3xl rounded-[60px] flex items-center justify-center relative border border-white/10 p-10 group"
            >
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(232,89,12,0.3)]" />
               
               {/* Animated rings */}
               <motion.div 
                 animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                 className="absolute inset-0 border-2 border-primary/30 rounded-[60px]"
               />
               <motion.div 
                 animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                 transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                 className="absolute inset-0 border-2 border-primary/20 rounded-[60px]"
               />
            </motion.div>
            
            {/* Branded Text */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-3">
                {"ORDERLETE".split("").map((char, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, y: 15, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.4 + (i * 0.05), type: "spring", stiffness: 120 }}
                    className="text-6xl font-black text-white tracking-tighter"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, tracking: '1em' }}
                animate={{ opacity: 0.4, tracking: '0.4em' }}
                transition={{ delay: 1, duration: 1 }}
                className="text-[10px] font-black text-white uppercase"
              >
                Beyond Rapid Delivery
              </motion.p>
            </div>
            
            {/* Loading Indicator */}
            <div className="absolute -bottom-32 flex flex-col items-center gap-6">
               <div className="w-40 h-[2px] bg-white/5 overflow-hidden relative rounded-full">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
               </div>
            </div>
          </motion.div>
          
          {/* Scanning Line Effect */}
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-primary/20 shadow-[0_0_15px_rgba(232,89,12,0.5)] z-50 pointer-events-none"
          />
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
