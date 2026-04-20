'use client';

import React from 'react';
import { Cake, BriefcaseMedical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CategorySwitcherProps {
  activeCategory: 'confectionary' | 'medical';
  onCategoryChange: (category: 'confectionary' | 'medical') => void;
}

const CategorySwitcher: React.FC<CategorySwitcherProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex bg-surface/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100/50 w-full" style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)' }}>
      <button
        onClick={() => onCategoryChange('confectionary')}
        className={cn(
          "relative flex-1 py-3.5 px-4 rounded-[14px] flex items-center justify-center gap-2.5 transition-all duration-500 overflow-hidden",
          activeCategory === 'confectionary' ? "text-primary-dark font-extrabold" : "text-gray-400 font-semibold hover:text-gray-600"
        )}
      >
        {activeCategory === 'confectionary' && (
          <motion.div 
            layoutId="activeTab" 
            className="absolute inset-0 bg-white shadow-md rounded-[14px]"
            style={{ boxShadow: '0 4px 16px -2px rgba(232,89,12,0.1)' }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
          />
        )}
        <Cake className={cn("relative z-10 transition-colors", activeCategory === 'confectionary' ? "text-primary" : "")} size={18} />
        <span className="relative z-10 text-[13px] tracking-tight">Confectionary</span>
      </button>
      
      <button
        onClick={() => onCategoryChange('medical')}
        className={cn(
          "relative flex-1 py-3.5 px-4 rounded-[14px] flex items-center justify-center gap-2.5 transition-all duration-500 overflow-hidden",
          activeCategory === 'medical' ? "text-primary-dark font-extrabold" : "text-gray-400 font-semibold hover:text-gray-600"
        )}
      >
        {activeCategory === 'medical' && (
          <motion.div 
            layoutId="activeTab" 
            className="absolute inset-0 bg-white shadow-md rounded-[14px]"
            style={{ boxShadow: '0 4px 16px -2px rgba(232,89,12,0.1)' }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}
          />
        )}
        <BriefcaseMedical className={cn("relative z-10 transition-colors", activeCategory === 'medical' ? "text-primary" : "")} size={18} />
        <span className="relative z-10 text-[13px] tracking-tight">Medical</span>
      </button>
    </div>
  );
};

export default CategorySwitcher;
