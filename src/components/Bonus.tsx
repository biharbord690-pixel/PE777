/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Gift, Zap, HelpCircle, Check, Coins, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Bonus({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();

  const [hourlyCool, setHourlyCool] = useState(store.getHourlyCooldown());
  const [dailyCool, setDailyCool] = useState(store.getDailyCooldown());

  // Fortune Spin Wheel States
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [wheelDegrees, setWheelDegrees] = useState(0);
  const [wheelCooldown, setWheelCooldown] = useState(0);
  const [wheelWinValue, setWheelWinValue] = useState<number | null>(null);

  // Wheel configuration segments
  const WHEEL_SECTORS = [
    { label: '500 Coins', color: '#dc2626', reward: 500 },     // Red
    { label: '1,000 Coins', color: '#d97706', reward: 1000 },  // Amber/Orange
    { label: '250 Coins', color: '#059669', reward: 250 },     // Emerald
    { label: '5,000 Coins 🌟', color: '#db2777', reward: 5000 },// Pink
    { label: '750 Coins', color: '#2563eb', reward: 750 },     // Blue
    { label: '1,500 Coins', color: '#7c3aed', reward: 1500 },  // Purple
    { label: '100 Coins', color: '#4b5563', reward: 100 },     // Slate
    { label: '10,000 Coins 👑', color: '#ca8a04', reward: 10000 },// Golden/Yellow
  ];

  // Set ticking intervals for countdowns and wheel cooldown
  useEffect(() => {
    const clock = setInterval(() => {
      setHourlyCool(store.getHourlyCooldown());
      setDailyCool(store.getDailyCooldown());
      setWheelCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(clock);
  }, [store]);

  // Format seconds to h:m:s
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const ss = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  const handleClaimDaily = () => {
    const res = store.claimDailyBonus();
    if (res) {
      toast.success(`🎉 Claimed Day ${res.day} Daily Bonus! +${res.amount.toLocaleString()} coins, congratulations!`, {
        duration: 4000,
        style: { background: '#1c1c1c', color: '#ffd700', border: '1px solid #e8b923' },
        icon: '🎁'
      });
    } else {
      toast.error(`Already claimed today's daily bonus. Come back in ${formatTime(dailyCool)}!`, {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' },
      });
    }
  };

  const handleClaimHourly = () => {
    const res = store.claimHourlyBonus();
    if (res) {
      toast.success(`⚡ Hourly Chest opened! Collected +${res} virtual coins!`, {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #a78bfa' },
        icon: '💎'
      });
    } else {
      toast.error(`Hourly chest is locked! Cooldown: ${formatTime(hourlyCool)}`, {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' },
      });
    }
  };

  // Perform a Deluxe Fortune Wheel spin
  const handleSpinWheel = () => {
    if (isWheelSpinning) return;
    if (wheelCooldown > 0) {
      toast.error(`Spin Wheel cooling down! Wait ${wheelCooldown} seconds.`, {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #ea580c' }
      });
      return;
    }

    setIsWheelSpinning(true);
    setWheelWinValue(null);

    // Pick a random winner index (0 to 7)
    const winnerIdx = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sector = WHEEL_SECTORS[winnerIdx];

    // Compute target rotation
    // 360 degrees / 8 sectors = 45 degrees per sector.
    const sectorAngle = 45;
    const targetAngle = 360 - (winnerIdx * sectorAngle) - (sectorAngle / 2);
    const totalRotation = (360 * 6) + targetAngle; // 6 full spins + target segment alignment

    setWheelDegrees(totalRotation);

    // Play spinning click chimes in background via Web Audio
    let pitchCounter = 0;
    const clickSoundInterval = setInterval(() => {
      if (store.settings.sound && pitchCounter < 25) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350 + (pitchCounter * 12), audioCtx.currentTime);
          gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.04);
        } catch (e) {}
        pitchCounter++;
      }
    }, 120);

    // Finalize after spinning finishes (3.2 seconds)
    setTimeout(() => {
      clearInterval(clickSoundInterval);
      
      // Award Coins
      store.addCoins(sector.reward, `Lucky Wheel Spin Reward: ${sector.label}`, 'LUCKY WHEEL', 'bonus');
      setWheelWinValue(sector.reward);
      setIsWheelSpinning(false);
      setWheelCooldown(30); // 30s reset cooldown for immediate testing!

      // Play success audio chime
      if (store.settings.sound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
          osc.start();
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
          osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
          osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.36); // C6
          osc.stop(audioCtx.currentTime + 0.6);
        } catch (err) {}
      }

      toast.success(`🎉 Fortune Smile! Secured +${sector.reward.toLocaleString()} Coins!`, {
        duration: 4000,
        icon: '👑',
        style: { background: '#131313', color: '#ca8a04', border: '2px solid #ca8a04' }
      });

    }, 3200);
  };

  const days = [
    { day: 1, val: 1000 },
    { day: 2, val: 1500 },
    { day: 3, val: 2000 },
    { day: 4, val: 2500 },
    { day: 5, val: 3000 },
    { day: 6, val: 4000 },
    { day: 7, val: 10000 },
  ];

  const currentActiveDay = store.dailyBonus.currentDay;
  const isDailyAlreadyClaimedToday = dailyCool > 0 && store.dailyBonus.lastClaim !== null && (new Date(store.dailyBonus.lastClaim).getTime() >= new Date().setHours(0,0,0,0));

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-24 flex flex-col items-center select-none w-full">
      {/* Header bar */}
      <header className="w-full h-15 bg-neutral-950/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-wide font-sans">DAILY CHEST & BONUSES</h1>
        </div>

        {/* Live balance indicator */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
          <Coins size={14} className="text-[#e8b923]" />
          <span className="text-xs font-bold font-mono text-[#e8b923]">
            {store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="w-full max-w-lg p-4 space-y-6 flex-1 flex flex-col justify-center">
        
        {/* INTERACTIVE GOLDEN DELUXE SPIN WHEEL */}
        <div className="bg-[#151515] border-2 border-[#e8b923]/25 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden text-white">
          <div className="absolute top-2 left-3 text-[10px] uppercase font-black tracking-widest text-[#e8b923]/40">
            ⭐ JW777 DELUXE
          </div>
          
          <div className="mb-4 select-none">
            <span className="text-[#e8b923] text-xs font-black uppercase tracking-[0.2em] block">
              FORTUNE WHEEL
            </span>
            <h2 className="text-lg font-black text-white mt-0.5">Spin & Claim Mega Rewards</h2>
          </div>

          {/* THE ROTATABLE WHEEL CONTAINER */}
          <div className="relative w-64 h-64 my-4 flex items-center justify-center shrink-0">
            {/* Pointer Pin Indicator */}
            <div className="absolute -top-1 z-30 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-[#e8b923] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-zinc-950 -mt-1 border border-[#e8b923]/55" />
            </div>

            {/* Glowing Wheel Outer Shadow Border Frame */}
            <div className="absolute inset-0 bg-transparent rounded-full border-[8px] border-neutral-900 shadow-[inset_0_0_12px_rgba(232,185,35,0.25)] flex items-center justify-center z-10 pointer-events-none" />
            
            {/* Spinning Wheel Body */}
            <div 
              style={{ 
                transform: `rotate(${wheelDegrees}deg)`,
                transition: isWheelSpinning ? 'transform 3.2s cubic-bezier(0.12, 0.8, 0.18, 1.01)' : 'none'
              }}
              className="absolute inset-2 rounded-full overflow-hidden border-4 border-[#e8b923]/40 shadow-inner select-none flex items-center justify-center"
            >
              {/* Dynamic SVG representation of 8 segment wedges */}
              <svg viewBox="0 0 100 100" className="w-full h-full rotate-[22.5deg]">
                {WHEEL_SECTORS.map((sec, i) => {
                  const angle = 45;
                  const startAngle = i * angle;
                  // SVG arc path calculations
                  const radStart = (startAngle * Math.PI) / 180;
                  const radEnd = ((startAngle + angle) * Math.PI) / 180;
                  
                  const x1 = 50 + 50 * Math.cos(radStart);
                  const y1 = 50 + 50 * Math.sin(radStart);
                  const x2 = 50 + 50 * Math.cos(radEnd);
                  const y2 = 50 + 50 * Math.sin(radEnd);

                  // Angle for text label rotation
                  const textAngle = startAngle + (angle / 2);
                  const radText = (textAngle * Math.PI) / 180;
                  const tx = 50 + 32 * Math.cos(radText);
                  const ty = 50 + 32 * Math.sin(radText);

                  return (
                    <g key={i}>
                      {/* Wedge arc */}
                      <path 
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                        fill={sec.color} 
                        opacity={0.92}
                        className="border border-black/20"
                      />
                      {/* Reward text aligned vertically centered */}
                      <text 
                        x={tx} 
                        y={ty} 
                        fill="#ffffff" 
                        fontSize="3.8" 
                        fontWeight="900" 
                        textAnchor="middle"
                        transform={`rotate(${textAngle - 90}, ${tx}, ${ty})`}
                        className="font-sans filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] fill-white uppercase select-none tracking-tighter"
                      >
                        {sec.reward >= 1000 ? `${sec.reward / 1000}K` : sec.reward}!
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Inner Decorative core axle plate */}
              <div className="absolute w-12 h-12 bg-neutral-950 border-[3px] border-[#e8b923] rounded-full flex items-center justify-center shadow-md z-20">
                <span className="text-[10px] font-black tracking-widest text-[#e8b923]">777</span>
              </div>
            </div>
            
            {/* Spinning active speed lines filter */}
            {isWheelSpinning && (
              <div className="absolute inset-3 rounded-full bg-amber-500/5 mix-blend-screen animate-pulse pointer-events-none z-20 border border-amber-300/10" />
            )}
          </div>

          <div className="space-y-3 w-full max-w-xs mt-1">
            {wheelWinValue !== null && (
              <div className="p-2.5 bg-zinc-950 border border-[#e8b923]/30 rounded-xl text-xs font-bold text-[#e8b923] animate-bounce">
                🚀 WON +{wheelWinValue.toLocaleString()} COINS YIELD!
              </div>
            )}

            <button
              onClick={handleSpinWheel}
              disabled={isWheelSpinning}
              className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 border-0 ${
                isWheelSpinning 
                  ? 'bg-zinc-900 border border-neutral-800 text-zinc-500' 
                  : wheelCooldown > 0
                  ? 'bg-neutral-900 border border-neutral-800/80 text-zinc-400 font-bold'
                  : 'bg-gradient-to-r from-amber-500 via-[#e8b923] to-yellow-500 text-neutral-950 hover:shadow-[0_0_15px_rgba(232,185,35,0.3)] hover:scale-[1.01] transition-all active:scale-[0.99]'
              }`}
            >
              <RefreshCw size={13} className={`${isWheelSpinning ? 'animate-spin' : ''}`} />
              {isWheelSpinning 
                ? 'Spinning...' 
                : wheelCooldown > 0 
                ? `RE-SPIN IN ${wheelCooldown}s` 
                : 'Free Spin Wheel'}
            </button>
          </div>
        </div>

        {/* DAILY CALENDAR BOX */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="text-center">
            <span className="text-[#e8b923] text-xs font-bold uppercase tracking-widest block">
              WEEKLY CHECK-IN CLUB
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">7-Day Reward Pathway</h2>
            <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-normal mt-0.5 font-semibold">
              Log in daily to claim free virtual tokens. Payout grows up to 10,000 on Day 7!
            </p>
          </div>

          {/* Grids calendar */}
          <div className="grid grid-cols-4 gap-2.5">
            {days.map((item) => {
              const matchesCurrent = item.day === currentActiveDay;
              const isPast = item.day < currentActiveDay;

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl p-2 text-center flex flex-col justify-around min-h-[82px] border select-none ${
                    item.day === 7 ? 'col-span-2 bg-gradient-to-tr from-amber-600 to-[#e01f26]/40 border-amber-500/30' : ''
                  } ${
                    matchesCurrent
                      ? 'bg-neutral-900 border-[#e8b923] ring-1 ring-[#e8b923] shadow-lg shadow-[#e8b923]/10 scale-[1.01] animate-pulse'
                      : isPast
                      ? 'bg-neutral-950 border-zinc-950 text-zinc-600'
                      : 'bg-neutral-950/60 border-neutral-900 text-zinc-500'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider block font-bold">DAY {item.day}</span>
                  <div className="text-md flex items-center justify-center text-[#ffd700] my-1">
                    {isPast ? <Check size={14} className="text-green-500" /> : '🪙'}
                  </div>
                  <span className="text-[10px] font-black font-mono tracking-tight block">
                    {item.val >= 1000 ? `${item.val / 1000}K` : item.val}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleClaimDaily}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer mt-2 flex items-center justify-center gap-2 border-0 ${
              isDailyAlreadyClaimedToday
                ? 'bg-neutral-950/80 border border-neutral-900 text-zinc-500 hover:text-zinc-400'
                : 'bg-gradient-to-r from-amber-500 to-[#e8b923] hover:shadow-[0_4px_12px_rgba(232,185,35,0.4)] text-zinc-950 transform active:scale-95 transition-all'
            }`}
          >
            <Gift size={16} />
            {isDailyAlreadyClaimedToday ? `LOCKED: NEXT IN ${formatTime(dailyCool)}` : "CLAIM TODAY'S REWARD"}
          </button>
        </div>

        {/* HOURLY BONUS CHEST CARD */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left select-none">
            <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-full border border-[#8b5cf6]/20 flex items-center justify-center text-purple-400 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] shrink-0 mx-auto">
              <Zap size={22} className="animate-bounce" />
            </div>
            <div className="text-left">
              <span className="text-purple-400 text-[10px] tracking-wider uppercase font-black block">Hourly Spin Chest</span>
              <h3 className="text-md font-extrabold text-white">Free Claim 200 Tokens</h3>
              <p className="text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">
                Resets every single hour. Cooldown: {hourlyCool > 0 ? formatTime(hourlyCool) : 'Ready!'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimHourly}
            className={`w-full md:w-auto min-w-[140px] py-3.5 px-6 rounded-xl font-extrabold text-xs tracking-wider uppercase cursor-pointer border-0 ${
              hourlyCool > 0
                ? 'bg-neutral-950 border border-neutral-900 text-zinc-500'
                : 'bg-gradient-to-r from-[#8b5cf6] to-purple-600 text-white shadow hover:scale-[1.01] active:scale-[0.99] transition-all'
            }`}
          >
            {hourlyCool > 0 ? 'LOCKED' : 'OPEN COFFER'}
          </button>
        </div>
      </div>
    </div>
  );
}
