'use client';

import React, { useState, useEffect } from 'react';
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

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (shouldHide) return null;

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pointer-events-none transition-transform duration-500 ease-in-out",
      !isVisible && "translate-y-[200%]"
    )}>
      <div className="max-w-md mx-auto h-[76px] bg-white border border-gray-100 rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] flex items-center justify-around px-4 pointer-events-auto relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center transition-all duration-300 relative py-4 px-5 rounded-2xl",
                isActive ? "text-primary scale-110" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.5} 
                className="transition-transform"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
