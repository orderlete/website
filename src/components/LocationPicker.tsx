'use client';

import React, { useState } from 'react';
import { MapPin, Loader2, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface LocationPickerProps {
  onLocationFound: (address: string, pincode: string) => void;
  className?: string;
}

export default function LocationPicker({ onLocationFound, className }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'detecting' | 'verifying' | 'success' | 'error'>('idle');

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // 1. Reverse Geocoding using OpenStreetMap
          // Added User-Agent header as required by OSM Nominatim usage policy
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'Orderlete/1.0 (App; Mobile Delivery)'
              }
            }
          );
          const data = await response.json();
          
          const pincode = data.address?.postcode || data.address?.zip;
          const address = data.display_name;

          if (!pincode) {
            setStatus('error');
            toast.error('Could not determine pincode. Please enter manually.');
            return;
          }

          setStatus('verifying');
          onLocationFound(address, pincode);

          // 2. Check Serviceability
          const { data: zone, error } = await supabase
            .from('serviceable_zones')
            .select('*')
            .eq('pincode', pincode)
            .eq('is_active', true)
            .single();

          if (error || !zone) {
            setStatus('error');
            toast.error(`Sorry, we don't serve ${pincode} yet!`, { icon: '📍' });
            return;
          }

          setStatus('success');
          onLocationFound(address, pincode);
          toast.success(`Broadcasting from ${zone.area_name}!`, { icon: '🚀' });
        } catch (err) {
          console.error(err);
          setStatus('error');
          toast.error('Location verification failed');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setLoading(false);
        setStatus('error');
        if (error.code === 1) toast.error('Permission denied. Please allow location access.');
        else if (error.code === 3) toast.error('Location request timed out. Try again.');
        else toast.error('Could not detect location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <button
      onClick={detectLocation}
      disabled={loading}
      type="button"
      className={cn(
        "w-full flex items-center justify-between p-5 rounded-[24px] border transition-all active:scale-[0.98] group",
        status === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : 
        status === 'error' ? "bg-red-50 border-red-100 text-red-700" :
        "bg-gray-50 border-gray-100 text-gray-900 overflow-hidden relative"
      )}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          status === 'success' ? "bg-emerald-500 text-white" : "bg-white text-gray-400 shadow-sm"
        )}>
           {loading ? <Loader2 size={18} className="animate-spin" /> : 
            status === 'success' ? <CheckCircle2 size={18} strokeWidth={2.5} /> :
            status === 'error' ? <AlertCircle size={18} strokeWidth={2.5} /> :
            <Navigation size={18} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
        </div>
        <div className="flex flex-col items-start leading-none gap-1">
           <span className="text-[11px] font-black uppercase tracking-widest text-inherit">
             {loading ? 'Analyzing Coordinates...' : 
              status === 'success' ? 'Location Verified' :
              status === 'error' ? 'Non-Serviceable Area' :
              'Auto-Detect Location'}
           </span>
           <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">
             {status === 'success' ? 'Proceed to Checkout' : 'GPS based verification'}
           </span>
        </div>
      </div>
      
      {!loading && status === 'idle' && (
        <div className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-1 pr-2">
           SCAN <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      )}

      {loading && (
        <motion.div 
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="absolute bottom-0 left-0 w-1/2 h-[2px] bg-primary"
        />
      )}
    </button>
  );
}
