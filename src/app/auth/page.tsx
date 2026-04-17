'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Sparkles, User as UserIcon, MapPin, Loader2, Lock, Phone, Hash, Eye, EyeOff
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import LocationPicker from '@/components/LocationPicker';
import { hashPassword } from '@/lib/utils';

export default function AuthPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [step, setStep] = useState(0); // 0: Check Phone, 1: Login Password, 2: Signup
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleCheckPhone = async () => {
    if (mobile.length < 10) {
      toast.error('Enter valid 10-digit phone');
      return;
    }
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', mobile)
        .maybeSingle();

      if (profile) {
        setStep(1); // User exists, ask for password
      } else {
        setStep(2); // New user, go to signup
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) { toast.error('Enter password'); return; }
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', mobile)
        .maybeSingle();

      if (profile) {
        const hashed = await hashPassword(password);
        if (profile.password === hashed) {
          document.cookie = `user_session=${profile.id}; path=/; samesite=strict`;
          setUser(profile);
          toast.success(`Welcome back, ${profile.name}!`);
          router.push('/');
        } else {
          toast.error('Incorrect password');
        }
      }
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !address || !pincode || !password) {
      toast.error('Please complete all fields');
      return;
    }
    setLoading(true);
    try {
      const hashed = await hashPassword(password);
      const { data, error } = await supabase.from('profiles').insert({
        name,
        phone: mobile,
        address,
        pincode,
        password: hashed
      }).select().single();

      if (error) throw error;
      document.cookie = `user_session=${data.id}; path=/; samesite=strict`;
      setUser(data);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/50 backdrop-blur-xl border border-white/50 rounded-2xl py-4 px-5 text-sm font-medium text-gray-900 placeholder-gray-500 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 shadow-sm";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-400/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-yellow-400/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div className="flex items-center justify-between mb-2">
          {step !== 0 && (
            <button 
              onClick={() => setStep(0)} 
              className="p-3 bg-white/70 backdrop-blur-md rounded-full text-gray-600 hover:text-gray-900 hover:bg-white transition-all border border-white/60 shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          )}
          <div className="flex items-center gap-2 mx-auto bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-sm">
            <Sparkles size={16} className="text-orange-500" fill="currentColor" />
            <span className="text-xs font-bold tracking-widest text-gray-800 uppercase">Orderlete Premium</span>
          </div>
          {step !== 0 && <div className="w-[42px]" />}
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/80 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
          <div className="space-y-2 mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {step === 0 ? 'Welcome' : step === 1 ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {step === 0 ? 'Enter your mobile to sign in or register' : step === 1 ? 'Enter your password' : 'Join to start ordering effortlessly'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 0 ? (
                <div className="space-y-5">
                   <div className="relative group">
                      <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <input type="tel" placeholder="Mobile Number" maxLength={10} className={`${inputClass} pl-12`} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}/>
                   </div>
                   <button onClick={handleCheckPhone} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(249,115,22,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
                   </button>
                </div>
              ) : step === 1 ? (
                <div className="space-y-5">
                   <div className="relative group">
                      <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <input type={showPassword ? "text" : "password"} placeholder="Password" className={`${inputClass} pl-12 pr-12`} value={password} onChange={(e) => setPassword(e.target.value)}/>
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                   <button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(249,115,22,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                   </button>
                   <div className="pt-4 text-center">
                     <p className="text-xs font-semibold text-gray-500 hover:text-orange-500 transition-colors cursor-pointer" onClick={() => toast.success('Please contact support to reset password.')}>Forgot Password?</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-5">
                   <LocationPicker onLocationFound={(addr, pin) => { setAddress(addr); setPincode(pin); }} />
                   <div className="space-y-4">
                      <div className="relative group">
                        <UserIcon size={18} className="absolute left-5 top-[18px] text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input type="text" placeholder="Full Name" className={`${inputClass} pl-12`} value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <Hash size={18} className="absolute left-5 top-[18px] text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          <input type="text" placeholder="Pincode" className={`${inputClass} pl-12`} value={pincode} onChange={(e) => setPincode(e.target.value)} />
                        </div>
                        <div className="relative group">
                           <Phone size={18} className="absolute left-5 top-[18px] text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                           <input type="tel" placeholder="Mobile" maxLength={10} className={`${inputClass} pl-12`} value={mobile} disabled />
                        </div>
                      </div>

                      <div className="relative group">
                        <MapPin size={18} className="absolute left-5 top-[18px] text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <textarea placeholder="Complete Delivery Address" className={`${inputClass} pl-12 min-h-[80px]`} value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      
                      <div className="relative group">
                        <Lock size={18} className="absolute left-5 top-[18px] text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input type={showPassword ? "text" : "password"} placeholder="Create Password" className={`${inputClass} pl-12 pr-12`} value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-[18px] text-gray-400 hover:text-gray-600 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                   </div>
                   <button onClick={handleSignup} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(249,115,22,0.6)] active:scale-[0.98] transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Complete Registration'}
                   </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
