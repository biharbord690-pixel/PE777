/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { Coins, ArrowLeft, Info, RefreshCw, TriangleAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SlotSymbol } from './SlotSymbol';

interface SlotsProps {
  gameId: string;
  gameName: string;
  onBack: () => void;
}

// Map slot variants helper
const SLOT_THEMES: Record<string, { mainColor: string; bgStyle: string; symbols: string[] }> = {
  lucky777: {
    mainColor: '#e01f26',
    bgStyle: 'from-red-950 via-[#0d0d0d] to-black',
    symbols: ['🍒', '🔔', '⭐', '💎', 'BAR', '7️⃣'] // 7️⃣ is premium, 🍒 is low
  },
  fortunedragon: {
    mainColor: '#e8b923',
    bgStyle: 'from-amber-950 via-[#0d0d0d] to-zinc-950',
    symbols: ['⚡', '🎴', '🔮', '🪙', '💰', '🐉'] // 🐉 is premium
  },
  goldentiger: {
    mainColor: '#ea580c',
    bgStyle: 'from-orange-950 via-[#0d0d0d] to-stone-950',
    symbols: ['🏮', '🎋', '👑', '🌸', '💛', '🐯']
  },
  wildwest: {
    mainColor: '#ca8a04',
    bgStyle: 'from-yellow-950 via-[#0d0d0d] to-[#0a0a0a]',
    symbols: ['🌵', '🐎', '🔫', '⭐', '💰', '🤠']
  },
  fruitfrenzy: {
    mainColor: '#16a34a',
    bgStyle: 'from-emerald-950 via-[#0d0d0d] to-[#0b0b0b]',
    symbols: ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐']
  },
  diamondrush: {
    mainColor: '#0284c7',
    bgStyle: 'from-sky-950 via-[#0d0d0d] to-zinc-950',
    symbols: ['🪙', '💠', '🌟', '👑', '💍', '💎']
  },
  neonnights: {
    mainColor: '#db2777',
    bgStyle: 'from-pink-950 via-[#0d0d0d] to-[#0c0c0c]',
    symbols: ['💡', '🧿', '🟣', '✨', '🚀', '🦄']
  },
  ancientegypt: {
    mainColor: '#854d0e',
    bgStyle: 'from-amber-900/40 via-[#0d0d0d] to-black',
    symbols: ['🐍', '📜', '👁️', '🐈', '👑', '🏺']
  },
  pirategold: {
    mainColor: '#475569',
    bgStyle: 'from-slate-900 via-[#0d0d0d] to-neutral-950',
    symbols: ['🗺️', '🦜', '⚓', '⚔️', '🪙', '🏴‍☠️']
  },
  candyblast: {
    mainColor: '#db2777',
    bgStyle: 'from-rose-950 via-[#0d0d0d] to-[#090909]',
    symbols: ['🍩', '🍫', '🧁', '🍭', '🍒', '🍬']
  },
  luckypanda: {
    mainColor: '#15803d',
    bgStyle: 'from-green-950 via-[#0d0d0d] to-neutral-900',
    symbols: ['🎋', '🏮', '🉐', '⭐', '💮', '🐼']
  },
  firephoenix: {
    mainColor: '#b91c1c',
    bgStyle: 'from-red-950/80 via-[#0d0d0d] to-black',
    symbols: ['🔥', '✨', '🥚', '👑', '🌋', '🐦']
  }
};

export default function Slots({ gameId, gameName, onBack }: SlotsProps) {
  const store = useCasinoStore();
  const theme = SLOT_THEMES[gameId] || SLOT_THEMES['lucky777'];

  // Current Bet Setting
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>([
    [theme.symbols[0], theme.symbols[1], theme.symbols[2]],
    [theme.symbols[3], theme.symbols[4], theme.symbols[5]],
    [theme.symbols[1], theme.symbols[2], theme.symbols[3]],
  ]);

  // Game Multiplier State
  const [payoutMultiplier, setPayoutMultiplier] = useState(0);
  const [winCoins, setWinCoins] = useState(0);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);

  // Auto spin state
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [isAutoSpinMode, setIsAutoSpinMode] = useState(false);

  // Free spins state
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [totalFreeWin, setTotalFreeWin] = useState(0);

  // Active winning lines index
  const [winLines, setWinLines] = useState<number[]>([]);

  // Fortune Game multiplier reel states
  const [multiplierReel, setMultiplierReel] = useState<string[]>(['2x', '4x', '5x']);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);

  // Chip options
  const chips = [1, 2, 3, 5, 10, 50, 100, 500, 1000];

  // Helper spin trigger
  const spinReels = () => {
    if (isSpinning) return;

    const actualCost = freeSpinsLeft > 0 ? 0 : bet;

    if (store.coins < actualCost) {
      toast.error('Insufficient coins! Choose lower bet or claim gifts.');
      setIsAutoSpinMode(false);
      setAutoSpinsLeft(0);
      return;
    }

    // Deduct coins
    if (freeSpinsLeft === 0) {
      store.deductCoins(bet, `Slots Bet: ${gameName}`, gameName, 'bet_loss');
    } else {
      setFreeSpinsLeft(prev => prev - 1);
    }

    // Sound effect
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    }

    setIsSpinning(true);
    setPayoutMultiplier(0);
    setWinCoins(0);
    setShowWinOverlay(false);
    setWinLines([]);

    // Custom spin animation loop (blur or mock changes)
    let counter = 0;
    const interval = setInterval(() => {
      setGrid([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);
      const pM = ['1x', '2x', '4x', '5x'];
      setMultiplierReel([
        pM[Math.floor(Math.random() * pM.length)],
        pM[Math.floor(Math.random() * pM.length)],
        pM[Math.floor(Math.random() * pM.length)],
      ]);
      counter++;
      if (counter >= 10) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 70);
  };

  const getRandomSymbol = () => {
    const list = theme.symbols;
    // Add scatter with low chance
    const rand = Math.random();
    if (rand < 0.07) return '⭐'; // Star / Scatter on any theme matches Scatter
    if (rand < 0.12 && list[4]) return list[4]; // High regular
    return list[Math.floor(Math.random() * list.length)];
  };

  const finalizeSpin = () => {
    // Check soft cap condition if balance > 500
    const isHighBalance = store.coins > 500;

    // Generate final layout
    let finalGrid = [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    ];

    let roundNum = parseInt(localStorage.getItem('slots_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true, true, true, false, true, true];
    
    let shouldWin = false;
    let isCappedWin = false;

    if (isHighBalance) {
      // Out of 10 games, let them win 3 games (30% win rate), e.g. on round 2, 5, 8
      const highBalanceWinners = [2, 5, 8];
      shouldWin = highBalanceWinners.includes(roundNum);
      isCappedWin = shouldWin; // restrict multipliers / payout
    } else {
      shouldWin = winPattern[roundNum];
    }

    if (!store.hasDeposited) {
      shouldWin = false;
      isCappedWin = false;
    }
    
    localStorage.setItem('slots_round_num', ((roundNum + 1) % 10).toString());

    if (shouldWin) {
      // Force middle row to match
      let winSym = theme.symbols[Math.floor(Math.random() * theme.symbols.length)] || '🍒';
      if (isCappedWin) {
        // use lower paying symbols for lower payout (0th or 1st symbol)
        winSym = theme.symbols[0] || '🍒';
      }
      finalGrid[1] = [winSym, winSym, winSym];
    } else {
      // Force no matches by mixing symbols
      const syms = [...theme.symbols, '⭐', '🍒', '🍋', '🍇'];
      finalGrid = [
        [syms[0] || '🍒', syms[1] || '🍋', syms[2] || '🍇'],
        [syms[3] || '🍎', syms[4] || '🍊', syms[0] || '🍒'],
        [syms[1] || '🍋', syms[2] || '🍇', syms[3] || '🍎'],
      ];
    }

    setGrid(finalGrid);

    // Multiplier reel selection for ALL SLOTS !!
    let chosenMultiplier = 1;
    let multOptions = ['1x', '2x', '4x', '5x'];
    if (isCappedWin) {
      // Force low multipliers if capped win
      multOptions = ['1x', '2x'];
    }
    const topMult = multOptions[Math.floor(Math.random() * multOptions.length)];
    const middleMult = multOptions[Math.floor(Math.random() * multOptions.length)];
    const bottomMult = multOptions[Math.floor(Math.random() * multOptions.length)];
    setMultiplierReel([topMult, middleMult, bottomMult]);
    
    chosenMultiplier = parseInt(middleMult.replace('x', ''), 10);
    setActiveMultiplier(chosenMultiplier);

    // Evaluate pays
    // Lines:
    // Line 0: Row 1 matches [1,0], [1,1], [1,2] (middle)
    // Line 1: Row 0 matches [0,0], [0,1], [0,2] (top)
    // Line 2: Row 2 matches [2,0], [2,1], [2,2] (bottom)
    // Line 3: Diagonal TL to BR [0,0], [1,1], [2,2]
    // Line 4: Diagonal BL to TR [2,0], [1,1], [0,2]

    const matchedLines: number[] = [];
    let multiplierVal = 0;

    const checkLine = (s1: string, s2: string, s3: string) => {
      if (s1 === s2 && s2 === s3) {
        // High paid premium
        if (s1 === theme.symbols[5]) return 35; // Ultimate core themed symbol (tiger, dragon etc)
        if (s1 === theme.symbols[4]) return 15;
        if (s1 === '⭐') return 50; // Scatter
        return 8; // Low medium symbol
      }
      // Wild subs
      if ((s1 === s2 && s3 === '⭐') || (s1 === s3 && s2 === '⭐')) return 5;
      return 0;
    };

    // Row middle
    let score0 = checkLine(finalGrid[1][0], finalGrid[1][1], finalGrid[1][2]);
    if (score0 > 0) { multiplierVal += score0; matchedLines.push(1); }
    // Row top
    let score1 = checkLine(finalGrid[0][0], finalGrid[0][1], finalGrid[0][2]);
    if (score1 > 0) { multiplierVal += score1; matchedLines.push(2); }
    // Row bottom
    let score2 = checkLine(finalGrid[2][0], finalGrid[2][1], finalGrid[2][2]);
    if (score2 > 0) { multiplierVal += score2; matchedLines.push(3); }
    // Diagonal TL-BR
    let score3 = checkLine(finalGrid[0][0], finalGrid[1][1], finalGrid[2][2]);
    if (score3 > 0) { multiplierVal += score3; matchedLines.push(4); }
    // Diagonal BL-TR
    let score4 = checkLine(finalGrid[2][0], finalGrid[1][1], finalGrid[0][2]);
    if (score4 > 0) { multiplierVal += score4; matchedLines.push(5); }

    // Count scatters for free spin activation
    let scatterCount = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (finalGrid[r][c] === '⭐') scatterCount++;
      }
    }

    let freeSpinsAwarded = 0;
    if (scatterCount >= 3) {
      freeSpinsAwarded = 5;
    }

    if ((isHighBalance && !shouldWin) || !store.hasDeposited) {
      multiplierVal = 0;
      matchedLines.length = 0;
      scatterCount = 0;
      freeSpinsAwarded = 0;
    }

    setWinLines(matchedLines);
    setIsSpinning(false);

    if (multiplierVal > 0) {
      // Big Winner
      const finalMult = multiplierVal * chosenMultiplier;
      const winnings = bet * finalMult;
      setPayoutMultiplier(finalMult);
      setWinCoins(winnings);
      setShowWinOverlay(true);

      // Add to balance
      store.addCoins(winnings, `Won on ${gameName} slots (x${finalMult})`, gameName, 'game_win');
      store.addGameLog(gameId, gameName, bet, winnings, 'win');

      if (freeSpinsLeft > 0) {
        setTotalFreeWin(p => p + winnings);
      }

      // Play victory sound
      if (store.settings.sound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);
          osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
          osc1.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.15);
          osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3);
          osc1.frequency.setValueAtTime(880, audioCtx.currentTime + 0.45);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
          osc1.start();
          osc1.stop(audioCtx.currentTime + 0.8);
        } catch (e) {}
      }
    } else {
      store.addGameLog(gameId, gameName, bet, 0, 'loss');
    }

    // Handle free spins trigger
    if (freeSpinsAwarded > 0) {
      setFreeSpinsLeft(p => p + freeSpinsAwarded);
      toast.success(`🎰 BONUS DISK TRIGGERED! +${freeSpinsAwarded} FREE SPINS AWARDED!`, {
        duration: 4000,
        style: { background: '#1c1c1c', color: '#ffd700', border: '1px solid #ffd700' }
      });
    }
  };

  // Auto-Spin Trigger loop
  useEffect(() => {
    let timerID: NodeJS.Timeout;
    if (isAutoSpinMode && autoSpinsLeft > 0 && !isSpinning && !showWinOverlay) {
      timerID = setTimeout(() => {
        setAutoSpinsLeft(p => p - 1);
        spinReels();
      }, 900);
    } else if (isAutoSpinMode && autoSpinsLeft === 0) {
      setIsAutoSpinMode(false);
      toast.success('Auto-spins completed.');
    }
    return () => clearTimeout(timerID);
  }, [isAutoSpinMode, autoSpinsLeft, isSpinning, showWinOverlay]);

  // Handle Free Spins automatically triggers
  useEffect(() => {
    let fTimer: NodeJS.Timeout;
    if (freeSpinsLeft > 0 && !isSpinning && !showWinOverlay) {
      fTimer = setTimeout(() => {
        spinReels();
      }, 1000);
    } else if (freeSpinsLeft === 0 && totalFreeWin > 0) {
      toast.success(`🎉 Total Free Spins Win: ${totalFreeWin.toLocaleString()} Coins!`, {
        duration: 5000,
        icon: '💎'
      });
      setTotalFreeWin(0);
    }
    return () => clearTimeout(fTimer);
  }, [freeSpinsLeft, isSpinning, showWinOverlay]);

  const handleBetIncrement = (val: number) => {
    const nextBet = Math.max(10, bet + val);
    if (nextBet <= store.coins) {
      setBet(nextBet);
    }
  };

  const handleChipSelect = (chip: number) => {
    if (chip <= store.coins) {
      setBet(chip);
    } else {
      toast.error('Insufficient coins for this bet Amount!');
    }
  };

  const handleSetMaxBet = () => {
    // Round to reasonable intervals
    const maxVal = Math.min(10000, store.coins);
    setBet(maxVal > 0 ? maxVal : 100);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bgStyle} text-white pb-10 flex flex-col items-center select-none`}>
      {/* Top navbar */}
      <header className="w-full h-15 bg-neutral-950/80 px-4 flex items-center justify-between border-b border-neutral-900/60 sticky top-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide truncate max-w-[150px]">{gameName}</h1>
            <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
              3x3 Classic Multiplier Slot
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

      <div className="w-full max-w-lg p-4 flex-1 flex flex-col justify-center space-y-4">
        {/* Banner announcement for free spins */}
        {freeSpinsLeft > 0 && (
          <div className="bg-gradient-to-r from-purple-900/30 via-zinc-950/80 to-purple-950/30 border border-purple-500/30 py-2.5 rounded-2xl text-center shadow animate-pulse">
            <span className="text-xs font-black text-purple-400 tracking-wider uppercase block">
              ⭐ FREE SPINS ROUND IN PLAY! ⭐
            </span>
            <span className="text-xl font-black text-yellow-400 font-mono mt-1 block">
              {freeSpinsLeft} SPINS REMAINING
            </span>
          </div>
        )}

        {/* SLOT CABINET CABINET */}
        <div className="relative bg-neutral-950 border-4 border-neutral-800 bg-radial-at-c from-neutral-900/40 to-neutral-950 p-4 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
          {/* Inner cabinet neon highlight border */}
          <div className="absolute inset-0 border border-amber-500/10 rounded-2xl pointer-events-none" />

          {/* Main Reels Area */}
          <div className="flex gap-3 relative pb-1 items-center justify-center w-full">
            {/* 3x3 Slots Grid Box */}
            <div className="grid grid-cols-3 gap-3 relative flex-1 h-[300px]">
              {/* Payline indicators representation overlay */}
              <div className="absolute inset-0 pointer-events-none select-none z-10">
                {/* Row middle */}
                {winLines.includes(1) && (
                  <div className="absolute top-[50%] left-0 right-0 h-[3px] bg-red-500 shadow-[0_0_8px_#ef4444]" />
                )}
                {/* Row top */}
                {winLines.includes(2) && (
                  <div className="absolute top-[16.6%] left-0 right-0 h-[3px] bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                )}
                {/* Row bottom */}
                {winLines.includes(3) && (
                  <div className="absolute top-[83.3%] left-0 right-0 h-[3px] bg-green-500 shadow-[0_0_8px_#22c55e]" />
                )}
                {/* Diagonal TL-BR */}
                {winLines.includes(4) && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 border-t-2 border-l-2 origin-top-left rotate-[34deg] w-[122%] h-0 border-yellow-500 shadow-[0_0_8px_#eab308] translate-y-3 pl-3" />
                )}
                {/* Diagonal BL-TR */}
                {winLines.includes(5) && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 border-b-2 border-l-2 origin-bottom-left -rotate-[34deg] w-[122%] h-0 border-indigo-500 shadow-[0_0_8px_#6366f1] -translate-y-3 pl-3" />
                )}
              </div>

              {/* Reel Columns */}
              {[0, 1, 2].map((colId) => (
                <div
                  key={colId}
                  className="bg-[#121212] border-2 border-neutral-900 rounded-2xl flex flex-col divide-y divide-neutral-950 p-1 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] overflow-hidden h-[300px] justify-around"
                >
                  {[0, 1, 2].map((rowId) => (
                    <motion.div
                      key={rowId}
                      className="flex flex-col items-center justify-center p-2 rounded-xl text-4xl h-24 select-none relative"
                      animate={isSpinning ? { y: [100, -100, 0] } : {}}
                      transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.15 }}
                    >
                      {grid[rowId] ? (
                        <SlotSymbol symbol={grid[rowId][colId]} size={56} />
                      ) : (
                        <SlotSymbol symbol="🍒" size={56} />
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            {/* 4th Column: Win Multiplier Reel */}
            <div
              className="w-20 bg-[#121212] border-2 border-[#e8b923] rounded-2xl flex flex-col divide-y divide-neutral-900 p-1 h-[300px] justify-around relative overflow-hidden shadow-[0_0_15px_rgba(232,185,35,0.3)] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950"
            >
              {/* Label indicator */}
              <div className="absolute top-1 inset-x-0 text-center select-none z-10 pointer-events-none">
                <span className="text-[6px] font-black tracking-widest text-[#e8b923] bg-neutral-950 px-1 py-0.5 rounded border border-[#e8b923]/30 uppercase">
                  Multiplier
                </span>
              </div>

              {multiplierReel.map((mult, id) => (
                <motion.div
                  key={id}
                  className={`flex flex-col items-center justify-center p-1 font-black select-none relative transition-all duration-300 h-24 ${
                    id === 1
                      ? 'text-[#e8b923] scale-110'
                      : 'text-zinc-600 scale-90 opacity-60'
                  }`}
                  animate={isSpinning ? { y: [100, -100, 0] } : {}}
                  transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.12 }}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 text-sm bg-neutral-950/80 font-black shadow-md ${
                    id === 1 ? 'border-[#e8b923] shadow-[0_0_12px_rgba(232,185,35,0.35)]' : 'border-zinc-800'
                  }`}>
                    {mult}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Winning payout notifications card banner */}
          <AnimatePresence>
            {showWinOverlay && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-2xl z-20 p-6 select-none"
              >
                {/* Golden spark particles */}
                <span className="text-5xl animate-[bounce_1s_infinite]">🎰</span>
                <h3 className="text-3xl font-black tracking-wider text-amber-500 mt-3 uppercase text-center animate-pulse">
                  Line Match Win!
                </h3>
                <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-1">
                  Multiplier: <span className="text-white font-black font-mono">x{payoutMultiplier}</span>
                </p>
                <h4 className="text-4xl font-extrabold text-[#e8b923] font-mono mt-4 tracking-wide">
                  +{winCoins.toLocaleString()} <span className="text-xs uppercase font-normal text-zinc-500">Coins</span>
                </h4>

                <button
                  onClick={() => setShowWinOverlay(false)}
                  className="bg-gradient-to-r from-[#e8b923] to-[#caa01a] py-2 px-6 rounded-full text-zinc-950 font-black text-xs uppercase tracking-widest mt-6 cursor-pointer transform duration-150 hover:scale-105 active:scale-95 border-0 focus:outline-none"
                >
                  Collect Win
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTROLS & BET SELECTOR PANEL */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-2xl p-4 space-y-4">
          {/* Bet size and selector chips */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                Select Stake Bet
              </span>
              <span className="text-xs font-black font-mono text-[#e8b923]">
                Total: {bet.toLocaleString()} Coins
              </span>
            </div>

            {/* Incrementor field bar */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBetIncrement(-1)}
                disabled={isSpinning || freeSpinsLeft > 0}
                className="w-10 h-10 bg-neutral-900 border border-neutral-800/85 hover:border-neutral-500/50 rounded-xl font-bold flex items-center justify-center hover:bg-neutral-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-40 cursor-pointer"
              >
                -
              </button>

              <div className="flex-1 bg-neutral-950 h-10 border border-neutral-900 rounded-xl flex items-center justify-center font-bold text-sm font-mono tracking-wide text-zinc-100">
                {bet}
              </div>

              <button
                onClick={() => handleBetIncrement(1)}
                disabled={isSpinning || freeSpinsLeft > 0}
                className="w-10 h-10 bg-neutral-900 border border-neutral-800/85 hover:border-neutral-500/50 rounded-xl font-bold flex items-center justify-center hover:bg-neutral-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Rapid chips selectors */}
            <div className="grid grid-cols-5 gap-1.5 mt-1">
              {chips.map((c) => (
                <button
                  key={c}
                  disabled={isSpinning || freeSpinsLeft > 0}
                  onClick={() => handleChipSelect(c)}
                  className={`py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all uppercase cursor-pointer border ${
                    bet === c
                      ? 'bg-neutral-950 border-[#e8b923] text-[#e8b923]'
                      : 'bg-neutral-900 border-neutral-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c >= 1000 ? `${c / 1000}K` : c}
                </button>
              ))}

              <button
                disabled={isSpinning || freeSpinsLeft > 0}
                onClick={handleSetMaxBet}
                className="bg-neutral-900 hover:bg-neutral-800 border border-dashed border-red-500/40 hover:border-red-500 text-red-400 rounded-lg py-1.5 text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Spin buttons executing bar */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {/* Auto Spin controls */}
            <div className="col-span-1 flex flex-col justify-center">
              {isAutoSpinMode ? (
                <button
                  onClick={() => setIsAutoSpinMode(false)}
                  className="w-full bg-red-950 border border-red-800 text-red-200 text-center rounded-xl p-2.5 flex flex-col items-center justify-center hover:bg-red-900 cursor-pointer text-[10px] font-black uppercase leading-tight"
                >
                  <RefreshCw size={14} className="animate-spin text-red-500 mb-1" />
                  <span>STOP</span>
                  <span className="text-[8px] font-mono mt-0.5">({autoSpinsLeft}L)</span>
                </button>
              ) : (
                <button
                  disabled={isSpinning || freeSpinsLeft > 0}
                  onClick={() => {
                    setAutoSpinsLeft(10);
                    setIsAutoSpinMode(true);
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 text-zinc-400 hover:text-white text-center rounded-xl p-2.5 flex flex-col items-center justify-center hover:bg-neutral-850 cursor-pointer text-[10px] font-black uppercase leading-tight disabled:opacity-40"
                >
                  <RefreshCw size={14} className="text-[#e8b923] mb-1" />
                  <span>AUTO</span>
                  <span className="text-[8px] font-mono mt-0.5">10 SPINS</span>
                </button>
              )}
            </div>

            {/* SPIN BUTTON */}
            <button
              onClick={spinReels}
              disabled={isSpinning || freeSpinsLeft > 0}
              className={`col-span-2 h-16 rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer transform active:scale-95 transition-all shadow-lg select-none relative overflow-hidden disabled:opacity-40 ${
                isSpinning
                  ? 'bg-neutral-900 border border-zinc-800 text-zinc-600'
                  : 'bg-gradient-to-r from-[#e01f26] to-red-600 hover:shadow-[0_4px_16px_rgba(224,31,38,0.5)] border-2 border-red-400/20'
              }`}
            >
              <span className="text-lg font-black tracking-widest uppercase">
                {isSpinning ? 'SPINNING' : 'SPIN'}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#ffd700] mt-0.5 h-3">
                {freeSpinsLeft > 0 ? 'FREE SPIN ROUND' : `Stake: ${bet}`}
              </span>
            </button>

            {/* Paytable Guide button */}
            <div className="col-span-1 flex flex-col justify-center">
              <button
                onClick={() => setShowPaytable(true)}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-zinc-400 hover:text-white text-center rounded-xl p-2.5 flex flex-col items-center justify-center hover:bg-[#151515] hover:text-white cursor-pointer text-[10px] font-black uppercase leading-tight"
              >
                <Info size={14} className="text-blue-500 mb-1" />
                <span>PAYOUTS</span>
                <span className="text-[8px] font-mono mt-0.5">GUIDE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paytable Modal overlay */}
      <AnimatePresence>
        {showPaytable && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-40 select-none">
            <div className="bg-[#1e1e1e] border-2 border-[#e8b923]/30 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative">
              <button
                onClick={() => setShowPaytable(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X icon size={16} />
              </button>

              <h3 className="text-lg font-black text-amber-500 text-center mb-4 uppercase tracking-widest border-b border-neutral-900 pb-3">
                {gameName} Paytable
              </h3>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-bold border-b border-zinc-950 pb-1 uppercase tracking-wider">
                  <span>Match Symbols (3x)</span>
                  <span>Payout Stake</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <SlotSymbol symbol={theme.symbols[5] || '🐉'} size={28} />
                    <span className="text-zinc-300 font-bold">Premium Core</span>
                  </div>
                  <span className="text-[#e8b923] font-black font-mono">x35 Bet</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <SlotSymbol symbol="⭐" size={28} />
                    <span className="text-zinc-300 font-bold">Wild Scatter</span>
                  </div>
                  <span className="text-[#e8b923] font-black font-mono">x50 Bet & Free Spins</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <SlotSymbol symbol={theme.symbols[4] || '👑'} size={28} />
                    <span className="text-zinc-300 font-bold">Medium Lucky</span>
                  </div>
                  <span className="text-[#e8b923] font-black font-mono">x15 Bet</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2 font-bold text-zinc-500 text-xs tracking-wider">
                    <span className="text-lg">Any Other Match</span>
                    <span>General Fruit/Icon</span>
                  </div>
                  <span className="text-[#e8b923] font-black font-mono">x8 Bet</span>
                </div>

                <div className="flex items-center gap-2.5 mt-5 p-2 bg-[#e01f26]/10 border border-[#e01f26]/30 rounded-xl">
                  <TriangleAlert size={14} className="text-[#e01f26] shrink-0" />
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Wild Scatter substitutes for adjacent symbols on any payline. 3 Scatters triggers the Free Spins loops!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPaytable(false)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-zinc-300 hover:text-white font-bold text-xs uppercase py-2.5 rounded-xl border border-neutral-800 mt-5 transition-all text-center cursor-pointer"
              >
                Close Paytable
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline X icon bypasses missing lucide-react imports safely
function X({ icon, size }: { icon?: any; size: number }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
