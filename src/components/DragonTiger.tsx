/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Card {
  suit: string;
  value: string;
  rank: number;
}

type BetZone = 'dragon' | 'tie' | 'tiger';

export default function DragonTiger({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();

  const [selectedChip, setSelectedChip] = useState<number>(500);
  const [bets, setBets] = useState<Record<BetZone, number>>({ dragon: 0, tie: 0, tiger: 0 });
  const [lastBets, setLastBets] = useState<Record<BetZone, number>>({ dragon: 0, tie: 0, tiger: 0 });

  const [dragonCard, setDragonCard] = useState<Card | null>(null);
  const [tigerCard, setTigerCard] = useState<Card | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const [status, setStatus] = useState('Place your bets on Dragon, Tiger or Tie');
  const [showWinner, setShowWinner] = useState(false);
  const [payout, setPayout] = useState(0);

  const [roadMap, setRoadMap] = useState<('D' | 'T' | 'TIE')[]>([
    'D', 'T', 'D', 'D', 'T', 'TIE', 'T', 'T', 'D', 'T', 'D', 'D'
  ]);

  const cardsVal = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const spawnCard = (): Card => {
    const suits = ['♠', '♥', '♦', '♣'];
    const s = suits[Math.floor(Math.random() * suits.length)];
    const randIdx = Math.floor(Math.random() * cardsVal.length);
    return {
      suit: s,
      value: cardsVal[randIdx],
      rank: randIdx + 1, // Ace (1) to King (13)
    };
  };

  const handlePlaceBet = (zone: BetZone) => {
    if (isDealing) return;
    if (store.coins < selectedChip) {
      toast.error('Insufficient Coins!');
      return;
    }

    store.deductCoins(selectedChip, `Placed DragonTiger stake: ${zone.toUpperCase()}`, 'Dragon Tiger', 'bet_loss');
    setBets(prev => ({ ...prev, [zone]: prev[zone] + selectedChip }));

    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  const handleClear = () => {
    if (isDealing) return;
    const summons = bets.dragon + bets.tie + bets.tiger;
    if (summons > 0) {
      store.addCoins(summons, 'Refunded DragonTiger bets', 'Dragon Tiger', 'bonus');
      setBets({ dragon: 0, tie: 0, tiger: 0 });
    }
  };

  const handleRebet = () => {
    if (isDealing) return;
    const sum = lastBets.dragon + lastBets.tie + lastBets.tiger;
    if (sum === 0) {
      toast.error('No previous dragontiger bets!');
      return;
    }
    if (store.coins < sum) {
      toast.error('Insufficient coins to rebet!');
      return;
    }
    store.deductCoins(sum, 'DragonTiger rebet', 'Dragon Tiger', 'bet_loss');
    setBets({ ...lastBets });
  };

  const handleDeal = () => {
    if (isDealing) return;
    const betSums = bets.dragon + bets.tie + bets.tiger;
    if (betSums === 0) {
      toast.error('Please place a bet first!');
      return;
    }

    setIsDealing(true);
    setRevealed(0);
    setShowWinner(false);
    setStatus('Dealing cards...');
    setLastBets({ ...bets });

    let d = spawnCard();
    let t = spawnCard();

    let roundNum = parseInt(localStorage.getItem('dt_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true, true, true, false, true, true];
    const shouldWin = winPattern[roundNum];
    localStorage.setItem('dt_round_num', ((roundNum + 1) % 10).toString());

    let favoredZone: 'dragon' | 'tiger' | 'tie' = 'dragon';
    if (bets.tiger > bets.dragon && bets.tiger > bets.tie) favoredZone = 'tiger';
    else if (bets.tie > bets.dragon && bets.tie > bets.tiger) favoredZone = 'tie';
    else if (bets.dragon === 0 && bets.tiger === 0 && bets.tie === 0) favoredZone = 'dragon';
    else favoredZone = bets.dragon >= bets.tiger ? 'dragon' : 'tiger';

    let attempts = 0;
    while (attempts < 800) {
      attempts++;
      d = spawnCard();
      t = spawnCard();

      if (shouldWin) {
        if (favoredZone === 'dragon' && d.rank > t.rank) break;
        if (favoredZone === 'tiger' && t.rank > d.rank) break;
        if (favoredZone === 'tie' && d.rank === t.rank) break;
      } else {
        if (favoredZone === 'dragon' && d.rank < t.rank) break;
        if (favoredZone === 'tiger' && t.rank < d.rank) break;
        if (favoredZone === 'tie' && d.rank !== t.rank) break;
      }
    }

    setDragonCard(d);
    setTigerCard(t);

    setTimeout(() => setRevealed(1), 600);
    setTimeout(() => setRevealed(2), 1200);

    setTimeout(() => {
      evaluateResult(d, t);
    }, 1800);
  };

  const evaluateResult = (d: Card, t: Card) => {
    let outcome: 'D' | 'T' | 'TIE';
    let label = '';

    if (d.rank > t.rank) {
      outcome = 'D';
      label = 'DRAGON WINS';
    } else if (t.rank > d.rank) {
      outcome = 'T';
      label = 'TIGER WINS';
    } else {
      outcome = 'TIE';
      label = 'TIE MATCH';
    }

    setStatus(`${label} (${d.value} vs ${t.value})`);
    setRoadMap((prev) => [...prev, outcome].slice(-40));

    let finalWinnings = 0;
    if (outcome === 'D' && bets.dragon > 0) finalWinnings += bets.dragon * 2;
    if (outcome === 'T' && bets.tiger > 0) finalWinnings += bets.tiger * 2;
    if (outcome === 'TIE' && bets.tie > 0) finalWinnings += bets.tie * 9;

    // Tie rules split
    if (outcome === 'TIE') {
      finalWinnings += bets.dragon * 0.5;
      finalWinnings += bets.tiger * 0.5;
    }

    setPayout(finalWinnings);
    setShowWinner(true);

    if (finalWinnings > 0) {
      store.addCoins(finalWinnings, `Won Dragon Tiger match: ${label}`, 'Dragon Tiger', 'game_win');
    }

    setBets({ dragon: 0, tie: 0, tiger: 0 });
    setIsDealing(false);

    const betSum = bets.dragon + bets.tie + bets.tiger;
    if (betSum > 0) {
      store.addGameLog(
        'dragontiger',
        'Dragon Tiger',
        betSum,
        finalWinnings,
        finalWinnings > betSum ? 'win' : finalWinnings === betSum ? 'tie' : 'loss'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1c0c05] text-white pb-10 flex flex-col items-center select-none relative">
      <div className="absolute inset-0 bg-radial-at-c from-amber-950/20 to-neutral-950 pointer-events-none" />

      {/* Header bar */}
      <header className="w-full h-15 bg-neutral-950/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide">DRAGON TIGER LOBBY</h1>
            <span className="text-[8px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
              1-Card Rapid Casino Duel
            </span>
          </div>
        </div>

        {/* Live balance banner */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
          <Coins size={14} className="text-[#e8b923]" />
          <span className="text-xs font-bold font-mono text-[#e8b923]">
            {store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="w-full max-w-lg p-3 flex-1 flex flex-col justify-between space-y-4">
        {/* Beads Roads */}
        <div className="bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-xl flex items-center gap-1.5 overflow-x-auto">
          {roadMap.map((r, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 ${
                r === 'D' ? 'bg-red-600' : r === 'T' ? 'bg-blue-600' : 'bg-green-600'
              }`}
            >
              {r === 'TIE' ? 'T' : r}
            </span>
          ))}
        </div>

        {/* DUEL COUTURE BOARD */}
        <div className="bg-[#5c2509] border-2 border-[#823207] rounded-3xl p-5 flex flex-col relative overflow-hidden flex-1 justify-center shadow-lg min-h-[220px]">
          <div className="grid grid-cols-2 gap-8 relative z-10 text-center">
            {/* DRAGON */}
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-red-500 tracking-wider">DRAGON 🐉</span>
              <div className="w-20 h-28 border-2 border-dashed border-red-500/20 bg-black/40 rounded-2xl flex items-center justify-center mt-3 shadow-inner">
                {dragonCard && (
                  <motion.div
                    initial={{ rotateY: 180, scale: 0.8 }}
                    animate={{ rotateY: revealed > 0 ? 0 : 180, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full bg-white rounded-2xl p-3 flex flex-col justify-between text-zinc-950 font-bold select-none border border-neutral-200"
                  >
                    {revealed > 0 ? (
                      <>
                        <span className={`text-xl font-black ${dragonCard.suit === '♠' || dragonCard.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {dragonCard.value}
                        </span>
                        <span className={`text-3xl self-center ${dragonCard.suit === '♠' || dragonCard.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {dragonCard.suit}
                        </span>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-red-600 border-2 border-white rounded-2xl flex items-center justify-center font-black text-white text-sm select-none">
                        JW77
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* TIGER */}
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-blue-500 tracking-wider">TIGER 🐅</span>
              <div className="w-20 h-28 border-2 border-dashed border-blue-500/20 bg-black/40 rounded-2xl flex items-center justify-center mt-3 shadow-inner">
                {tigerCard && (
                  <motion.div
                    initial={{ rotateY: 180, scale: 0.8 }}
                    animate={{ rotateY: revealed > 1 ? 0 : 180, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full bg-white rounded-2xl p-3 flex flex-col justify-between text-zinc-950 font-bold select-none border border-neutral-200"
                  >
                    {revealed > 1 ? (
                      <>
                        <span className={`text-xl font-black ${tigerCard.suit === '♠' || tigerCard.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {tigerCard.value}
                        </span>
                        <span className={`text-3xl self-center ${tigerCard.suit === '♠' || tigerCard.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {tigerCard.suit}
                        </span>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-blue-600 border-2 border-white rounded-2xl flex items-center justify-center font-black text-white text-sm select-none">
                        JW77
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Winner Banner */}
          <AnimatePresence>
            {showWinner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-4 top-[35%] bg-neutral-950 border border-amber-500/30 rounded-2xl py-5 px-4 text-center z-20 shadow-2xl"
              >
                <h4 className="text-amber-500 font-black text-md tracking-wider uppercase leading-none">
                  {status}
                </h4>
                {payout > 0 ? (
                  <h3 className="text-2xl font-black text-green-400 font-mono mt-2 animate-pulse leading-none">
                    Payout: +{payout} Coins
                  </h3>
                ) : (
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    No active betting matches
                  </span>
                )}
                <button
                  onClick={() => setShowWinner(false)}
                  className="bg-neutral-900 text-zinc-400 hover:text-white border border-neutral-800 font-bold text-xs py-1.5 px-4 rounded-lg mt-3"
                >
                  Ok
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BET Zones */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { zone: 'dragon', title: 'DRAGON pays 1:1', border: 'border-red-500/20 hover:border-red-500 bg-red-950/10' },
            { zone: 'tie', title: 'TIE pays 8:1', border: 'border-green-500/20 hover:border-green-500 bg-green-950/10' },
            { zone: 'tiger', title: 'TIGER pays 1:1', border: 'border-blue-500/20 hover:border-blue-500 bg-blue-950/10' },
          ].map((item) => (
            <button
              key={item.zone}
              disabled={isDealing}
              onClick={() => handlePlaceBet(item.zone as BetZone)}
              className={`rounded-2xl border-2 p-3 text-center min-h-[92px] flex flex-col items-center justify-around cursor-pointer transition-all disabled:opacity-40 ${item.border}`}
            >
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{item.zone}</span>
              <span className="text-[8px] text-zinc-500 uppercase font-black">{item.title}</span>

              {bets[item.zone as BetZone] > 0 && (
                <div className="bg-[#e8b923] text-neutral-950 font-mono font-black text-[11px] py-0.5 px-2 rounded-full mt-2 shadow">
                  {bets[item.zone as BetZone].toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Choose Chip Stake</span>
            <div className="flex items-center justify-between">
              {[100, 500, 1000, 5000, 10000].map((c) => (
                <button
                  key={c}
                  disabled={isDealing}
                  onClick={() => setSelectedChip(c)}
                  className={`w-11 h-11 rounded-full font-black text-xs font-mono border-2 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer ${
                    selectedChip === c ? 'ring-2 ring-amber-400 border-amber-400 text-[#e8b923] bg-neutral-950 scale-105 shadow-md' : 'bg-neutral-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {c >= 1000 ? `${c / 1000}K` : c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleClear}
              disabled={isDealing}
              className="py-3 px-2 bg-neutral-950 hover:bg-neutral-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Clear Bets
            </button>
            <button
              onClick={handleDeal}
              disabled={isDealing}
              className="py-3 px-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-[1.01]"
            >
              DEAL DUEL
            </button>
            <button
              onClick={handleRebet}
              disabled={isDealing}
              className="py-3 px-2 bg-neutral-950 hover:bg-neutral-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Rebet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Coins icon duplication
function Coins({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={`w-${size} h-${size} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
