/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Coins, Rocket, ShieldAlert, Users, TrendingUp, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FakePlayer {
  username: string;
  bet: number;
  cashoutAt: number; // multiplier to cash out at
  cashed: boolean;
  payout: number;
}

export default function Crash({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();

  const [selectedChip, setSelectedChip] = useState<number>(500);
  const [betInPlay, setBetInPlay] = useState<number>(0);
  const [isWagered, setIsWagered] = useState(false);

  // Auto cash out inputs
  const [autoCashout, setAutoCashout] = useState<string>('2.00');

  // Multipliers & stages
  const [gameState, setGameState] = useState<'countdown' | 'flying' | 'crashed'>('countdown');
  const [multiplier, setMultiplier] = useState(1.00);
  const [timerText, setTimerText] = useState('5.0');
  const [history, setHistory] = useState<number[]>([1.45, 2.10, 1.12, 5.80, 1.03, 3.25, 1.88, 14.20, 1.34]);

  // Fake multiplayer competitors
  const [players, setPlayers] = useState<FakePlayer[]>([]);

  // Local game loop refs
  const loopRef = useRef<any>(null);
  const crashRef = useRef<number>(2.0);

  // Generate players for next round
  const resetFakePlayers = () => {
    const list = [
      { username: 'San***88', bet: 200, cashoutAt: 1.2 + Math.random() * 2, cashed: false, payout: 0 },
      { username: 'Lck***777', bet: 1000, cashoutAt: 1.5 + Math.random() * 4, cashed: false, payout: 0 },
      { username: 'Avi***Op', bet: 5000, cashoutAt: 1.1 + Math.random() * 1.5, cashed: false, payout: 0 },
      { username: 'Raa***ji', bet: 500, cashoutAt: 1.8 + Math.random() * 5, cashed: false, payout: 0 },
    ];
    setPlayers(list);
  };

  const getMultiplierColor = (m: number) => {
    if (m < 2.0) return 'text-white';
    if (m < 5.0) return 'text-green-400';
    if (m < 10.0) return 'text-yellow-400';
    return 'text-red-500 font-extrabold animate-pulse';
  };

  // Run flight loop
  useEffect(() => {
    if (gameState === 'countdown') {
      resetFakePlayers();
      setMultiplier(1.00);
      let count = 50; // 5.0 seconds
      const timer = setInterval(() => {
        count--;
        setTimerText((count / 10).toFixed(1));
        if (count <= 0) {
          clearInterval(timer);
          launchRocket();
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const launchRocket = () => {
    setGameState('flying');

    // Provably fair calculation with 3 out of 5 rounds guaranteed > 10x or 15x
    let roundNum = parseInt(localStorage.getItem('crash_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true];
    const shouldGoHigh = winPattern[roundNum];
    localStorage.setItem('crash_round_num', ((roundNum + 1) % 5).toString());

    let crashPoint = 1.01;
    if (shouldGoHigh) {
      // Randomized high multiplier between 10.5x and 24.5x
      crashPoint = parseFloat((10.5 + Math.random() * 14).toFixed(2));
    } else {
      // Lower values
      crashPoint = parseFloat((1.1 + Math.random() * 3).toFixed(2));
    }
    crashRef.current = crashPoint;

    let currentMult = 1.00;
    const interval = setInterval(() => {
      // Speed increases as multiplier grows
      const step = 0.008 * Math.pow(currentMult, 0.4);
      currentMult = parseFloat((currentMult + step).toFixed(2));

      setMultiplier(currentMult);

      // Check fake players cashouts
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.cashed && currentMult >= p.cashoutAt && p.cashoutAt < crashRef.current) {
            return {
              ...p,
              cashed: true,
              payout: Math.round(p.bet * p.cashoutAt)
            };
          }
          return p;
        })
      );

      // Check auto-cashout trigger for active user
      const parsedAuto = parseFloat(autoCashout);
      if (isWagered && !isNaN(parsedAuto) && currentMult >= parsedAuto && parsedAuto <= crashRef.current) {
        // Execute automatic cash out
        executeManualCashout(currentMult);
      }

      // Check Crash
      if (currentMult >= crashRef.current) {
        clearInterval(interval);
        triggerCrash(currentMult);
      }
    }, 60);

    loopRef.current = interval;
  };

  const triggerCrash = (finalMult: number) => {
    setGameState('crashed');
    setHistory((prev) => [finalMult, ...prev].slice(0, 20));

    // Wagered lost check
    if (isWagered) {
      toast.error(`🚀 CRASHED at ${finalMult}x! Stake lost.`, {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' }
      });
      setIsWagered(false);
      setBetInPlay(0);

      store.addGameLog('crashrocket', 'Crash Rocket', betInPlay, 0, 'loss');
    }

    // Play explosion sound bleep
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {}
    }

    setTimeout(() => {
      setGameState('countdown');
    }, 3000);
  };

  const handlePlaceBet = () => {
    if (gameState !== 'countdown') {
      toast.error('Wagering only available during countdown phase!');
      return;
    }

    if (isWagered) {
      // Cancel / remove bet
      store.addCoins(betInPlay, 'Refunded Wagered Crash Bet', 'Crash Rocket', 'bonus');
      setBetInPlay(0);
      setIsWagered(false);
      return;
    }

    if (store.coins < selectedChip) {
      toast.error('Insufficient Coins!');
      return;
    }

    store.deductCoins(selectedChip, 'Wagered Crash Rocket stake', 'Crash Rocket', 'bet_loss');
    setBetInPlay(selectedChip);
    setIsWagered(true);

    toast.success('Bet placed! Waiting for launch...', {
      style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e8b923' }
    });
  };

  const executeManualCashout = (atMult: number) => {
    if (!isWagered || gameState !== 'flying') return;

    // stop intervals if auto matched or simple manual
    const reward = Math.round(betInPlay * atMult);
    store.addCoins(reward, `Cashed out on Crash (x${atMult})`, 'Crash Rocket', 'game_win');
    store.addGameLog('crashrocket', 'Crash Rocket', betInPlay, reward, 'win');

    toast.success(`🎉 CASH OUT SUCCESSFUL! +${reward.toLocaleString()} Coins (x${atMult})`, {
      style: { background: '#1c1c1c', color: '#ffd700', border: '1px solid #ffd700' },
      icon: '💎'
    });

    setIsWagered(false);
    setBetInPlay(0);

    // Audio chime
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    }
  };

  // Clean loops
  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10 flex flex-col items-center select-none relative overflow-x-hidden">
      <div className="absolute inset-0 bg-radial-at-c from-[#be123c]/5 to-neutral-950 pointer-events-none" />

      {/* Header bar */}
      <header className="w-full h-15 bg-neutral-900/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide">CRASH ROCKET LAUNCHER</h1>
            <span className="text-[8px] font-mono text-rose-500 font-bold uppercase tracking-wider block">
              Simulated Multiplayer lobbies
            </span>
          </div>
        </div>

        {/* Live balance indicator */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
          <Coins size={14} className="text-[#e8b923]" />
          <span className="text-xs font-bold font-mono text-[#e8b923]">
            {store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="w-full max-w-lg p-3 flex-1 flex flex-col justify-between space-y-4">
        {/* PAST crash benchmarks pills */}
        <div className="bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-xl flex items-center gap-2 overflow-x-auto">
          {history.map((h, i) => (
            <span
              key={i}
              className={`text-[9px] font-mono font-black py-0.5 px-2 rounded-md ${
                h < 2.0 ? 'bg-red-950/40 text-red-500 border border-red-900/30' : h < 5.0 ? 'bg-green-950/40 text-green-400 border border-green-900/30' : 'bg-yellow-950/40 text-yellow-500 border border-yellow-900/40'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* FLIGHT VISUAL HUD PANEL */}
        <div className="bg-[#09090b] border-2 border-[#be123c]/20 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-[240px] shadow-2xl">
          {/* Grid overlays climbing upwards */}
          <div className="absolute inset-x-0 bottom-0 top-0 border-b border-white/5 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_20px]" />

          {gameState === 'countdown' ? (
            <div className="flex flex-col items-center text-center z-10">
              <span className="text-rose-500 font-bold text-xs uppercase tracking-widest animate-pulse">
                Next Launch Countdown
              </span>
              <h2 className="text-5xl font-mono font-black text-white mt-1.5">{timerText}s</h2>
              <div className="w-40 bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-3 relative">
                <motion.div
                  className="bg-rose-500 h-full shadow-[0_0_8px_rgb(244,63,94)]"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5.0, ease: 'linear' }}
                />
              </div>
            </div>
          ) : gameState === 'flying' ? (
            <div className="flex flex-col items-center text-center z-10 w-full justify-between h-full py-4">
              {/* Rocket vector translating diagonal-up */}
              <motion.div
                animate={{
                  y: [5, -5, 5],
                  x: [-3, 3, -3],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute left-1/4 bottom-1/4 text-rose-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
              >
                <Rocket size={44} className="transform rotate-45 text-rose-500" />
              </motion.div>

              <div className="relative">
                <span className="text-zinc-500 block text-[9px] uppercase tracking-widest font-bold">
                  Active Multipliers
                </span>
                <h2 className={`text-6xl font-black font-mono tracking-wider ${getMultiplierColor(multiplier)}`}>
                  {multiplier.toFixed(2)}x
                </h2>
              </div>
            </div>
          ) : (
            /* CRASHED EXPLOSION */
            <div className="flex flex-col items-center text-center z-10 animate-bounce">
              <span className="text-red-500 font-black text-xl uppercase tracking-widest leading-none">
                💥 CRASHED 💥
              </span>
              <h3 className="text-4xl font-mono font-black text-stone-500 mt-2">
                At {multiplier.toFixed(2)}x
              </h3>
            </div>
          )}
        </div>

        {/* COMPETING MULTIPLAYER CASH-OUTS GRID (Real-time feels) */}
        {gameState === 'flying' && (
          <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-900 space-y-1.5 max-h-[85px] overflow-y-auto select-none">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 mb-1 border-b border-neutral-900 pb-1">
              <Users size={12} className="text-rose-500 shrink-0" />
              <span>Multiplayer lobby cashouts</span>
            </div>
            {players.map((p, idx) => (
              <div key={idx} className="flex justify-between text-[11px] font-semibold leading-none py-0.5">
                <span className="text-zinc-400 font-bold">{p.username} wagered {p.bet}</span>
                {p.cashed ? (
                  <span className="text-green-500 font-bold font-mono">
                    Cashed at {p.cashoutAt.toFixed(2)}x (+{p.payout})
                  </span>
                ) : (
                  <span className="text-zinc-600 uppercase font-bold text-[9px]">Flying...</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CASH OUT OR Countdown indicator */}
        {gameState === 'flying' && isWagered && (
          <button
            onClick={() => executeManualCashout(multiplier)}
            className="w-full bg-[#e01f26] border-2 border-red-500 hover:bg-neutral-950 text-white font-black text-sm tracking-widest uppercase py-4 rounded-2xl animate-pulse cursor-pointer shadow-[0_0_15px_rgba(224,31,38,0.5)] transform duration-150 hover:scale-[1.01]"
          >
            CASH OUT {(betInPlay * multiplier).toLocaleString()} COINS
          </button>
        )}

        {/* WAGERING PANEL */}
        <div className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl space-y-4 select-none">
          <div className="grid grid-cols-2 gap-3 pb-1">
            {/* Bet chips choices */}
            <div>
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Stake bet</span>
              <div className="grid grid-cols-4 gap-1 mt-1.5 h-11">
                {[100, 500, 1000, 5000].map((c) => (
                  <button
                    key={c}
                    disabled={gameState !== 'countdown' || isWagered}
                    onClick={() => setSelectedChip(c)}
                    className={`rounded-xl text-[10px] font-mono font-black border transition-all ${
                      selectedChip === c
                        ? 'bg-neutral-950 border-rose-500 text-rose-500'
                        : 'bg-neutral-950 border-neutral-800 text-zinc-500'
                    }`}
                  >
                    {c >= 1000 ? `${c / 1000}K` : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Cashout setting */}
            <div>
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Auto cashout</span>
              <input
                type="text"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 2.00"
                className="w-full bg-neutral-950 h-11 border border-neutral-800/80 rounded-xl px-3 font-semibold text-sm text-center font-mono focus:outline-none focus:border-rose-500 mt-1.5"
              />
            </div>
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={gameState !== 'countdown'}
            className={`w-full py-3.5 font-black uppercase text-xs tracking-widest rounded-xl cursor-pointer ${
              isWagered
                ? 'bg-rose-950 border border-rose-800 text-red-200 hover:bg-neutral-900 hover:text-white'
                : 'bg-gradient-to-r from-[#e01f26] to-[#b91c1c] text-white disabled:opacity-40'
            }`}
          >
            {isWagered ? `CANCEL STAKE: ${betInPlay} COINS` : `PLACE STAKE: ${selectedChip} COINS`}
          </button>
        </div>
      </div>
    </div>
  );
}
