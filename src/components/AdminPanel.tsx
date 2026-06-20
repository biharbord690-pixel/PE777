/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Save, Lock, ShieldCheck, Image, HelpCircle, Eye, EyeOff, LayoutGrid, Sparkles, Orbit, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();
  const [isLogged, setIsLogged] = useState(false);
  const [uId, setUId] = useState('');
  const [uPass, setUPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'slots' | 'credentials'>('info');

  // Input states synchronized with adminSettings
  const [adminId, setAdminId] = useState(store.adminSettings.adminId);
  const [adminPassword, setAdminPassword] = useState(store.adminSettings.adminPassword);
  const [squareImages, setSquareImages] = useState(store.adminSettings.squareImages);
  const [gameImages, setGameImages] = useState<Record<string, string>>({ ...store.adminSettings.gameImages });
  const [slotOverrideEmojis, setSlotOverrideEmojis] = useState<Record<string, string>>({ ...store.adminSettings.slotOverrideEmojis });
  const [aviatorImg, setAviatorImg] = useState(store.adminSettings.aviatorImg);

  // Slot symbol pool options to edit
  const SLOT_EMOJI_POOL = ['🐉', '🐯', '🍒', '🔔', '⭐', '💎', 'BAR', '7️⃣', '⚡', '🎴', '🔮', '🪙', '💰', '🏮', '🎋', '👑', '🌸', '🌵', '🐎', '🔫', '🤠', '🍋', '🍊', '🍇', '🍉', '💠', '🌟', '💍', '✨', '🚀', '🔮', '🏺', '🏴‍☠️', '🐼', '🔥', '🦜', '⚓', '⚔️', '🍩', '🍫', '🧁', '🍭', '🍬'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = uId.trim();
    const cleanPass = uPass.trim();

    if (cleanId === store.adminSettings.adminId && cleanPass === store.adminSettings.adminPassword) {
      setIsLogged(true);
      toast.success('एडमिन डैशबोर्ड में आपका स्वागत है!', {
        style: { background: '#0e0b1e', color: '#10b981', border: '1px solid #10b981' },
        icon: '🛡️'
      });
    } else {
      toast.error('गलत आईडी या पासवर्ड! कृपया दोबारा जांचें।');
    }
  };

  const saveSettings = () => {
    store.updateAdminSettings({
      adminId,
      adminPassword,
      squareImages,
      gameImages,
      slotOverrideEmojis,
      aviatorImg
    });

    toast.success('सभी सेटिंग्स फायरबेस और क्लाउड डेटाबेस पर सफलतापूर्वक सहेज दी गई हैं! 🔥🚀', {
      style: { background: '#090514', color: '#ffd700', border: '1px solid #e8b923' },
      duration: 3500
    });
  };

  // 24 Games lookup helper
  const ALL_GAMES = [
    { id: 'lucky777', name: 'Lucky 777 Slots' },
    { id: 'fortunedragon', name: 'Fortune Dragon Slots' },
    { id: 'goldentiger', name: 'Golden Tiger Slots' },
    { id: 'wildwest', name: 'Wild West Riches' },
    { id: 'fruitfrenzy', name: 'Fruit Frenzy Slots' },
    { id: 'diamondrush', name: 'Diamond Rush' },
    { id: 'neonnights', name: 'Neon Nights' },
    { id: 'ancientegypt', name: 'Ancient Egypt' },
    { id: 'pirategold', name: 'Pirate Gold' },
    { id: 'candyblast', name: 'Candy Blast' },
    { id: 'luckypanda', name: 'Lucky Panda' },
    { id: 'firephoenix', name: 'Fire Phoenix' },
    { id: 'oceanking', name: 'Ocean King' },
    { id: 'dragonking', name: 'Dragon King' },
    { id: 'alienhunter', name: 'Alien Hunter' },
    { id: 'deepsea', name: 'Deep Sea Hunter' },
    { id: 'baccarat', name: 'Vegas Baccarat' },
    { id: 'dragontiger', name: 'Dragon Tiger' },
    { id: 'teenpatti', name: 'Teen Patti Elite' },
    { id: 'blackjack', name: 'Royal Blackjack' },
    { id: 'poker', name: 'Texas Hold\'em Poker' },
    { id: 'crashrocket', name: 'Crash Rocket' },
    { id: 'aviator', name: 'Aviator Crash' },
    { id: 'luckywheel', name: 'Lucky Fortune Wheel' }
  ];

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative select-none">
        <div className="absolute inset-0 bg-radial-at-c from-purple-950/20 via-neutral-950 to-neutral-950 pointer-events-none" />
        
        <div className="w-full max-w-sm ml-auto mr-auto bg-gradient-to-b from-[#1b0c36] via-[#0e0622] to-[#120727] border border-pink-500/35 p-6 rounded-3xl shadow-[0_0_40px_rgba(236,72,153,0.15)] backdrop-blur-md relative z-10">
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 via-amber-400 to-[#e8b923] rounded-2xl flex items-center justify-center text-zinc-950 ml-auto mr-auto shadow-[0_0_20px_rgba(232,185,35,0.4)] border border-white/20">
              <Lock size={28} className="text-neutral-950 stroke-[2.5]" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-[#e8b923] font-sans">
              PE777 SECURE ADMIN PANEL
            </h1>
            <p className="text-[10px] text-pink-300 font-bold uppercase tracking-widest leading-none">
              सिर्फ ऑपरेटर लॉगिन के लिए सुरक्षित गेटवे
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">लॉगिन आईडी (ID)</label>
              <input
                type="text"
                required
                value={uId}
                onChange={(e) => setUId(e.target.value)}
                placeholder="उदा. ahirgaming"
                className="w-full bg-slate-950/80 border border-cyan-500/20 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-[#e8b923] placeholder-neutral-700 font-mono transition-all"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">सुरक्षित पासवर्ड (PASSWORD)</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={uPass}
                  onChange={(e) => setUPass(e.target.value)}
                  placeholder="उदा. 854336"
                  className="w-full bg-slate-950/80 border border-cyan-500/20 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-[#e8b923] placeholder-neutral-700 font-mono pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-650 to-amber-400 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] mt-4 cursor-pointer"
            >
              डैशबोर्ड में प्रवेश करें 🛡️
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full text-center text-[10px] font-bold uppercase text-neutral-500 hover:text-white mt-4 border-0 bg-transparent cursor-pointer transition-colors"
          >
            वापस होम पर जाएं ←
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06030c] text-neutral-100 flex flex-col relative pb-15 select-none font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Admin Header Panel */}
      <header className="sticky top-0 bg-[#0e081e]/90 border-b border-pink-500/35 px-4 py-4 backdrop-blur z-20 flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-neutral-900 border border-white/5 hover:border-pink-500/20 transition-all text-neutral-300"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-200 to-[#e8b923] tracking-widest">
            AHIRGAMING ADMIN WORKSPACE
          </h1>
          <span className="text-[7.5px] uppercase tracking-[0.2em] font-extrabold text-cyan-400 block mt-0.5">
            Cloud Secured Database Syncing
          </span>
        </div>
        <button
          onClick={saveSettings}
          className="px-3.5 py-2.5 bg-gradient-to-r from-[#e8b923] to-amber-500 text-zinc-950 font-black rounded-xl text-[10px] uppercase flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(232,185,35,0.3)]"
        >
          <Save size={13} className="text-zinc-950" /> Save Config
        </button>
      </header>

      {/* Tabs list switchers */}
      <div className="flex gap-1.5 overflow-x-auto p-4 border-b border-neutral-900 bg-[#0c071a]/50">
        <button
          onClick={() => setActiveTab('info')}
          className={`py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
            activeTab === 'info' ? 'bg-pink-600 font-extrabold text-white shadow-lg shadow-pink-600/25' : 'bg-neutral-900/60 text-zinc-500 border border-neutral-800'
          }`}
        >
          🔑 जानकारी (HINDI HELP)
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
            activeTab === 'images' ? 'bg-pink-600 font-extrabold text-white shadow-lg shadow-pink-600/25' : 'bg-neutral-900/60 text-zinc-500 border border-neutral-800'
          }`}
        >
          🖼️ गेम इमेजेस (24 GAMES)
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
            activeTab === 'slots' ? 'bg-pink-600 font-extrabold text-white shadow-lg shadow-pink-600/25' : 'bg-neutral-900/60 text-zinc-500 border border-neutral-800'
          }`}
        >
          🐉 स्लॉट इमोजी (CUSTOM REELS)
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
            activeTab === 'credentials' ? 'bg-pink-600 font-extrabold text-white shadow-lg shadow-pink-600/25' : 'bg-neutral-900/60 text-zinc-500 border border-neutral-800'
          }`}
        >
          🛡️ सेटिंग्स (CREDS & LAYOUT)
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-w-lg ml-auto mr-auto w-full">
        {/* Tab 1: Hindi Guidelines & Help */}
        {activeTab === 'info' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#0e071c] p-4 rounded-2xl border border-pink-500/20 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={18} className="text-[#e8b923]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">एडमिन पैनल से आप क्या-क्या बदलाव कर सकते हैं?</h3>
              </div>
              <p className="text-[11px] text-pink-300 font-extrabold uppercase tracking-widest border-b border-pink-500/10 pb-2 mb-3">
                (हिंदी गाइडलाइन्स - ऑपरेटर के लिए पूर्ण नियंत्रण)
              </p>
              
              <ul className="space-y-4 text-xs text-zinc-300 leading-relaxed list-none pl-0">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-400 font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-white block font-black uppercase tracking-wide">सभी 24 खेलों की इमेज बदलें (Change Game Images)</strong>
                    आप अपने एडमिन पैनल से सभी 24 गेम्स के SVG डिजाइन को खुद की पसन्दीदा इमेज URL (PNG/JPG) से ओवरराइड कर सकते हैं।
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-400 font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-white block font-black uppercase tracking-wide">फुल स्क्वायर शेप या गोल इमेज मोड (Square Vs Circle Images)</strong>
                    गेम कार्ड के थंबनेल को पूर्ण चौकोर (Square shape) या पारंपरिक गोलाकार (Circle size) में स्वैप कर सकते हैं। लॉबी तुरंत चुनी गई थीम के हिसाब से खुद को ढाल लेगी।
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-400 font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-white block font-black uppercase tracking-wide">फॉरच्यून स्लॉट स्पिन इमोजी कस्टमाइजेशन (Slot Emoji to Custom PNGs)</strong>
                    फॉरच्यून ड्रैगन जैसी स्लॉट गेम्स में जो घूमते हुए इमोजी (🐉, 🐯, 🍒, 🔔, ⭐, 💎) दिखते हैं, उनकी जगह आप मनपसंद इमेज लगा सकते हैं।
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-400 font-bold text-[10px]">
                    4
                  </div>
                  <div>
                    <strong className="text-white block font-black uppercase tracking-wide">एविएटर / क्रैश रॉकेट कस्टमाइजेशन (Aviation Sprite Switcher)</strong>
                    क्रैश एविएटर में उड़ने वाले ट्रेडिशनल लाल विमान या रॉकेट को उड़ाने के बजाय आप अपनी कंपनी का कस्टम विमान लोगो इमेज यहाँ रख सकते हैं।
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-400 font-bold text-[10px]">
                    5
                  </div>
                  <div>
                    <strong className="text-white block font-black uppercase tracking-wide">गूगल फायरबेस डेटाबेस सिंक (Live Cloud Firestore Sync)</strong>
                    आपकी सभी सेटिंग्स, गेम फोटो, आईडी और पासवर्ड सीधा असली गूगल फायरबेस डेटाबेस (silent-drake-jwh20) में लाइव सिंक होते हैं! जब इंटरनेट से नया अपडेट आएगा, सभी प्लेयर्स को वह स्वतः दिखने लगेगा।
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-3">
              <Sparkles className="text-amber-400 shrink-0" size={20} />
              <div className="text-left">
                <span className="text-[10px] text-zinc-500 block uppercase font-black">सिस्टम स्टेटस</span>
                <p className="text-[11px] text-emerald-400 font-bold uppercase leading-tight animate-pulse">● फायरबेस क्लाउड डेटाबेस सिंक सक्रिय है</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 24 Game Images Overrides */}
        {activeTab === 'images' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-[#0c071a] border border-cyan-500/20 rounded-2xl">
              <span className="text-[9px] text-cyan-400 uppercase font-black tracking-widest block mb-1">गेम थंबनेल्स बदलें (Change Games Images)</span>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                यहाँ गेम्स के लिए PNG/JPG इमेज का डायरेक्ट लिंक डालें। जब URL मौजूद होगा, असली 3D रेंडर इमेज दिखाई देगी। खाली छोड़ने पर डिफ़ॉल्ट 3D SVG दिखेगा।
              </p>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {ALL_GAMES.map((game) => (
                <div key={game.id} className="p-3 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center gap-3 justify-between">
                  {/* Miniature Image preview square/round based on configuration */}
                  <div className={`w-12 h-12 ${squareImages ? 'rounded-xl' : 'rounded-full'} border border-white/10 overflow-hidden shrink-0 bg-[#0e0c1f] flex items-center justify-center p-0.5`}>
                    {gameImages[game.id] ? (
                      <img src={gameImages[game.id]} alt={game.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] font-black text-pink-500 uppercase">{game.id.substring(0,3)}</span>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <span className="text-[11px] font-extrabold text-white block uppercase tracking-wide leading-tight">{game.name}</span>
                    <span className="text-[8px] text-indigo-400 font-sans block uppercase font-mono mt-0.5">ID: {game.id}</span>
                    <input
                      type="text"
                      value={gameImages[game.id] || ''}
                      onChange={(e) => {
                        const next = { ...gameImages };
                        next[game.id] = e.target.value;
                        setGameImages(next);
                      }}
                      placeholder="इमेज का लाइव URL डालें..."
                      className="w-full bg-[#120f26]/60 border border-white/5 rounded-lg py-1.5 px-3 text-[10px] font-mono focus:border-pink-500 outline-none text-zinc-300 mt-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Slot Emojis to Custom Images Overrides */}
        {activeTab === 'slots' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-[#0c071a] border border-cyan-500/20 rounded-2xl text-left space-y-1">
              <span className="text-[9px] text-cyan-400 uppercase font-black tracking-widest block">फॉरच्यून स्पिन स्लॉट इमोजी इमेज कस्टमाइजेशन</span>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                स्लॉट रील्स में घूमने वाले इमोजी कैरेक्टर्स को मॉडर्न इमेजेस से बदलें। मनचाहे सिंबल के लिए अपना कस्टमाइज्ड डायरेक्ट इमेज (PNG/JPG) URL पेस्ट करें।
              </p>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-4 space-y-3">
              <span className="text-[10px] text-zinc-400 font-bold block uppercase border-b border-neutral-900 pb-1.5 tracking-wider">
                Reel Items Override List
              </span>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {SLOT_EMOJI_POOL.slice(0, 15).map((symbol) => (
                  <div key={symbol} className="flex items-center gap-3 p-2 bg-[#120f26]/40 border border-white/5 rounded-xl">
                    <div className="w-10 h-10 bg-[#07050e] rounded-xl flex items-center justify-center text-xl shrink-0">
                      {slotOverrideEmojis[symbol] ? (
                        <img src={slotOverrideEmojis[symbol]} alt={symbol} className="w-8 h-8 object-contain rounded" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{symbol}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-bold block text-pink-300 tracking-wider">सिंबल / सिंबल इमेज बदलाव: {symbol}</span>
                      <input
                        type="text"
                        value={slotOverrideEmojis[symbol] || ''}
                        onChange={(e) => {
                          const next = { ...slotOverrideEmojis };
                          next[symbol] = e.target.value;
                          setSlotOverrideEmojis(next);
                        }}
                        placeholder="अपनी कस्टम इमेज का URL पेस्ट करें..."
                        className="w-full bg-[#0a0815] border border-white/5 rounded-lg py-1 px-2.5 text-[9.5px] font-mono outline-none focus:border-[#e8b923] text-zinc-300 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: General Settings & Credentials and Layouts */}
        {activeTab === 'credentials' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-4 space-y-4 text-left">
              <div className="flex items-center gap-2 border-b border-neutral-955 pb-2">
                <Orbit className="text-[#e8b923]" size={16} />
                <span className="text-[11px] font-black uppercase text-white tracking-wider">
                  लॉबी लेआउट सेटिंग्स (Thumbnail Layout style)
                </span>
              </div>

              {/* Square / Circle switch UI toggle representation */}
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                <div>
                  <span className="text-xs font-black text-white block uppercase tracking-wide">फुल स्क्वायर शेप थंबनेल (Full Square Thumbnails)</span>
                  <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5 leading-none">इमेजेस को गोल होने के बजाय पूर्ण चौकोर बॉक्स मोड में रखें</span>
                </div>
                <button
                  onClick={() => setSquareImages(!squareImages)}
                  className={`w-14 h-7 rounded-full p-1 transition-all ${squareImages ? 'bg-pink-600' : 'bg-neutral-800'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${squareImages ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Aviator Custom image input panel */}
              <div className="p-3 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-2">
                <div>
                  <span className="text-xs font-black text-white block uppercase tracking-wide">एविएटर कस्टम प्लेन इमेज (Aviator Custom Plane Icon)</span>
                  <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5 leading-none">एविएटर / क्रैश गेम के अंदर उड़ते हुए विमान की कस्टम फोटो</span>
                </div>
                <input
                  type="text"
                  value={aviatorImg}
                  onChange={(e) => setAviatorImg(e.target.value)}
                  placeholder="उदा. https://image.png (खाली छोड़ने पर डिफ़ॉल्ट रॉकेट दिखेगा)"
                  className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-2 px-3 text-[10px] font-mono text-zinc-300 outline-none focus:border-pink-500"
                />
                {aviatorImg && (
                  <div className="mt-2 w-16 h-16 bg-[#0c0a1a] rounded-xl flex items-center justify-center p-1.5 border border-white/10 border-dashed">
                    <img src={aviatorImg} alt="aviator preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            {/* Change Admin credentials section */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-4 space-y-3.5 text-left">
              <div className="flex items-center gap-2 border-b border-neutral-955 pb-2">
                <KeyRound className="text-cyan-400" size={16} />
                <span className="text-[11px] font-black uppercase text-white tracking-wider">
                  एडमिन लॉगिन एक्सेस कुंजी (Change ID / PASSWORD)
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-cyan-400 block tracking-wider">एडमिन आईडी (ADMIN USERNAME)</span>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="एडमिन लॉग-इन आईडी दर्ज करें..."
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-zinc-150 outline-none focus:border-[#e8b923]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-cyan-400 block tracking-wider">सुरक्षित पासवर्ड (ADMIN SECRET PASSWORD)</span>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="एडमिन सुरक्षित पासवर्ड दर्ज करें..."
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-zinc-150 outline-none focus:border-[#e8b923]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto py-4 border-t border-neutral-900 bg-[#0c071a]/40 text-center relative z-10 select-none">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block"> AhirGaming Gate Escrow • Server-Side Firewalls Enabled</span>
      </footer>
    </div>
  );
}
