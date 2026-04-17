'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Bell, 
  Search,
  ChevronRight,
  LogOut,
  AppWindow,
  Layers,
  CircleUser,
  Loader2,
  Navigation,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { updateStoreStatusAdmin } from './actions';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: AppWindow, label: 'Products', href: '/admin/products' },
  { icon: Layers, label: 'Categories', href: '/admin/categories' },
  { icon: Navigation, label: 'Service Areas', href: '/admin/zones' },
  { icon: FileText, label: 'Legal CMS', href: '/admin/pages' },
  { icon: Bell, label: 'Broadcast', href: '/admin/notifications' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { storeStatus, fetchStatus } = useSettingsStore();
  const [isTogglingStore, setIsTogglingStore] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    // Check authentication via cookie (recognized by Middleware)
    const isAuth = document.cookie.includes('admin_authorized=true');
    if (!isAuth && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAuth(true);
    }
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname, router]);

  const handleLogout = () => {
    // Clear the auth cookie
    document.cookie = "admin_authorized=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/admin/login');
  };

  const handleToggleStoreStatus = async () => {
    setIsTogglingStore(true);
    const newStatus = storeStatus === 'open' ? 'closed' : 'open';
    const res = await updateStoreStatusAdmin(newStatus);
    if (res.success) {
      await fetchStatus();
      toast.success(`Store is now ${newStatus}`);
    } else {
      toast.error('Failed to change store status');
    }
    setIsTogglingStore(false);
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
         <Loader2 className="animate-spin text-gray-200" size={40} />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 pb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white border border-gray-100 rounded-[22px] flex items-center justify-center p-2 shadow-xl shadow-gray-200/50">
             <img src="/logo.png" alt="Orderlete" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">Console</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-2 text-gray-400"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all group",
                isActive 
                  ? "bg-gray-900 text-white shadow-xl shadow-gray-200" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className={cn(
                "flex items-center justify-center transition-transform",
                isActive ? "scale-105" : "group-hover:scale-110"
              )}>
                 <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-sm font-black tracking-tight">{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto opacity-40" strokeWidth={3} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-[22px] text-red-500 hover:bg-red-50 transition-all group"
        >
           <LogOut size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
           <span className="text-sm font-black tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col lg:flex-row overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 border-r border-gray-100 flex-col shrink-0">
         <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 shadow-2xl overflow-hidden"
            >
               <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className="h-20 lg:h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-900 bg-gray-50 rounded-xl"
              >
                <Menu size={20} strokeWidth={2.5} />
              </button>
              
              <div className="relative w-48 md:w-80 group hidden sm:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" size={18} strokeWidth={2.5} />
                 <input 
                   type="text" 
                   placeholder="Deep search..."
                   className="w-full bg-gray-50 rounded-2xl py-2.5 pl-12 pr-6 text-sm font-bold placeholder:text-gray-400 outline-none focus:bg-white focus:ring-4 focus:ring-gray-900/5 transition-all text-xs"
                 />
              </div>
           </div>

           <div className="flex items-center gap-3 lg:gap-6">
              <button 
                onClick={handleToggleStoreStatus}
                disabled={isTogglingStore}
                className={cn(
                  "relative px-4 py-2 rounded-xl transition-all flex items-center gap-2",
                  storeStatus === 'open' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                )}
              >
                 <div className={cn("w-2 h-2 rounded-full", storeStatus === 'open' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                 <span className="text-[11px] font-black uppercase tracking-widest leading-none hidden sm:block">
                   {isTogglingStore ? 'WAIT...' : storeStatus === 'open' ? 'STORE OPEN' : 'STORE CLOSED'}
                 </span>
              </button>

              <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
                 <Bell size={20} strokeWidth={2.5} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              
              <div className="h-10 w-[1px] bg-gray-100 mx-1 lg:mx-2 hidden sm:block" />
              
              <div className="flex items-center gap-3 pl-2">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-gray-900 leading-none mb-0.5">Admin</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Master View</p>
                 </div>
                 <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gray-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden">
                    <CircleUser size={24} strokeWidth={2} />
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-10 flex-1 overflow-x-hidden">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </div>
      </div>
    </div>
  );
}
