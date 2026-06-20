/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { ALL_GAMES } from '../gamesData';
import { GameCategory, GameMetadata } from '../types';
import { 
  Plus, History, User2, Bell, Sparkles, Coins, 
  ArrowUpRight, ArrowDownLeft, Trophy, Gift, ArrowRight, 
  Search, MessageSquare, Send, ChevronRight, Star, Flame, CheckCircle,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GameIcon3D } from './GameIcon3D';

interface BunniesDashboardProps {
  onNavigate: (path: string) => void;
  onOpenAddCash: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export default function BunniesDashboard({ 
  onNavigate, 
  onOpenAddCash, 
  onOpenNotifications, 
  onOpenProfile 
}: BunniesDashboardProps) {
  
  const store = useCasinoStore();
  const [notifyBadgeCount, setNotifyBadgeCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Progressive Cumulative Mega Jackpot State
  const [jackpot, setJackpot] = useState<number>(94812304);
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((v) => v + Math.floor(Math.random() * 85) + 12);
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  // Sync general notification badges
  useEffect(() => {
    if (store.currentUser) {
      const notifyKey = `bunnies_notifs_${store.currentUser}`;
      const existing = localStorage.getItem(notifyKey);
      if (existing) {
        const list = JSON.parse(existing);
        const unread = list.filter((n: any) => !n.read).length;
        setNotifyBadgeCount(unread);
      }
    }
  }, [store.currentUser, store.transactions]);

  // Live Simulated High-Roller Jackpots / Chat feed to make UI look extremely busy and interactive
  const [messages, setMessages] = useState([
    { id: '1', user: 'Aviator007', text: 'Just hit 14.5x cashout on Moon Crash! 🚀', vip: 'Gold Club', prize: '₹14,500' },
    { id: '2', user: 'SlotsKing99', text: 'Fortune Dragon paid 250x, reels are hot today!', vip: 'Imperial VIP', prize: '₹37,500' },
    { id: '3', user: 'DeepSeaHunter', text: 'Captured Alien boss fish! Big bounty!', vip: 'Elite Member', prize: '₹15,000' }
  ]);
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    const botMessages = [
      { user: 'BaccaratLady', text: 'Red streak on Banker! Join the table 🔴', vip: 'Gold Club', prize: '₹12,000' },
      { user: 'Karan777', text: 'Spinning Golden Tiger Slots! 🐯', vip: 'Imperial VIP', prize: '₹8,500' },
      { user: 'Ravi_Ji', text: 'Just withdrew ₹10,000 via Fino UPI simulator!', vip: 'Gold Club', prize: '₹10,000' },
      { user: 'TigerDragon', text: 'Dragon survived Tiger! Double payout 🐉', vip: 'Elite Member', prize: '₹6,000' },
      { user: 'ProSpinAman', text: 'Lucky 777 has pays a mega reward of +20,000! 🎰', vip: 'Imperial VIP', prize: '₹20,000' },
      { user: 'Dia_Wins', text: 'Daily check-in gave me +₹10,000! Loving it', vip: 'Elite Member', prize: '₹10,000' }
    ];

    const timer = setInterval(() => {
      const chosen = botMessages[Math.floor(Math.random() * botMessages.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: chosen.user,
          text: chosen.text,
          vip: chosen.vip,
          prize: chosen.prize
        }
      ].slice(-8));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: store.currentUser || 'You',
        text: userMsg.trim(),
        vip: store.coins >= 100000 ? 'Imperial VIP' : store.coins >= 25000 ? 'Gold Club' : 'Elite Member',
        prize: ''
      }
    ]);
    setUserMsg('');

    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  // Maps game buttons to launch engines in App.tsx
  const launchGameEngine = (gameId: string, gameName: string) => {
    if (store.coins <= 0) {
      toast.error('Your balance is ₹0. Please recharge your wallet to unlock and play!', {
        id: 'out-of-money-alert',
        style: { background: '#111', color: '#fff', border: '1px solid #dc2626' }
      });
      onNavigate('#add_cash');
      return;
    }

    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High chime launch
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (e) {}
    }

    toast(`Entering ${gameName} Table...`, {
      icon: '🎰',
      duration: 1500,
      style: { background: '#111', color: '#e8b923', border: '1px solid #e8b923' }
    });

    if (gameId === 'luckywheel') {
      onNavigate('#luckywheel');
    } else if (gameId === 'baccarat') {
      onNavigate('#baccarat');
    } else if (gameId === 'dragontiger') {
      onNavigate('#dragontiger');
    } else if (gameId === 'teenpatti') {
      onNavigate('#teenpatti');
    } else if (gameId === 'blackjack') {
      onNavigate('#blackjack');
    } else if (gameId === 'poker') {
      onNavigate('#blackjack');
    } else if (['oceanking', 'dragonking', 'alienhunter', 'deepsea'].includes(gameId)) {
      onNavigate('#fish');
    } else if (['crashrocket', 'aviator', 'mooncrash'].includes(gameId)) {
      onNavigate('#crash');
    } else {
      // Slot variants
      onNavigate(`#games/slots/${gameId}`);
    }
  };

  // Search and Category filtering
  const filteredGames = ALL_GAMES.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'ALL') return matchesSearch;
    if (activeCategory === 'SLOTS') return matchesSearch && g.category.includes('SLOTS');
    if (activeCategory === 'CARDS') return matchesSearch && g.category.includes('CARDS');
    if (activeCategory === 'CRASH') return matchesSearch && g.category.includes('CRASH');
    if (activeCategory === 'FISH') return matchesSearch && g.category.includes('FISH');
    
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-transparent text-white flex flex-col relative overflow-y-auto pb-24 select-none">
      
      {/* Hyper colourful neon holographic glow layers */}
      <div className="absolute top-[-5%] left-[-15%] w-80 h-80 bg-cyan-500/20 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-20%] w-96 h-96 bg-pink-500/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-25%] w-96 h-96 bg-[#e8b923]/10 rounded-full filter blur-[130px] pointer-events-none" />

      {/* High-Contrast Luxury Header with glowing bottom edge */}
      <header className="sticky top-0 bg-gradient-to-b from-[#1b0c36]/90 via-[#0e0622]/90 to-[#190930]/90 border-b border-pink-500/30 shadow-[0_4px_25px_rgba(236,72,153,0.18)] z-20 backdrop-blur-md px-4 py-3 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border-2 border-[#e8b923] p-0.5 bg-gradient-to-tr from-neutral-900 via-purple-950 to-neutral-850 overflow-hidden shrink-0 shadow-[0_0_10px_rgba(232,185,35,0.4)]">
            <img 
              src="/src/assets/images/pe777_slots_lobby_1781925818795.jpg"
              alt="PE777 Slots"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="text-left font-sans">
            <span className="text-[8.5px] uppercase tracking-[0.25em] text-cyan-400 font-black block">Elite VIP Lounge</span>
            <h1 className="text-sm font-black text-white mt-0.5 tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-200 to-[#e8b923]">PE777 Elite</h1>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('#add_cash')}
            className="px-3 py-1.5 button-3d-gold hover:scale-105 rounded-xl text-[10px] text-zinc-950 font-black flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
          >
            <Plus size={11} className="text-zinc-950" /> Add Fund
          </button>

          <button
            onClick={onOpenNotifications}
            className="p-2 bg-indigo-950/70 border border-cyan-500/25 hover:border-cyan-500/80 rounded-xl transition-all relative text-cyan-300 hover:text-white cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.15)]"
          >
            <Bell size={15} />
            {notifyBadgeCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-pink-500 border border-black animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            )}
          </button>
          
          <button
            onClick={onOpenProfile}
            className="p-2 bg-indigo-950/70 border border-cyan-500/25 hover:border-cyan-500/80 rounded-xl transition-all text-cyan-300 hover:text-white cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.15)] flex items-center gap-1 font-extrabold text-[10px] uppercase tracking-wider"
          >
            <User2 size={13} className="text-[#e8b923]" />
          </button>

          <button
            onClick={() => onNavigate('#admin')}
            className="p-2 bg-pink-950/30 border border-pink-500/25 hover:border-pink-500/80 rounded-xl transition-all text-pink-300 hover:text-white cursor-pointer shadow-[0_0_8px_rgba(236,72,153,0.15)] flex items-center justify-center"
            title="Admin Dashboard"
          >
            <Shield size={13} className="text-pink-400" />
          </button>
        </div>
      </header>

      {/* Main Page scroll content */}
      <div className="p-4 flex-1 flex flex-col space-y-4">

        {/* GLOWING DYNAMIC PROGRESSIVE JACKPOT TAPE - Luxury Gold Electroplating Frame */}
        <div className="bg-gradient-to-r from-[#1d0e3a]/80 via-[#2f134f]/70 to-[#1d0e3a]/80 border-2 border-[#e8b923] rounded-2xl p-4 text-center relative overflow-hidden shadow-[0_0_25px_rgba(232,185,35,0.4),_inset_0_1px_1px_rgba(255,255,255,0.1)] select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />
          <div className="flex justify-center items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.3em] text-[#e8b923] animate-pulse">
            <Star size={10} className="fill-[#e8b923] stroke-none" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e8b923] via-yellow-250 to-[#e8b923] font-sans">PE777 CUMULATIVE VIP JACKPOT</span>
            <Star size={10} className="fill-[#e8b923] stroke-none" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-mono tracking-wider mt-1.5 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            ₹{jackpot.toLocaleString()}
          </h2>
          <div className="text-[8px] text-cyan-300 tracking-[0.2em] font-black uppercase mt-1">
            Certified Gateway Escrow • Payout Live
          </div>
        </div>

        {/* SEARCH BAR WIDGET - Cybernetic Glowing Cyan Frame */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through 24 premium game modules..."
            className="w-full py-3 pl-10 pr-4 bg-slate-950/80 border border-cyan-500/35 focus:border-[#e8b923] hover:border-cyan-400 rounded-2xl text-[11px] font-sans font-bold text-cyan-50 placeholder-indigo-300/40 outline-none transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),_0_0_8px_rgba(6,182,212,0.1)]"
          />
        </div>

        {/* CATEGORY SWITCHERS GRID */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-thin">
          {['ALL', 'SLOTS', 'CARDS', 'CRASH', 'FISH'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                if (store.settings.sound) {
                  try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.008, audioCtx.currentTime);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.05);
                  } catch (e) {}
                }
              }}
              className={`py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer border transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 text-black border-transparent font-black shadow-[0_0_12px_rgba(236,72,153,0.55)] scale-102'
                  : 'bg-indigo-950/40 text-cyan-300 border-cyan-500/20 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRAND GAME TILE GRID */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-[#e8b923] uppercase mb-2.5">
            <span>ACTIVE SELECTIONS ({filteredGames.length})</span>
            <span className="text-zinc-500">Fast Play Enabled</span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-900 rounded-2xl h-60 text-zinc-650 text-center">
              <Flame size={28} className="mb-1 text-zinc-700" />
              <p className="text-xs font-black uppercase">No games found</p>
              <p className="text-[9px] text-zinc-700 mt-1">Try searching another game e.g. "Dragon" or "Crash"</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 select-none font-sans">
              {filteredGames.map((g) => {
                const isGameHot = g.isHot || g.id === 'lucky777' || g.id === 'baccarat' || g.id === 'teenpatti';
                const isGameNew = g.isNew || g.id === 'alienhunter' || g.id === 'aviator';
                const customImg = store.adminSettings?.gameImages?.[g.id];

                return (
                  <button
                    key={g.id}
                    onClick={() => launchGameEngine(g.id, g.name)}
                    className="aspect-square bg-gradient-to-tr from-[#1b103e]/90 via-[#0e0722]/90 to-indigo-950/95 hover:from-[#2e1966] hover:to-[#db2777]/20 border border-cyan-500/30 w-full rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-[1.04] active:scale-[0.98] outline-none cursor-pointer relative overflow-hidden shadow-[0_6px_15px_rgba(0,0,0,0.5)]"
                    style={{
                      borderBottom: `2.5px solid ${g.theme || '#e11d48'}`
                    }}
                  >
                    {/* Background Image if customImg is set */}
                    {customImg ? (
                      <div className="absolute inset-0 z-0 select-none pointer-events-none">
                        <img 
                          src={customImg} 
                          alt={g.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {/* Semi-transparent dark gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
                      </div>
                    ) : null}

                    {/* Hot or New Badge overlay */}
                    {isGameHot && (
                      <div className="absolute top-1 left-1 px-1 py-[1.5px] bg-red-600/90 text-white text-[6.5px] font-black rounded uppercase tracking-wider scale-90 z-10">
                        🔥 HOT
                      </div>
                    )}
                    {isGameNew && (
                      <div className="absolute top-1 left-1 px-1 py-[1.5px] bg-purple-600/95 text-white text-[6.5px] font-black rounded uppercase tracking-wider scale-90 z-10">
                        ✨ NEW
                      </div>
                    )}

                    {/* Content spacer or standard 3D icon wrapper */}
                    {customImg ? (
                      <div className="flex-1 z-10" />
                    ) : (
                      /* Glowing 3D Vector Icon */
                      <div 
                        className={`w-11 h-11 ${store.adminSettings?.squareImages ? 'rounded-xl' : 'rounded-full'} flex items-center justify-center shadow-lg border-2 mb-1.5 shrink-0 bg-neutral-950/40 p-0.5 z-10`}
                        style={{
                          borderColor: g.theme || '#e8b923',
                          boxShadow: `0 0 10px ${g.theme || '#e8b923'}30`
                        }}
                      >
                        <GameIcon3D gameId={g.id} themeColor={g.theme} className="w-9 h-9 object-contain" />
                      </div>
                    )}

                    <span className="text-[10px] font-black text-zinc-100 truncate w-full break-all leading-tight z-10">
                      {g.name}
                    </span>
                    <span 
                      className="text-[6.5px] font-black tracking-widest uppercase mt-0.5 px-1 py-[1px] rounded z-10"
                      style={{
                        color: g.theme || '#e8b923',
                        backgroundColor: customImg ? 'rgba(0,0,0,0.5)' : `${g.theme || '#e8b923'}08`
                      }}
                    >
                      {g.category[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FEATURED AD SLIDER AS A DYNAMIC BANNER */}
        <div 
          onClick={() => onNavigate('#profile')}
          className="bg-gradient-to-r from-purple-950/50 via-zinc-950 to-neutral-950 p-4 rounded-2xl border border-zinc-900 text-left flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
              <Trophy size={16} />
            </div>
            <div>
              <span className="text-[7.5px] text-[#e8b923] tracking-widest font-black uppercase">REVENUE CHECKPOINT</span>
              <h4 className="text-xs font-black text-white leading-tight uppercase">Simulated Cashout Success</h4>
              <p className="text-[10px] text-zinc-500 font-semibold leading-none mt-0.5">Withdraw funds immediately via Fino Bank</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-zinc-650" />
        </div>

        {/* LIVE HIGH ROLLER CHAT ROOM */}
        <div className="space-y-2 text-left flex-1 flex flex-col min-h-[170px] select-none">
          <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 tracking-widest uppercase">
            <span>Verified PE777 Feed Stream</span>
            <span className="text-zinc-600">Simulating Live Lobby</span>
          </div>

          {/* Messages Body */}
          <div className="bg-gradient-to-b from-[#150d32]/85 to-[#0b051e]/90 border border-pink-500/25 rounded-2xl p-2.5 space-y-2 flex-1 overflow-y-auto max-h-[180px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            {messages.map((m) => (
              <div key={m.id} className="text-[9.5px] leading-relaxed flex items-start gap-1 justify-between">
                <div className="truncate max-w-[80%] pr-1">
                  <span className={`font-extrabold mr-1 ${
                    m.vip === 'Imperial VIP' ? 'text-pink-400' : m.vip === 'Gold Club' ? 'text-[#e8b923]' : 'text-cyan-400'
                  }`}>
                    [{m.vip}] {m.user}:
                  </span>
                  <span className="text-stone-200 truncate font-semibold">{m.text}</span>
                </div>
                
                {m.prize && (
                  <span className="text-[7.5px] bg-[#10b981] text-black font-extrabold px-1 rounded block shrink-0 font-mono tracking-tighter">
                     + {m.prize}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Message form sender */}
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Send message to live lounge..."
              className="flex-1 py-2.5 px-3 bg-[#0d0725]/85 border border-cyan-500/30 text-[10px] outline-none text-cyan-50 rounded-xl placeholder-indigo-300/40 shadow-inner"
            />
            <button
              type="submit"
              className="p-2.5 bg-gradient-to-r from-pink-500 to-fuchsia-650 hover:brightness-110 text-white rounded-xl text-center flex items-center justify-center cursor-pointer font-extrabold hover:scale-105 border-0 shadow-md"
            >
              <Send size={12} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
