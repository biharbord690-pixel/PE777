/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { 
  ArrowLeft, User, MessageSquare, Shield, Clock, 
  Settings, QrCode, ClipboardCheck, Sparkles, Check,
  Camera, BadgeCheck, Copy, Lock, LogOut, ArrowUpRight, 
  ArrowDownLeft, History, Smartphone, CreditCard, Gift, 
  CheckCircle, Plus, ChevronRight, XCircle, DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BunniesProfileProps {
  onBack: () => void;
}

export default function BunniesProfile({ onBack }: BunniesProfileProps) {
  const store = useCasinoStore();

  const [displayName, setDisplayName] = useState<string>(store.currentUser || 'Gamer');
  const [upiId, setUpiId] = useState<string>('7779915662@ybl');
  const [bioNote, setBioNote] = useState<string>('Luxury PE777 VIP Member');
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // States for relocated dashboard systems
  const [animatedBalance, setAnimatedBalance] = useState<number>(0);
  const [activeAdWatching, setActiveAdWatching] = useState<boolean>(false);

  // States for new interactive simulated Withdrawal System
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5000');
  const [withdrawBankName, setWithdrawBankName] = useState<string>('');
  const [withdrawAccNumber, setWithdrawAccNumber] = useState<string>('');
  const [withdrawHolderName, setWithdrawHolderName] = useState<string>('');
  const [withdrawIfsc, setWithdrawIfsc] = useState<string>('');
  const [withdrawalState, setWithdrawalState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [withdrawStatusMsg, setWithdrawStatusMsg] = useState<string>('');
  const [lastWithdrawTxId, setLastWithdrawTxId] = useState<string>('');

  // VIP configurations
  const VIP_TIERS = [
    { name: 'Elite Member', color: 'text-zinc-400 border-zinc-800 bg-zinc-950/20', limit: '₹1,00,000 / daily' },
    { name: 'Gold Club', color: 'text-[#e8b923] border-[#e8b923]/30 bg-amber-950/15', limit: '₹10,00,000 / daily' },
    { name: 'Imperial VIP', color: 'text-purple-400 border-purple-500/30 bg-purple-950/15', limit: 'UNLIMITED' }
  ];

  const bunnyAvatars = [
    { emoji: '🐰', bg: 'bg-gradient-to-tr from-[#e8b923]/30 to-[#e8b923]/10 border-[#e8b923]' },
    { emoji: '👑', bg: 'bg-gradient-to-tr from-purple-700/30 to-purple-800/10 border-purple-500' },
    { emoji: '💎', bg: 'bg-gradient-to-tr from-blue-700/30 to-blue-800/10 border-blue-500' },
    { emoji: '💵', bg: 'bg-gradient-to-tr from-emerald-700/30 to-emerald-800/10 border-emerald-500' },
    { emoji: '🐅', bg: 'bg-gradient-to-tr from-orange-700/30 to-orange-800/10 border-orange-500' },
    { emoji: '🎩', bg: 'bg-gradient-to-tr from-rose-700/30 to-rose-800/10 border-rose-500' },
  ];

  // Sync count up animation
  useEffect(() => {
    let start = animatedBalance;
    const end = store.coins;
    if (start === end) return;
    
    const duration = 1200; 
    const stepTime = 40;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      start += increment;
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedBalance(end);
      } else {
        setAnimatedBalance(Math.floor(start));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [store.coins]);

  useEffect(() => {
    if (store.currentUser) {
      setDisplayName(store.currentUser);
      
      const cachedBank = localStorage.getItem(`bunnies_bank_name_${store.currentUser}`);
      if (cachedBank) setWithdrawBankName(cachedBank);

      const cachedAcc = localStorage.getItem(`bunnies_acc_num_${store.currentUser}`);
      if (cachedAcc) setWithdrawAccNumber(cachedAcc);

      const cachedHolder = localStorage.getItem(`bunnies_holder_${store.currentUser}`);
      if (cachedHolder) setWithdrawHolderName(cachedHolder);

      const cachedIfsc = localStorage.getItem(`bunnies_ifsc_${store.currentUser}`);
      if (cachedIfsc) setWithdrawIfsc(cachedIfsc);

      const cachedBio = localStorage.getItem(`bunnies_bio_${store.currentUser}`);
      if (cachedBio) setBioNote(cachedBio);

      const cachedAvatar = localStorage.getItem(`bunnies_avatar_${store.currentUser}`);
      if (cachedAvatar) setAvatarIndex(parseInt(cachedAvatar, 10));
    }
  }, [store.currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    if (!displayName.trim()) {
      toast.error('Display Name cannot be empty.', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      setIsUpdating(false);
      return;
    }

    if (store.currentUser) {
      localStorage.setItem(`bunnies_bio_${store.currentUser}`, bioNote.trim());
      localStorage.setItem(`bunnies_avatar_${store.currentUser}`, avatarIndex.toString());
    }

    setTimeout(() => {
      setIsUpdating(false);
      toast.success('VIP credentials customized and synchronized!', {
        icon: '👑',
        style: { background: '#111111', color: '#e8b923', border: '1px solid #e8b923' }
      });
    }, 800);
  };

  const handleClaimRewardAd = () => {
    setActiveAdWatching(true);
    toast.success('Streaming sponsor advertisement...', { icon: '📺' });
    
    setTimeout(() => {
      setActiveAdWatching(false);
      store.addCoins(1500, 'VIP Video Sponsor Ad Claim', 'MARKET EXCHANGE', 'bonus');
      toast.success('₹1,500 credited to PE777 wallet!', {
        icon: '💎',
        style: { background: '#111', color: '#e8b923', border: '1px solid #e8b923' }
      });

      if (store.currentUser) {
         const notifyKey = `bunnies_notifs_${store.currentUser}`;
         const existing = localStorage.getItem(notifyKey);
         const list = existing ? JSON.parse(existing) : [];
         list.unshift({
           id: Date.now().toString(),
           title: '⚡ Sponsor Bounty Credited!',
           body: 'Added ₹1,500 virtual funds straight into your balance from partner ad streams.',
           time: 'Just now',
           read: false
         });
         localStorage.setItem(notifyKey, JSON.stringify(list));
      }
    }, 3000);
  };

  // Simulated cash withdrawal process
  const triggerWithdrawAction = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please specify a positive withdrawal amount.', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      return;
    }

    if (amt > store.coins) {
      toast.error(`Insufficient Balance! You only have ₹${store.coins.toLocaleString()}`, {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #ef4444' }
      });
      return;
    }

    if (!withdrawBankName.trim()) {
      toast.error('Please specify recipient Bank Name (e.g. State Bank of India, HDFC).', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      return;
    }

    if (withdrawAccNumber.trim().length < 9) {
      toast.error('Please specify a valid Bank Account Number (minimum 9 digits).', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      return;
    }

    if (!withdrawHolderName.trim()) {
      toast.error('Please specify Bank Account Holder Name.', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      return;
    }

    // 11 character Indian IFSC format
    const ifscClean = withdrawIfsc.trim().toUpperCase();
    if (ifscClean.length !== 11) {
      toast.error('Please specify a valid 11-digit alphanumeric IFSC code.', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      return;
    }

    // Persist bank inputs
    if (store.currentUser) {
      localStorage.setItem(`bunnies_bank_name_${store.currentUser}`, withdrawBankName.trim());
      localStorage.setItem(`bunnies_acc_num_${store.currentUser}`, withdrawAccNumber.trim());
      localStorage.setItem(`bunnies_holder_${store.currentUser}`, withdrawHolderName.trim());
      localStorage.setItem(`bunnies_ifsc_${store.currentUser}`, ifscClean);
    }

    setWithdrawalState('processing');
    setWithdrawStatusMsg('Contacting Fino Escrow clearing network...');

    // Play register chime
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(580, audioCtx.currentTime + 0.1);
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}
    }

    // Step-by-step progress simulation
    setTimeout(() => {
      setWithdrawStatusMsg('Validating bank routing code with RBI clearing gateway...');
    }, 1000);

    setTimeout(() => {
      setWithdrawStatusMsg('Verifying account holder identity match with escrow ledger...');
    }, 2000);

    setTimeout(() => {
      // Complete transaction
      setWithdrawalState('success');
      const genRefId = 'IMPS' + Math.floor(200000000000 + Math.random() * 799999999999).toString();
      setLastWithdrawTxId(genRefId);

      // Deduct coins in store
      store.deductCoins(amt, `Simulated IMPS Bank Cashout (Ref: ${genRefId})`, 'PE777 CASH OUT', 'withdraw');

      if (store.currentUser) {
        const notifyKey = `bunnies_notifs_${store.currentUser}`;
        const existing = localStorage.getItem(notifyKey);
        const list = existing ? JSON.parse(existing) : [];
        list.unshift({
          id: Date.now().toString(),
          title: '💸 IMPS Bank Withdrawal approved!',
          body: `Successfully processed withdrawal of ₹${amt.toLocaleString()} to ${withdrawBankName} Acc (***${withdrawAccNumber.slice(-4)}) of holder ${withdrawHolderName}. Ref: ${genRefId}`,
          time: 'Just now',
          read: false
        });
        localStorage.setItem(notifyKey, JSON.stringify(list));
      }

      // Success register sound
      if (store.settings.sound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscNode = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
          oscNode.start();
          oscNode.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
          oscNode.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
          oscNode.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6 success
          oscNode.stop(audioCtx.currentTime + 0.5);
        } catch (e) {}
      }

      toast.success(`Successfully cashed out ₹${amt.toLocaleString()}!`, {
        icon: '💵',
        style: { background: '#0a0a0c', color: '#10b981', border: '1px solid #10b981' }
      });
    }, 3200);
  };

  const handleLogout = () => {
    store.logoutUser();
    window.location.hash = '#login';
    toast.success('Safely logged out of PE777.', {
      style: { background: '#111111', color: '#fff' }
    });
  };

  const currentVIP = store.coins >= 25000 ? (store.coins >= 100000 ? VIP_TIERS[2] : VIP_TIERS[1]) : VIP_TIERS[0];
  const getTxStatusIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <CheckCircle size={12} className="text-emerald-500" />;
      case 'withdraw':
        return <XCircle size={12} className="text-red-500" />;
      default:
        return <CheckCircle size={12} className="text-[#e8b923]" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col relative overflow-y-auto pb-24 select-none">
      
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-950/25 rounded-full filter blur-[110px] pointer-events-none" />
      <div className="absolute top-[40%] right-5 w-80 h-80 bg-amber-500/5 rounded-full filter blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-20%] w-96 h-96 bg-purple-900/10 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 bg-black/85 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-zinc-900 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#e8b923] font-black block leading-none">VIP ACCOUNTS</span>
            <h1 className="text-sm font-black text-white mt-1 tracking-wide">WALLET & PROFILE HUB</h1>
          </div>
        </div>
      </header>

      {/* Core Container */}
      <div className="p-4 flex flex-col space-y-5 flex-1 relative z-10 text-left">
        
        {/* PREMIUM GOLD-SHIMMERING BALANCE CARD */}
        <div className="relative bg-gradient-to-br from-[#1c142c] via-[#0b0616] to-[#010103] border-2 border-[#e8b923]/40 rounded-3xl p-5 shadow-[0_0_25px_rgba(232,185,35,0.15)] overflow-hidden relative select-none">
          <div className="absolute top-3 right-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e8b923] animate-pulse" />
            <span className={`text-[8px] font-black uppercase tracking-widest border border-amber-600/30 px-2 py-0.5 rounded-full ${currentVIP.color}`}>
              {currentVIP.name}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.25em] block leading-none">
              NET CASH WALLET
            </span>
            <h2 className="text-3xl font-black text-white flex items-center font-mono leading-none tracking-tight">
              ₹{animatedBalance.toLocaleString()}
            </h2>
            <div className="flex items-center gap-1.5 text-[8.5px] uppercase font-bold text-zinc-400 leading-none pt-1">
              <Smartphone size={10} className="text-[#e8b923]" />
              <span>Biometric Escrow Secured • Fino Network</span>
            </div>
          </div>

          {/* Wallet Interactive tools */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => window.location.hash = '#add_cash'}
              className="py-3 px-4 bg-gradient-to-r from-purple-700 via-purple-600 to-[#e8b923] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:shadow-[0_4px_15px_rgba(232,185,35,0.2)] border-0 transform active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Plus size={14} className="stroke-[2.5]" /> Add Balance
            </button>
            <button
              onClick={() => {
                setWithdrawalState('idle');
                setWithdrawAmount('10000');
                setShowWithdrawModal(true);
              }}
              className="py-3 px-4 bg-zinc-950 hover:bg-zinc-900 border border-[#e8b923]/30 text-zinc-100 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transform active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
            >
              Withdraw Cash
            </button>
          </div>
        </div>



        {/* CHOOSE ELITE MASCOT / EMOJI */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block leading-none">
            CHOOSE ELITE MASCOT / EMOJI
          </label>
          <div className="grid grid-cols-6 gap-2">
            {bunnyAvatars.map((b, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setAvatarIndex(i)}
                className={`w-full aspect-square text-2xl flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
                  avatarIndex === i
                    ? 'bg-[#150d2c] border-[#e8b923] scale-105 shadow-[0_0_12px_rgba(232,185,35,0.3)]'
                    : 'bg-zinc-950 border-zinc-900 opacity-60 hover:opacity-100'
                }`}
              >
                {b.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* PROFILE INPUT DETAILS */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block leading-none">
              LEADER DISPLAY NAME
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-600"><User size={15} /></span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Custom Display Name"
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#e8b923]/60 rounded-xl pl-9 pr-3 py-3 text-xs text-white focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>

          {/* Status Note Field */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block leading-none">
              CUSTOM VIP STATUS LINE
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-600"><MessageSquare size={15} /></span>
              <input
                type="text"
                value={bioNote}
                maxLength={45}
                onChange={(e) => setBioNote(e.target.value)}
                placeholder="VIP Club Member Note"
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#e8b923]/60 rounded-xl pl-9 pr-3 py-3 text-xs text-white focus:outline-none transition-all text-zinc-100 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-3 bg-gradient-to-r from-purple-800 via-[#e8b923] to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_12px_rgba(232,185,35,0.2)] transition-all border-0 cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            {isUpdating ? 'Synchronising Account...' : 'Save & Sync Elite Data'}
          </button>
        </form>

        {/* SUBSECTION: RECENT TRANSFERS */}
        <div className="space-y-2.5 pt-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block leading-none">
              RECENT TRANSACTION JOURNAL
            </span>
            <span className="text-[8px] text-green-500 uppercase font-black tracking-wide">Fino Escrow Protected</span>
          </div>

          <div className="bg-[#0c0c0d] border border-zinc-900 rounded-2xl p-3divide-y divide-zinc-950/80 max-h-[220px] overflow-y-auto">
            {store.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-5 text-zinc-600 text-center">
                <History size={16} className="mb-1 text-zinc-700" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Journal Quiet</span>
                <p className="text-[9px] text-zinc-800 mt-0.5">Top-up or withdrawal actions will sync here immediately</p>
              </div>
            ) : (
              store.transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="py-2 flex items-center justify-between text-left border-b border-zinc-950 last:border-b-0">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      tx.type === 'deposit' 
                        ? 'bg-emerald-950/20 text-emerald-500 border border-emerald-900/30' 
                        : tx.type === 'withdraw'
                        ? 'bg-red-950/20 text-red-500 border border-red-900/30'
                        : 'bg-zinc-900 text-zinc-400'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                    </div>
                    <div className="truncate">
                      <h4 className="text-[11px] font-extrabold text-white truncate leading-snug">{tx.description}</h4>
                      <p className="text-[8px] text-zinc-600 font-bold font-mono mt-0.5">
                        {tx.gameName || 'FINTECH TRANS'} • {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0 pl-1">
                    <span className={`text-[11px] font-black font-mono block ${
                      tx.type === 'deposit' ? 'text-emerald-500' : tx.type === 'withdraw' ? 'text-red-400' : 'text-zinc-200'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}₹{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[7.5px] uppercase tracking-wider text-green-500 font-extrabold flex items-center justify-end gap-0.5">
                      {getTxStatusIcon(tx.type)} SUC
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="pt-2 border-t border-zinc-900">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 bg-red-950/25 hover:bg-red-950/40 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-red-950/60 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Terminate & Log Out Session</span>
          </button>
        </div>

      </div>

      {/* MODAL: COLOURFUL SIMULATED TEMPORARY WITHDRAWAL GATEWAY */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0714] border-2 border-purple-500/50 rounded-3xl w-full max-w-sm p-5 shadow-[0_0_35px_rgba(168,85,247,0.35)] text-left relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-600 to-amber-500" />
            
            {withdrawalState === 'idle' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-purple-900/30 text-[#e8b923] rounded-lg border border-purple-800/20">
                      <CreditCard size={15} />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-wider">IMPS BANK WITHDRAWAL</span>
                  </div>
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white text-xs font-extrabold"
                  >
                    Close
                  </button>
                </div>

                <div className="p-3.5 bg-purple-950/15 border border-purple-900/30 rounded-xl leading-snug">
                  <p className="text-[8.5px] text-purple-400 font-extrabold uppercase tracking-widest">Available liquidity</p>
                  <p className="text-xl font-mono font-black text-white mt-0.5">₹{store.coins.toLocaleString()}</p>
                  <p className="text-[8.5px] text-zinc-500 mt-1 leading-normal">
                    Proceed to settle and cash out coins immediately to your verified Indian Bank Account via IMPS clearing network.
                  </p>
                </div>

                {/* Form fields for Bank, Account Number, IFSC, and Holder Name */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-black tracking-widest text-[#e8b923] uppercase">Recipient Bank Name</span>
                    <input
                      type="text"
                      value={withdrawBankName}
                      onChange={(e) => setWithdrawBankName(e.target.value)}
                      placeholder="e.g. State Bank of India, HDFC"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-xl px-3 py-2 text-[11px] text-white font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8.5px] font-black tracking-widest text-purple-400 uppercase">Account Number</span>
                    <input
                      type="text"
                      value={withdrawAccNumber}
                      onChange={(e) => setWithdrawAccNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 50100991204481"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-xl px-3 py-2 text-[11px] font-mono text-white font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8.5px] font-black tracking-widest text-zinc-400 uppercase">Account Holder Name</span>
                    <input
                      type="text"
                      value={withdrawHolderName}
                      onChange={(e) => setWithdrawHolderName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-xl px-3 py-2 text-[11px] text-white font-extrabold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8.5px] font-black tracking-widest text-amber-500 uppercase">IFSC Code</span>
                    <input
                      type="text"
                      value={withdrawIfsc}
                      maxLength={11}
                      onChange={(e) => setWithdrawIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0000104, HDFC0000214"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-xl px-3 py-2 text-[11px] font-mono text-white font-black uppercase focus:outline-none"
                    />
                  </div>
                </div>

                {/* Form Amount */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[8.5px] uppercase font-black text-zinc-400">
                    <span>CASH OUT AMOUNT (₹)</span>
                    <span className="text-purple-400">Escrow Cleansed</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-zinc-500 text-xs font-black">₹</span>
                    <input
                      type="text"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 5000"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-xl pl-6 pr-3 py-2 font-mono text-xs text-white font-extrabold focus:outline-none"
                    />
                  </div>
                  
                  {/* Presets */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[1000, 5000, 20000, 100000].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setWithdrawAmount(pr.toString())}
                        className="py-1.5 bg-zinc-950 hover:bg-purple-950/20 border border-zinc-900 rounded-lg text-[9px] font-black font-sans text-purple-400 hover:text-white"
                      >
                        +₹{pr.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={triggerWithdrawAction}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer select-none border-0 text-center flex items-center justify-center gap-1.5"
                >
                  <DollarSign size={13} />
                  <span>Initiate IMPS Settlement</span>
                </button>
              </div>
            )}

            {withdrawalState === 'processing' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#e8b923]">
                    <Shield size={20} className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Encrypted Ledger Check</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal font-mono h-8 flex items-center justify-center text-center">
                    {withdrawStatusMsg}
                  </p>
                </div>
                <div className="w-full max-w-[200px] h-1 bg-zinc-950 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-purple-500 to-[#e8b923] w-2/3 animate-pulse" style={{ animationDuration: '0.8s' }} />
                </div>
              </div>
            )}

            {withdrawalState === 'success' && (
              <div className="flex flex-col items-center text-center space-y-4 select-none animate-enter">
                
                {/* Glowing Success Icon */}
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] shrink-0 animate-bounce">
                  <Check size={32} className="stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-[0.25em] bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                    IMPS APPROVAL GRANTED
                  </span>
                  <h3 className="text-lg font-black text-white uppercase">Withdrawal Success!</h3>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans max-w-[260px] mx-auto">
                    ₹{parseFloat(withdrawAmount).toLocaleString()} has been safely debited from your escrow account and routed via IMPS bank clearing wire.
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="w-full bg-[#0a0614] border border-zinc-900 rounded-2xl p-4.5 space-y-2 text-left font-sans shadow-inner">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">Settlement Net</span>
                    <span className="text-white font-mono uppercase tracking-tight font-black">IMPS Bank Wiring</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">Paid out To</span>
                    <span className="text-[#e8b923] font-mono text-right truncate max-w-[170px] font-black uppercase">{withdrawBankName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">Account Holder</span>
                    <span className="text-purple-400 font-mono text-right truncate max-w-[170px] font-bold">{withdrawHolderName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">Reference Ref ID</span>
                    <span className="text-zinc-300 font-mono font-semibold tracking-tighter text-right">{lastWithdrawTxId}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold pt-1.5 border-t border-zinc-950/80">
                    <span className="text-zinc-400 uppercase font-black">Net Deducted</span>
                    <span className="text-red-400 font-mono font-black text-xs leading-none">-₹{parseFloat(withdrawAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-400 uppercase font-black">Remaining Balance</span>
                    <span className="text-[#e8b923] font-mono font-black text-xs leading-none font-black">₹{store.coins.toLocaleString()}</span>
                  </div>
                </div>

                {/* Confirm closing button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawalState('idle');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-950 hover:opacity-90 select-none transition-all cursor-pointer border-0 text-center"
                >
                  Return to Portfolio
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
