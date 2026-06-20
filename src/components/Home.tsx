/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { ALL_GAMES } from '../gamesData';
import { GameCategory, GameMetadata } from '../types';
import { 
  Menu, X, Coins, Gift, Trophy, User as UserIcon, Clock, LogOut, 
  ChevronRight, Volume2, VolumeX, Sparkles, AlertCircle, Home as HomeIcon,
  Gamepad2, Club, Ship, MessageSquare, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GameIcon3D } from './GameIcon3D';

interface HomeProps {
  onNavigate: (route: string, gameId?: string, gameName?: string) => void;
  onOpenDrawer: () => void;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export default function Home({ onNavigate, isDrawerOpen, onOpenDrawer, onCloseDrawer }: HomeProps) {
  const store = useCasinoStore();
  const [activeCategory, setActiveCategory] = useState<GameCategory>('ALL');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Progressive Cumulative Mega Jackpot State
  const [jackpot, setJackpot] = useState(94812304);
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((v) => v + Math.floor(Math.random() * 85) + 12);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Web Audio feedback sound trigger
  const triggerSoundToggleChime = (isEnabled: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (isEnabled) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        osc.stop(audioCtx.currentTime + 0.18);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, audioCtx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  // Helper to determine VIP Level progress and name
  const getVIPStatus = () => {
    const totalWinnings = store.gameHistory.reduce(
      (sum, h) => sum + (h.payoutAmount > 0 ? h.payoutAmount : 0),
      0
    );
    if (totalWinnings >= 3000000) {
      return { title: 'Royal King 👑', color: 'from-purple-600 via-pink-600 to-amber-500', next: 'MAX LEVEL', progress: 100, threshold: 3000000 };
    }
    if (totalWinnings >= 1000000) {
      return { title: 'Diamond VIP 💎', color: 'from-cyan-500 via-sky-600 to-indigo-600', next: 'Royal King', progress: Math.min(100, Math.round(((totalWinnings - 1000000) / 2000000) * 100)), threshold: 3000000 };
    }
    if (totalWinnings >= 250000) {
      return { title: 'Gold VIP 🏅', color: 'from-amber-400 via-amber-500 to-amber-600', next: 'Diamond VIP', progress: Math.min(100, Math.round(((totalWinnings - 250000) / 750000) * 100)), threshold: 1000000 };
    }
    if (totalWinnings >= 50000) {
      return { title: 'Silver Tier 🥈', color: 'from-zinc-300 via-zinc-400 to-zinc-500', next: 'Gold VIP', progress: Math.min(100, Math.round(((totalWinnings - 50000) / 200000) * 100)), threshold: 250000 };
    }
    return { title: 'Bronze Tier 🥉', color: 'from-amber-700 via-amber-800 to-amber-900', next: 'Silver Tier', progress: Math.min(100, Math.round((totalWinnings / 50000) * 100)), threshold: 50000 };
  };

  // Chat Section Simulation
  const [messages, setMessages] = useState([
    { id: '1', user: 'Aviator007', text: 'Just hit 14.5x cashout on Moon Crash! 🚀', vip: 'Gold VIP 🏅', time: '1m ago', isSystem: false },
    { id: '2', user: 'SlotsKing99', text: 'Fortune Dragon paid 250x, this is hot today!', vip: 'Royal King 👑', time: 'Just now', isSystem: false },
    { id: '3', user: 'SystemBot', text: '🎉 Player SlotsKing99 achieved Royal King VIP status!', vip: 'System', time: 'Just now', isSystem: true }
  ]);
  const [userMsg, setUserMsg] = useState('');

  // Periodically add fake chat messages to represent busy server
  useEffect(() => {
    const botMessages = [
      { user: 'BaccaratLady', text: 'Rank run red on Banker! Anyone riding Baccarat table? 🔴', vip: 'Diamond VIP 💎' },
      { user: 'DeepSeaHunter', text: 'Alien Hunter boss fish is crazy, captured for +15k coins 🐙', vip: 'Silver Tier 🥈' },
      { user: 'Karan777', text: 'Can we get to Diamond tier today? Doing wild bets', vip: 'Royal King 👑' },
      { user: 'Ravi_Ji', text: 'Claimed hourly bonus 500 tokens! High five', vip: 'Gold VIP 🏅' },
      { user: 'TigerDragon', text: 'Dragon is on fire! 7 wins in a row in Dragon Tiger 🐅', vip: 'Silver Tier 🥈' },
      { user: 'TeenPattiPro', text: 'Who wants to start a Teen Patti real card table?', vip: 'Gold VIP 🏅' }
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
          time: 'Just now',
          isSystem: false
        }
      ].slice(-12));
    }, 9000);

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim()) return;

    const myVip = getVIPStatus().title;
    const copiedText = userMsg;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: store.currentUser || 'You',
        text: copiedText,
        vip: myVip,
        time: 'Just now',
        isSystem: false
      }
    ]);

    setUserMsg('');

    // Trigger feedback chime
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (err) {}
    }

    // Auto chatbot response
    setTimeout(() => {
      const chatReplies = [
        { user: 'SlotsKing99', text: 'Nice! Claim that free hourly check-in if you are running low! 🔥', vip: 'Royal King 👑' },
        { user: 'Karan777', text: 'Wow good luck brother! Let us spin some Fortune Dragon slots together.', vip: 'Royal King 👑' },
        { user: 'BaccaratLady', text: 'Nice one! Join the card baccarat table, Banker is hot!', vip: 'Diamond VIP 💎' },
        { user: 'DeepSeaHunter', text: 'Incredible active demo, we are scoring big. Cheers!', vip: 'Silver Tier 🥈' }
      ];

      const chosenReply = chatReplies[Math.floor(Math.random() * chatReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          user: chosenReply.user,
          text: chosenReply.text,
          vip: chosenReply.vip,
          time: 'Just now',
          isSystem: false
        }
      ]);
    }, 1500);
  };

  // Carousel banners
  const banners = [
    {
      title: 'Win Big on Slots!',
      sub: 'Up to 1000x Multiplier on Fortune Dragon',
      badge: 'POPULAR',
      color: 'from-red-950 via-zinc-900 to-amber-950/40',
      action: () => onNavigate('games/slots', 'lucky777', 'Lucky 777')
    },
    {
      title: 'Hunt Giant Boss Fish!',
      sub: 'Dragon King & Ocean King Mega payouts await',
      badge: 'HOT ACTION',
      color: 'from-cyan-950 via-zinc-900 to-indigo-950/40',
      action: () => onNavigate('games/fish')
    },
    {
      title: 'Claim Daily Coins!',
      sub: 'Claim up to 10,000 Coins every week free',
      badge: 'GIFTS',
      color: 'from-amber-950 via-zinc-900 to-neutral-900/60',
      action: () => onNavigate('bonus')
    }
  ];

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Filter games based on category
  const filteredGames = ALL_GAMES.filter((g) => {
    if (activeCategory === 'ALL') return true;
    return g.category.includes(activeCategory);
  });

  // Calculate today's winnings dynamically from actual transactions!
  const getTodaysWinnings = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return store.transactions
      .filter((t) => t.timestamp >= today && t.amount > 0 && (t.type === 'game_win' || t.type === 'bonus'))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleGameSelect = (game: GameMetadata) => {
    if (game.category.includes('SLOTS')) {
      onNavigate(`games/slots/${game.id}`, game.id, game.name);
    } else if (game.category.includes('FISH')) {
      onNavigate('games/fish', game.id, game.name);
    } else if (game.id === 'baccarat') {
      onNavigate('games/baccarat');
    } else if (game.id === 'dragontiger') {
      onNavigate('games/dragontiger');
    } else if (game.id === 'teenpatti') {
      onNavigate('games/teenpatti');
    } else if (game.id === 'blackjack') {
      onNavigate('games/blackjack');
    } else if (game.category.includes('CRASH')) {
      onNavigate('games/crash');
    } else {
      toast.success(`Launching ${game.name}! Preparing demo tables...`, {
        icon: '🎰',
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e8b923' },
      });
      // Fallback
      if (game.id === 'poker') {
        onNavigate('games/teenpatti'); // Load Teen Patti for raw Indian poker variant
      } else {
        onNavigate('games/blackjack');
      }
    }
  };

  const handleQuickClaimBonus = () => {
    const bonus = store.claimDailyBonus();
    if (bonus) {
      toast.success(`Bonus Claimed! +${bonus.amount.toLocaleString()} coins`, {
        icon: '🎁',
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e8b923' },
      });
    } else {
      toast.error("Already claimed today's daily bonus! Come back tomorrow.", {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' },
      });
    }
  };

  // List of fake winners for live scrolling
  const fakeWinners = [
    { name: 'Play***489', win: '22,400', game: 'Lucky 777' },
    { name: 'Kati***312', win: '105,000', game: 'Crash Rocket' },
    { name: 'Arju***777', win: '7,500', game: 'Ocean King' },
    { name: 'Neh***vi', win: '45,200', game: 'Teen Patti' },
    { name: 'Sing***Vip', win: '18,000', game: 'Fortune Dragon' },
    { name: 'Gues***4221', win: '2,000', game: 'Baccarat' },
    { name: 'Vik***99', win: '35,000', game: 'Golden Tiger' },
    { name: 'Bacc***OP', win: '210,000', game: 'Dragon Tiger' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-24 relative overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#e01f26]/5 via-transparent to-transparent pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 bg-[#0d0d0d] px-4 h-15 flex items-center justify-between border-b border-zinc-900 z-30 select-none backdrop-blur-md bg-[#0d0d0d]/90">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
          <span className="text-xl font-black tracking-widest text-white flex items-center gap-1.5">
            PE<span className="text-[#e8b923]">777</span>
            <span className="text-[10px] font-semibold text-[#e8b923] border border-[#e8b923]/30 px-1 py-0.5 rounded leading-none">
              DEMO
            </span>
          </span>
        </div>

        {/* Header Right Operations Panel */}
        <div className="flex items-center gap-3">
          {/* Sound Synthesizer Toggle */}
          <button
            onClick={() => {
              const prev = store.settings.sound;
              store.updateSettings({ sound: !prev });
              triggerSoundToggleChime(!prev);
              toast.success(!prev ? 'Audio Chimes Enabled' : 'Audio muted', {
                icon: !prev ? '🔊' : '🔇',
                style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e8b923' },
              });
            }}
            className="p-2 bg-neutral-900/80 border border-zinc-800 rounded-full hover:bg-neutral-800 text-[#e8b923] transition-all cursor-pointer shadow-inner"
            title="Toggle Web-Audio Synth"
          >
            {store.settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} className="text-zinc-500" />}
          </button>

          {/* Balance view */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800/80 rounded-full py-1 pl-2.5 pr-1 shadow-inner relative overflow-hidden">
            <Coins size={14} className="text-[#e8b923] filter drop-shadow-[0_0_4px_rgba(232,185,35,0.4)]" />
            <span className="text-xs font-black tracking-wide text-[#e8b923] px-1 font-mono">
              {store.coins.toLocaleString()}
            </span>
            <button
              onClick={() => onNavigate('bonus')}
              className="bg-gradient-to-r from-[#e8b923] to-[#caa01a] text-neutral-950 font-extrabold rounded-full w-5 h-5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer shadow"
            >
              +
            </button>
          </div>
        </div>
      </header>

      {/* Left Drawer Menu Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onCloseDrawer}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Slider */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#141414] border-r border-zinc-900 z-50 flex flex-col p-5 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-5">
                <span className="text-lg font-black tracking-wide text-white">
                  JW<span className="text-[#e01f26]">777</span> MENU
                </span>
                <button
                  onClick={onCloseDrawer}
                  className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-500 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Profile Info Card in menu */}
              <div className="bg-neutral-950/60 rounded-xl border border-neutral-900 p-4 mb-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#e01f26] to-red-500 flex items-center justify-center font-bold text-white shadow">
                  {store.currentUser ? store.currentUser[0].toUpperCase() : 'G'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                    {store.currentUser || 'Guest Gamer'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-green-500 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online Demo {store.isGuest ? '(GUEST)' : ''}
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {[
                  { label: 'Lobby Home', icon: <HomeIcon size={16} />, route: 'home' },
                  { label: 'Slots Games', icon: <span className="text-sm">🎰</span>, route: 'games/slots/lucky777' },
                  { label: 'Fish Shooting', icon: <span className="text-sm">🐠</span>, route: 'games/fish' },
                  { label: 'Card Tables', icon: <Club size={16} />, route: 'games/baccarat' },
                  { label: 'Crash Multiplier', icon: <span className="text-sm">🚀</span>, route: 'games/crash' },
                  { label: 'Daily Sign-In', icon: <Gift size={16} />, route: 'bonus' },
                  { label: 'Leaderboard', icon: <Trophy size={16} />, route: 'leaderboard' },
                  { label: 'My Profile & Logs', icon: <UserIcon size={16} />, route: 'profile' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      onCloseDrawer();
                      onNavigate(item.route);
                    }}
                    className="w-full text-left py-3 px-3 rounded-lg flex items-center justify-between text-zinc-300 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#e8b923]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-zinc-600" />
                  </button>
                ))}
              </div>

              {/* Draw Foot */}
              <div className="border-t border-neutral-900 pt-4 mt-auto">
                <button
                  onClick={() => {
                    onCloseDrawer();
                    store.logoutUser();
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg flex items-center gap-3 text-red-500 hover:text-red-400 hover:bg-neutral-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Logout Account</span>
                </button>
                <p className="text-[9px] text-zinc-600 text-center mt-4 tracking-tight leading-relaxed uppercase">
                  JW777 — STRICTLY ENTERTAINMENT DEMO
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Live Announcement Marquee Banner */}
      <div className="bg-[#e01f26]/12 border-y border-[#e01f26]/20 py-2 overflow-hidden relative flex items-center select-none shadow">
        <div className="whitespace-nowrap flex animate-[marquee_20s_linear_infinite] gap-10 text-xs font-semibold uppercase tracking-wider text-red-100 flex-none leading-none">
          <span>🔥 JW777 Demo: Play 24 complete Casino modules with virtual tokens! No deposits required!</span>
          <span>🎰 Instant Daily login reward of up to 10,000 extra chips on Day 7!</span>
          <span>🐠 Hunt Manta Rays & Kracken in our beautiful Ocean King canvas game!</span>
          <span>⚡ Real-time multiplier Crash Rocket resets are active! cashout safely!</span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* CAROUSEL PROMO BANNER */}
        <div className="relative h-44 rounded-2xl overflow-hidden shadow-xl group border border-neutral-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={carouselIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              onClick={banners[carouselIndex].action}
              className={`absolute inset-0 bg-gradient-to-r ${banners[carouselIndex].color} flex flex-col justify-center p-6 cursor-pointer select-none`}
            >
              <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black pointer-events-none" />
              <span className="self-start text-[9px] font-black tracking-widest text-[#e8b923] bg-neutral-950/80 px-2 py-0.5 rounded border border-[#e8b923]/30 uppercase mb-2">
                {banners[carouselIndex].badge}
              </span>
              <h2 className="text-2xl font-black text-white leading-tight max-w-xs filter drop-shadow">
                {banners[carouselIndex].title}
              </h2>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs">
                {banners[carouselIndex].sub}
              </p>

              {/* Decorative design right side */}
              <div className="absolute right-4 bottom-4 w-20 h-20 opacity-35 select-none text-[80px] pointer-events-none flex items-center justify-center filter drop-shadow">
                {carouselIndex === 0 ? '🎰' : carouselIndex === 1 ? '🐠' : '🎁'}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCarouselIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all border-0 focus:outline-none cursor-pointer ${
                  i === carouselIndex ? 'bg-[#e8b923] w-4 shadow-[0_0_6px_rgba(232,185,35,0.8)]' : 'bg-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* PROGRESSIVE MEGA JACKPOT BANNER */}
        <div className="bg-gradient-to-r from-red-950 via-zinc-950 to-amber-950/20 border-2 border-[#e8b923]/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_20px_rgba(232,185,35,0.15)] select-none">
          {/* Subtle gold sparks absolute background icons */}
          <div className="absolute top-2 left-3 flex gap-1 opacity-20 text-xs">⭐✨</div>
          <div className="absolute bottom-2 right-3 flex gap-1 opacity-20 text-xs">✨⭐</div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#e8b923]">
            <Trophy size={11} className="text-[#e8b923] animate-pulse" />
            JW777 CUMULATIVE MEGA JACKPOT
          </div>
          
          <div className="mt-1 text-3xl md:text-4xl font-extrabold tracking-widest text-[#e8b923] font-mono filter drop-shadow-[0_0_8px_rgba(232,185,35,0.4)]">
            {jackpot.toLocaleString()} <span className="text-xs uppercase font-bold text-zinc-500 font-sans tracking-wide">Coins</span>
          </div>

          <div className="text-[9px] font-bold text-zinc-400 mt-0.5 tracking-wider uppercase">
            🔥 Pulsing live reward increases on every player spin!
          </div>
        </div>

        {/* QUICK BALANCE CARD */}
        <div className="bg-[#1a1a1a] border border-neutral-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none shadow">
          <div className="flex items-center gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                DEMO CURRENT BALANCE
              </span>
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-[#e8b923]" />
                <h3 className="text-2xl font-black text-[#e8b923] font-mono leading-none tracking-wide">
                  {store.coins.toLocaleString()} <span className="text-xs font-normal text-zinc-500 uppercase">Tokens</span>
                </h3>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-neutral-800 hidden md:block" />

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                TODAY'S SAVED GAINS
              </span>
              <div className="text-green-500 font-bold text-lg leading-none font-mono flex items-center gap-1">
                + {getTodaysWinnings().toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={handleQuickClaimBonus}
            className="bg-[#e01f26] hover:bg-red-700 text-white font-extrabold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-2 tracking-wider uppercase transition-all shadow hover:shadow-[0_4px_12px_rgba(224,31,38,0.3)] transform active:scale-95 cursor-pointer"
          >
            <Gift size={15} /> Claim Day Check-In
          </button>
        </div>

        {/* VIP LOYALTY CLUB CARD */}
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-neutral-800/80 rounded-2xl p-4 select-none shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${getVIPStatus().color} flex items-center justify-center text-xl shadow`}>
                👑
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#e8b923] uppercase tracking-widest leading-none block">
                  LOYALTY VIP CLUB
                </span>
                <h4 className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
                  {getVIPStatus().title}
                </h4>
              </div>
            </div>

            <div className="flex-1 max-w-sm space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>Progress to {getVIPStatus().next}</span>
                <span>{getVIPStatus().progress}%</span>
              </div>
              <div className="w-full bg-neutral-900/90 h-2 rounded-full overflow-hidden border border-neutral-800/80">
                <div 
                  className={`h-full bg-gradient-to-r ${getVIPStatus().color} rounded-full transition-all duration-500`}
                  style={{ width: `${getVIPStatus().progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GAME CATEGORY TABS CONTAINER */}
        <div className="relative">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none snap-x">
            {(['ALL', 'SLOTS', 'FISH', 'CARDS', 'CRASH', 'HOT', 'NEW'] as GameCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold tracking-wider transition-all snap-start uppercase cursor-pointer shrink-0 border ${
                  activeCategory === cat
                    ? 'bg-[#e8b923] border-[#e8b923] text-neutral-950 shadow-[0_3px_8px_rgba(232,185,35,0.4)]'
                    : 'bg-neutral-900/60 border-neutral-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GAME GRID */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Available Casino Modules ({filteredGames.length})
            </span>
            <div className="text-[10px] text-zinc-500 font-semibold uppercase flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" /> Math.Random Simulated
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGameSelect(game)}
                className="bg-[#1e1e1e] border border-neutral-800/80 rounded-xl overflow-hidden cursor-pointer shadow relative group hover:border-[#e8b923]/40 transition-colors"
              >
                {/* Image/Icon Panel */}
                <div 
                  className="aspect-square bg-neutral-950 flex flex-col items-center justify-center relative select-none"
                  style={{
                    background: `radial-gradient(circle at center, ${game.theme || '#111'}20, #0a0a0a)`
                  }}
                >
                  <div className="w-16 h-16 flex items-center justify-center filter drop-shadow-md group-hover:scale-110 transition-transform">
                    <GameIcon3D gameId={game.id} themeColor={game.theme} className="w-14 h-14 object-contain" />
                  </div>

                  {/* Indicators badge */}
                  {game.isHot && (
                    <span className="absolute top-1.5 left-1.5 bg-[#e01f26] text-white font-black text-[8px] px-1 py-0.5 rounded uppercase leading-none shadow">
                      HOT
                    </span>
                  )}
                  {game.isNew && (
                    <span className="absolute top-1.5 left-1.5 bg-[#16a34a] text-white font-black text-[8px] px-1 py-0.5 rounded uppercase leading-none shadow">
                      NEW
                    </span>
                  )}

                  {/* Play circle icon representation */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-[#e8b923] text-neutral-950 p-2 rounded-full font-black text-xs shadow-lg uppercase tracking-wider scale-90 group-hover:scale-100 transition-transform">
                      PLAY
                    </span>
                  </div>
                </div>

                {/* Footer panel */}
                <div className="p-2 border-t border-neutral-900 bg-neutral-900/40 text-center">
                  <h4 className="text-[11px] font-bold tracking-wide text-zinc-100 truncate">
                    {game.name}
                  </h4>
                  <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">
                    {game.category[0]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RECENT WINNERS TICKER DASHBOARD */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-3 select-none shadow">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border-b border-neutral-900 pb-2 mb-2">
            <Trophy size={12} className="text-[#e8b923] animate-bounce" />
            <span>Pulsing Real-Time Winner Stream</span>
          </div>

          <div className="overflow-hidden relative h-5">
            <div className="whitespace-nowrap flex animate-[marquee_25s_linear_infinite] gap-8 text-[11px] font-mono text-zinc-400">
              {fakeWinners.map((w, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[#e8b923] font-bold">{w.name}</span>
                  <span>won</span>
                  <span className="text-green-500 font-black">+{w.win}</span>
                  <span>on</span>
                  <span className="text-white font-semibold">{w.game}</span>
                  <span className="text-neutral-800">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VIP COMMUNITY ACTIVE DEMO CHAT */}
        <div className="bg-[#111111] border border-neutral-900 rounded-2xl p-4 flex flex-col space-y-3 shadow">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-1 select-none">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-[#e8b923]" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-100">
                JW777 VIP Live Lobby Chat
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Simulated Players Online
            </div>
          </div>

          {/* Messages list container */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 flex flex-col scrollbar-thin scroll-smooth text-left">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`p-2 rounded-xl text-left border ${
                  m.isSystem 
                    ? 'bg-neutral-950/80 border-purple-950/30 text-[11px] font-mono text-center text-purple-300 w-full' 
                    : 'bg-zinc-950/40 border-zinc-900/40 flex flex-col space-y-0.5'
                }`}
              >
                {!m.isSystem && (
                  <div className="flex items-center justify-between select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[11px] text-[#e8b923]">{m.user}</span>
                      <span className="text-[8px] px-1 rounded-sm bg-neutral-900 text-zinc-500 font-bold uppercase leading-none border border-neutral-800">
                        {m.vip}
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-600 font-mono font-medium">{m.time}</span>
                  </div>
                )}
                <p className={`text-xs text-zinc-300 mt-0.5 leading-relaxed break-words ${m.isSystem ? 'py-1 font-semibold' : ''}`}>
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Send Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Send live message to server lobby..."
              className="flex-1 bg-neutral-950 border border-neutral-800 hover:border-zinc-800 focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all placeholder-zinc-600"
            />
            <button
              type="submit"
              className="bg-[#e8b923] hover:bg-[#d4a81b] text-neutral-950 p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer transform active:scale-95 shadow font-extrabold shrink-0 border-0"
            >
              <Send size={13} className="stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* DISCLAIMER FOOTER ACCURATE COMPLIANCE */}
      <footer className="mt-8 border-t border-neutral-900/60 pt-6 px-6 text-center select-none pb-8">
        <p className="text-[10px] text-zinc-600 max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
          JW777 Demo is built for fun only. All credits are virtual. No real money gambling involved. JW777 Demo is for entertainment purposes only. All coins are virtual and have no real-world value. No real money gambling involved.
        </p>
      </footer>
    </div>
  );
}
