'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  User as UserIcon, 
  MapPin, 
  Loader2, 
  Lock, 
  Phone, 
  Hash, 
  ShieldQuestion, 
  Eye, 
  EyeOff,
  HelpCircle,
  MessageSquare,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import LocationPicker from '@/components/LocationPicker';
import CallAction from '@/components/CallAction';
import { hashPassword } from '@/lib/utils';

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "Which city were you born in?",
  "What was the name of your first school?",
  "What is your favorite food?"
];

export default function AuthPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  const [step, setStep] = useState(1); // 1: Login, 2: Signup, 3: Recovery
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleAuth = async () => {
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
        const hashed = await hashPassword(password);
        if (profile.password === hashed) {
          // Set secure user session cookie for Middleware
          document.cookie = `user_session=${profile.id}; path=/; samesite=strict`;
          setUser(profile);
          toast.success(`Welcome back, ${profile.name}!`);
          router.push('/');
        } else {
          toast.error('Incorrect password');
        }
      } else {
        setStep(2); // New User -> Signup
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !address || !pincode || !securityAnswer || !password) {
      toast.error('Please complete all security fields');
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
        password: hashed,
        security_question: securityQuestion,
        security_answer: securityAnswer.toLowerCase().trim()
      }).select().single();

      if (error) throw error;
      // Set secure user session cookie for Middleware
      document.cookie = `user_session=${data.id}; path=/; samesite=strict`;
      setUser(data);
      toast.success('Secure account created!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', mobile)
        .single();

      if (profile && profile.security_answer === securityAnswer.toLowerCase().trim()) {
        const hashed = await hashPassword(password);
        const { error } = await supabase
          .from('profiles')
          .update({ password: hashed })
          .eq('id', profile.id);
        
        if (error) throw error;
        toast.success('Identity verified. Password reset!');
        setStep(1);
      } else {
        toast.error('Incorrect security answer');
      }
    } catch (err) {
      toast.error('Identity not found');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-surface border border-transparent rounded-[24px] py-4.5 px-6 text-sm font-bold text-foreground outline-none focus:bg-white focus:border-primary/10 transition-all duration-300 shadow-sm";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <button 
          onClick={() => setStep(1)} 
          className="p-3 bg-white rounded-2xl text-muted hover:text-foreground transition-colors border border-gray-100 shadow-sm active:scale-90"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="bg-white border border-gray-100/60 p-8 rounded-[40px] space-y-7 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              {step === 1 ? 'Digital Entry' : step === 2 ? 'Identity Setup' : 'Recovery'}
            </h2>
            <p className="text-[11px] text-muted font-black uppercase tracking-widest opacity-60">
              {step === 1 ? 'Marketplace Login' : step === 2 ? 'Initialize Profile' : 'System Verification'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {step === 1 ? (
                <div className="space-y-4">
                   <div className="relative">
                      <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
                      <input type="tel" placeholder="Mobile" maxLength={10} className={`${inputClass} pl-14`} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}/>
                   </div>
                   <div className="relative">
                      <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
                      <input type={showPassword ? "text" : "password"} placeholder="Password" className={`${inputClass} pl-14 pr-14`} value={password} onChange={(e) => setPassword(e.target.value)}/>
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                   </div>
                   <button onClick={handleAuth} disabled={loading} className="w-full bg-foreground text-white font-black py-4.5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'PROCEED'}
                   </button>
                   <button onClick={() => setStep(3)} className="w-full text-[10px] font-black text-muted uppercase tracking-widest text-center hover:text-primary transition-colors">
                      Trouble accessing?
                   </button>
                </div>
              ) : step === 2 ? (
                <div className="space-y-4">
                   <LocationPicker onLocationFound={(addr, pin) => { setAddress(addr); setPincode(pin); }} />
                   <div className="space-y-3">
                      <input type="text" placeholder="Full Name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                      <input type="text" placeholder="Pincode" className={inputClass} value={pincode} onChange={(e) => setPincode(e.target.value)} />
                      <textarea placeholder="Delivery Address" className={`${inputClass} min-h-[80px] py-4`} value={address} onChange={(e) => setAddress(e.target.value)} />
                      <input type="password" placeholder="Create Password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)}/>
                      
                      <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Security Question</span>
                         <select className={inputClass} value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)}>
                            {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                         </select>
                         <input type="text" placeholder="Your Answer" className={inputClass} value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
                      </div>
                   </div>
                   <button onClick={handleSignup} disabled={loading} className="w-full bg-primary text-white font-black py-4.5 rounded-2xl shadow-xl">
                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'INITIALIZE ACCOUNT'}
                   </button>
                </div>
              ) : (
                <div className="space-y-5">
                   <div className="bg-blue-50/50 p-4 rounded-3xl space-y-3">
                      <div className="flex items-center gap-2 text-blue-800">
                         <ShieldAlert size={18} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Forgot Password?</span>
                      </div>
                      <p className="text-[11px] text-blue-800/60 font-bold leading-relaxed">Enter your phone and answer the security question you set during signup.</p>
                   </div>
                   
                   <input type="tel" placeholder="Mobile" className={inputClass} value={mobile} onChange={(e) => setMobile(e.target.value)}/>
                   <select className={inputClass} value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)}>
                     {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                   </select>
                   <input type="text" placeholder="Secret Answer" className={inputClass} value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
                   <input type="password" placeholder="New Password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)}/>
                   
                   <button onClick={handleResetPassword} disabled={loading} className="w-full bg-gray-900 text-white font-black py-4.5 rounded-2xl shadow-xl active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'VERIFY & RESET'}
                   </button>

                   <div className="pt-6 border-t border-gray-50 text-center space-y-4">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Still can't access?</p>
                      <CallAction 
                        title="Identity Helpdesk"
                        trigger={
                          <div className="flex items-center justify-center gap-3 bg-emerald-50 text-emerald-600 py-4 rounded-2xl border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer">
                             <PhoneCall size={18} strokeWidth={2.5} />
                             <span className="text-[11px] font-black uppercase tracking-widest leading-none">Call Office Helpdesk</span>
                          </div>
                        }
                      />
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
