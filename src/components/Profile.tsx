/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCasinoStore } from '../store';
import { 
  ArrowLeft, Coins, Settings, Database, Volume2, VolumeX, ShieldAlert,
  Clock, Gamepad2, Landmark, HelpCircle, FileText, ToggleLeft, ToggleRight, User as UserIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type ProfileTab = 'stats' | 'transactions' | 'gamelog' | 'settings';

export default function Profile({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('stats');
  const [usernameEdit, setUsernameEdit] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  // Compute stats on fly from logs
  const hist = store.gameHistory;
  const txs = store.transactions;

  const totalGames = hist.length;
  const totalWins = hist.filter((h) => h.result === 'win').length;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const biggestWin = hist.reduce((max, h) => Math.max(max, h.payoutAmount), 0);

  const handleToggleSound = () => {
    store.updateSettings({ sound: !store.settings.sound });
    toast.success(`Sound effects ${!store.settings.sound ? 'Enabled' : 'Disabled'}`);
  };

  const handleToggleAnimations = () => {
    store.updateSettings({ animations: !store.settings.animations });
    toast.success(`Motion effects ${!store.settings.animations ? 'Enabled' : 'Disabled'}`);
  };

  const handleResetAccount = () => {
    const confirm = window.confirm('Are you sure you want to reset your coins to 50,000? History logs will be deleted.');
    if (confirm) {
      store.resetAccount();
      toast.success('Virtual tokens reset successfully! +50,000 Coins loaded.');
    }
  };

  const handleDeleteAll = () => {
    const confirm = window.confirm('Warning: This will clear all register folders, passwords, and balances. Continue?');
    if (confirm) {
      store.clearAllData();
      toast.success('Local cache wiped successfully.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pb-24 flex flex-col items-center select-none">
      {/* Top Nabbar */}
      <header className="w-full h-15 bg-neutral-950/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-wide font-sans">MY CASINO DASHBOARD</h1>
        </div>

        {/* Live balance indicator */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
          <Coins size={14} className="text-[#e8b923]" />
          <span className="text-xs font-bold font-mono text-[#e8b923]">
            {store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="w-full max-w-lg p-3 space-y-4 flex-1 flex flex-col justify-start">
        {/* PROFILE IDENT CARD */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 p-5 rounded-3xl shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#e01f26]/10 border border-[#e01f26]/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black tracking-wider uppercase text-[#f87171]">
              Demo Gamer
            </span>
          </div>

          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#e8b923] to-red-600 flex items-center justify-center font-black text-white text-lg shadow">
            {store.currentUser ? store.currentUser[0].toUpperCase() : 'G'}
          </div>

          <h3 className="text-md font-extrabold text-white mt-3 truncate max-w-xs leading-none">
            {store.currentUser || 'Guest Gamer'}
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 font-bold mt-1.5 uppercase tracking-widest block">
            Wallet Balance: <span className="text-[#e8b923] font-black">{store.coins.toLocaleString()} Coins</span>
          </span>
        </div>

        {/* STATS ANALYTICS GRID */}
        <div className="grid grid-cols-4 gap-2.5 select-none text-center">
          {[
            { label: 'Total Plays', val: totalGames, color: 'text-white' },
            { label: 'Total Wins', val: totalWins, color: 'text-[#e8b923]' },
            { label: 'Peak Win', val: biggestWin.toLocaleString(), color: 'text-green-400 font-mono' },
            { label: 'Ratio %', val: `${winRate}%`, color: 'text-purple-400' },
          ].map((card, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-neutral-800 p-2.5 rounded-2xl flex flex-col justify-center">
              <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-extrabold block truncate leading-tight">
                {card.label}
              </span>
              <span className={`text-xs font-black mt-1 ${card.color} block`}>{card.val}</span>
            </div>
          ))}
        </div>

        {/* IN-CARD TABS SELECTOR */}
        <div className="grid grid-cols-4 rounded-xl bg-neutral-900 border border-neutral-800/60 p-1">
          {[
            { id: 'stats', label: 'History' },
            { id: 'transactions', label: 'Cash Log' },
            { id: 'gamelog', label: 'Game Log' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`py-2 text-[10px] font-bold rounded-lg tracking-wider transition-all cursor-pointer truncate ${
                activeTab === tab.id
                  ? 'bg-neutral-950 text-[#e8b923] shadow-inner'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* COMPONENT VIEWER CONSOLE */}
        <div className="bg-[#121212] border border-neutral-900 rounded-3xl p-4 flex-1 max-h-[340px] overflow-y-auto scrollbar-thin">
          {activeTab === 'stats' && (
            <div className="space-y-3.5 select-none text-zinc-400 text-xs">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 font-bold uppercase text-[10px] tracking-widest text-[#e8b923]">
                <Clock size={12} />
                <span>Account Audit statistics</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-950">
                <span>Account Registered</span>
                <span className="text-white font-mono font-bold">Standard Local storage</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-950">
                <span>Core Audio Engine</span>
                <span className="text-white font-mono font-bold">{store.settings.sound ? 'Active Synth' : 'Deactivated'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-950">
                <span>Rounds Completed</span>
                <span className="text-white font-mono font-bold">{totalGames} games</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-950">
                <span>Transactions Count</span>
                <span className="text-white font-mono font-bold">{txs.length} logged</span>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 font-bold uppercase text-[10px] tracking-widest text-[#e8b923] pl-1 select-none">
                <Landmark size={12} />
                <span>Chronicle Transaction Logs</span>
              </div>
              {txs.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-600 font-bold uppercase">No records logged</div>
              ) : (
                txs.map((t) => (
                  <div key={t.id} className="flex justify-between items-center text-xs p-2 bg-neutral-950 rounded-xl">
                    <div>
                      <span className="text-white font-black block text-[11px] truncate max-w-[150px]">{t.description}</span>
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block mt-1">
                        {new Date(t.timestamp).toLocaleTimeString()} • {t.gameName || 'SYSTEM'}
                      </span>
                    </div>
                    <span className={`font-mono font-black text-xs ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {t.amount > 0 ? `+${t.amount.toLocaleString()}` : t.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'gamelog' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 font-bold uppercase text-[10px] tracking-widest text-[#e8b923] pl-1 select-none">
                <Gamepad2 size={12} />
                <span>Local Gameplay Logs</span>
              </div>
              {hist.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-600 font-bold uppercase font-sans">No rounds completed</div>
              ) : (
                hist.map((h) => (
                  <div key={h.id} className="flex justify-between items-center text-xs p-2.5 bg-neutral-950 rounded-xl border border-neutral-900/50">
                    <div>
                      <span className="text-white font-black block text-[11px]">{h.gameName}</span>
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase block mt-1">
                        Bet: {h.betAmount} • Payout: {h.payoutAmount}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase py-0.5 px-2 rounded-md ${
                      h.result === 'win' ? 'bg-green-950/40 text-green-500' : h.result === 'tie' ? 'bg-zinc-900 text-zinc-400' : 'bg-red-950/40 text-red-500'
                    }`}>
                      {h.result}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 font-bold uppercase text-[10px] tracking-widest text-[#e8b923] pl-1 select-none">
                <Settings size={12} />
                <span>Control Panel settings</span>
              </div>

              {/* Toggles */}
              <div className="space-y-3 flex flex-col font-sans select-none text-xs font-semibold text-zinc-300">
                <div className="flex justify-between items-center py-1 border-b border-zinc-950">
                  <span>Synthesizer Sound Effects</span>
                  <button onClick={handleToggleSound} className="cursor-pointer">
                    {store.settings.sound ? <Volume2 size={20} className="text-amber-500" /> : <VolumeX size={20} className="text-neutral-600" />}
                  </button>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-950">
                  <span>Framer Motion animations</span>
                  <button onClick={handleToggleAnimations} className="cursor-pointer">
                    {store.settings.animations ? <Volume2 size={20} className="text-[#e8b923]" /> : <VolumeX size={20} className="text-neutral-500" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex flex-col gap-2 select-none font-bold text-xs uppercase">
                <button
                  onClick={handleResetAccount}
                  className="w-full bg-[#e01f26]/10 text-[#f87171] border border-[#e01f26]/30 py-3 rounded-xl transition-colors hover:bg-[#e01f26]/20 cursor-pointer text-center"
                >
                  Reset Balance to 50K
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-neutral-500 border border-neutral-900 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Full Cache Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
