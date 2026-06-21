/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCasinoStore } from '../store';
import { ArrowLeft, RotateCcw, HelpCircle, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Card {
  suit: string;
  value: string;
  score: number;
}

type BetZone = 'player' | 'tie' | 'banker';

export default function Baccarat({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();

  // Selected chip value
  const [selectedChip, setSelectedChip] = useState<number>(10);

  // Active bets
  const [bets, setBets] = useState<Record<BetZone, number>>({
    player: 0,
    tie: 0,
    banker: 0,
  });

  const [lastBets, setLastBets] = useState<Record<BetZone, number>>({
    player: 0,
    tie: 0,
    banker: 0,
  });

  // Hands state
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [isHandActive, setIsHandActive] = useState<boolean>(false);
  const [revealedCount, setRevealedCount] = useState<number>(0);

  // Round results
  const [statusText, setStatusText] = useState<string>('Place Your Bets');
  const [showWinnerBanner, setShowWinnerBanner] = useState<boolean>(false);
  const [wonAmount, setWonAmount] = useState<number>(0);

  // Road map of last results
  const [roadMap, setRoadMap] = useState<('P' | 'B' | 'T')[]>([
    'B', 'B', 'P', 'B', 'T', 'P', 'P', 'B', 'T', 'B', 'P', 'B', 'B', 'P', 'P'
  ]);

  // Dynamic Statistics
  const getStats = () => {
    if (roadMap.length === 0) return { P: 33, B: 33, T: 34 };
    const pCount = roadMap.filter((r) => r === 'P').length;
    const bCount = roadMap.filter((r) => r === 'B').length;
    const tCount = roadMap.filter((r) => r === 'T').length;
    const total = roadMap.length;
    return {
      P: Math.round((pCount / total) * 100),
      B: Math.round((bCount / total) * 100),
      T: Math.round((tCount / total) * 100),
    };
  };

  const getCardScore = (val: string): number => {
    if (['10', 'J', 'Q', 'K'].includes(val)) return 0;
    if (val === 'A') return 1;
    return parseInt(val, 10);
  };

  const generateCard = (): Card => {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const s = suits[Math.floor(Math.random() * suits.length)];
    const v = values[Math.floor(Math.random() * values.length)];
    return {
      suit: s,
      value: v,
      score: getCardScore(v),
    };
  };

  const calculateHandTotal = (cardsList: Card[]): number => {
    const total = cardsList.reduce((sum, c) => sum + c.score, 0);
    return total % 10;
  };

  const handlePlaceBet = (zone: BetZone) => {
    if (isHandActive) return;

    if (store.coins < selectedChip) {
      toast.error('Insufficient Coins! Claim Daily reward or adjust chip size.', {
        style: { background: '#1c1c1c', color: '#fff', border: '1px solid #e01f26' },
      });
      return;
    }

    // Deduct coins
    store.deductCoins(selectedChip, `Placed Bet on Baccarat: ${zone.toUpperCase()}`, 'Baccarat', 'bet_loss');

    setBets((prev) => ({
      ...prev,
      [zone]: prev[zone] + selectedChip,
    }));

    // Trigger visual table clack audio
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
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }
  };

  const handleClearBets = () => {
    if (isHandActive) return;

    const totalBetInPlay = bets.player + bets.tie + bets.banker;
    if (totalBetInPlay > 0) {
      // Refund
      store.addCoins(totalBetInPlay, 'Refunded Baccarat Bets', 'Baccarat', 'bonus');
      setBets({ player: 0, tie: 0, banker: 0 });
    }
  };

  const handleRebet = () => {
    if (isHandActive) return;

    const lastTotal = lastBets.player + lastBets.tie + lastBets.banker;
    if (lastTotal === 0) {
      toast.error('No previous bets saved!');
      return;
    }

    if (store.coins < lastTotal) {
      toast.error('Insufficient coins to reconstruct last round!');
      return;
    }

    store.deductCoins(lastTotal, 'Reconstructed Last round bets', 'Baccarat', 'bet_loss');
    setBets({ ...lastBets });
  };

  const handleStartRound = () => {
    if (isHandActive) return;

    const activeBetTotal = bets.player + bets.tie + bets.banker;
    if (activeBetTotal === 0) {
      toast.error('Please place a chip on Player, Banker or Tie to deal!');
      return;
    }

    // Freeze board
    setIsHandActive(true);
    setRevealedCount(0);
    setShowWinnerBanner(false);
    setStatusText('Dealing Cards...');

    // Save history as "Last"
    setLastBets({ ...bets });

    // Step 1: Draw cards with win control loop
    let tempPlayer: Card[] = [];
    let tempBanker: Card[] = [];

    let roundNum = parseInt(localStorage.getItem('baccarat_round_num') || '0', 10);
    const winPattern = [true, false, true, false, true, true, true, false, true, true];
    
    let shouldWin = false;
    if (store.coins > 500) {
      // High balance soft cap: Win 3 out of 10 games (rounds 2, 5, 8)
      const highBalanceWinners = [2, 5, 8];
      shouldWin = highBalanceWinners.includes(roundNum);
    } else {
      shouldWin = winPattern[roundNum];
    }
    
    localStorage.setItem('baccarat_round_num', ((roundNum + 1) % 10).toString());

    // Find the bet zone where user put the most coins
    let favoredZone: 'player' | 'banker' | 'tie' = 'player';
    if (bets.banker > bets.player && bets.banker > bets.tie) favoredZone = 'banker';
    else if (bets.tie > bets.player && bets.tie > bets.banker) favoredZone = 'tie';
    else if (bets.player === 0 && bets.banker === 0 && bets.tie === 0) favoredZone = 'player';
    else favoredZone = bets.player >= bets.banker ? 'player' : 'banker';

    let attempts = 0;
    while (attempts < 800) {
      attempts++;
      const p1 = generateCard();
      const p2 = generateCard();
      const b1 = generateCard();
      const b2 = generateCard();

      tempPlayer = [p1, p2];
      tempBanker = [b1, b2];

      let playerSum = calculateHandTotal(tempPlayer);
      let bankerSum = calculateHandTotal(tempBanker);

      const isNatural = playerSum >= 8 || bankerSum >= 8;

      if (!isNatural) {
        let pThird: Card | null = null;
        if (playerSum <= 5) {
          pThird = generateCard();
          tempPlayer.push(pThird);
        }

        const playerThirdScore = pThird ? pThird.score : -1;
        let shouldBankerDraw = false;

        if (playerThirdScore === -1) {
          if (bankerSum <= 5) shouldBankerDraw = true;
        } else {
          if (bankerSum <= 2) {
            shouldBankerDraw = true;
          } else if (bankerSum === 3 && playerThirdScore !== 8) {
            shouldBankerDraw = true;
          } else if (bankerSum === 4 && [2, 3, 4, 5, 6, 7].includes(playerThirdScore)) {
            shouldBankerDraw = true;
          } else if (bankerSum === 5 && [4, 5, 6, 7].includes(playerThirdScore)) {
            shouldBankerDraw = true;
          } else if (bankerSum === 6 && [6, 7].includes(playerThirdScore)) {
            shouldBankerDraw = true;
          }
        }

        if (shouldBankerDraw) {
          tempBanker.push(generateCard());
        }
      }

      const finalPlayer = calculateHandTotal(tempPlayer);
      const finalBanker = calculateHandTotal(tempBanker);

      let winner: 'P' | 'B' | 'T';
      if (finalPlayer > finalBanker) winner = 'P';
      else if (finalBanker > finalPlayer) winner = 'B';
      else winner = 'T';

      const isBetPlaced = (bets.player > 0 || bets.banker > 0 || bets.tie > 0);
      if (!isBetPlaced) {
        break; // No bets, any draw is fine
      }

      if (shouldWin) {
        if (favoredZone === 'player' && winner === 'P') break;
        if (favoredZone === 'banker' && winner === 'B') break;
        if (favoredZone === 'tie' && winner === 'T') break;
      } else {
        if (favoredZone === 'player' && winner !== 'P') break;
        if (favoredZone === 'banker' && winner !== 'B') break;
        if (favoredZone === 'tie' && winner !== 'T') break;
      }
    }

    setPlayerCards(tempPlayer);
    setBankerCards(tempBanker);

    // Step-by-step card reveal sequence animation timers
    setTimeout(() => setRevealedCount(1), 500);
    setTimeout(() => setRevealedCount(2), 1000);
    setTimeout(() => setRevealedCount(3), 1500);
    setTimeout(() => setRevealedCount(4), 2000);

    // If third cards exist, reveal them with delays
    const hasP3 = tempPlayer.length > 2;
    const hasB3 = tempBanker.length > 2;
    let revealIdx = 4;

    if (hasP3) {
      revealIdx++;
      const currentReveal = revealIdx;
      setTimeout(() => {
        setPlayerCards([...tempPlayer.slice(0, 3)]);
        setRevealedCount(currentReveal);
      }, 2500);
    }
    if (hasB3) {
      revealIdx++;
      const currentReveal = revealIdx;
      setTimeout(() => {
        setBankerCards([...tempBanker.slice(0, 3)]);
        setRevealedCount(currentReveal);
      }, 3100);
    }

    // Wrap-up & evaluation timer
    setTimeout(() => {
      evaluateWinner(tempPlayer, tempBanker);
    }, 3200 + (hasP3 ? 500 : 0) + (hasB3 ? 500 : 0));
  };

  const evaluateWinner = (pHand: Card[], bHand: Card[]) => {
    const finalPlayer = calculateHandTotal(pHand);
    const finalBanker = calculateHandTotal(bHand);

    let winner: 'P' | 'B' | 'T';
    let label = '';

    if (finalPlayer > finalBanker) {
      winner = 'P';
      label = 'PLAYER WINS';
    } else if (finalBanker > finalPlayer) {
      winner = 'B';
      label = 'BANKER WINS';
    } else {
      winner = 'T';
      label = 'TIE GAME';
    }

    setStatusText(`${label} (${finalPlayer} vs ${finalBanker})`);

    // Calculate payouts
    let totalPayout = 0;
    if (store.coins > 500 || !store.hasDeposited) {
      totalPayout = 0;
    } else {
      if (winner === 'P' && bets.player > 0) {
        totalPayout += bets.player * 2; // Player pays 1:1 (total return is 2x)
      }
      if (winner === 'B' && bets.banker > 0) {
        totalPayout += bets.banker * 1.95; // Banker pays 1:0.95 (5% commission)
      }
      if (winner === 'T' && bets.tie > 0) {
        totalPayout += bets.tie * 9; // Tie pays 8:1 (total return 9x)
      }

      // If Tie, other bets are refunded (standard rules, or we can just keep them)
      if (winner === 'T') {
        totalPayout += bets.player;
        totalPayout += bets.banker;
      }
    }

    setWonAmount(totalPayout);
    setShowWinnerBanner(true);

    if (totalPayout > 0) {
      store.addCoins(totalPayout, `Won Baccarat match: ${label}`, 'Baccarat', 'game_win');
    }

    // Append to road map (keep max 40 results)
    setRoadMap((prev) => [...prev, winner].slice(-40));

    // Clear board states
    setBets({ player: 0, tie: 0, banker: 0 });
    setIsHandActive(false);

    // Save logs
    const betTotalSum = bets.player + bets.banker + bets.tie;
    if (betTotalSum > 0) {
      store.addGameLog(
        'baccarat',
        'Baccarat',
        betTotalSum,
        totalPayout,
        totalPayout > betTotalSum ? 'win' : totalPayout === betTotalSum ? 'tie' : 'loss'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#07331e] text-white pb-10 flex flex-col items-center select-none relative">
      <div className="absolute inset-0 bg-radial-at-c from-emerald-950/20 to-[#072415] pointer-events-none" />

      {/* Top Nabbar */}
      <header className="w-full h-15 bg-neutral-950/80 px-4 flex items-center justify-between border-b border-white/5 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide">LUXURY COUTURE BACCARAT</h1>
            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              5% Banker Commission applied
            </span>
          </div>
        </div>

        {/* Live balance indicator */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-zinc-800">
          <Coins size={14} className="text-[#e8b923]" />
          <span className="text-xs font-bold font-mono text-[#e8b923]">
            {store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="w-full max-w-lg p-3 flex-1 flex flex-col justify-between space-y-4">
        {/* STATISTICS SPANNERS */}
        <div className="bg-[#051c11] border border-emerald-900/40 p-2 text-[10px] rounded-xl font-bold flex items-center justify-around text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Player Ratio:{' '}
            <span className="text-white">{getStats().P}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Banker Ratio:{' '}
            <span className="text-white">{getStats().B}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Tie Ratio:{' '}
            <span className="text-white">{getStats().T}%</span>
          </div>
        </div>

        {/* ROAD MAP CHART (Bead Road Grid) */}
        <div className="bg-[#051c11] border border-emerald-900/30 p-2 rounded-xl flex items-center gap-1.5 overflow-x-auto">
          {roadMap.map((r, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 ${
                r === 'P' ? 'bg-blue-600' : r === 'B' ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {r}
            </span>
          ))}
        </div>

        {/* GREEN FELT BOARD & ACTIVE HANDS */}
        <div className="bg-[#0b5131] border-2 border-[#127d4c] rounded-3xl p-4 flex flex-col relative overflow-hidden flex-1 shadow-inner min-h-[220px]">
          {/* Deck panel left side */}
          <div className="absolute right-3 top-3 w-16 h-20 border border-white/10 bg-neutral-900/60 rounded-lg flex items-center justify-center text-[11px] font-bold text-zinc-600 uppercase italic">
            CARD SHOE
          </div>

          <div className="grid grid-cols-2 gap-4 my-auto relative z-10">
            {/* PLAYER CARD VIEW */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-blue-200 tracking-wider">
                PLAYER ({playerCards.length > 0 ? calculateHandTotal(playerCards) : 0})
              </span>
              <div className="flex gap-2 mt-2 min-h-[92px] items-center">
                {playerCards.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
                    animate={{ rotateY: revealedCount > i ? 0 : 180, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-14 h-20 bg-white rounded-xl shadow-lg border border-neutral-300 flex flex-col justify-between p-2 text-zinc-950 font-bold"
                  >
                    {revealedCount > i ? (
                      <>
                        <span className={`text-[#e01f26] ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {c.value}
                        </span>
                        <span className={`text-xl self-center ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {c.suit}
                        </span>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[#c01f26] border-2 border-white rounded-xl flex items-center justify-center font-black text-white text-xs select-none">
                        JW77
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* BANKER CARD VIEW */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-red-200 tracking-wider">
                BANKER ({bankerCards.length > 0 ? calculateHandTotal(bankerCards) : 0})
              </span>
              <div className="flex gap-2 mt-2 min-h-[92px] items-center">
                {bankerCards.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
                    animate={{ rotateY: revealedCount > i ? 0 : 180, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-14 h-20 bg-white rounded-xl shadow-lg border border-neutral-300 flex flex-col justify-between p-2 text-zinc-950 font-bold"
                  >
                    {revealedCount > i ? (
                      <>
                        <span className={`text-[#e01f26] ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {c.value}
                        </span>
                        <span className={`text-xl self-center ${c.suit === '♠' || c.suit === '♣' ? 'text-zinc-900' : 'text-red-500'}`}>
                          {c.suit}
                        </span>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[#c01f26] border-2 border-white rounded-xl flex items-center justify-center font-black text-white text-xs select-none">
                        JW77
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic round winner card */}
          <AnimatePresence>
            {showWinnerBanner && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="absolute inset-x-4 top-[35%] bg-neutral-950/95 border border-[#e8b923]/40 p-4 rounded-2xl flex flex-col items-center justify-center z-20 text-center shadow-2xl select-none"
              >
                <h4 className="text-amber-500 font-black tracking-widest text-lg uppercase leading-none">
                  {statusText}
                </h4>
                {wonAmount > 0 ? (
                  <h3 className="text-2xl font-black text-green-400 font-mono mt-2 animate-pulse leading-none">
                    Payout: +{wonAmount.toLocaleString()} Coins
                  </h3>
                ) : (
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    No active payout matches
                  </span>
                )}
                <button
                  onClick={() => setShowWinnerBanner(false)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-zinc-300 hover:text-white font-bold text-xs py-1.5 px-6 rounded-lg border border-zinc-800 mt-3 cursor-pointer"
                >
                  Ok
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BET ZONES CHIPS PLACER */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { zone: 'player', label: 'PLAYER pays 1:1', color: 'border-blue-500/30 hover:border-blue-500 bg-blue-900/10' },
            { zone: 'tie', label: 'TIE pays 8:1', color: 'border-green-500/30 hover:border-green-500 bg-green-900/10' },
            { zone: 'banker', label: 'BANKER pays 1:0.95', color: 'border-red-500/30 hover:border-red-500 bg-red-900/10' },
          ].map((z) => (
            <button
              key={z.zone}
              disabled={isHandActive}
              onClick={() => handlePlaceBet(z.zone as BetZone)}
              className={`rounded-2xl border-2 p-3 text-center flex flex-col items-center justify-around min-h-[92px] transition-all cursor-pointer relative shadow-sm hover:shadow active:scale-95 disabled:opacity-40 ${z.color}`}
            >
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                {z.zone}
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5">{z.label}</span>

              {/* Placed Chip Badge */}
              {bets[z.zone as BetZone] > 0 && (
                <div className="mt-2 bg-[#e8b923] text-neutral-950 font-black text-xs px-2 py-0.5 rounded-full border border-white font-mono shadow">
                  {bets[z.zone as BetZone].toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* TABLE CONTROLS & CHIP CHOICER */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-2xl p-4 space-y-4">
          {/* Quick Chip Choosers row */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
              Choose Chip Token Size
            </span>
            <div className="flex items-center justify-between gap-1">
              {[
                { val: 1, color: 'bg-white text-zinc-950 border-zinc-200 shadow-sm' },
                { val: 2, color: 'bg-indigo-600 text-white border-indigo-700 shadow-sm' },
                { val: 3, color: 'bg-purple-600 text-white border-purple-700 shadow-sm' },
                { val: 5, color: 'bg-pink-600 text-white border-pink-700 shadow-sm' },
                { val: 10, color: 'bg-[#e01f26] text-white border-red-700' },
                { val: 50, color: 'bg-orange-600 text-white border-orange-700' },
                { val: 100, color: 'bg-teal-600 text-white border-teal-700' },
                { val: 500, color: 'bg-green-600 text-white border-green-800' },
                { val: 1000, color: 'bg-zinc-900 text-amber-500 border-zinc-950' },
              ].map((chip) => (
                <button
                  key={chip.val}
                  disabled={isHandActive}
                  onClick={() => setSelectedChip(chip.val)}
                  className={`w-9 h-9 rounded-full font-black text-[10px] font-mono border-2 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${chip.color} ${
                    selectedChip === chip.val ? 'ring-2 ring-amber-400 scale-105 shadow-lg' : ''
                  }`}
                >
                  {chip.val}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleClearBets}
              disabled={isHandActive}
              className="py-3 px-2 bg-[#121212] hover:bg-neutral-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-neutral-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Trash2 size={14} /> Clear Bets
            </button>
            <button
              onClick={handleStartRound}
              disabled={isHandActive}
              className="py-3 px-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-[1.01]"
            >
              DEAL HAND
            </button>
            <button
              onClick={handleRebet}
              disabled={isHandActive}
              className="py-3 px-2 bg-[#121212] hover:bg-neutral-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-neutral-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw size={14} /> Rebet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom inline Trash2 standard fallback safely
function Trash2({ size }: { size: number }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
