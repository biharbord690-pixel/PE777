/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  username: string;
  coins: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bonus' | 'bet_loss' | 'game_win';
  gameName?: string;
  description: string;
  amount: number;
  timestamp: number;
}

export interface GameLog {
  id: string;
  gameId: string;
  gameName: string;
  betAmount: number;
  payoutAmount: number;
  result: 'win' | 'loss' | 'tie';
  coinsBefore: number;
  coinsAfter: number;
  timestamp: number;
}

export interface DailyBonusState {
  lastClaim: number | null;
  currentDay: number; // 1 to 7
}

export interface HourlyBonusState {
  lastClaim: number | null;
}

export interface AppSettings {
  sound: boolean;
  animations: boolean;
}

export type GameCategory = 'ALL' | 'SLOTS' | 'FISH' | 'CARDS' | 'CRASH' | 'HOT' | 'NEW';

export interface GameMetadata {
  id: string;
  name: string;
  category: GameCategory[];
  thumbnail: string;
  isHot?: boolean;
  isNew?: boolean;
  theme?: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalWinnings: number;
  avatarColor: string;
}
