/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCasinoStore } from '../store';
import { ShieldCheck, User, Lock, Eye, EyeOff, Sparkles, Key, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import lobbyImg from '../assets/images/pe777_slots_lobby_1781925818795.jpg';

interface BunniesLoginProps {
  onSuccess: () => void;
}

export default function BunniesLogin({ onSuccess }: BunniesLoginProps) {
  const store = useCasinoStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      toast.error('Please enter a display username.', {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #dc2626' }
      });
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 4) {
      toast.error('Security password must be at least 4 characters.', {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #dc2626' }
      });
      setIsLoading(false);
      return;
    }

    if (activeTab === 'register') {
      if (cleanUsername === 'ahirgaming') {
        toast.error('Username is already taken!', {
          style: { background: '#1c1c1c', color: '#fff', border: '1px solid #dc2626' }
        });
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Confirmation passwords do not match.', {
          style: { background: '#1c1c1c', color: '#fff', border: '1px solid #dc2626' }
        });
        setIsLoading(false);
        return;
      }

      // Perform store actions
      const res = store.registerUser(cleanUsername, password);
      if (res.success) {
        toast.success(`Welcome to PE777! Account registered with ₹10 Login Bonus!`, {
          icon: '🎁',
          style: { background: '#111', color: '#e8b923', border: '1px solid #e8b923' }
        });

        // Auto login right away
        store.loginUser(cleanUsername, false);
        onSuccess();
      } else {
        toast.error(res.message, {
          style: { background: '#1c1c1c', color: '#fff' }
        });
      }
    } else {
      // Check bypass credentials for owner account
      if (cleanUsername === 'ahirgaming') {
        if (password !== '854336') {
          toast.error('Invalid credentials or unauthorized access.', {
            style: { background: '#1c1c1c', color: '#fff', border: '1px solid #dc2626' }
          });
          setIsLoading(false);
          return;
        }
        // Save/force metadata quietly
        localStorage.setItem('jw777_coins_ahirgaming', '5000');
        const usersStr = localStorage.getItem('jw777_users');
        const users = usersStr ? JSON.parse(usersStr) : {};
        if (!users['ahirgaming']) {
          users['ahirgaming'] = { password: '854336', coins: 5000, createdAt: Date.now() };
          localStorage.setItem('jw777_users', JSON.stringify(users));
        }
      }

      // Login mode
      const res = store.loginUser(cleanUsername, false);
      if (res.success) {
        if (cleanUsername === 'ahirgaming') {
          store.setCoins(5000);
          toast.success(`Welcome back, VIP Owner!`, {
            icon: '👑',
            style: { background: '#111', color: '#e8b923', border: '1px solid #e8b923' }
          });
        } else {
          toast.success(`Welcome back, verified VIP user ${cleanUsername}!`, {
            icon: '✨',
            style: { background: '#111', color: '#e8b923', border: '1px solid #e8b923' }
          });
        }
        onSuccess();
      } else {
        toast.error(res.message, {
          style: { background: '#1c1c1c', color: '#fff' }
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-transparent text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      
      {/* Glow overlays */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/15 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 z-10 py-6 animate-fade-in">
        
        {/* Brand visual header */}
        <div className="text-center space-y-2">
          {/* Animated Mascot logo */}
          <div className="relative w-28 h-28 mx-auto border-2 border-amber-400 p-1 rounded-full bg-gradient-to-tr from-neutral-900 to-purple-950/40 shadow-[0_0_20px_rgba(232,185,35,0.45)] overflow-hidden mb-3.5">
            <img 
              src={lobbyImg}
              alt="Mascot Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] tracking-[0.25em] text-[#e8b923] font-black uppercase block leading-none">
              PE777 MOBILE SUPERPORTAL
            </span>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-200 to-[#e8b923] uppercase tracking-wider">
              PE777 Elite
            </h1>
            <p className="text-[10px] text-cyan-300 font-semibold uppercase leading-relaxed max-w-[280px] mx-auto">
              Simulated mobile UPI payment cards, secure top-ups, and luxury entertainment lobby.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-indigo-950/45 p-1 rounded-xl border border-cyan-500/25 flex shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 text-black font-black shadow-[0_0_10px_rgba(236,72,153,0.45)]'
                : 'text-cyan-400 hover:text-white'
            }`}
          >
            Access Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 text-black font-black shadow-[0_0_10px_rgba(236,72,153,0.45)]'
                : 'text-cyan-400 hover:text-white'
            }`}
          >
            Register VIP
          </button>
        </div>

        {/* Secure Form */}
        <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-fuchsia-500/25 rounded-3xl p-5 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.6),_0_0_15px_rgba(236,72,153,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest block leading-none">
                VERIFIED USERNAME
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-cyan-400"><User size={14} /></span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. administrator"
                  className="w-full bg-slate-950/90 border border-cyan-500/30 focus:border-[#e8b923] focus:ring-1 focus:ring-amber-500/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white focus:outline-none transition-all font-semibold font-mono placeholder-indigo-300/30"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest block leading-none">
                SECURITY PASSWORD
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-cyan-400"><Lock size={14} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/90 border border-cyan-500/30 focus:border-[#e8b923] focus:ring-1 focus:ring-amber-500/10 rounded-xl pl-9 pr-10 py-3 text-xs text-white focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-cyan-400 hover:text-white transition-all cursor-pointer border-0 bg-transparent p-0"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register Mode only) */}
            {activeTab === 'register' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[9px] font-extrabold text-pink-400 uppercase tracking-widest block leading-none">
                  CONFIRM PASSWORD
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-pink-400"><Key size={14} /></span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/90 border border-pink-500/30 focus:border-[#e8b923] focus:ring-1 focus:ring-amber-500/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>
            )}

            {/* Action Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 button-3d-gold hover:scale-[1.01] rounded-xl font-extrabold text-xs uppercase tracking-widest cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md"
            >
              <ShieldCheck size={14} />
              {activeTab === 'login' ? 'Confirm & Authorize' : 'Initialize VIP Account'}
            </button>
          </form>
        </div>

        {/* Bottom security warning */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-600 uppercase font-bold tracking-wider leading-none">
          <AlertCircle size={10} />
          <span>Fino Merchant End-to-end Encrypted Layer</span>
        </div>
      </div>
    </div>
  );
}
