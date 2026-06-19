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
  Search, MessageSquare, Send, ChevronRight, Star, Flame, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

    if (gameId === 'baccarat') {
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
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col relative overflow-y-auto pb-24 select-none">
      
      {/* Hyper colourful neon blur spots */}
      <div className="absolute top-[-5%] left-[-15%] w-80 h-80 bg-purple-900/15 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-20%] w-96 h-96 bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-25%] w-96 h-96 bg-purple-950/15 rounded-full filter blur-[130px] pointer-events-none" />

      {/* High-Contrast Luxury Header */}
      <header className="sticky top-0 bg-black/85 backdrop-blur-md px-4 py-3 pb-3 flex items-center justify-between border-b border-zinc-900/90 z-20 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border-2 border-[#e8b923] p-0.5 bg-gradient-to-tr from-neutral-900 via-purple-950 to-neutral-850 overflow-hidden shrink-0">
            <img 
              src="/src/assets/images/bunny_luxury_mascot_1781800135949.jpg"
              alt="Mascot Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="text-left font-sans">
            <span className="text-[8.5px] uppercase tracking-[0.25em] text-[#e8b923] font-black block">Elite VIP Lounge</span>
            <h1 className="text-sm font-black text-white mt-0.5 tracking-wider uppercase">PE777 Elite</h1>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('#add_cash')}
            className="px-2.5 py-1.5 bg-zinc-950 hover:bg-neutral-900 border border-[#e8b923]/30 hover:border-[#e8b923]/80 rounded-xl text-[10px] text-white font-extrabold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
          >
            <Plus size={11} className="text-[#e8b923]" /> Add Fund
          </button>

          <button
            onClick={onOpenNotifications}
            className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all relative text-zinc-300 hover:text-white cursor-pointer"
          >
            <Bell size={15} />
            {notifyBadgeCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 border border-black animate-pulse" />
            )}
          </button>
          
          <button
            onClick={onOpenProfile}
            className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 rounded-xl transition-all text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1 font-extrabold text-[10px] uppercase tracking-wider"
          >
            <User2 size={13} className="text-[#e8b923]" />
          </button>
        </div>
      </header>

      {/* Main Page scroll content */}
      <div className="p-4 flex-1 flex flex-col space-y-4">

        {/* GLOWING DYNAMIC PROGRESSIVE JACKPOT TAPE */}
        <div className="bg-gradient-to-r from-purple-950/40 via-purple-900/10 to-purple-950/40 border border-purple-500/30 rounded-2xl p-4 text-center relative overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.15)] select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="flex justify-center items-center gap-1 text-[9px] font-black uppercase tracking-[0.3em] text-[#e8b923] animate-pulse">
            <Star size={10} className="fill-[#e8b923] stroke-none" />
            <span>CUMULATIVE BUNNIES MEGA JACKPOT</span>
            <Star size={10} className="fill-[#e8b923] stroke-none" />
          </div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e8b923] via-yellow-300 to-amber-500 font-mono tracking-wider mt-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            ₹{jackpot.toLocaleString()}
          </h2>
          <div className="text-[8px] text-zinc-500 tracking-widest font-black uppercase mt-0.5">
            Updated live • payout certified by escrow
          </div>
        </div>

        {/* SEARCH BAR WIDGET */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through 24 premium game modules..."
            className="w-full py-3 pl-10 pr-4 bg-zinc-950 border border-zinc-900 focus:border-[#e8b923]/40 rounded-2xl text-[11px] font-sans font-bold text-white placeholder-zinc-700 outline-none transition-all shadow-inner"
          />
        </div>

        {/* CATEGORY SWITCHERS GRID */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
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
                  ? 'bg-gradient-to-r from-purple-800 to-[#e8b923]/90 text-white border-purple-500/50 shadow-[0_0_10px_rgba(232,185,35,0.2)]'
                  : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
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

                return (
                  <button
                    key={g.id}
                    onClick={() => launchGameEngine(g.id, g.name)}
                    className="aspect-square bg-gradient-to-tr from-[#09090b] via-[#050508] to-neutral-900 hover:to-[#171322] border border-zinc-90 w-full rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-[1.03] active:scale-[0.98] outline-none cursor-pointer relative overflow-hidden"
                    style={{
                      borderBottom: `2.5px solid ${g.theme || '#e8b923'}50`
                    }}
                  >
                    {/* Hot or New Badge overlay */}
                    {isGameHot && (
                      <div className="absolute top-1 left-1 px-1 py-[1.5px] bg-red-600/90 text-white text-[6.5px] font-black rounded uppercase tracking-wider scale-90">
                        🔥 HOT
                      </div>
                    )}
                    {isGameNew && (
                      <div className="absolute top-1 left-1 px-1 py-[1.5px] bg-purple-600/95 text-white text-[6.5px] font-black rounded uppercase tracking-wider scale-90">
                        ✨ NEW
                      </div>
                    )}

                    {/* Emoji Thumbnail container with colorful glowing ring */}
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg border-2 mb-1.5 shrink-0"
                      style={{
                        borderColor: g.theme || '#e8b923',
                        backgroundColor: `${g.theme || '#e8b923'}10`,
                        boxShadow: `0 0 10px ${g.theme || '#e8b923'}25`
                      }}
                    >
                      {g.thumbnail || '🎰'}
                    </div>

                    <span className="text-[10px] font-black text-zinc-100 truncate w-full break-all leading-tight">
                      {g.name}
                    </span>
                    <span 
                      className="text-[6.5px] font-black tracking-widest uppercase mt-0.5 px-1 py-[1px] rounded"
                      style={{
                        color: g.theme || '#e8b923',
                        backgroundColor: `${g.theme || '#e8b923'}08`
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
          <div className="bg-[#09090b] border border-zinc-950/80 rounded-2xl p-2.5 space-y-2 flex-1 overflow-y-auto max-h-[180px]">
            {messages.map((m) => (
              <div key={m.id} className="text-[9.5px] leading-relaxed flex items-start gap-1 justify-between">
                <div className="truncate max-w-[80%] pr-1">
                  <span className={`font-extrabold mr-1 ${
                    m.vip === 'Imperial VIP' ? 'text-purple-400' : m.vip === 'Gold Club' ? 'text-[#e8b923]' : 'text-zinc-400'
                  }`}>
                    [{m.vip}] {m.user}:
                  </span>
                  <span className="text-zinc-300 truncate font-semibold">{m.text}</span>
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
              className="flex-1 py-2.5 px-3 bg-zinc-950 border border-zinc-900 text-[10px] outline-none text-white rounded-xl placeholder-zinc-800"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#e8b923] hover:bg-yellow-400 text-black rounded-xl text-center flex items-center justify-center cursor-pointer font-extrabold hover:scale-105 border-0"
            >
              <Send size={12} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
