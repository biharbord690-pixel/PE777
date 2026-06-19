/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Bell, BellOff, Trash2, Check, Sparkles, Send, Coins, ShieldCheck, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BunniesNotificationProps {
  onBack: () => void;
  onNavigateToTopUp: () => void;
}

interface PushMessage {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function BunniesNotification({ onBack, onNavigateToTopUp }: BunniesNotificationProps) {
  const store = useCasinoStore();

  const [notifications, setNotifications] = useState<PushMessage[]>([]);
  const [pushesEnabled, setPushesEnabled] = useState<boolean>(true);

  // Load notifications
  useEffect(() => {
    if (store.currentUser) {
      const notifyKey = `bunnies_notifs_${store.currentUser}`;
      const existing = localStorage.getItem(notifyKey);
      if (existing) {
        setNotifications(JSON.parse(existing));
      } else {
        // Hydrate with initial messages
        const initial = [
          {
            id: '1',
            title: '👑 Welcome to PE777!',
            body: 'Congratulations on joining the world’s quietest premium financial app. Explore glassmorphic dashboards & secure UPI transfers instantly.',
            time: '2 hours ago',
            read: false,
          },
          {
            id: '2',
            title: '✨ 7-Day Checks Ready',
            body: 'Your Daily Elite Check-in reward of ₹1,000 is waiting to be claimed under Profile Perks calendars.',
            time: '5 hours ago',
            read: true,
          }
        ];
        localStorage.setItem(notifyKey, JSON.stringify(initial));
        setNotifications(initial);
      }

      // Read preference
      const pref = localStorage.getItem(`bunnies_pref_pushes_${store.currentUser}`);
      if (pref !== null) {
        setPushesEnabled(pref === 'true');
      }
    }
  }, [store.currentUser]);

  const handleTogglePushes = () => {
    const newVal = !pushesEnabled;
    setPushesEnabled(newVal);
    if (store.currentUser) {
      localStorage.setItem(`bunnies_pref_pushes_${store.currentUser}`, newVal.toString());
    }
    toast.success(newVal ? 'Instant App Alerts enabled.' : 'App Alerts muted.', {
      style: { background: '#1c1c1c', color: '#fff' }
    });
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (store.currentUser) {
      localStorage.setItem(`bunnies_notifs_${store.currentUser}`, JSON.stringify(updated));
    }
    toast.success('All messages marked as read.', { icon: '✔️' });
  };

  const handleClearAll = () => {
    setNotifications([]);
    if (store.currentUser) {
      localStorage.setItem(`bunnies_notifs_${store.currentUser}`, JSON.stringify([]));
    }
    toast.success('Notification Log cleared.');
  };

  // Simulate receiving a push notification in real-time
  const triggerSimulatedAlert = (type: 'payment' | 'reward' | 'security') => {
    if (!pushesEnabled) {
      toast.error('Alerts are currently muted. Enable pushes to receive updates!', {
        style: { background: '#1c1c1c', color: '#fff' }
      });
      return;
    }

    let item: PushMessage;
    if (type === 'payment') {
      const amt = [500, 1000, 2500, 5000, 10000][Math.floor(Math.random() * 5)];
      const app = ['PhonePe', 'Google Pay', 'Paytm'][Math.floor(Math.random() * 3)];
      item = {
        id: Date.now().toString(),
        title: '💰 UPI Deposit Credited',
        body: `₹${amt.toLocaleString()} has been successfully credit-verified through Fino Escrow using modern ${app}. Balance updated.`,
        time: 'Just now',
        read: false,
      };
      
      // Auto Credit coins so it acts real!
      store.addCoins(amt, `Simulated Auto-Received ${app} Top-Up`, 'NOTIFS SIMULATOR', 'deposit');
    } else if (type === 'reward') {
      const rewardAmt = 500;
      item = {
        id: Date.now().toString(),
        title: '🎁 Daily Streak Bonus Auto-Awarded',
        body: `Congratulations! Your VIP Account has been auto-gifted +₹${rewardAmt} daily premium currency reward. Keep thriving!`,
        time: 'Just now',
        read: false,
      };
      store.addCoins(rewardAmt, `Daily Auto Notif Incentive`, 'BONUS REWARD', 'bonus');
    } else {
      item = {
        id: Date.now().toString(),
        title: '🚨 Fino Payment Gateway Shield On',
        body: 'Biometric authorization check passed. Encryption layer successfully re-generated for UPI handle ' + (localStorage.getItem(`bunnies_upi_${store.currentUser}`) || '7779915662@ybl'),
        time: 'Just now',
        read: false,
      };
    }

    const updated = [item, ...notifications];
    setNotifications(updated);
    if (store.currentUser) {
      localStorage.setItem(`bunnies_notifs_${store.currentUser}`, JSON.stringify(updated));
    }

    // Play push trigger sound
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 high
        gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.12); // C6 highest chime
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {}
    }

    // Custom stylized react-hot-toast conforming to the user request screenshot theme
    toast.custom((t) => (
      <div 
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-[#111111]/95 text-white border border-[#e8b923]/30 shadow-2xl rounded-2xl flex p-4 pointer-events-auto backdrop-blur-md relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-600 to-[#e8b923]" />
        
        <div className="flex-1 pl-2.5">
          <div className="flex items-center gap-1.5">
            <Smartphone size={13} className="text-[#e8b923]" />
            <span className="text-[10px] font-black tracking-widest text-[#e8b923] uppercase">BUNNIES LIVE ALERT</span>
          </div>
          <p className="text-xs font-black mt-1 text-white">{item.title}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{item.body}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-3 self-start text-zinc-600 hover:text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer border-0 bg-transparent font-sans"
        >
          Dismiss
        </button>
      </div>
    ), { duration: 4500 });
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col relative overflow-hidden select-none pb-20">
      
      {/* Glow */}
      <div className="absolute top-[20%] right-[-10%] w-60 h-60 bg-purple-950/20 rounded-full filter blur-[100px] pointer-events-none" />

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
            <span className="text-[9px] uppercase tracking-widest text-[#e8b923] font-bold block leading-none">ALERTS JOURNAL</span>
            <h1 className="text-sm font-black text-white mt-0.5">NOTIFICATION LOG</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTogglePushes}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
          title={pushesEnabled ? 'Mute critical alerts' : 'Unmute critical alerts'}
        >
          {pushesEnabled ? <Bell size={18} className="text-[#e8b923]" /> : <BellOff size={18} />}
        </button>
      </header>

      <div className="p-4 flex-1 flex flex-col space-y-4">
        
        {/* Toggle Panel Display */}
        <div className="bg-[#111111]/90 rounded-2xl p-4 border border-zinc-900 flex items-center justify-between">
          <div className="text-left max-w-[70%]">
            <h4 className="text-xs font-black text-white">Dynamic Push Subsystems</h4>
            <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 leading-relaxed">
              {pushesEnabled ? '🟢 Alerts are active & listening inside viewport' : '🔴 Alerts are silenced'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePushes}
            className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border ${
              pushesEnabled 
                ? 'bg-purple-950/10 text-purple-400 border-purple-900/30' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {pushesEnabled ? 'Active' : 'Muted'}
          </button>
        </div>

        {/* Real-time Push Playground Simulator */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <div className="text-left">
            <span className="text-[8px] tracking-[0.25em] font-black uppercase text-[#e8b923] block">SANDBOX SIMULATOR</span>
            <h4 className="text-xs font-black text-white mt-0.5">Test Live Push Transactions</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerSimulatedAlert('payment')}
              className="py-2.5 px-1 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 text-[#e8b923] border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
            >
              +₹ Balance
            </button>
            <button
              onClick={() => triggerSimulatedAlert('reward')}
              className="py-2.5 px-1 bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
            >
              🎉 Reward
            </button>
            <button
              onClick={() => triggerSimulatedAlert('security')}
              className="py-2.5 px-1 bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
            >
              🛡️ Security
            </button>
          </div>
        </div>

        {/* Control toolbar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold font-sans">
            <span>SHOWING {notifications.length} ALERTS</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllRead}
                className="hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-0"
              >
                <Check size={11} /> Mark Read
              </button>
              <button
                onClick={handleClearAll}
                className="hover:text-red-500 flex items-center gap-1 cursor-pointer bg-transparent border-0"
              >
                <Trash2 size={11} /> Wipe All
              </button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-900 rounded-2xl h-60 text-center text-zinc-600">
              <BellOff size={32} className="stroke-[1.5] mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">Journals Empty</p>
              <p className="text-[10px] text-zinc-700 mt-1">No alerts or mock transactions recorded yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  notif.read 
                    ? 'bg-[#080808]/50 border-zinc-950 text-zinc-400' 
                    : 'bg-[#121212] border-zinc-800/80 text-white shadow-sm'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-[#e8b923] rounded-full animate-ping" />
                )}
                
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-black ${notif.read ? 'text-zinc-300' : 'text-white'}`}>{notif.title}</h4>
                  <span className="text-[9px] font-mono text-zinc-600 font-bold">{notif.time}</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{notif.body}</p>

                {notif.title.includes('Deposit') && (
                  <button
                    onClick={onNavigateToTopUp}
                    className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-bold text-[#e8b923] border border-zinc-800/80 rounded-lg mt-2.5 cursor-pointer uppercase font-sans tracking-wider"
                  >
                    View Wallet Receipt
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
