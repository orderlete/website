import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url?: string;
  priority: number;
  bg_color?: string;
  text_color?: string;
  alignment?: string;
  image_alignment?: string;
  overlay_opacity?: number;
  has_border?: boolean;
}

interface CustomBannerProps {
  banner: Banner;
}

const alignmentClasses = {
  'top-left': 'justify-start items-start text-left',
  'top-center': 'justify-start items-center text-center',
  'top-right': 'justify-start items-end text-right',
  'center-left': 'justify-center items-start text-left',
  'center-center': 'justify-center items-center text-center',
  'center-right': 'justify-center items-end text-right',
  'bottom-left': 'justify-end items-start text-left',
  'bottom-center': 'justify-end items-center text-center',
  'bottom-right': 'justify-end items-end text-right',
};

export default function CustomBanner({ banner }: CustomBannerProps) {
  const currentAlignment = banner.alignment || 'center-center';
  const currentImageFocus = banner.image_alignment || 'center';
  const flexClasses = alignmentClasses[currentAlignment as keyof typeof alignmentClasses] || alignmentClasses['center-center'];

  return (
    <div className="w-full mb-8">
      <Link href={banner.link_url || '#'}>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative overflow-hidden aspect-[21/9] lg:aspect-[21/7] shadow-xl group cursor-pointer",
            banner.has_border && "border-[8px] border-white ring-1 ring-gray-900/5 rounded-[40px] m-4"
          )}
          style={{ backgroundColor: banner.bg_color || '#000' }}
        >
          <img 
            src={banner.image_url} 
            alt={banner.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700",
              currentImageFocus === 'top' ? 'object-top' : 
              currentImageFocus === 'bottom' ? 'object-bottom' : 'object-center'
            )}
          />
          <div 
            className={cn(
              "absolute inset-0 flex flex-col p-8 md:p-12",
              flexClasses
            )}
            style={{ 
              background: `linear-gradient(to top, rgba(0,0,0,${banner.overlay_opacity ?? 0.8}), rgba(0,0,0,${(banner.overlay_opacity ?? 0.8) * 0.2}), transparent)`
            }}
          >
            {banner.title && (
              <h3 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2 uppercase tracking-tighter drop-shadow-2xl">
                {banner.title}
              </h3>
            )}
            <div className={cn(
              "flex flex-col gap-4",
              currentAlignment.includes('center') ? 'items-center' : 
              currentAlignment.includes('right') ? 'items-end' : 'items-start'
            )}>
              {banner.subtitle && (
                <p className="text-white/90 text-sm md:text-lg font-black uppercase tracking-[0.25em] drop-shadow-xl">
                  {banner.subtitle}
                </p>
              )}
              {banner.link_url && (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl active:scale-90 transition-transform mt-2">
                  <ArrowRight size={22} strokeWidth={3} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
