/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CasinoProvider, useCasinoStore } from './store';
import Splash from './components/Splash';
import BunniesLogin from './components/BunniesLogin';
import BunniesDashboard from './components/BunniesDashboard';
import BunniesWallet from './components/BunniesWallet';
import BunniesProfile from './components/BunniesProfile';
import BunniesNotification from './components/BunniesNotification';
import Slots from './components/Slots';
import Fish from './components/Fish';
import Baccarat from './components/Baccarat';
import DragonTiger from './components/DragonTiger';
import TeenPatti from './components/TeenPatti';
import Crash from './components/Crash';
import Blackjack from './components/Blackjack';
import { Toaster, toast } from 'react-hot-toast';
import { Home as HomeIcon, Wallet, Bell, Gamepad2, User } from 'lucide-react';

function AppContent() {
  const store = useCasinoStore();

  const [currentPath, setCurrentPath] = useState<string>('splash');
  const [extraParam, setExtraParam] = useState<string>('');
  const [extraName, setExtraName] = useState<string>('');

  const [isWatchingAd, setIsWatchingAd] = useState(false);

  // Synchronise route hashes
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash || '#splash';
      if (hash.startsWith('#')) hash = hash.substring(1);

      // Simple auth filter guard
      const cached = localStorage.getItem('jw777_current_user');
      if (!cached && hash !== 'splash' && hash !== 'login') {
        window.location.hash = '#login';
        return;
      }

      if (hash.startsWith('games/slots/')) {
        const parts = hash.split('/');
        const variantId = parts[2] || 'lucky777';
        setCurrentPath('slots');
        setExtraParam(variantId);

        const names: Record<string, string> = {
          lucky777: 'Lucky 777 Slot',
          fortunedragon: 'Fortune Dragon Slot',
          goldentiger: 'Golden Tiger Slot',
          wildwest: 'Wild West Riches Slot',
          fruitfrenzy: 'Fruit Frenzy Spin',
          diamondrush: 'Diamond Rush Slot',
          neonnights: 'Neon Nights Slot',
          ancientegypt: 'Ancient Egypt Slot',
          pirategold: 'Pirate Gold Slot',
          candyblast: 'Candy Blast Slot',
          luckypanda: 'Lucky Panda Slot',
          firephoenix: 'Fire Phoenix Slot'
        };
        setExtraName(names[variantId] || 'Golden slot');
      } else {
        setCurrentPath(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // trigger on mount
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSimulateAd = () => {
    setIsWatchingAd(true);
    toast.success('Loading sponsored media...', { icon: '📺' });

    setTimeout(() => {
      setIsWatchingAd(false);
      store.addCoins(2500, 'Watched sponsored simulation Ad', 'SYSTEM', 'bonus');
      toast.success('Congratulations! +₹2,500 cash added!', {
        icon: '💎',
        style: { background: '#1c1c1c', color: '#ffd700', border: '1px solid #ffd700' }
      });
    }, 3000);
  };

  const handleResetBankruptcy = () => {
    store.addCoins(50000, 'Bankruptcy fund reset', 'SYSTEM', 'bonus');
    toast.success('Account reset to ₹50,000 cash successfully!');
  };

  // 0-Coins overlay blocker
  const isBroke = store.coins <= 0 && 
    currentPath !== 'splash' && 
    currentPath !== 'login' && 
    currentPath !== 'home' && 
    currentPath !== 'add_cash' && 
    currentPath !== 'profile' && 
    currentPath !== 'notifications';

  const renderActiveComponent = () => {
    switch (currentPath) {
      case 'splash':
        return <Splash onComplete={() => window.location.hash = '#login'} />;
      case 'login':
        return <BunniesLogin onSuccess={() => window.location.hash = '#home'} />;
      case 'home':
        return (
          <BunniesDashboard
            onNavigate={(p) => window.location.hash = p}
            onOpenAddCash={() => window.location.hash = '#add_cash'}
            onOpenNotifications={() => window.location.hash = '#notifications'}
            onOpenProfile={() => window.location.hash = '#profile'}
          />
        );
      case 'add_cash':
        return (
          <BunniesWallet
            onBack={() => window.location.hash = '#home'}
            onRequestViewNotifications={() => window.location.hash = '#notifications'}
          />
        );
      case 'notifications':
        return (
          <BunniesNotification
            onBack={() => window.location.hash = '#home'}
            onNavigateToTopUp={() => window.location.hash = '#add_cash'}
          />
        );
      case 'slots':
        return <Slots gameId={extraParam} gameName={extraName} onBack={() => window.location.hash = '#home'} />;
      case 'fish':
        return <Fish onBack={() => window.location.hash = '#home'} />;
      case 'baccarat':
        return <Baccarat onBack={() => window.location.hash = '#home'} />;
      case 'dragontiger':
        return <DragonTiger onBack={() => window.location.hash = '#home'} />;
      case 'teenpatti':
        return <TeenPatti onBack={() => window.location.hash = '#home'} />;
      case 'crash':
        return <Crash onBack={() => window.location.hash = '#home'} />;
      case 'blackjack':
        return <Blackjack onBack={() => window.location.hash = '#home'} />;
      case 'profile':
        return <BunniesProfile onBack={() => window.location.hash = '#home'} />;
      default:
        return (
          <BunniesDashboard
            onNavigate={(p) => window.location.hash = p}
            onOpenAddCash={() => window.location.hash = '#add_cash'}
            onOpenNotifications={() => window.location.hash = '#notifications'}
            onOpenProfile={() => window.location.hash = '#profile'}
          />
        );
    }
  };

  // Determine active mobile bar item status
  const getActiveTabClass = (tabHash: string) => {
    const hash = window.location.hash;
    if (tabHash === '#home' && hash === '#home') return 'text-[#e8b923]';
    if (tabHash === '#add_cash' && hash === '#add_cash') return 'text-[#e8b923]';
    if (tabHash === '#notifications' && hash === '#notifications') return 'text-[#e8b923]';
    if (tabHash === '#slots' && (hash === '#slots' || hash.startsWith('#games/slots/'))) return 'text-[#e8b923]';
    if (tabHash === '#profile' && hash === '#profile') return 'text-[#e8b923]';
    return 'text-zinc-600';
  };

  const showBottomNav = currentPath !== 'splash' && currentPath !== 'login';

  return (
    <div className="relative min-h-screen bg-black font-sans leading-none text-white overflow-x-hidden p-0 m-0">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Viewport */}
      <main className="w-full pb-18 flex flex-col min-h-screen">
        {renderActiveComponent()}
      </main>

      {/* Extreme Out-of-coins Blocker Shield */}
      {isBroke && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-full text-red-500 animate-bounce mb-4">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-2xl font-black tracking-wider text-white">PE777 BALANCE EXHAUSTED!</h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-normal">
            No virtual finances remaining in your wallet. Please use the UPI QR Top-up gateway to instantly load funds and unlock the games!
          </p>

          <div className="w-full max-w-xs flex flex-col gap-3 mt-6">
            <button
              onClick={() => window.location.hash = '#add_cash'}
              className="py-3 px-4 bg-gradient-to-r from-purple-700 via-[#e8b923] to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wide rounded-xl shadow-md transition-transform duration-100 cursor-pointer active:scale-95"
            >
              Add Cash / UPI QR Simulator
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav Rail bar strictly following Mobile First fintech standards */}
      {showBottomNav && (
        <nav className="fixed bottom-0 inset-x-0 h-16 bg-[#09090a]/95 border-t border-zinc-950/80 flex items-center justify-around z-30 px-3 backdrop-blur-md select-none max-w-md mx-auto rounded-t-2xl shadow-2xl">
          <button
            onClick={() => window.location.hash = '#home'}
            className="flex flex-col items-center gap-1.5 focus:outline-none flex-1 py-1 cursor-pointer"
          >
            <HomeIcon size={16} className={getActiveTabClass('#home')} />
            <span className={`text-[8px] font-black uppercase tracking-wider ${getActiveTabClass('#home')}`}>Dashboard</span>
          </button>

          <button
            onClick={() => window.location.hash = '#add_cash'}
            className="flex flex-col items-center gap-1.5 focus:outline-none flex-1 py-1 cursor-pointer"
          >
            <Wallet size={16} className={getActiveTabClass('#add_cash')} />
            <span className={`text-[8px] font-black uppercase tracking-wider ${getActiveTabClass('#add_cash')}`}>Add Cash</span>
          </button>

          <button
            onClick={() => window.location.hash = '#notifications'}
            className="flex flex-col items-center gap-1.5 focus:outline-none flex-1 py-1 cursor-pointer"
          >
            <Bell size={16} className={getActiveTabClass('#notifications')} />
            <span className={`text-[8px] font-black uppercase tracking-wider ${getActiveTabClass('#notifications')}`}>Alerts</span>
          </button>

          <button
            onClick={() => window.location.hash = '#games/slots/lucky777'}
            className="flex flex-col items-center gap-1.5 focus:outline-none flex-1 py-1 cursor-pointer"
          >
            <Gamepad2 size={16} className={getActiveTabClass('#slots')} />
            <span className={`text-[8px] font-black uppercase tracking-wider ${getActiveTabClass('#slots')}`}>Lounge</span>
          </button>

          <button
            onClick={() => window.location.hash = '#profile'}
            className="flex flex-col items-center gap-1.5 focus:outline-none flex-1 py-1 cursor-pointer"
          >
            <User size={16} className={getActiveTabClass('#profile')} />
            <span className={`text-[8px] font-black uppercase tracking-wider ${getActiveTabClass('#profile')}`}>Profile</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CasinoProvider>
      <AppContent />
    </CasinoProvider>
  );
}
