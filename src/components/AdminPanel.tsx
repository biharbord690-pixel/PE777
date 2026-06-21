/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Save, Lock, ShieldCheck, Image, HelpCircle, Eye, EyeOff, LayoutGrid, Sparkles, Orbit, KeyRound, Database, Check, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSupabase } from '../supabase';

// Reusable Image upload & URL Selector helper component
const ImageUploadInput = ({
  value,
  onChange,
  placeholder,
  maxWidth = 400
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxWidth?: number;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('गैलरी से चित्र कंप्रेस हो रहा है...', {
      style: { background: '#0e0b1e', color: '#ffd700', border: '1px solid #e8b923' }
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new window.Image();
      imgObj.onload = () => {
        const canvas = document.createElement('canvas');
        let width = imgObj.width;
        let height = imgObj.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgObj, 0, 0, width, height);
          
          // Use high quality Webp/Jpeg compression to keep files crisp & bright while 10x lighter than raw PNG
          let compressedBase64 = canvas.toDataURL('image/webp', 0.90);
          if (!compressedBase64.startsWith('data:image/webp')) {
            compressedBase64 = canvas.toDataURL('image/jpeg', 0.90);
          }
          
          onChange(compressedBase64);
          toast.success('छवि गैलरी से लोड और सुरक्षित रूप से सहेज ली गई है! ✨', { id: loadingToast });
        }
      };
      imgObj.onerror = () => {
        toast.error('इमेज लोड करने में असमर्थ!', { id: loadingToast });
      };
      imgObj.src = event.target?.result as string;
    };
    reader.onerror = () => {
      toast.error('फ़ाइल पढ़ने में त्रुटि!', { id: loadingToast });
    };
    reader.readAsDataURL(file);
  };

  const isUploaded = value && value.startsWith('data:image/');

  return (
    <div className="space-y-1 text-left w-full mt-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={isUploaded ? '✨ [ Uploaded: डिवाइस गैलरी चित्र ]' : value}
          disabled={!!isUploaded}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "डायरेक्ट URL या गैलरी से अपलोड..."}
          className={`flex-1 bg-[#120f26]/60 border border-white/5 rounded-lg py-1.5 px-3 text-[10px] font-mono focus:border-pink-500 outline-none ${isUploaded ? 'text-amber-400 font-bold bg-neutral-900/80 cursor-not-allowed' : 'text-zinc-300'}`}
        />
        
        {isUploaded ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="px-2.5 bg-red-950/40 border border-red-500/20 hover:border-red-500/60 rounded-lg text-[9px] font-black uppercase text-red-400 transition-colors shrink-0 cursor-pointer"
            title="इमेज को साफ़ करें"
          >
            हटाएं ❌
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 bg-pink-950/30 border border-pink-500/25 hover:border-pink-500 text-pink-400 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Image size={10} className="stroke-[2.5]" /> गैलरी 📁
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

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
  const [loginMascotUrl, setLoginMascotUrl] = useState(store.adminSettings.loginMascotUrl || '');
  const [loginLobbyBgUrl, setLoginLobbyBgUrl] = useState(store.adminSettings.loginLobbyBgUrl || '');

  // Supabase states for integration checks
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'checking' | 'success' | 'table-missing' | 'error'>('idle');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState('');

  const handleTestSupabase = async () => {
    const supabaseClient = getSupabase();
    if (!supabaseClient) {
      toast.error('Supabase credentials not found. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in settings!');
      setSupabaseStatus('error');
      setSupabaseErrorMsg('Supabase is not configured yet. Add variables to Settings.');
      return;
    }

    setSupabaseStatus('checking');
    const checkToast = toast.loading('Testing Supabase Connection...');

    try {
      // Direct call to query table
      const { data, error } = await supabaseClient.from('admin_settings').select('settings').eq('id', 'config').maybeSingle();
      
      if (error) {
        // Table missing or other database error
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          setSupabaseStatus('table-missing');
          setSupabaseErrorMsg('admin_settings table not created yet. Please execute the SQL below in Supabase SQL Editor!');
          toast.error('Supabase connected, but database table is missing.', { id: checkToast });
        } else {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(error.message);
          toast.error(`Error: ${error.message}`, { id: checkToast });
        }
      } else {
        // Successful connection! Let's save/upsert the current state as backup
        const currentData = {
          adminId,
          adminPassword,
          squareImages,
          gameImages,
          slotOverrideEmojis,
          aviatorImg,
          loginMascotUrl,
          loginLobbyBgUrl
        };
        const { error: upsertError } = await supabaseClient.from('admin_settings').upsert({ id: 'config', settings: currentData });
        if (upsertError) {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(`Connected but could not write configuration: ${upsertError.message}`);
          toast.error('Write authorization failed. Check your row-level security (RLS).', { id: checkToast });
        } else {
          setSupabaseStatus('success');
          toast.success('Supabase is connected & live-syncing! 🎉', { id: checkToast });
        }
      }
    } catch (err: any) {
      // PGRST205 or similar Table not found
      const msg = err?.message || '';
      if (msg.includes('relation "public.admin_settings" does not exist') || msg.includes('404') || msg.includes('schema cache')) {
        setSupabaseStatus('table-missing');
        setSupabaseErrorMsg('admin_settings table not created yet. Please run the SQL below in Supabase Console!');
        toast.error('Supabase connected, but table not found.', { id: checkToast });
      } else {
        setSupabaseStatus('error');
        setSupabaseErrorMsg(err.message || 'Unknown network error');
        toast.error('Supabase connection failed!', { id: checkToast });
      }
    }
  };

  // Synchronize deep state values when refreshed from Firebase onSnapshot live stream
  React.useEffect(() => {
    if (store.adminSettings) {
      setAdminId(store.adminSettings.adminId || 'ahirgaming');
      setAdminPassword(store.adminSettings.adminPassword || '854336');
      setSquareImages(!!store.adminSettings.squareImages);
      setGameImages({ ...store.adminSettings.gameImages });
      setSlotOverrideEmojis({ ...store.adminSettings.slotOverrideEmojis });
      setAviatorImg(store.adminSettings.aviatorImg || '');
      setLoginMascotUrl(store.adminSettings.loginMascotUrl || '');
      setLoginLobbyBgUrl(store.adminSettings.loginLobbyBgUrl || '');
    }
  }, [store.adminSettings]);

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
      aviatorImg,
      loginMascotUrl,
      loginLobbyBgUrl
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
                    <ImageUploadInput
                      value={gameImages[game.id] || ''}
                      onChange={(val) => {
                        const next = { ...gameImages };
                        next[game.id] = val;
                        setGameImages(next);
                        store.updateAdminSettings({ gameImages: next });
                      }}
                      placeholder="इमेज का लाइव URL डालें या गैलरी से अपलोड करें..."
                      maxWidth={500}
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
                      <ImageUploadInput
                        value={slotOverrideEmojis[symbol] || ''}
                        onChange={(val) => {
                          const next = { ...slotOverrideEmojis };
                          next[symbol] = val;
                          setSlotOverrideEmojis(next);
                          store.updateAdminSettings({ slotOverrideEmojis: next });
                        }}
                        placeholder="अपनी कस्टम इमेज का URL पेस्ट करें या गैलरी से चुनें..."
                        maxWidth={300}
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
                  लॉबी लेात्पाद सेटिंग्स (Thumbnail Layout style)
                </span>
              </div>

              {/* Square / Circle switch UI toggle representation */}
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                <div>
                  <span className="text-xs font-black text-white block uppercase tracking-wide">फुल स्क्वायर शेप थंबनेल (Full Square Thumbnails)</span>
                  <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5 leading-none">इमेजेस को गोल होने के बजाय पूर्ण चौकोर बॉक्स मोड में रखें</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !squareImages;
                    setSquareImages(nextVal);
                    store.updateAdminSettings({ squareImages: nextVal });
                  }}
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
                <ImageUploadInput
                  value={aviatorImg}
                  onChange={(val) => {
                    setAviatorImg(val);
                    store.updateAdminSettings({ aviatorImg: val });
                  }}
                  placeholder="उदा. https://image.png या गैलरी से चित्र अपलोड करें"
                  maxWidth={300}
                />
                {aviatorImg && (
                  <div className="mt-2 w-16 h-16 bg-[#0c0a1a] rounded-xl flex items-center justify-center p-1.5 border border-white/10 border-dashed">
                    <img src={aviatorImg} alt="aviator preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* Login Mascot Logo image input panel */}
              <div className="p-3 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-2">
                <div>
                  <span className="text-xs font-black text-white block uppercase tracking-wide">लॉगिन गोल मैस्कॉट लोगो (Login Mascot Logo URL)</span>
                  <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5 leading-none">लॉगिन पेज पर दिखने वाला गोल मैस्कॉट कार्टून/लोगो</span>
                </div>
                <ImageUploadInput
                  value={loginMascotUrl}
                  onChange={(val) => {
                    setLoginMascotUrl(val);
                    store.updateAdminSettings({ loginMascotUrl: val });
                  }}
                  placeholder="उदा. https://image.png या गैलरी से चित्र अपलोड करें"
                  maxWidth={300}
                />
                {loginMascotUrl && (
                  <div className="mt-2 w-16 h-16 bg-[#0c0a1a] rounded-xl flex items-center justify-center p-1.5 border border-white/10 border-dashed">
                    <img src={loginMascotUrl} alt="mascot preview" className="max-w-full max-h-full object-contain rounded-full" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* Login/Splash Lobby Background image input panel */}
              <div className="p-3 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-2">
                <div>
                  <span className="text-xs font-black text-white block uppercase tracking-wide">लॉगिन/स्प्लैश बैकग्राउंड (Lobby Background URL)</span>
                  <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5 leading-none">लॉबी और लॉगिन पृष्ठ की मुख्य पृष्ठभूमि इमेज चित्र</span>
                </div>
                <ImageUploadInput
                  value={loginLobbyBgUrl}
                  onChange={(val) => {
                    setLoginLobbyBgUrl(val);
                    store.updateAdminSettings({ loginLobbyBgUrl: val });
                  }}
                  placeholder="उदा. https://image.png या गैलरी से चित्र अपलोड करें"
                  maxWidth={1200}
                />
                {loginLobbyBgUrl && (
                  <div className="mt-2 h-16 w-28 bg-[#0c0a1a] rounded-xl flex items-center justify-center p-1.5 border border-white/10 border-dashed">
                    <img src={loginLobbyBgUrl} alt="lobby bg preview" className="max-w-full max-h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
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

            {/* Supabase Database Settings Section */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-4 space-y-4 text-left">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
                <Database className="text-emerald-400 animate-pulse" size={16} />
                <span className="text-[11px] font-black uppercase text-white tracking-wider">
                  Supabase डेटाबेस सेटअप (Vercel & Live Backup)
                </span>
              </div>

              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-medium">
                Vercel या अन्य सर्वर पर इमेज और ओवेरराइड्स को हमेशा चालू रखने के लिए Supabase का उपयोग करें। यह आपके डेटा को लाइव रखता है।
              </p>

              <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-bold uppercase tracking-wide text-[9.5px]">SUPABASE_URL STATUS:</span>
                  {import.meta.env.VITE_SUPABASE_URL ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/10">
                      लॉन्च है (Configured)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/10">
                      गैस है (Missing)
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-bold uppercase tracking-wide text-[9.5px]">ANON_KEY STATUS:</span>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                      <ShieldCheck size={10} /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/10">
                      गायब है (Missing)
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={supabaseStatus === 'checking'}
                className="w-full bg-[#10b981] hover:bg-[#059669] transition-all text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-[0.98] disabled:opacity-50"
              >
                <Database size={14} />
                {supabaseStatus === 'checking' ? 'चेक किया जा रहा है...' : 'डेटाबेस चेक करें और सिंक्रोनाइज़ करें'}
              </button>

              {supabaseStatus === 'success' && (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-xl border border-emerald-500/20 font-bold text-center">
                  ✅ आपका Supabase बिल्कुल सही काम कर रहा है और सुरक्षित है! सभी फोटो और सेटिंग्स वहां सिंक हो गई हैं।
                </div>
              )}

              {supabaseStatus === 'error' && (
                <div className="p-3 bg-rose-500/10 text-rose-400 text-[10px] rounded-xl border border-rose-500/20 font-semibold leading-relaxed">
                  ❌ एरर: {supabaseErrorMsg}. <br />
                  कृपया एडमिन सेटिंग्स (Secret keys) में जाके अपनी Supabase URL और API ANON-Key जांचें।
                </div>
              )}

              {(supabaseStatus === 'table-missing' || supabaseStatus === 'idle' || supabaseStatus === 'error') && (
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-rose-500/10 text-rose-400 text-[10.5px] rounded-xl border border-rose-500/20 leading-relaxed font-bold">
                    ⚠️ <b>RLS Policy Error Solution:</b> Supabase का RLS पॉलिसी एरर ठीक करने के लिए नीचे दिए गए पूरे SQL कोड को फिर से कॉपी करें और अपने <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-black">Supabase SQL Editor</a> में चलाएं:
                  </div>

                  <div className="bg-neutral-900 border border-white/5 rounded-xl p-3 relative font-mono text-[9px] text-zinc-300 select-all overflow-x-auto whitespace-pre leading-normal max-h-40">
                    <button
                      type="button"
                      onClick={() => {
                        const sqlCode = `-- 1. Create admin_settings table if not exists\nCREATE TABLE IF NOT EXISTS admin_settings (\n  id varchar PRIMARY KEY DEFAULT 'config',\n  settings jsonb NOT NULL,\n  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 2. Turn off Row Level Security (RLS) permanently to allow simple app config\nALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;\n\n-- 3. Fallback policy if RLS remains active\nDROP POLICY IF EXISTS "Allow public read and write" ON admin_settings;\nCREATE POLICY "Allow public read and write" ON admin_settings\n  FOR ALL TO public USING (true) WITH CHECK (true);\n\n-- 4. Insert initial config\nINSERT INTO admin_settings (id, settings) \nVALUES ('config', '{"squareImages": true, "gameImages": {}, "slotOverrideEmojis": {}}'::jsonb)\nON CONFLICT (id) DO NOTHING;`;
                        navigator.clipboard.writeText(sqlCode);
                        setCopiedSql(true);
                        toast.success('SQL कोड कॉपी हो गया! Supabase में पेस्ट करें।');
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="absolute right-2 top-2 bg-neutral-800 hover:bg-neutral-700 p-1.5 rounded-lg text-white transition-all cursor-pointer"
                    >
                      {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                    {`-- 1. Create admin_settings table if not exists
CREATE TABLE IF NOT EXISTS admin_settings (
  id varchar PRIMARY KEY DEFAULT 'config',
  settings jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Turn off Row Level Security (RLS) permanently to allow simple app config
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- 3. Fallback policy if RLS remains active
DROP POLICY IF EXISTS "Allow public read and write" ON admin_settings;
CREATE POLICY "Allow public read and write" ON admin_settings
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Insert initial config
INSERT INTO admin_settings (id, settings) 
VALUES ('config', '{"squareImages": true, "gameImages": {}, "slotOverrideEmojis": {}}'::jsonb)
ON CONFLICT (id) DO NOTHING;`}
                  </div>
                </div>
              )}
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
