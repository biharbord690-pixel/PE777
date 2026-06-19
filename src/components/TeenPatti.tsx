/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Coins, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Card {
  suit: string;
  value: string;
  rank: number; // 2=2 to Ace=14
}

interface HandResult {
  score: number; // higher is better
  name: string;
}

export default function TeenPatti({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();

  const [selectedChip, setSelectedChip] = useState<number>(500);
  const [anteBet, setAnteBet] = useState<number>(0);
  const [playBet, setPlayBet] = useState<number>(0);

  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);

  const [gamePhase, setGamePhase] = useState<'betting' | 'dealing' | 'action' | 'revealed'>('betting');
  const [revealedCount, setRevealedCount] = useState(0);

  const [status, setStatus] = useState('Place your Ante Bet to play Teen Patti');
  const [payout, setPayout] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Evaluation definitions
  const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const spawnCard = (): Card => {
    const suits = ['♠', '♥', '♦', '♣'];
    const s = suits[Math.floor(Math.random() * suits.length)];
    const valIdx = Math.floor(Math.random() * VALUES.length);
    return {
      suit: s,
      value: VALUES[valIdx],
      rank: valIdx + 2, // 2 to 14 (Ace)
    };
  };

  // 3-Card evaluation math
  const evaluateHand = (cards: Card[]): HandResult => {
    if (cards.length < 3) return { score: 0, name: 'Invalid' };

    // Sort descending by rank
    const sCards = [...cards].sort((a, b) => b.rank - a.rank);
    const r1 = sCards[0].rank;
    const r2 = sCards[1].rank;
    const r3 = sCards[2].rank;

    const s1 = sCards[0].suit;
    const s2 = sCards[1].suit;
    const s3 = sCards[2].suit;

    const isTrail = r1 === r2 && r2 === r3;
    const isColor = s1 === s2 && s2 === s3;

    // Check sequence (Straight) (Also handle A-2-3 as special)
    let isSeq = false;
    if (r1 - r2 === 1 && r2 - r3 === 1) {
      isSeq = true;
    } else if (r1 === 14 && r2 === 3 && r3 === 2) {
      // Special A-2-3 low sequence
      isSeq = true;
    }

    const isPureSeq = isSeq && isColor;

    const isPair = r1 === r2 || r2 === r3 || r1 === r3;

    // Encode scores: Trail (6m), PureSeq (5m), Seq (4m), Color (3m), Pair (2m), HighCard (1m)
    if (isTrail) {
      return { score: 6000000 + r1, name: 'Trail / Trio' };
    }
    if (isPureSeq) {
      return { score: 5000000 + r1, name: 'Pure Sequence' };
    }
    if (isSeq) {
      return { score: 4000000 + r1, name: 'Sequence' };
    }
    if (isColor) {
      return { score: 3000000 + r1 * 100 + r2 * 10 + r3, name: 'Color / Flush' };
    }
    if (isPair) {
      // Find pair value and kick value
      let pairRank = r1;
      let kicker = r3;
      if (r2 === r3) {
        pairRank = r2;
        kicker = r1;
      } else if (r1 === r3) {
        pairRank = r1;
        kicker = r2;
      }
      return { score: 2000000 + pairRank * 100 + kicker, name: `Pair of ${sCards.find(c => c.rank === pairRank)?.value}'s` };
    }

    // High card
    return { score: 1000000 + r1 * 100 + r2 * 10 + r3, name: 'High Card' };
  };

  const handlePlaceAnte = () => {
    if (gamePhase !== 'betting') return;

    if (store.coins < selectedChip) {
      toast.error('Insufficient Coins!');
      return;
    }

    store.deductCoins(selectedChip, 'Teen Patti Ante Placement', 'Teen Patti', 'bet_loss');
    setAnteBet((prev) => prev + selectedChip);

    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  const handleClear = () => {
    if (gamePhase !== 'betting') return;
    if (anteBet > 0) {
      store.addCoins(anteBet, 'Refunded Ante Bet', 'Teen Patti', 'bonus');
      setAnteBet(0);
    }
  };

  const handleDeal = () => {
    if (gamePhase !== 'betting') return;
    if (anteBet === 0) {
      toast.error('Please place your Ante Bet first!');
      return;
    }

    setGamePhase('dealing');
    setRevealedCount(0);
    setShowResult(false);
    setStatus('Dealing cards...');

    // Draw 3 cards each with win control loop
    let p1 = spawnCard();
    let p2 = spawnCard();
    let p3 = spawnCard();
    let d1 = spawnCard();
    let d2 = spawnCard();
    let d3 = spawnCard();

    let pHand = [p1, p2, p3];
    let dHand = [d1, d2, d3];

    let roundNum = parseInt(localStorage.getItem('tp_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true, true, true, false, true, true];
    const shouldWin = winPattern[roundNum];
    localStorage.setItem('tp_round_num', ((roundNum + 1) % 10).toString());

    let attempts = 0;
    while (attempts < 800) {
      attempts++;
      p1 = spawnCard();
      p2 = spawnCard();
      p3 = spawnCard();
      d1 = spawnCard();
      d2 = spawnCard();
      d3 = spawnCard();

      pHand = [p1, p2, p3];
      dHand = [d1, d2, d3];

      const pResult = evaluateHand(pHand);
      const dResult = evaluateHand(dHand);

      if (shouldWin) {
        if (pResult.score > dResult.score) break;
      } else {
        if (pResult.score < dResult.score) break;
      }
    }

    setPlayerCards(pHand);
    setDealerCards(dHand);

    // Animate initial deal (show only player cards, dealer is face down)
    setTimeout(() => {
      setRevealedCount(3); // player cards revealed
      setGamePhase('action');
      setStatus('Cards Dealt! Select Play (Ante x1) or Fold.');
    }, 1200);
  };

  const handleFold = () => {
    if (gamePhase !== 'action') return;
    store.addGameLog('teenpatti', 'Teen Patti', anteBet, 0, 'loss');

    setStatus('You Folded. Dealer wins Ante.');
    setAnteBet(0);
    setPlayBet(0);
    setGamePhase('betting');
    toast.error('Folded hand. Ante bet lost.', {
      style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' },
    });
  };

  const handlePlay = () => {
    if (gamePhase !== 'action') return;

    if (store.coins < anteBet) {
      toast.error('Insufficient cash to place Play bet (must match Ante)!');
      return;
    }

    // Deduct equivalent stake for play
    store.deductCoins(anteBet, 'Placed Teen Patti Play Bet', 'Teen Patti', 'bet_loss');
    setPlayBet(anteBet);
    setGamePhase('revealed');
    setStatus('Revealing Dealer cards...');

    // Expand reveal index
    setRevealedCount(6);

    // Evaluate ranks
    setTimeout(() => {
      const pResult = evaluateHand(playerCards);
      const dResult = evaluateHand(dealerCards);

      let finalWinnings = 0;
      let outcomeLabel = '';
      let logRes: 'win' | 'loss' | 'tie' = 'loss';

      // Compare
      if (pResult.score > dResult.score) {
        outcomeLabel = `YOU WIN with ${pResult.name}!`;
        // pays 1:1 on Ante, and 1:1 on Play (so total returns is 4x the original ante!)
        finalWinnings = anteBet * 2 + anteBet * 2;
        logRes = 'win';
      } else if (dResult.score > pResult.score) {
        outcomeLabel = `DEALER WINS with ${dResult.name}!`;
        finalWinnings = 0;
        logRes = 'loss';
      } else {
        outcomeLabel = 'SPLIT POT TIE';
        finalWinnings = anteBet + anteBet; // refund
        logRes = 'tie';
      }

      setPayout(finalWinnings);
      setStatus(outcomeLabel);
      setShowResult(true);

      if (finalWinnings > 0) {
        store.addCoins(finalWinnings, `Won Teen Patti: ${outcomeLabel}`, 'Teen Patti', 'game_win');
      }

      setAnteBet(0);
      setPlayBet(0);

      store.addGameLog('teenpatti', 'Teen Patti', anteBet * 2, finalWinnings, logRes);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#02131e] text-white pb-10 flex flex-col items-center select-none relative">
      <div className="absolute inset-0 bg-radial-at-c from-sky-950/20 to-neutral-950 pointer-events-none" />

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
            <h1 className="text-sm font-black tracking-wide font-sans">ROYAL TEEN PATTI 3-CARD</h1>
            <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Classic Indian Flush variant
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
        {/* VELVET FELT TABLE */}
        <div className="bg-[#032a3d] border-2 border-[#005177] rounded-3xl p-5 flex flex-col relative overflow-hidden flex-1 justify-around shadow-inner min-h-[300px]">
          {/* DEALER SIDE */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-zinc-400 select-none">
              Dealer's Deck 🤵
            </span>
            <div className="flex gap-2.5 mt-2.5 min-h-[96px] items-center">
              {dealerCards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ rotateY: 180, scale: 0.7 }}
                  animate={{ rotateY: revealedCount > 3 ? 0 : 180, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-24 bg-white rounded-2xl p-2.5 flex flex-col justify-between text-zinc-950 font-bold border border-zinc-200 shadow"
                >
                  {revealedCount > 3 ? (
                    <>
                      <span className={`text-md leading-none ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                        {c.value}
                      </span>
                      <span className={`text-3xl self-center ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                        {c.suit}
                      </span>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[#075177] border-2 border-white rounded-2xl flex items-center justify-center font-black text-white text-xs select-none">
                      JW77
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* PLAYER SIDE */}
          <div className="flex flex-col items-center">
            <div className="flex gap-2.5 mb-2.5 min-h-[96px] items-center">
              {playerCards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ rotateY: 180, scale: 0.7 }}
                  animate={{ rotateY: revealedCount > i ? 0 : 180, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-24 bg-white rounded-2xl p-2.5 flex flex-col justify-between text-zinc-950 font-bold border border-zinc-200 shadow"
                >
                  {revealedCount > i ? (
                    <>
                      <span className={`text-md leading-none ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                        {c.value}
                      </span>
                      <span className={`text-3xl self-center ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                        {c.suit}
                      </span>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[#075177] border-2 border-white rounded-2xl flex items-center justify-center font-black text-white text-xs select-none">
                      JW77
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <span className="text-[10px] uppercase font-black text-zinc-400 select-none">
              Your Deck 🧑 (Hand: {playerCards.length > 0 ? evaluateHand(playerCards).name : 'Void'})
            </span>
          </div>

          {/* Result Banner Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7 }}
                className="absolute inset-x-4 top-[35%] bg-neutral-950 border border-[#e8b923]/35 p-5 rounded-2xl text-center z-20 shadow-2xl"
              >
                <h4 className="text-amber-500 font-extrabold tracking-wider text-sm uppercase">
                  {status}
                </h4>
                {payout > 0 ? (
                  <h3 className="text-2xl font-black text-green-400 mt-2 font-mono tracking-wide">
                    Winnings: +{payout.toLocaleString()} Coins
                  </h3>
                ) : (
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5 block">
                    Dealer wins ante stake
                  </span>
                )}
                <button
                  onClick={() => {
                    setShowResult(false);
                    setGamePhase('betting');
                    setPlayerCards([]);
                    setDealerCards([]);
                  }}
                  className="bg-neutral-900 font-bold border border-zinc-800 py-1.5 px-6 rounded-lg text-xs mt-4 text-center cursor-pointer"
                >
                  Continue Play
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIVE BET STATEMENTS */}
        <div className="grid grid-cols-2 gap-3 select-none text-center h-15 items-center">
          <div className="bg-neutral-950 border border-neutral-900 p-2.5 rounded-xl">
            <span className="text-[8px] uppercase font-black text-zinc-500">Ante bet in play</span>
            <span className="font-mono font-black text-[#e8b923] text-sm block mt-0.5">{anteBet.toLocaleString()}</span>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-2.5 rounded-xl">
            <span className="text-[8px] uppercase font-black text-zinc-500">Play bet in play</span>
            <span className="font-mono font-black text-[#e8b923] text-sm block mt-0.5">{playBet.toLocaleString()}</span>
          </div>
        </div>

        {/* ACTION ROW BAR */}
        {gamePhase === 'action' ? (
          <div className="grid grid-cols-2 gap-3.5 select-none h-14">
            <button
              onClick={handleFold}
              className="bg-neutral-900 hover:bg-neutral-800 border-2 border-red-500/20 text-red-500 font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
            >
              FOLD HAND
            </button>
            <button
              onClick={handlePlay}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
            >
              PLAY (MATCH ANTE)
            </button>
          </div>
        ) : (
          /* BETTING CONTROLS */
          <div className="bg-[#111] border border-neutral-800/80 p-4 rounded-2xl space-y-4 select-none">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Choose ante chip</span>
              <div className="flex items-center justify-between">
                {[100, 500, 1000, 5000, 10000].map((c) => (
                  <button
                    key={c}
                    disabled={gamePhase !== 'betting'}
                    onClick={() => setSelectedChip(c)}
                    className={`w-11 h-11 rounded-full font-black text-xs font-mono border-2 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer ${
                      selectedChip === c ? 'ring-2 ring-amber-400 border-amber-400 text-[#e8b923] bg-neutral-950 scale-105 shadow-md' : 'bg-neutral-950 text-zinc-400 border-zinc-900'
                    }`}
                  >
                    {c >= 1000 ? `${c / 1000}K` : c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleClear}
                disabled={gamePhase !== 'betting'}
                className="py-3 px-2 bg-neutral-950 hover:bg-neutral-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Clear Ante
              </button>
              <button
                onClick={handleDeal}
                disabled={gamePhase !== 'betting'}
                className="py-3 px-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                DEAL HANDS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
