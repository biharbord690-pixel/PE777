/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Coins, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Card {
  suit: string;
  value: string;
  score: number;
}

export default function Blackjack({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();

  const [selectedChip, setSelectedChip] = useState<number>(500);
  const [bet, setBet] = useState(0);
  const [lastBet, setLastBet] = useState(0);

  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);

  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'ended'>('betting');
  const [revealedCount, setRevealedCount] = useState(0);

  const [status, setStatus] = useState('Place your Bet and deal');
  const [wonAmount, setWonAmount] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);

  const SUITS = ['♠', '♥', '♦', '♣'];
  const VALUES = [
    { name: 'A', score: 11 },
    { name: '2', score: 2 },
    { name: '3', score: 3 },
    { name: '4', score: 4 },
    { name: '5', score: 5 },
    { name: '6', score: 6 },
    { name: '7', score: 7 },
    { name: '8', score: 8 },
    { name: '9', score: 9 },
    { name: '10', score: 10 },
    { name: 'J', score: 10 },
    { name: 'Q', score: 10 },
    { name: 'K', score: 10 },
  ];

  const spawnCard = (): Card => {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    const val = VALUES[Math.floor(Math.random() * VALUES.length)];
    return {
      suit: s,
      value: val.name,
      score: val.score,
    };
  };

  const calculateScore = (cards: Card[]): number => {
    let total = cards.reduce((sum, c) => sum + c.score, 0);
    let aces = cards.filter((c) => c.value === 'A').length;

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const handlePlaceBet = () => {
    if (gameState !== 'betting') return;
    if (store.coins < selectedChip) {
      toast.error('Insufficient Coins!');
      return;
    }

    store.deductCoins(selectedChip, 'Blackjack Stake Placed', 'Blackjack', 'bet_loss');
    setBet((prev) => prev + selectedChip);

    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  const handleClear = () => {
    if (gameState !== 'betting') return;
    if (bet > 0) {
      store.addCoins(bet, 'Refunded Blackjack Bet', 'Blackjack', 'bonus');
      setBet(0);
    }
  };

  const handleRebet = () => {
    if (gameState !== 'betting') return;
    if (lastBet === 0) {
      toast.error('No previous bet tracked!');
      return;
    }
    if (store.coins < lastBet) {
      toast.error('Insufficient coins to reconstruct rebet!');
      return;
    }
    store.deductCoins(lastBet, 'Blackjack rebet', 'Blackjack', 'bet_loss');
    setBet(lastBet);
  };

  const handleDeal = () => {
    if (gameState !== 'betting') return;
    if (bet === 0) {
      toast.error('Please place your table bet first!');
      return;
    }

    setLastBet(bet);
    setGameState('playing');
    setRevealedCount(0);
    setShowOutcome(false);
    setStatus('Dealing cards...');

    let p1 = spawnCard();
    let p2 = spawnCard();
    let d1 = spawnCard();
    let d2 = spawnCard();

    let tempPlayer = [p1, p2];
    let tempDealer = [d1, d2];

    let roundNum = parseInt(localStorage.getItem('bj_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true, true, true, false, true, true];
    const shouldWin = winPattern[roundNum];
    localStorage.setItem('bj_round_num', ((roundNum + 1) % 10).toString());

    let attempts = 0;
    while (attempts < 800) {
      attempts++;
      p1 = spawnCard();
      p2 = spawnCard();
      d1 = spawnCard();
      d2 = spawnCard();
      tempPlayer = [p1, p2];
      tempDealer = [d1, d2];

      const pScore = calculateScore(tempPlayer);
      const dScore = calculateScore(tempDealer);

      if (shouldWin) {
        if (pScore >= 19 && pScore <= 21 && dScore < pScore) break;
      } else {
        if (dScore >= 19 && dScore <= 21 && pScore < dScore) break;
      }
    }

    setPlayerCards(tempPlayer);
    setDealerCards(tempDealer);

    setTimeout(() => setRevealedCount(1), 400);
    setTimeout(() => setRevealedCount(2), 800);
    setTimeout(() => setRevealedCount(3), 1200);

    setTimeout(() => {
      // Check for natural player blackjack
      const pScore = calculateScore(tempPlayer);
      if (pScore === 21) {
        // Double down Blackjack check
        handleStand(tempPlayer, tempDealer);
      } else {
        setStatus('HIT or STAND? Your hand score: ' + pScore);
      }
    }, 1400);
  };

  const handleHit = () => {
    if (gameState !== 'playing') return;

    const nextCard = spawnCard();
    const nextPlayerDeck = [...playerCards, nextCard];
    setPlayerCards(nextPlayerDeck);

    const score = calculateScore(nextPlayerDeck);
    if (score > 21) {
      // BUSTED!
      triggerRoundEnd('busted', nextPlayerDeck, dealerCards);
    } else {
      setStatus(`Hit Card: ${nextCard.value}. Score is ${score}. HIT or STAND?`);
    }
  };

  const handleStand = (activePlayer = playerCards, activeDealer = dealerCards) => {
    if (gameState !== 'playing') return;

    setGameState('dealerTurn');
    setStatus('Dealer is drawing...');
    setRevealedCount(4); // Reveal hidden dealer card

    let currentDealer = [...activeDealer];
    let dScore = calculateScore(currentDealer);

    const drawInterval = setInterval(() => {
      if (dScore < 17) {
        const next = spawnCard();
        currentDealer = [...currentDealer, next];
        setDealerCards(currentDealer);
        dScore = calculateScore(currentDealer);
      } else {
        clearInterval(drawInterval);
        evaluateBlackjackWinner(activePlayer, currentDealer);
      }
    }, 800);
  };

  const evaluateBlackjackWinner = (pHand: Card[], dHand: Card[]) => {
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);

    let stateOutcome: 'win' | 'dealer' | 'push' = 'win';
    let labelText = '';
    let finalPayout = 0;

    if (dScore > 21) {
      labelText = 'DEALER BUSTS! YOU WIN!';
      stateOutcome = 'win';
      finalPayout = bet * 2;
    } else if (pScore > dScore) {
      // Check blackjack premium 3:2 payout!
      if (pScore === 21 && pHand.length === 2) {
        labelText = 'BLACKJACK! Pays 3:2!';
        finalPayout = Math.floor(bet * 2.5);
      } else {
        labelText = 'YOU WIN!';
        finalPayout = bet * 2;
      }
      stateOutcome = 'win';
    } else if (dScore > pScore) {
      labelText = 'DEALER WINS!';
      stateOutcome = 'dealer';
      finalPayout = 0;
    } else {
      labelText = 'ROUND PUSH';
      stateOutcome = 'push';
      finalPayout = bet; // Refund
    }

    triggerRoundEnd(stateOutcome, pHand, dHand, labelText, finalPayout);
  };

  const triggerRoundEnd = (
    result: 'win' | 'dealer' | 'push' | 'busted',
    pHand: Card[],
    dHand: Card[],
    customLabel = '',
    payoutAmt = 0
  ) => {
    setGameState('ended');
    setRevealedCount(6); // reveal everything

    const pScore = calculateScore(pHand);

    let label = customLabel;
    if (result === 'busted') {
      label = `BUSTED at ${pScore}! Dealer Wins.`;
    }

    setStatus(label);
    setWonAmount(payoutAmt);
    setShowOutcome(true);

    if (payoutAmt > 0) {
      store.addCoins(payoutAmt, `Won Blackjack match: ${label}`, 'Blackjack', 'game_win');
    }

    // Save history logs
    store.addGameLog(
      'blackjack',
      'Blackjack Table',
      bet,
      payoutAmt,
      payoutAmt > bet ? 'win' : payoutAmt === bet ? 'tie' : 'loss'
    );

    setBet(0);
  };

  return (
    <div className="min-h-screen bg-[#07301c] text-white pb-10 flex flex-col items-center select-none relative">
      <div className="absolute inset-0 bg-radial-at-c from-[#0f4d30]/20 to-neutral-950 pointer-events-none" />

      {/* Header bar */}
      <header className="w-full h-15 bg-neutral-950/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide font-sans">COUTURE BLACKJACK 21</h1>
            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              Blackjack Pays 3:2 • Stands soft 17
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
        {/* DUEL BOARD felt */}
        <div className="bg-[#0c4027] border-2 border-[#125a3a] rounded-3xl p-5 flex flex-col relative overflow-hidden flex-1 justify-around shadow-inner min-h-[300px]">
          {/* DEALER FIELD */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-zinc-400 select-none">
              Dealer Score:{' '}
              {revealedCount > 3 ? calculateScore(dealerCards) : dealerCards.length > 0 ? dealerCards[0].score : 0}
            </span>
            <div className="flex gap-2 mt-2 min-h-[96px] items-center">
              {dealerCards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ rotateY: 180, scale: 0.7 }}
                  animate={{ rotateY: i === 1 && revealedCount < 4 ? 180 : 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-24 bg-white rounded-2xl p-2.5 flex flex-col justify-between text-zinc-950 font-bold border border-zinc-200 shadow relative"
                >
                  {i === 1 && revealedCount < 4 ? (
                    <div className="absolute inset-0 bg-[#a21caf] border-2 border-white rounded-2xl flex items-center justify-center font-black text-white text-xs select-none">
                      JW77
                    </div>
                  ) : (
                    <>
                      <span className={`text-md leading-none ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                        {c.value}
                      </span>
                      <span className={`text-3xl self-center ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                        {c.suit}
                      </span>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* PLAYER FIELD */}
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-2 min-h-[96px] items-center">
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
                    <div className="absolute inset-0 bg-[#a21caf] border-2 border-white rounded-2xl flex items-center justify-center font-black text-white text-xs select-none">
                      JW77
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <span className="text-[10px] uppercase font-black text-zinc-400 select-none">
              Your hand score: {playerCards.length > 0 ? calculateScore(playerCards) : 0}
            </span>
          </div>

          {/* Status results cover */}
          <AnimatePresence>
            {showOutcome && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7 }}
                className="absolute inset-x-4 top-[35%] bg-neutral-950 border border-purple-500/35 p-5 rounded-2xl text-center z-20 shadow-2xl"
              >
                <h4 className="text-purple-400 font-extrabold tracking-wider text-sm uppercase">
                  {status}
                </h4>
                {wonAmount > 0 ? (
                  <h3 className="text-2xl font-black text-green-400 mt-2 font-mono tracking-wide">
                    Payout: +{wonAmount.toLocaleString()} Coins
                  </h3>
                ) : (
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5 block">
                    Dealer wins wagered chip
                  </span>
                )}
                <button
                  onClick={() => {
                    setShowOutcome(false);
                    setGameState('betting');
                    setPlayerCards([]);
                    setDealerCards([]);
                  }}
                  className="bg-neutral-900 font-bold border border-zinc-800 py-1.5 px-6 rounded-lg text-xs mt-4 text-center cursor-pointer font-sans"
                >
                  Continue Play
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIVE BET INDICATOR */}
        <div className="bg-neutral-950 border border-neutral-900 py-2 rounded-xl text-center font-bold tracking-widest text-[#e8b923] text-sm font-mono select-none">
          Active Wager: {bet.toLocaleString()} Coins
        </div>

        {/* DECISION ACTION BUTTONS */}
        {gameState === 'playing' ? (
          <div className="grid grid-cols-2 gap-3.5 select-none h-14">
            <button
              onClick={handleHit}
              className="bg-neutral-900 hover:bg-neutral-800 border-2 border-purple-500/20 text-purple-400 font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
            >
              HIT CARD
            </button>
            <button
              onClick={() => handleStand()}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer animate-pulse"
            >
              STAND HAND
            </button>
          </div>
        ) : (
          /* BETTING CONTROLS */
          <div className="bg-[#111] border border-neutral-800/80 p-4 rounded-2xl space-y-4 select-none">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Choose chip value</span>
              <div className="flex items-center justify-between">
                {[100, 500, 1000, 5000, 10000].map((c) => (
                  <button
                    key={c}
                    disabled={gameState !== 'betting'}
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
                disabled={gameState !== 'betting'}
                className="py-3 px-2 bg-neutral-950 hover:bg-neutral-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Clear Bet
              </button>
              <button
                onClick={handleDeal}
                disabled={gameState !== 'betting'}
                className="py-3 px-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                DEAL GAME
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
