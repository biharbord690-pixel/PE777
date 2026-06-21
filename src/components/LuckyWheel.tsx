/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Coins, RefreshCw, Volume2, VolumeX, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

interface LuckyWheelProps {
  onBack: () => void;
}

interface Segment {
  val: string;
  mult: number;
  color: string;
}

export default function LuckyWheel({ onBack }: LuckyWheelProps) {
  const store = useCasinoStore();
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(store.settings.sound);
  
  // Handlers for payouts
  const [payoutMultiplier, setPayoutMultiplier] = useState<number | null>(null);
  const [winCoins, setWinCoins] = useState<number>(0);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 10 Segments of the Golden Lucky Wheel
  const segments: Segment[] = [
    { val: '1x', mult: 1, color: 'from-amber-600 to-amber-700' },
    { val: '0x', mult: 0, color: 'from-zinc-800 to-zinc-900' },
    { val: '2x', mult: 2, color: 'from-amber-500 to-amber-600' },
    { val: '3x', mult: 3, color: 'from-emerald-600 to-emerald-700' },
    { val: '0x', mult: 0, color: 'from-zinc-800 to-zinc-900' },
    { val: '4x', mult: 4, color: 'from-indigo-600 to-indigo-700' },
    { val: '1x', mult: 1, color: 'from-amber-600 to-amber-700' },
    { val: '5x', mult: 5, color: 'from-purple-600 to-purple-700' },
    { val: '0x', mult: 0, color: 'from-zinc-800 to-zinc-900' },
    { val: '10x', mult: 10, color: 'from-rose-600 to-rose-700' },
  ];

  const chips = [10, 50, 100, 500, 1000, 5000];

  const handleBetIncrement = (factor: number) => {
    if (isSpinning) return;
    setBet((prev) => {
      const next = prev + factor * 10;
      return next <= 0 ? 10 : Math.min(10000, next);
    });
  };

  const handleChipSelect = (val: number) => {
    if (isSpinning) return;
    setBet(val);
  };

  const triggerBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  const handleSpin = () => {
    if (isSpinning) return;

    if (store.coins < bet) {
      toast.error('Insufficient coins! Choose a lower bet or claim your rewards.');
      return;
    }

    // Deduct coins first
    store.deductCoins(bet, 'Spun Lucky Wheel', 'Lucky Wheel', 'bet_loss');
    setIsSpinning(true);
    setPayoutMultiplier(null);
    setShowWinOverlay(false);

    // Play spinning chime
    triggerBeep(440, 0.1);
    const audioInterval = setInterval(() => {
      triggerBeep(600 + Math.random() * 400, 0.05);
    }, 180);

    // Rigging control of segments
    let roundNum = parseInt(localStorage.getItem('wheel_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true, true, true, false, true, true]; // standard win
    
    let shouldWin = false;
    let isCappedWin = false;

    if (store.coins > 500) {
      // Soft cap: allow 30% wins (on rounds 2, 5, 8)
      const allowedWinners = [2, 5, 8];
      shouldWin = allowedWinners.includes(roundNum);
      isCappedWin = shouldWin;
    } else {
      shouldWin = winPattern[roundNum];
    }

    if (!store.hasDeposited) {
      shouldWin = false;
      isCappedWin = false;
    }
    localStorage.setItem('wheel_round_num', ((roundNum + 1) % 10).toString());

    // Select candidate segment
    let choiceIndex = 0;
    if (shouldWin) {
      // Find segments where multiplier is > 0
      const winableIndices = segments
        .map((s, idx) => ({ s, idx }))
        .filter((item) => {
          if (isCappedWin) {
            // Keep winnings tiny (1x or 2x only)
            return item.s.mult === 1 || item.s.mult === 2;
          }
          return item.s.mult > 0;
        })
        .map((item) => item.idx);
      
      choiceIndex = winableIndices[Math.floor(Math.random() * winableIndices.length)] || 0;
    } else {
      // Find segments where multiplier is 0
      const losingIndices = segments
        .map((s, idx) => ({ s, idx }))
        .filter((item) => item.s.mult === 0)
        .map((item) => item.idx);
      choiceIndex = losingIndices[Math.floor(Math.random() * losingIndices.length)] || 1; // fallbacks to 0x index 1
    }

    const segmentAngle = 360 / segments.length;
    // Align wheel so the target segment stops under the pointer at top (270 degrees offset)
    const targetAngle = 360 - (choiceIndex * segmentAngle) + 270;
    
    // Add multiple spins for dramatic velocity
    const finalRotation = rotation - (rotation % 360) + (3600 * 3) + targetAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      clearInterval(audioInterval);
      setIsSpinning(false);

      const chosenSegment = segments[choiceIndex];
      const winnings = bet * chosenSegment.mult;

      setPayoutMultiplier(chosenSegment.mult);
      setWinCoins(winnings);

      if (chosenSegment.mult > 0) {
        // Winner Sound
        triggerBeep(880, 0.15);
        setTimeout(() => triggerBeep(1200, 0.25), 150);

        setToastMessage(`YOU WON x${chosenSegment.mult}!`);
        setShowWinOverlay(true);

        // Add coins to balance
        store.addCoins(winnings, `Lucky Wheel Spin Win (x${chosenSegment.mult})`, 'Lucky Wheel', 'game_win');
        store.addGameLog('luckywheel', 'Lucky Wheel', bet, winnings, 'win');
      } else {
        // Loser Sound
        triggerBeep(220, 0.4);
        toast.error('Better luck next time!', {
          style: { background: '#1c1c1c', color: '#fff', border: '1px solid #7f1d1d' },
        });
        store.addGameLog('luckywheel', 'Lucky Wheel', bet, 0, 'loss');
      }
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white pb-10 flex flex-col items-center select-none relative overflow-x-hidden">
      {/* Background Holographic Atmosphere */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-[#1e1b4b]/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="w-full h-15 bg-neutral-950/80 px-4 flex items-center justify-between border-b border-neutral-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide">GOLDEN SPIN WHEEL</h1>
            <span className="text-[8px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
              Multi-Multiplier Fortune Wheel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound switch */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Live balance indicator */}
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
            <Coins size={14} className="text-[#e8b923]" />
            <span className="text-xs font-bold font-mono text-[#e8b923]">
              {store.coins.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Wheel Area */}
      <div className="w-full max-w-lg p-4 flex-1 flex flex-col justify-center space-y-6">
        
        {/* WHEEL BODY CABINET */}
        <div className="relative flex flex-col items-center">
          
          {/* Golden Peg Pointer Indicator (Points downwards from top) */}
          <div className="absolute top-1 z-30 filter drop-shadow-[0_4px_10px_rgba(232,185,35,0.6)]">
            <div className="w-6 h-8 bg-gradient-to-b from-[#e8b923] to-[#caa01a] clip-triangle shadow-2xl relative">
              <div className="absolute inset-x-0 bottom-0 h-4 bg-[#b91c1c] rounded-b-sm" />
            </div>
            {/* Soft pointer bulb */}
            <div className="w-3 h-3 bg-white rounded-full mx-auto -mt-1 shadow-inner border border-amber-400 animate-pulse" />
          </div>

          {/* Glowing Frame Border rings */}
          <div className="w-[290px] h-[290px] rounded-full border-[8px] border-neutral-900 bg-neutral-950 p-2 shadow-[0_0_30px_rgba(232,185,35,0.25)] relative flex items-center justify-center">
            
            {/* Rotating Wheel Canvas/SVG Area */}
            <motion.div
              style={{ rotate: rotation }}
              transition={{ duration: 3.2, ease: [0.15, 0.85, 0.25, 1] }}
              className="w-full h-full rounded-full relative overflow-hidden shadow-2xl bg-[#0d0e12] select-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-18">
                {segments.map((s, idx) => {
                  const angle = 360 / segments.length;
                  const startAngle = idx * angle;
                  const endAngle = startAngle + angle;
                  
                  // Convert polar to cartesian coordinates helper for SVG drawing
                  const rad1 = (Math.PI * (startAngle - 90)) / 180;
                  const rad2 = (Math.PI * (endAngle - 90)) / 180;
                  
                  const x1 = 50 + 50 * Math.cos(rad1);
                  const y1 = 50 + 50 * Math.sin(rad1);
                  const x2 = 50 + 50 * Math.cos(rad2);
                  const y2 = 50 + 50 * Math.sin(rad2);
                  
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  const textAngle = startAngle + angle / 2;
                  const textRad = (Math.PI * (textAngle - 90)) / 180;
                  const tx = 50 + 35 * Math.cos(textRad);
                  const ty = 50 + 35 * Math.sin(textRad);

                  const isLoss = s.mult === 0;

                  return (
                    <g key={idx}>
                      <path
                        d={pathData}
                        fill={isLoss ? '#11131c' : idx % 2 === 0 ? '#1b223c' : '#273155'}
                        stroke="#e8b923"
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill={isLoss ? '#64748b' : '#e8b923'}
                        fontSize="6"
                        fontWeight="900"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                      >
                        {s.val}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>

            {/* Glowing Golden Center Cap Knob */}
            <div className="absolute w-12 h-12 bg-gradient-to-r from-[#ffd700] via-[#caa01a] to-[#927008] border-4 border-neutral-900 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6)] z-20 pointer-events-none">
              <span className="text-zinc-950 font-black text-xs">SPIN</span>
            </div>
          </div>
        </div>

        {/* BET CONFIGURATION COMPONENT */}
        <div className="bg-neutral-950/80 border border-neutral-900 rounded-3xl p-5 space-y-4 shadow-xl select-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Set Wheel Stake Bet
            </span>
            <span className="text-xs font-black font-mono text-amber-500">
              Total Bet: {bet.toLocaleString()} Coins
            </span>
          </div>

          {/* Increment field bar controller */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBetIncrement(-10)}
              disabled={isSpinning}
              className="w-11 h-11 bg-neutral-900 border border-neutral-800 rounded-2xl font-bold flex items-center justify-center hover:bg-neutral-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              -100
            </button>

            <div className="flex-1 bg-neutral-950 h-11 border border-neutral-900 rounded-2xl flex items-center justify-center font-bold text-base font-mono tracking-wide text-white shadow-inner">
              {bet}
            </div>

            <button
              onClick={() => handleBetIncrement(10)}
              disabled={isSpinning}
              className="w-11 h-11 bg-neutral-900 border border-neutral-800 rounded-2xl font-bold flex items-center justify-center hover:bg-neutral-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              +100
            </button>
          </div>

          {/* Quick chips selector deck */}
          <div className="grid grid-cols-6 gap-1.5 pt-1">
            {chips.map((c) => (
              <button
                key={c}
                disabled={isSpinning}
                onClick={() => handleChipSelect(c)}
                className={`py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider transition-all uppercase cursor-pointer border ${
                  bet === c
                    ? 'bg-amber-500 border-amber-500 text-zinc-950 font-black scale-105'
                    : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {c >= 1000 ? `${c / 1000}K` : c}
              </button>
            ))}
          </div>

          {/* Huge Spin Trigger Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full h-13 mt-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black tracking-widest text-xs uppercase shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 transform active:scale-98 transition disabled:opacity-45 disabled:cursor-not-allowed uppercase"
          >
            {isSpinning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>SPINNING SEGMENTS...</span>
              </>
            ) : (
              <>
                <Trophy size={16} />
                <span>PLAY LUCKY SPIN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WIN overlay animation popup modal */}
      <AnimatePresence>
        {showWinOverlay && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center rounded-2xl z-20 p-6 select-none"
          >
            <span className="text-6xl animate-bounce">🏆</span>
            <h3 className="text-3xl font-black tracking-wider text-amber-500 mt-3 uppercase text-center animate-pulse">
              {toastMessage}
            </h3>
            <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-1">
              Lucky Wheel hit multiplier!
            </p>
            <h4 className="text-4xl font-extrabold text-[#e8b923] font-mono mt-4 tracking-wide">
              +{winCoins.toLocaleString()} <span className="text-xs uppercase font-normal text-zinc-500">Coins</span>
            </h4>

            <button
              onClick={() => setShowWinOverlay(false)}
              className="bg-gradient-to-r from-amber-400 to-amber-600 py-3 px-8 rounded-full text-zinc-950 font-black text-xs uppercase tracking-widest mt-8 cursor-pointer transform duration-150 hover:scale-105 active:scale-95 border-0 focus:outline-none"
            >
              Collect Rewards
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
