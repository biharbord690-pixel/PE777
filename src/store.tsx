/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, GameLog, DailyBonusState, HourlyBonusState, AppSettings, LeaderboardEntry, AdminSettings } from './types';
import { getDb, doc, getDoc, setDoc, updateDoc, onSnapshot } from './firebase';

interface CasinoContextType {
  currentUser: string | null;
  coins: number;
  isGuest: boolean;
  settings: AppSettings;
  gameHistory: GameLog[];
  transactions: Transaction[];
  leaderboard: LeaderboardEntry[];
  dailyBonus: DailyBonusState;
  hourlyBonus: HourlyBonusState;
  adminSettings: AdminSettings;
  loginUser: (username: string, isGuestMode: boolean) => { success: boolean; message: string };
  registerUser: (username: string, pass: string) => { success: boolean; message: string };
  logoutUser: () => void;
  addCoins: (amount: number, description: string, gameName?: string, type?: Transaction['type']) => { success: boolean, currentBalance: number };
  deductCoins: (amount: number, description: string, gameName?: string, type?: Transaction['type']) => { success: boolean, currentBalance: number };
  addGameLog: (gameId: string, gameName: string, betAmount: number, payoutAmount: number, result: GameLog['result']) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateAdminSettings: (newAdminSettings: Partial<AdminSettings>) => void;
  claimDailyBonus: () => { amount: number; day: number } | null;
  claimHourlyBonus: () => number | null;
  resetAccount: () => void;
  clearAllData: () => void;
  getHourlyCooldown: () => number; // seconds left
  getDailyCooldown: () => number; // seconds left until midnight
  setCoins: (amount: number) => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

// Generate deterministic fake leaderboard players
const generateFakeLeaderboard = (userCoins: number, username: string | null): LeaderboardEntry[] => {
  const avatars = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500'];
  const basePlayers = [
    { name: 'Karan777', size: 1450000 },
    { name: 'SlotsKing99', size: 1220000 },
    { name: 'DeepSeaHunter', size: 980000 },
    { name: 'BaccaratLady', size: 850000 },
    { name: 'CrashMaster', size: 740000 },
    { name: 'Ravi_Ji', size: 690000 },
    { name: 'TigerDragon', size: 610000 },
    { name: 'TeenPattiPro', size: 540000 },
    { name: 'LuckyAman', size: 480000 },
    { name: 'RajSpin', size: 450000 },
    { name: 'JackpotSunny', size: 420000 },
    { name: 'Aviator007', size: 390000 },
    { name: 'MantaRayHnter', size: 350000 },
    { name: 'DoubleDownV', size: 310000 },
    { name: 'PokerFaceS', size: 280000 },
    { name: 'LuckyRhea', size: 250000 },
    { name: 'Vikram_X', size: 230000 },
    { name: 'NeonNightsP', size: 210000 },
    { name: 'Fortune7', size: 195000 },
    { name: 'GoldenD77', size: 180000 },
  ];

  const list: LeaderboardEntry[] = basePlayers.map((p, i) => ({
    rank: i + 1,
    username: p.name,
    totalWinnings: p.size,
    avatarColor: avatars[i % avatars.length],
  }));

  // Append remaining up to 50
  for (let i = 21; i <= 50; i++) {
    const randomSeed = Math.sin(i) * 5000;
    const winnings = Math.floor(150000 + (Math.abs(randomSeed) % 100000));
    const firstChars = ['Sanjay', 'Arjun', 'Pooja', 'Neha', 'Kabir', 'Rohan', 'Dia', 'Ajay', 'Aisha', 'Preeti'];
    const endings = ['88', '123', 'Slots', 'Boss', '_OP', 'W', 'Win', 'Vip'];
    const pName = `${firstChars[Math.floor(Math.abs(randomSeed) % firstChars.length)]}${endings[Math.floor(Math.abs(randomSeed * 2) % endings.length)]}`;
    list.push({
      rank: i,
      username: pName,
      totalWinnings: winnings,
      avatarColor: avatars[(i + 3) % avatars.length],
    });
  }

  // Insert current user at appropriate place
  if (username) {
    const userIndex = list.findIndex(p => p.username === username);
    if (userIndex !== -1) {
      list[userIndex].totalWinnings = userCoins;
    } else {
      list.push({
        rank: 99, // Will sort next
        username: username,
        totalWinnings: userCoins,
        avatarColor: 'bg-amber-500'
      });
    }
  }

  // Re-sort and re-rank
  list.sort((a, b) => b.totalWinnings - a.totalWinnings);
  return list.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};

export const CasinoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>({ sound: true, animations: true });
  const [gameHistory, setGameHistory] = useState<GameLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyBonus, setDailyBonus] = useState<DailyBonusState>({ lastClaim: null, currentDay: 1 });
  const [hourlyBonus, setHourlyBonus] = useState<HourlyBonusState>({ lastClaim: null });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adminId: 'ahirgaming',
    adminPassword: '854336',
    squareImages: true,
    gameImages: {},
    slotOverrideEmojis: {},
    aviatorImg: ''
  });

  // Load static admin settings from localstorage on mount as instant fallback
  useEffect(() => {
    const savedAdmin = localStorage.getItem('jw777_admin_settings');
    if (savedAdmin) {
      try {
        setAdminSettings(JSON.parse(savedAdmin));
      } catch (e) {}
    }

    // Subscribe to Firebase Live Firestore config Changes
    try {
      const db = getDb();
      const configDocRef = doc(db, 'admin_settings', 'config');
      
      const unsubscribe = onSnapshot(configDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as AdminSettings;
          setAdminSettings(cloudData);
          localStorage.setItem('jw777_admin_settings', JSON.stringify(cloudData));
        } else {
          // Document does not exist yet. Initialize it lazily on Firebase!
          const initialConfig: AdminSettings = {
            adminId: 'ahirgaming',
            adminPassword: '854336',
            squareImages: true,
            gameImages: {},
            slotOverrideEmojis: {},
            aviatorImg: ''
          };
          setDoc(configDocRef, initialConfig).catch(() => {});
        }
      }, (error) => {
        console.warn("Firestore access error / Offline mode:", error);
      });

      return () => unsubscribe();
    } catch (firebaseErr) {
      console.warn("Firebase Init failed/offline:", firebaseErr);
    }
  }, []);

  // 1. Initial State Hydration on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('jw777_current_user');
    if (storedUser) {
      setCurrentUser(storedUser);
      const isG = localStorage.getItem(`jw777_is_guest_${storedUser}`) === 'true';
      setIsGuest(isG);

      // Coins
      const savedCoins = localStorage.getItem(`jw777_coins_${storedUser}`);
      if (savedCoins !== null) {
        setCoins(parseInt(savedCoins, 10));
      }

      // History
      const hStr = localStorage.getItem(`jw777_history_${storedUser}`);
      if (hStr) setGameHistory(JSON.parse(hStr));

      // Transactions
      const txStr = localStorage.getItem(`jw777_transactions_${storedUser}`);
      if (txStr) setTransactions(JSON.parse(txStr));

      // Daily Bonus
      const dbStr = localStorage.getItem(`jw777_daily_bonus_${storedUser}`);
      if (dbStr) setDailyBonus(JSON.parse(dbStr));

      // Hourly Bonus
      const hbStr = localStorage.getItem(`jw777_hourly_bonus_${storedUser}`);
      if (hbStr) setHourlyBonus(JSON.parse(hbStr));

      // Settings
      const setStr = localStorage.getItem(`jw777_settings_${storedUser}`);
      if (setStr) setSettings(JSON.parse(setStr));
    }
  }, []);

  // 2. Synchronize Dynamic State (Leaderboard) based on coins & user
  useEffect(() => {
    setLeaderboard(generateFakeLeaderboard(coins, currentUser));
  }, [coins, currentUser]);

  // Auth: Register
  const registerUser = (username: string, pass: string): { success: boolean; message: string } => {
    const cleanUsername = username.trim();
    if (!cleanUsername) return { success: false, message: 'Username cannot be empty.' };
    if (cleanUsername.length < 3) return { success: false, message: 'Username must be at least 3 characters.' };
    if (!pass || pass.length < 4) return { success: false, message: 'Password must be at least 4 characters.' };

    const usersStr = localStorage.getItem('jw777_users');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (users[cleanUsername]) {
      return { success: false, message: 'Username is already taken!' };
    }

    // Save user creds
    users[cleanUsername] = { password: pass, coins: 0, createdAt: Date.now() };
    localStorage.setItem('jw777_users', JSON.stringify(users));

    // Initialize individual stores
    localStorage.setItem(`jw777_coins_${cleanUsername}`, '0');
    localStorage.setItem(`jw777_history_${cleanUsername}`, JSON.stringify([]));
    localStorage.setItem(`jw777_transactions_${cleanUsername}`, JSON.stringify([]));
    localStorage.setItem(`jw777_daily_bonus_${cleanUsername}`, JSON.stringify({ lastClaim: null, currentDay: 1 }));
    localStorage.setItem(`jw777_hourly_bonus_${cleanUsername}`, JSON.stringify({ lastClaim: null }));
    localStorage.setItem(`jw777_settings_${cleanUsername}`, JSON.stringify({ sound: true, animations: true }));

    return { success: true, message: 'Registration successful! Please login.' };
  };

  // Auth: Login
  const loginUser = (username: string, isGuestMode: boolean): { success: boolean; message: string } => {
    const cleanUsername = username.trim();

    if (isGuestMode) {
      return { success: false, message: 'Guest Mode is disabled.' };
    }

    if (!cleanUsername) return { success: false, message: 'Enter a valid username' };

    const usersStr = localStorage.getItem('jw777_users');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (cleanUsername === 'ahirgaming') {
      if (!users['ahirgaming']) {
        users['ahirgaming'] = { password: '854336', coins: 5000, createdAt: Date.now() };
        localStorage.setItem('jw777_users', JSON.stringify(users));
      }
      localStorage.setItem('jw777_coins_ahirgaming', '5000');
    }

    if (!users[cleanUsername]) {
      return { success: false, message: 'User does not exist. Please register first.' };
    }

    // Restore user states
    localStorage.setItem('jw777_current_user', cleanUsername);
    setCurrentUser(cleanUsername);
    setIsGuest(false);

    // Coins
    const savedCoins = localStorage.getItem(`jw777_coins_${cleanUsername}`);
    const finalCoins = savedCoins !== null ? parseInt(savedCoins, 10) : 0;
    setCoins(cleanUsername === 'ahirgaming' ? 5000 : finalCoins);

    // Logs
    const hStr = localStorage.getItem(`jw777_history_${cleanUsername}`);
    setGameHistory(hStr ? JSON.parse(hStr) : []);

    // Tx
    const txStr = localStorage.getItem(`jw777_transactions_${cleanUsername}`);
    setTransactions(txStr ? JSON.parse(txStr) : []);

    // Daily Bonus
    const dbStr = localStorage.getItem(`jw777_daily_bonus_${cleanUsername}`);
    setDailyBonus(dbStr ? JSON.parse(dbStr) : { lastClaim: null, currentDay: 1 });

    // Hourly
    const hbStr = localStorage.getItem(`jw777_hourly_bonus_${cleanUsername}`);
    setHourlyBonus(hbStr ? JSON.parse(hbStr) : { lastClaim: null });

    // Settings
    const setStr = localStorage.getItem(`jw777_settings_${cleanUsername}`);
    setSettings(setStr ? JSON.parse(setStr) : { sound: true, animations: true });

    return { success: true, message: `Welcome back, ${cleanUsername}!` };
  };

  // Auth: Logout
  const logoutUser = () => {
    if (isGuest && currentUser) {
      // Clear current guest specifics to keep localStorage neat
      localStorage.removeItem(`jw777_is_guest_${currentUser}`);
      localStorage.removeItem(`jw777_coins_${currentUser}`);
      localStorage.removeItem(`jw777_history_${currentUser}`);
      localStorage.removeItem(`jw777_transactions_${currentUser}`);
      localStorage.removeItem(`jw777_daily_bonus_${currentUser}`);
      localStorage.removeItem(`jw777_hourly_bonus_${currentUser}`);
      localStorage.removeItem(`jw777_settings_${currentUser}`);
    }
    localStorage.removeItem('jw777_current_user');
    setCurrentUser(null);
    setCoins(50000);
    setIsGuest(false);
    setGameHistory([]);
    setTransactions([]);
    setDailyBonus({ lastClaim: null, currentDay: 1 });
    setHourlyBonus({ lastClaim: null });
  };

  // Wallet Add
  const addCoins = (amount: number, description: string, gameName?: string, type: Transaction['type'] = 'game_win'): { success: boolean, currentBalance: number } => {
    if (!currentUser) return { success: false, currentBalance: coins };
    const nextCoins = coins + amount;
    setCoins(nextCoins);
    localStorage.setItem(`jw777_coins_${currentUser}`, nextCoins.toString());

    // Record Transaction
    const tx: Transaction = {
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      type,
      gameName,
      description,
      amount,
      timestamp: Date.now()
    };
    const nextTx = [tx, ...transactions].slice(0, 500);
    setTransactions(nextTx);
    localStorage.setItem(`jw777_transactions_${currentUser}`, JSON.stringify(nextTx));

    // Update global list if user is a standard registered user
    if (!isGuest) {
      const usersStr = localStorage.getItem('jw777_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        if (users[currentUser]) {
          users[currentUser].coins = nextCoins;
          localStorage.setItem('jw777_users', JSON.stringify(users));
        }
      }
    }

    return { success: true, currentBalance: nextCoins };
  };

  // Wallet Deduct
  const deductCoins = (amount: number, description: string, gameName?: string, type: Transaction['type'] = 'bet_loss'): { success: boolean, currentBalance: number } => {
    if (!currentUser) return { success: false, currentBalance: coins };
    if (coins < amount) return { success: false, currentBalance: coins };

    const nextCoins = coins - amount;
    setCoins(nextCoins);
    localStorage.setItem(`jw777_coins_${currentUser}`, nextCoins.toString());

    // Record Transaction
    const tx: Transaction = {
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      type,
      gameName,
      description,
      amount: -amount,
      timestamp: Date.now()
    };
    const nextTx = [tx, ...transactions].slice(0, 500);
    setTransactions(nextTx);
    localStorage.setItem(`jw777_transactions_${currentUser}`, JSON.stringify(nextTx));

    // Update nested
    if (!isGuest) {
      const usersStr = localStorage.getItem('jw777_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        if (users[currentUser]) {
          users[currentUser].coins = nextCoins;
          localStorage.setItem('jw777_users', JSON.stringify(users));
        }
      }
    }

    return { success: true, currentBalance: nextCoins };
  };

  // Logging
  const addGameLog = (gameId: string, gameName: string, betAmount: number, payoutAmount: number, result: GameLog['result']) => {
    if (!currentUser) return;
    const log: GameLog = {
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      gameId,
      gameName,
      betAmount,
      payoutAmount,
      result,
      coinsBefore: coins + betAmount - payoutAmount, // simplified
      coinsAfter: coins,
      timestamp: Date.now()
    };
    const nextHistory = [log, ...gameHistory].slice(0, 500);
    setGameHistory(nextHistory);
    localStorage.setItem(`jw777_history_${currentUser}`, JSON.stringify(nextHistory));
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (!currentUser) return;
    const nextSettings = { ...settings, ...newSettings };
    setSettings(nextSettings);
    localStorage.setItem(`jw777_settings_${currentUser}`, JSON.stringify(nextSettings));
  };

  // Admin Settings
  const updateAdminSettings = (newAdminSettings: Partial<AdminSettings>) => {
    const nextAdminSettings = { ...adminSettings, ...newAdminSettings };
    setAdminSettings(nextAdminSettings);
    localStorage.setItem('jw777_admin_settings', JSON.stringify(nextAdminSettings));

    // Update in Firestore
    try {
      const db = getDb();
      const configDocRef = doc(db, 'admin_settings', 'config');
      updateDoc(configDocRef, newAdminSettings).catch((err) => {
        // Document might not be created yet, fallback to setDoc
        setDoc(configDocRef, nextAdminSettings).catch(() => {});
      });
    } catch (e) {
      console.warn("Firestore sync update dynamic error:", e);
    }
  };

  // Daily Bonus logic
  const claimDailyBonus = (): { amount: number; day: number } | null => {
    if (!currentUser) return null;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check lastClaim
    if (dailyBonus.lastClaim) {
      const timeSinceClaim = now - dailyBonus.lastClaim;
      // Daily resets relative to midnight or simple 24 hours. We use elegant calendar system: can claim once per calendar day.
      const lastClaimDate = new Date(dailyBonus.lastClaim).setHours(0,0,0,0);
      const currentDate = new Date(now).setHours(0,0,0,0);
      if (lastClaimDate === currentDate) {
        return null; // Already claimed today
      }
    }

    const payChart = [1000, 1500, 2000, 2500, 3000, 4000, 10000];
    const index = dailyBonus.currentDay - 1;
    const reward = payChart[index];

    const nextDay = dailyBonus.currentDay >= 7 ? 1 : dailyBonus.currentDay + 1;
    const nextBonusState = {
      lastClaim: now,
      currentDay: nextDay
    };

    setDailyBonus(nextBonusState);
    localStorage.setItem(`jw777_daily_bonus_${currentUser}`, JSON.stringify(nextBonusState));

    // Credit coins
    addCoins(reward, `Daily Check-In: Day ${dailyBonus.currentDay}`, undefined, 'bonus');

    return { amount: reward, day: dailyBonus.currentDay };
  };

  // Hourly Bonus logic
  const claimHourlyBonus = (): number | null => {
    if (!currentUser) return null;
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;

    if (hourlyBonus.lastClaim && now - hourlyBonus.lastClaim < oneHourMs) {
      return null; // hourly locked
    }

    const reward = 200;
    const nextHourlyState = { lastClaim: now };

    setHourlyBonus(nextHourlyState);
    localStorage.setItem(`jw777_hourly_bonus_${currentUser}`, JSON.stringify(nextHourlyState));

    addCoins(reward, 'Hourly Spin Chest Reward', undefined, 'bonus');

    return reward;
  };

  // Get Hourly countdown
  const getHourlyCooldown = (): number => {
    if (!hourlyBonus.lastClaim) return 0;
    const elapsed = Date.now() - hourlyBonus.lastClaim;
    const left = 3600 - Math.floor(elapsed / 1000);
    return left > 0 ? left : 0;
  };

  // Get Daily countdown until midnight local
  const getDailyCooldown = (): number => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  // Reset Account balance
  const resetAccount = () => {
    if (!currentUser) return;
    setCoins(50000);
    setGameHistory([]);
    setTransactions([]);
    setDailyBonus({ lastClaim: null, currentDay: 1 });
    setHourlyBonus({ lastClaim: null });

    localStorage.setItem(`jw777_coins_${currentUser}`, '50000');
    localStorage.setItem(`jw777_history_${currentUser}`, '[]');
    localStorage.setItem(`jw777_transactions_${currentUser}`, JSON.stringify([
      {
        id: Date.now().toString(),
        type: 'bonus',
        description: 'Account Reset Virtual coins',
        amount: 50000,
        timestamp: Date.now()
      }
    ]));
    localStorage.setItem(`jw777_daily_bonus_${currentUser}`, JSON.stringify({ lastClaim: null, currentDay: 1 }));
    localStorage.setItem(`jw777_hourly_bonus_${currentUser}`, JSON.stringify({ lastClaim: null }));
  };

  // Clear everything for Guests
  const clearAllData = () => {
    localStorage.clear();
    setCurrentUser(null);
    setCoins(50000);
    setIsGuest(false);
    setGameHistory([]);
    setTransactions([]);
  };

  const setCoinsExposed = (amount: number) => {
    setCoins(amount);
    if (currentUser) {
      localStorage.setItem(`jw777_coins_${currentUser}`, amount.toString());
    }
  };

  return (
    <CasinoContext.Provider value={{
      currentUser,
      coins,
      isGuest,
      settings,
      gameHistory,
      transactions,
      leaderboard,
      dailyBonus,
      hourlyBonus,
      adminSettings,
      loginUser,
      registerUser,
      logoutUser,
      addCoins,
      deductCoins,
      addGameLog,
      updateSettings,
      updateAdminSettings,
      claimDailyBonus,
      claimHourlyBonus,
      resetAccount,
      clearAllData,
      getHourlyCooldown,
      getDailyCooldown,
      setCoins: setCoinsExposed
    }}>
      {children}
    </CasinoContext.Provider>
  );
};

export const useCasinoStore = () => {
  const context = useContext(CasinoContext);
  if (context === undefined) {
    throw new Error('useCasinoStore must be used within a CasinoProvider');
  }
  return context;
};
