/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { 
  ArrowLeft, Coins, CreditCard, ChevronRight, CheckCircle2, 
  XCircle, Clock, Copy, Download, Share2, Sparkles, ShieldCheck,
  Smartphone, QrCode, ArrowDownRight, RefreshCw, Send, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BunniesWalletProps {
  onBack: () => void;
  onRequestViewNotifications: () => void;
}

export default function BunniesWallet({ onBack, onRequestViewNotifications }: BunniesWalletProps) {
  const store = useCasinoStore();

  const [topUpAmount, setTopUpAmount] = useState<string>('2500');
  const [selectedApp, setSelectedApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'qr'>('phonepe');
  
  // Payment processing states
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'verify' | 'success' | 'failed'>('input');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [lastTxId, setLastTxId] = useState<string>('');
  const [processingTimer, setProcessingTimer] = useState<number>(0);
  const [userCustomUPI, setUserCustomUPI] = useState<string>('7779915662@ybl');

  // Load user's UPI or use default
  useEffect(() => {
    if (store.currentUser) {
      const savedUPI = localStorage.getItem(`bunnies_upi_${store.currentUser}`);
      if (savedUPI) setUserCustomUPI(savedUPI);
    }
  }, [store.currentUser]);

  // Handle auto timer countdowns
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === 'processing' && processingTimer > 0) {
      interval = setInterval(() => {
        setProcessingTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPaymentStep('verify');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentStep, processingTimer]);

  const handleQuickPreset = (amount: number) => {
    setTopUpAmount(amount.toString());
    // Audio tick
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (e) {}
    }
  };

  const initiatePayment = () => {
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid luxury Top-up amount.', {
        style: { background: '#131313', color: '#fff', border: '1px solid #dc2626' }
      });
      return;
    }
    if (amt < 100) {
      toast.error('Minimum elite load amount is ₹100.', {
        style: { background: '#131313', color: '#fff', border: '1px solid #dc2626' }
      });
      return;
    }

    // Set transaction ID
    const generatedTxId = 'TXN' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setLastTxId(generatedTxId);
    
    // Smooth transition
    setPaymentStep('processing');
    setProcessingTimer(3); // 3 seconds security pre-handshake

    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {}
    }
  };

  const confirmUtrSubmission = (forceSuccess = true) => {
    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length !== 12 || !/^\d+$/.test(cleanUtr)) {
      toast.error('Please enter a valid 12-digit numeric UPI UTR number to verify.', {
        id: 'utr-error',
        style: { background: '#131313', color: '#fff', border: '1px solid #ef4444' }
      });
      return;
    }

    const amt = parseFloat(topUpAmount);
    let bonusAmt = 0;
    if (amt === 100) bonusAmt = 7;
    else if (amt === 500) bonusAmt = 50;
    else if (amt === 1000) bonusAmt = 100;

    const totalCredited = amt + bonusAmt;

    if (forceSuccess) {
      setPaymentStep('success');

      // Update coins in store
      store.addCoins(totalCredited, `UPI Top-up (Deposit: ₹${amt} + Bonus: ₹${bonusAmt}) UTR: ${cleanUtr}`, 'PE777 PAY', 'deposit');

      // Register mock transaction push
      if (store.currentUser) {
        const notifyKey = `bunnies_notifs_${store.currentUser}`;
        const existing = localStorage.getItem(notifyKey);
        const list = existing ? JSON.parse(existing) : [];
        list.unshift({
          id: Date.now().toString(),
          title: '💰 Wallet Credited!',
          body: `Successfully loaded ₹${amt.toLocaleString()} + ₹${bonusAmt} Promo Bonus via ${selectedApp === 'qr' ? 'UPI QR' : selectedApp.toUpperCase()}. UTR: ${cleanUtr}`,
          time: 'Just now',
          read: false
        });
        localStorage.setItem(notifyKey, JSON.stringify(list));
      }

      // Success Sound
      if (store.settings.sound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
          osc1.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
          osc1.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4 -> harmonize
          osc2.frequency.setValueAtTime(329.63, audioCtx.currentTime + 0.1);
          osc2.frequency.setValueAtTime(392.00, audioCtx.currentTime + 0.2);
          osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.3);

          gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
          osc1.start();
          osc2.start();
          osc1.stop(audioCtx.currentTime + 0.5);
          osc2.stop(audioCtx.currentTime + 0.5);
        } catch (e) {}
      }

      toast.success(`💎 ₹${amt.toLocaleString()} added successfully to wallet!`, {
        duration: 4500,
        icon: '👑',
        style: { background: '#111111', color: '#e8b923', border: '1px solid #e8b923' }
      });
    } else {
      setPaymentStep('failed');
      if (store.settings.sound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {}
      }
      toast.error('Top-up transaction declined or verification failed.', {
        style: { background: '#111111', color: '#fff', border: '1px solid #ef4444' }
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`, {
      style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e8b923' }
    });
  };

  // Preset quick grids
  const PRESET_VALUES = [100, 500, 1000, 2000, 5000, 10000, 25000];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col relative overflow-hidden select-none pb-20">
      
      {/* Decorative Gold & Purple Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-purple-900/15 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-80 h-80 bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-zinc-900 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest text-[#e8b923] font-bold block leading-none">PE777 FINANCIAL</span>
            <h1 className="text-sm font-black text-white mt-0.5">ELITE WALLET TOP-UP</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800/80 px-2.5 py-1 rounded-full">
          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wide font-sans mr-0.5">CASH:</span>
          <span className="text-xs font-black text-[#e8b923] font-mono">
            ₹{store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* STAGE 1: ENTER AMOUNT & METHOD */}
      {paymentStep === 'input' && (
        <div className="p-4 flex-1 flex flex-col space-y-4">
          
          {/* Top-Up Banner Illustration */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-1 z-10 max-w-[60%]">
              <span className="text-[9px] font-black text-[#e8b923] uppercase tracking-[0.2em] block">SECURE END-TO-END</span>
              <h3 className="text-md font-extrabold text-white leading-tight">Instant UPI Settlement Gateway</h3>
              <p className="text-[10px] text-zinc-400 leading-snug">
                Supported natively by Google Pay, PhonePe & Paytm. Automatic Fino bank secure approval layer.
              </p>
            </div>
            {/* Illustrated Gold Card from AI Assets! */}
            <div className="absolute right-[-10px] bottom-[-20px] w-36 h-36 opacity-35 filter blur-[1px] transform rotate-[15deg]">
              <img 
                src="/src/assets/images/bunny_card_illustration_1781800152051.jpg"
                alt="Fintech Gold Card"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Real-time cash incentives label */}
          <div className="bg-[#1a1135]/90 border border-purple-500/30 rounded-2xl p-3.5 flex flex-col text-left space-y-1 my-1">
            <span className="text-[9px] font-black tracking-wider text-purple-400 uppercase">✨ EXCLUSIVE TOP-UP CASHBACK RULES</span>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              <div className="bg-black/40 border border-zinc-800/80 rounded-lg p-1.5 text-center">
                <span className="text-[10px] block font-mono text-zinc-400">Recharge ₹100</span>
                <span className="text-[11px] font-black text-[#e8b923] font-mono leading-none">+₹7 Bonus</span>
              </div>
              <div className="bg-black/40 border border-[#e8b923]/20 rounded-lg p-1.5 text-center">
                <span className="text-[10px] block font-mono text-zinc-400">Recharge ₹500</span>
                <span className="text-[11px] font-black text-amber-400 font-mono leading-none">+₹50 Bonus</span>
              </div>
              <div className="bg-black/40 border border-purple-500/20 rounded-lg p-1.5 text-center">
                <span className="text-[10px] block font-mono text-zinc-400">Recharge ₹1000</span>
                <span className="text-[11px] font-black text-purple-400 font-mono leading-none">+₹100 Bonus</span>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-gradient-to-b from-[#121212] to-black border border-zinc-800/70 rounded-2xl p-5 shadow-inner">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-2 text-left">
              ENTER TOP-UP AMOUNT (INR)
            </label>
            <div className="relative flex items-center justify-center">
              <span className="absolute left-4 text-3xl font-black text-[#e8b923] font-mono">₹</span>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-[#e8b923]/60 rounded-2xl py-4.5 pl-12 pr-4 text-center text-3xl font-black text-white focus:outline-none transition-all font-mono placeholder-zinc-800 tracking-wide"
              />
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-1.5 mt-3.5">
              {PRESET_VALUES.slice(0, 4).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickPreset(amt)}
                  className={`py-2 px-1 text-[11px] font-mono font-black border rounded-xl transition-all cursor-pointer ${
                    topUpAmount === amt.toString()
                      ? 'bg-gradient-to-r from-[#e8b923] to-amber-500 text-neutral-950 border-[#e8b923] scale-[1.03] shadow'
                      : 'bg-zinc-900/60 text-zinc-300 border-zinc-800/80 hover:bg-zinc-800'
                  }`}
                >
                  +₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 mt-1.5">
              {PRESET_VALUES.slice(4, 7).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickPreset(amt)}
                  className={`py-2 px-1 text-[11px] font-mono font-black border rounded-xl transition-all cursor-pointer ${
                    topUpAmount === amt.toString()
                      ? 'bg-gradient-to-r from-purple-600 to-[#e8b923] text-white border-purple-500 scale-[1.03] shadow'
                      : 'bg-zinc-900/60 text-zinc-300 border-zinc-800/80 hover:bg-zinc-800'
                  }`}
                >
                  +₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Select UPI Payment Application */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block leading-none">
              CHOOSE SECURE UPI METHOD
            </span>
            <div className="grid grid-cols-1 gap-2">
              
              {/* PhonePe */}
              <button
                type="button"
                onClick={() => setSelectedApp('phonepe')}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer text-left ${
                  selectedApp === 'phonepe'
                    ? 'bg-purple-950/20 border-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                    : 'bg-[#121212]/80 border-zinc-900 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white text-lg font-black shrink-0 relative overflow-hidden">
                    पे
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">PhonePe UPI APP</h4>
                    <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-bold">Recommended Instant Autopay</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedApp === 'phonepe' ? 'border-purple-400 bg-purple-500' : 'border-zinc-700'}`}>
                  {selectedApp === 'phonepe' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
              </button>

              {/* Google Pay */}
              <button
                type="button"
                onClick={() => setSelectedApp('gpay')}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer text-left ${
                  selectedApp === 'gpay'
                    ? 'bg-blue-950/20 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'bg-[#121212]/80 border-zinc-900 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-green-600 to-yellow-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                    GPay
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Google Pay (G-Pay)</h4>
                    <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-bold">Fast Token Authorization</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedApp === 'gpay' ? 'border-blue-400 bg-blue-500' : 'border-zinc-700'}`}>
                  {selectedApp === 'gpay' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
              </button>

              {/* Paytm */}
              <button
                type="button"
                onClick={() => setSelectedApp('paytm')}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer text-left ${
                  selectedApp === 'paytm'
                    ? 'bg-cyan-950/20 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-[#121212]/80 border-zinc-900 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600 flex flex-col items-center justify-center text-white shrink-0 font-sans font-bold leading-none">
                    <span className="text-[10px]">pay</span>
                    <span className="text-[11px] font-black -mt-0.5">tm</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Paytm Secure Banking</h4>
                    <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-bold">Includes Net Banking & Wallets</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedApp === 'paytm' ? 'border-cyan-400 bg-cyan-500' : 'border-zinc-700'}`}>
                  {selectedApp === 'paytm' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
              </button>

              {/* QR Code / Share */}
              <button
                type="button"
                onClick={() => setSelectedApp('qr')}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all cursor-pointer text-left ${
                  selectedApp === 'qr'
                    ? 'bg-amber-950/20 border-[#e8b923] text-white shadow-[0_0_12px_rgba(232,185,35,0.15)]'
                    : 'bg-[#121212]/80 border-zinc-900 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e8b923] flex items-center justify-center text-zinc-950 shrink-0">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Scan UPI Merchant QR Code</h4>
                    <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-bold">Scan with any UPI app</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedApp === 'qr' ? 'border-[#e8b923] bg-[#e8b923]' : 'border-zinc-700'}`}>
                  {selectedApp === 'qr' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
              </button>

            </div>
          </div>

          <button
            type="button"
            onClick={initiatePayment}
            className="w-full py-4.5 bg-gradient-to-r from-purple-600 via-[#e8b923] to-amber-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/10 cursor-pointer border-0 mt-3 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Smartphone size={14} className="stroke-[2.5]" />
            Proceed to Pay ₹{parseFloat(topUpAmount || '0').toLocaleString()}
          </button>
        </div>
      )}

      {/* STAGE 2: PROCESSING SECURITY GATEWAY */}
      {paymentStep === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            <RefreshCw size={52} className="text-[#e8b923] animate-spin stroke-[1.5]" />
            <div className="absolute inset-0 border-4 border-dashed border-purple-500 rounded-full animate-pulse opacity-40" />
          </div>

          <span className="text-[10px] tracking-[0.25em] font-black uppercase text-purple-400">FINO PAYMENTS INITIATIVE</span>
          <h2 className="text-xl font-extrabold text-white mt-1">Establishing Secure Connection...</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed mt-2.5">
            Communication channels with <span className="font-bold text-white">UPI Secure Gateway</span> are initializing. Do not close this app or press the back key.
          </p>

          <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 mt-6 flex items-center justify-between text-left font-mono text-[11px] text-zinc-400">
            <span>UTR Handshake Status:</span>
            <span className="text-green-400 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              ONLINE (0{processingTimer}s)
            </span>
          </div>
        </div>
      )}

      {/* STAGE 3: VERIFY TRANSACTION UTR/QR DETAILS */}
      {paymentStep === 'verify' && (
        <div className="p-4 flex-1 flex flex-col space-y-4 text-left">
          
          <div className="text-center mb-1">
            <div className="inline-flex p-2 bg-purple-950/40 border border-purple-500/20 rounded-full text-purple-400 mb-2">
              <QrCode size={20} />
            </div>
            <h2 className="text-lg font-black text-white">Complete & Verify Payment</h2>
            <p className="text-[10px] text-zinc-400 max-w-xs mx-auto mt-0.5 leading-snug">
              Open your selected UPI app, complete the transfer to the official merchant, then paste the 12-digit UTR/Ref code here.
            </p>
          </div>

          {/* QR Screen Display, similar to PhonePe QR screenshot attachment! */}
          <div className="bg-white text-zinc-950 rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-neutral-300 relative">
            
            {/* Top Bar matching screenshot */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 rounded text-[8px] font-black tracking-widest text-[#e8b923] bg-zinc-950 uppercase">
                  PE777
                </div>
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Luxe Merchant</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
                ?
              </div>
            </div>

            {/* MY QR Box */}
            <div className="text-center font-bold tracking-widest text-[20px] text-zinc-400 opacity-60 mb-2 font-sans select-none">
              MY QR
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col items-center border border-zinc-100 relative">
              <span className="text-[9px] font-black text-purple-800 uppercase tracking-widest block mb-1">Fino Payments — Elite</span>
              
              {/* Actual customizable QR simulation - FIXED to generate a real working dynamic QR code */}
              <div className="w-48 h-48 bg-white border-2 border-zinc-950 rounded-xl p-2 relative flex items-center justify-center shadow-md">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=7779915662@ybl&pn=Yadav&am=${topUpAmount}&cu=INR`)}`}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
                
                {/* Simulated center phonepe/upi logo */}
                <div className="absolute w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white z-10 select-none font-sans">
                  पे
                </div>

                {/* Outer corners target markers */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-zinc-950 pointer-events-none" />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-zinc-950 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-zinc-950 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-zinc-950 pointer-events-none" />
              </div>
            </div>

            {/* Bottom Actions from screenshot */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                type="button"
                onClick={() => toast.success('QR Code saved to gallery.', { style: { background: '#1c1c1c', color: '#fff' }})}
                className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[10px] font-black text-zinc-800 flex items-center justify-center gap-1 cursor-pointer border-0"
              >
                <Download size={11} /> Download
              </button>
              <button 
                type="button"
                onClick={() => toast.success('UPI details shared.', { style: { background: '#1c1c1c', color: '#fff' }})}
                className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[10px] font-black text-zinc-800 flex items-center justify-center gap-1 cursor-pointer border-0"
              >
                <Share2 size={11} /> Share
              </button>
            </div>
          </div>

          {/* Secure Instruction Warning */}
          <div className="bg-[#121212] border border-zinc-900 rounded-xl p-3 flex gap-2.5">
            <ShieldCheck size={26} className="text-[#e8b923] shrink-0" />
            <div className="text-left leading-normal">
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block">SECURITY SHIELD PROTECTION</span>
              <p className="text-[10px] text-zinc-500 leading-snug mt-0.5">
                Pay exactly <span className="text-white font-extrabold">₹{parseFloat(topUpAmount || '0').toLocaleString()}</span> using GPay, PhonePe or Paytm to the QR code above. Enter the 12-digit transaction reference number below for instant top-up logic check.
              </p>
            </div>
          </div>

          {/* UTR Input Section */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block leading-none">
              ENTER 12-DIGIT UPI REF / UTR CODE
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={12}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 627192837492"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#e8b923]/60 focus:ring-1 focus:ring-amber-500/20 rounded-xl px-3 py-3 text-sm text-white focus:outline-none transition-all placeholder-zinc-700 font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setUtrNumber(Math.floor(620000000000 + Math.random() * 379999999999).toString())}
                className="absolute right-2 px-2.5 py-1.5 bg-neutral-900 border border-zinc-800/80 rounded-lg text-[9px] font-bold text-[#e8b923] uppercase tracking-wide hover:bg-neutral-800 transition-all cursor-pointer"
                title="Simulate copy real transaction reference code"
              >
                Auto-Fill
              </button>
            </div>
          </div>

          {/* Control Verification Buttons */}
          <div className="flex gap-2.5 pt-1.5">
            <button
              onClick={() => confirmUtrSubmission(false)}
              className="flex-1 py-3.5 bg-zinc-950 border border-[#ef4444]/30 text-red-500 hover:bg-red-950/10 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
            >
              Simulate FAIL
            </button>
            <button
              onClick={() => confirmUtrSubmission(true)}
              className="flex-[2] py-3.5 bg-gradient-to-r from-amber-500 to-[#e8b923] text-black font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_4px_12px_rgba(232,185,35,0.15)] border-0 flex items-center justify-center gap-1"
            >
              Submit & Verify Top-Up
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: TRANSACTION SUCCESS RECEIPT */}
      {paymentStep === 'success' && (
        <div className="p-4 flex-1 flex flex-col justify-center space-y-4">
          
          <div className="relative bg-gradient-to-b from-[#111111] to-black border-2 border-[#e8b923]/30 rounded-3xl p-6 shadow-2xl relative text-center">
            
            {/* Elegant luxury background particles */}
            <div className="absolute top-3 left-4 flex gap-1 opacity-20 text-[10px]">✨💎</div>
            <div className="absolute bottom-3 right-4 flex gap-1 opacity-20 text-[10px]">💎✨</div>

            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-[#e8b923] to-yellow-400 rounded-full flex items-center justify-center mx-auto text-black shadow-lg shadow-[#e8b923]/25 mb-4 animate-bounce">
              <CheckCircle2 size={34} className="stroke-[2.5]" />
            </div>

            <span className="text-[10px] uppercase font-black tracking-[0.25em] text-[#e8b923] block leading-none">TRANSACTION COMPLETED</span>
            <h2 className="text-2xl font-black text-white mt-1">₹{parseFloat(topUpAmount || '0').toLocaleString()} Credited</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">UTR REFERENCE ID: {utrNumber || '682192837482'}</p>

            {/* Receipt Table */}
            <div className="border-t border-b border-zinc-900 my-5 py-4 space-y-3 font-mono text-[11px] text-zinc-400 text-left">
              <div className="flex justify-between">
                <span>Receiver Gateway:</span>
                <span className="text-white font-extrabold">BUNNIES ESCROW MERCH</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Bank:</span>
                <span className="text-zinc-300 font-semibold">Fino Payments Bank Ltd</span>
              </div>
              <div className="flex justify-between">
                <span>UPI Method:</span>
                <span className="text-zinc-100 font-extrabold uppercase">{selectedApp === 'qr' ? 'UPI QR' : selectedApp} Wallet</span>
              </div>
              <div className="flex justify-between">
                <span>Security Token:</span>
                <span className="text-[#e8b923] font-bold">{lastTxId || 'TXN192837491029'}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-zinc-300">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-900 pt-2.5 mt-2.5 text-xs">
                <span className="font-sans font-bold text-zinc-300">Net Settled Balance:</span>
                <span className="text-[#e8b923] font-black font-mono">₹{store.coins.toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt share actions */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  toast.success('Receipt receipt PDF saved into local downloads.', {
                    style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e8b923' }
                  });
                }}
                className="py-3 px-3 border border-zinc-800 hover:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer bg-transparent"
              >
                <Download size={13} /> Save PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Sharing link copied to clipboard.', {
                    style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' }
                  });
                }}
                className="py-3 px-3 bg-[#e8b923] text-black hover:bg-amber-500 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer border-0"
              >
                <Share2 size={13} /> Share Link
              </button>
            </div>
          </div>

          <button
            onClick={() => setPaymentStep('input')}
            className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-300 font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            Load Another Balance
          </button>
          
          <button
            onClick={onBack}
            className="w-full py-4.5 bg-gradient-to-r from-purple-700 via-purple-600 to-[#e8b923] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl cursor-pointer border-0 transform active:scale-95 transition-all text-center"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {/* STAGE 5: TRANSACTION FAILURE */}
      {paymentStep === 'failed' && (
        <div className="p-4 flex-1 flex flex-col justify-center space-y-4 text-center">
          <div className="bg-gradient-to-b from-[#111111] to-black border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="w-16 h-16 bg-red-600/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 shadow mb-2">
              <XCircle size={36} className="stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-red-500 block leading-none">PAYMENT DECLINED</span>
              <h2 className="text-xl font-extrabold text-white">Verification Rejected</h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-normal">
                The Fino escrow verification engine could not validate the reference number <span className="font-mono text-zinc-300">"{utrNumber || 'None'}"</span>.
              </p>
            </div>

            <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-3 flex gap-2 text-left text-[11px] text-zinc-400">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="leading-snug">
                Please ensure you double check the 12-digit UTR/Ref code displayed inside Google Pay/PhonePe app details and paste it correctly.
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setPaymentStep('input')}
                className="flex-1 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                Quit
              </button>
              <button
                onClick={() => setPaymentStep('verify')}
                className="flex-[2] py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black uppercase tracking-wider text-white cursor-pointer border-0"
              >
                Edit Reference Code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
