/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Trophy, Coins, Award, Sparkles, Medal } from 'lucide-react';

type LeaderTab = 'today' | 'week' | 'alltime';

export default function Leaderboard({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();
  const [activeTab, setActiveTab] = useState<LeaderTab>('today');

  // Compute stats or offsets to make tabs feel realistic
  const getLeaderboardData = () => {
    const base = store.leaderboard;
    if (activeTab === 'today') {
      return base.map((p) => ({
        ...p,
        totalWinnings: Math.floor(p.totalWinnings * 0.12) // small daily slice
      })).sort((a,b)=> b.totalWinnings - a.totalWinnings).map((item, idx)=> ({...item, rank: idx+1}));
    }
    if (activeTab === 'week') {
      return base.map((p) => ({
        ...p,
        totalWinnings: Math.floor(p.totalWinnings * 0.45) // weekly slice
      })).sort((a,b)=> b.totalWinnings - a.totalWinnings).map((item, idx)=> ({...item, rank: idx+1}));
    }
    return base; // All time is raw global store
  };

  const list = getLeaderboardData();

  // Find active user relative rank
  const userRankIndex = list.findIndex((item) => item.username === store.currentUser);
  const userRankData = userRankIndex !== -1 ? list[userRankIndex] : null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-32 flex flex-col items-center select-none relative">
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#e8b923]/10 to-transparent pointer-events-none" />

      {/* Header bar */}
      <header className="w-full h-15 bg-neutral-950/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#e8b923] animate-pulse" />
            <h1 className="text-sm font-black tracking-wide font-sans">DEMO WINNINGS LEADERBOARD</h1>
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

      <div className="w-full max-w-lg p-3 flex-1 flex flex-col space-y-4">
        {/* TAB CHOOSERS */}
        <div className="grid grid-cols-3 rounded-xl bg-neutral-900 border border-neutral-800/60 p-1">
          {[
            { id: 'today', label: 'TODAY' },
            { id: 'week', label: 'THIS WEEK' },
            { id: 'alltime', label: 'ALL TIME' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LeaderTab)}
              className={`py-2 text-xs font-bold rounded-lg tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#e8b923] text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TOP 3 PODIUMS HIGHLIGHT BANNER */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* 2nd place left side */}
          {list[1] && (
            <div className="bg-[#1a1a1a] border border-neutral-800 p-3 pt-6 rounded-2xl text-center relative flex flex-col items-center justify-around">
              <span className="absolute -top-3.5 bg-zinc-600 text-white font-extrabold text-[10px] w-6 h-6 border-2 border-zinc-950 rounded-full flex items-center justify-center">
                2
              </span>
              <div className="w-10 h-10 rounded-full bg-zinc-500 flex items-center justify-center font-bold text-white shadow">
                {list[1].username[0].toUpperCase()}
              </div>
              <h4 className="text-[10px] font-black tracking-wide text-zinc-300 truncate w-full mt-2">
                {list[1].username}
              </h4>
              <span className="text-[10px] font-bold font-mono text-[#e8b923] mt-1 block">
                {list[1].totalWinnings.toLocaleString()}
              </span>
            </div>
          )}

          {/* 1st place center highlight */}
          {list[0] && (
            <div className="bg-neutral-900/60 border-2 border-amber-500/30 p-4 pt-10 rounded-3xl text-center relative flex flex-col items-center justify-around transform scale-105 shadow-xl shadow-amber-500/5 -translate-y-1">
              {/* Crown badge top */}
              <div className="absolute -top-6 text-2xl select-none animate-bounce">👑</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#e8b923] to-amber-300 flex items-center justify-center font-black text-neutral-950 shadow-md">
                {list[0].username[0].toUpperCase()}
              </div>
              <h4 className="text-xs font-black tracking-wide text-white truncate w-full mt-2.5 flex items-center justify-center gap-1">
                {list[0].username} <Sparkles size={11} className="text-[#e8b923]" />
              </h4>
              <span className="text-xs font-black font-mono text-[#e8b923] mt-1 block">
                {list[0].totalWinnings.toLocaleString()}
              </span>
            </div>
          )}

          {/* 3rd place right side */}
          {list[2] && (
            <div className="bg-[#1a1a1a] border border-neutral-800 p-3 pt-6 rounded-2xl text-center relative flex flex-col items-center justify-around">
              <span className="absolute -top-3.5 bg-amber-800 text-white font-extrabold text-[10px] w-6 h-6 border-2 border-zinc-950 rounded-full flex items-center justify-center">
                3
              </span>
              <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center font-bold text-white shadow">
                {list[2].username[0].toUpperCase()}
              </div>
              <h4 className="text-[10px] font-black tracking-wide text-zinc-300 truncate w-full mt-2">
                {list[2].username}
              </h4>
              <span className="text-[10px] font-bold font-mono text-[#e8b923] mt-1 block">
                {list[2].totalWinnings.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* DETAILED rankings table scroll container */}
        <div className="bg-[#121212] border border-neutral-900 rounded-3xl p-4 flex-1 overflow-y-auto space-y-1 max-h-[320px] scrollbar-thin">
          <div className="flex justify-between items-center text-[9px] text-zinc-500 font-black border-b border-neutral-950 pb-2 mb-2 uppercase tracking-widest pl-1">
            <span>Rank & Username</span>
            <span>Multiplier Score (Coins)</span>
          </div>

          {list.slice(3).map((player) => {
            const isSelf = player.username === store.currentUser;
            return (
              <div
                key={player.rank}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold leading-none select-none border transition-colors ${
                  isSelf
                    ? 'bg-[#e8b923]/10 border-[#e8b923]/30 text-[#e8b923]'
                    : 'bg-neutral-950 border-neutral-900/60 text-zinc-300 hover:bg-neutral-90 *0/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-zinc-500 min-w-[20px]">
                    #{player.rank}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] ${player.avatarColor}`}>
                    {player.username[0].toUpperCase()}
                  </div>
                  <span className="font-bold truncate max-w-[140px]">{player.username}</span>
                </div>

                <div className="flex items-center gap-1.5 font-bold font-mono text-[#e8b923]">
                  <span>{player.totalWinnings.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOAT STICKY CURRENT USER BANNER DETAIL AT EXTREME BOTTOM */}
      {userRankData && (
        <div className="fixed bottom-19 left-1/2 transform -translate-x-1/2 max-w-lg w-[calc(100%-2rem)] bg-[#1e1e1e] border-2 border-[#e8b923]/60 rounded-2xl p-3.5 flex items-center justify-between z-10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-neutral-950 font-black rounded-full text-xs font-mono w-7 h-7 flex items-center justify-center border border-white">
              #{userRankData.rank}
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                My relative rankposition
              </span>
              <h4 className="text-sm font-black text-white leading-none mt-1">
                {userRankData.username} {store.isGuest ? '(Guest)' : ''}
              </h4>
            </div>
          </div>

          <div className="text-right flex flex-col justify-center">
            <span className="text-[#e8b923] font-black font-mono text-base">
              {userRankData.totalWinnings.toLocaleString()}{' '}
              <span className="text-[9px] uppercase font-normal text-zinc-500">Coins</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
