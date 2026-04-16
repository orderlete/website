'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cake, BriefcaseMedical, ShoppingCart, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

export default function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { icon: Cake, label: 'Bakery', href: '/' },
    { icon: BriefcaseMedical, label: 'Medical', href: '/medical' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  const hideOnPaths = ['/checkout', '/auth', '/admin', '/product/', '/cart'];
  const shouldHide = !pathname || hideOnPaths.some(p => pathname.startsWith(p));

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pointer-events-none">
      <div className="max-w-md mx-auto h-[76px] bg-white border border-gray-100 rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] flex items-center justify-around px-4 pointer-events-auto relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative py-2 px-4 rounded-2xl",
                isActive ? "text-primary scale-110" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="relative">
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 3 : 2.5} 
                  className="transition-transform"
                />
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                isActive ? "opacity-100" : "opacity-0 scale-90"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
