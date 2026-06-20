/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCasinoStore } from '../store';

interface SlotSymbolProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const SlotSymbol: React.FC<SlotSymbolProps> = ({ symbol, className = 'w-14 h-14', size = 56 }) => {
  const store = useCasinoStore();
  
  // 1. If admin override exists, render override image
  const overrideUrl = store.adminSettings?.slotOverrideEmojis?.[symbol];
  if (overrideUrl) {
    return (
      <img
        src={overrideUrl}
        alt={symbol}
        referrerPolicy="no-referrer"
        className={`${className} object-contain rounded-xl filter drop-shadow-md`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Common styles
  const commonSvgProps = {
    viewBox: '0 0 64 64',
    width: size,
    height: size,
    className: `${className} cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-100 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]`
  };

  // Render stylized SVG based on character, so no native emojis are displayed in slot reels!
  switch (symbol) {
    case '🍒': // Cherry
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="cherryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="60%" stopColor="#cc0000" />
              <stop offset="100%" stopColor="#660000" />
            </linearGradient>
            <linearGradient id="cherryStem" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b3ff66" />
              <stop offset="100%" stopColor="#4d9900" />
            </linearGradient>
          </defs>
          {/* Leaves & Stem */}
          <path d="M42 12C36 15 32 25 24 38" stroke="url(#cherryStem)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M42 12C45 18 38 27 34 38" stroke="url(#cherryStem)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M42 12C48 8 52 14 42 12Z" fill="url(#cherryStem)" />
          {/* Cherries */}
          <circle cx="20" cy="42" r="11" fill="url(#cherryGrad)" />
          <circle cx="38" cy="44" r="11" fill="url(#cherryGrad)" />
          {/* Gloss Shiny Reflection Spheres */}
          <ellipse cx="17" cy="38" rx="3" ry="1.5" fill="#ffffff" opacity="0.8" transform="rotate(-30 17 38)" />
          <ellipse cx="35" cy="40" rx="3" ry="1.5" fill="#ffffff" opacity="0.8" transform="rotate(-30 35 40)" />
        </svg>
      );

    case '🔔': // Golden Slot Bell
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="bellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff3cc" />
              <stop offset="30%" stopColor="#ffd700" />
              <stop offset="70%" stopColor="#e59400" />
              <stop offset="100%" stopColor="#805300" />
            </linearGradient>
            <linearGradient id="bellMetal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#999999" />
              <stop offset="50%" stopColor="#e6e6e6" />
              <stop offset="100%" stopColor="#4d4d4d" />
            </linearGradient>
          </defs>
          {/* Top bracket hanger */}
          <rect x="27" y="6" width="10" height="8" rx="2" fill="url(#bellMetal)" />
          {/* Main Bell Body dome */}
          <path d="M14 42C14 22 20 14 32 14C44 14 50 22 50 42C50 45 42 45 32 45C22 45 14 45 14 42Z" fill="url(#bellGrad)" />
          {/* Bell Bottom rim lip */}
          <ellipse cx="32" cy="44" rx="20" ry="3.5" fill="#e59400" stroke="#ffd700" strokeWidth="1" />
          {/* Bell Clapper hammer */}
          <circle cx="32" cy="51" r="5" fill="url(#bellMetal)" />
        </svg>
      );

    case '⭐':
    case '🌟': // Glistening Golden Star
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8e6" />
              <stop offset="35%" stopColor="#ffcc00" />
              <stop offset="75%" stopColor="#e68a00" />
              <stop offset="100%" stopColor="#994d00" />
            </linearGradient>
          </defs>
          <path 
            d="M32 4 L41 22 L60 25 L46 38 L50 58 L32 48 L14 58 L18 38 L4 25 L23 22 Z" 
            fill="url(#goldStar)" 
            stroke="#ffeb99" 
            strokeWidth="1.5"
            strokeLinejoin="round" 
          />
          {/* Internal realistic star facets for 3D look */}
          <path d="M32 4 L32 48 L14 58 Z" fill="#000000" opacity="0.12" />
          <path d="M32 4 L32 48 L50 58 Z" fill="#ffffff" opacity="0.12" />
        </svg>
      );

    case '💎': // Blue Diamond
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6ffff" />
              <stop offset="30%" stopColor="#33ccff" />
              <stop offset="70%" stopColor="#0066cc" />
              <stop offset="100%" stopColor="#001a33" />
            </linearGradient>
          </defs>
          {/* Gem Crown Facets */}
          <polygon points="18,18 46,18 56,30 32,54 8,30" fill="url(#gemGrad)" stroke="#b3f0ff" strokeWidth="1.5" />
          <polygon points="18,18 25,30 8,30" fill="#ffffff" opacity="0.3" />
          <polygon points="46,18 39,30 56,30" fill="#000000" opacity="0.2" />
          <polygon points="25,30 39,30 32,54" fill="#ffffff" opacity="0.15" />
          <polygon points="18,18 46,18 32,30" fill="#ffffff" opacity="0.35" />
        </svg>
      );

    case 'BAR': // Slot machine BAR bar badge
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="barGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="10%" stopColor="#f3e5ab" />
              <stop offset="50%" stopColor="#e5a65d" />
              <stop offset="90%" stopColor="#8c5825" />
              <stop offset="100%" stopColor="#3d2105" />
            </linearGradient>
            <linearGradient id="barDarkCore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#030303" />
            </linearGradient>
          </defs>
          <rect x="4" y="14" width="56" height="36" rx="6" fill="url(#barGold)" stroke="#ffd700" strokeWidth="2" />
          <rect x="8" y="18" width="48" height="28" rx="4" fill="url(#barDarkCore)" />
          {/* Bold text */}
          <text x="32" y="38" fill="url(#barGold)" fontFamily="Impact, sans-serif" fontSize="22" fontWeight="black" textAnchor="middle" letterSpacing="2">
            BAR
          </text>
        </svg>
      );

    case '7️⃣':
    case '7': // Neon red 7
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="sevenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8080" />
              <stop offset="25%" stopColor="#ff0000" />
              <stop offset="75%" stopColor="#990000" />
              <stop offset="100%" stopColor="#4d0000" />
            </linearGradient>
          </defs>
          {/* Chrome steel shield container */}
          <polygon points="10,6 54,6 44,58 20,58" fill="#141416" stroke="#4d4d4d" strokeWidth="2.5" />
          {/* Red 3D 7 */}
          <path d="M18 12 H46 L28 52 H18 L32 22 H18 Z" fill="url(#sevenGrad)" filter="drop-shadow(0 0 6px rgba(255,0,0,0.6))" />
        </svg>
      );

    case '⚡': // Gold Lightning Strike
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="electricGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffeb99" />
              <stop offset="40%" stopColor="#ffcc00" />
              <stop offset="80%" stopColor="#e68a00" />
            </linearGradient>
          </defs>
          <polygon points="38,4 12,32 30,32 20,60 52,24 30,24" fill="url(#electricGold)" filter="drop-shadow(0 0 8px rgba(255,204,0,0.5))" />
        </svg>
      );

    case '🐉': // Dragon medallion
      return (
        <svg {...commonSvgProps}>
          <circle cx="32" cy="32" r="28" fill="#a30000" stroke="#ffd700" strokeWidth="3" />
          <path d="M22 28 C18 34 26 50 38 46 C50 42 46 22 36 24 C26 26 24 16 32 14" stroke="#ffd700" strokeWidth="4" strokeLinecap="round" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />
          <circle cx="28" cy="20" r="1.5" fill="#ffffff" />
        </svg>
      );

    case '🐯':
    case '🐯': // Tiger Medallion
      return (
        <svg {...commonSvgProps}>
          <circle cx="32" cy="32" r="28" fill="#ea580c" stroke="#ffd700" strokeWidth="2.5" />
          {/* Abstract Tiger pattern */}
          <path d="M18 24 L24 28 M46 24 L40 28 M32 12 L32 18 M20 40 Q32 50 44 40" stroke="#000" strokeWidth="3" fill="none" />
          <polygon points="26,24 38,24 32,34" fill="#000000" />
          <circle cx="24" cy="22" r="2" fill="#ffd700" />
          <circle cx="40" cy="22" r="2" fill="#ffd700" />
        </svg>
      );

    case '🪙': // Gold Coin
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="coinFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff5cc" />
              <stop offset="40%" stopColor="#ffd700" />
              <stop offset="85%" stopColor="#dfa700" />
              <stop offset="100%" stopColor="#7a5c00" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#coinFace)" stroke="#ffd700" strokeWidth="1" />
          <circle cx="32" cy="32" r="22" fill="none" stroke="#7a5c00" strokeWidth="2" strokeDasharray="3 3.5" />
          <polygon points="32,18 35,25 43,26 37,31 39,39 32,35 25,39 27,31 21,26 29,25" fill="#7a5c00" />
        </svg>
      );

    case '💰': // Wealthy Money Bag
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="goldSack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00cc44" />
              <stop offset="50%" stopColor="#00802b" />
              <stop offset="100%" stopColor="#004d1a" />
            </linearGradient>
          </defs>
          <path d="M18 46 C18 30 24 24 32 24 C40 24 46 30 46 46 C46 54 38 58 32 58 C26 58 18 54 18 46Z" fill="url(#goldSack)" />
          {/* Top neck gather */}
          <path d="M26 20 C24 16 40 16 38 20 C36 24 28 24 26 20 Z" fill="#004d1a" />
          {/* Gold Tie rope */}
          <rect x="25" y="21" width="14" height="3" rx="1.5" fill="#ffd700" />
          {/* Gold Embossed Dollar mark */}
          <text x="32" y="46" fill="#ffd700" fontFamily="Arial Black, Impact" fontSize="18" fontWeight="black" textAnchor="middle">
            $
          </text>
        </svg>
      );

    case '👑': // Royal crown
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff5cc" />
              <stop offset="50%" stopColor="#e5a65d" />
              <stop offset="100%" stopColor="#7a4700" />
            </linearGradient>
          </defs>
          <path d="M8 48 L14 20 L24 34 L32 14 L40 34 L50 20 L56 48 Z" fill="url(#crownGrad)" stroke="#ffd700" strokeWidth="1" />
          <rect x="8" y="46" width="48" height="6" rx="2" fill="#7a4700" />
          {/* Jewel Dots */}
          <circle cx="14" cy="20" r="2.5" fill="#ff4d4d" />
          <circle cx="32" cy="14" r="2.5" fill="#0099ff" />
          <circle cx="50" cy="20" r="2.5" fill="#ff4d4d" />
          <circle cx="32" cy="49" r="2" fill="#00ff66" />
        </svg>
      );

    case '🌸':
    case '💮': // Cherry blossom pink flower
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="blossomPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffb3d9" />
              <stop offset="100%" stopColor="#ff3399" />
            </linearGradient>
          </defs>
          {/* 5 Petals */}
          <g fill="url(#blossomPink)">
            <ellipse cx="32" cy="18" rx="8" ry="12" />
            <ellipse cx="32" cy="46" rx="8" ry="12" />
            <ellipse cx="18" cy="32" rx="12" ry="8" />
            <ellipse cx="46" cy="32" rx="12" ry="8" />
          </g>
          <circle cx="32" cy="32" r="7" fill="#ffd700" stroke="#ff3399" strokeWidth="1.5" />
        </svg>
      );

    case '💛': // Golden heart bubble
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="goldHeart" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffeb99" />
              <stop offset="40%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#996600" />
            </linearGradient>
          </defs>
          <path d="M32 16 C32 16 26 6 16 12 C6 18 10 32 32 52 C54 32 58 18 48 12 C38 6 32 16 32 16 Z" fill="url(#goldHeart)" />
        </svg>
      );

    case '🍋': // Lemon yellow
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="lemonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffff99" />
              <stop offset="70%" stopColor="#e6e600" />
              <stop offset="100%" stopColor="#808000" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="32" rx="14" ry="20" fill="url(#lemonGrad)" transform="rotate(45 32 32)" />
          {/* leaf */}
          <path d="M42 14 C40 10 30 16 32 18" stroke="#339933" strokeWidth="3" fill="none" />
        </svg>
      );

    case '🍊': // Orange
      return (
        <svg {...commonSvgProps}>
          <circle cx="32" cy="32" r="22" fill="#ff9900" stroke="#cc5200" strokeWidth="2" />
          <circle cx="30" cy="14" r="2.5" fill="#339933" />
        </svg>
      );

    case '🍇': // Grapes bunch
      return (
        <svg {...commonSvgProps}>
          <defs>
            <linearGradient id="grapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cc99ff" />
              <stop offset="100%" stopColor="#5900b3" />
            </linearGradient>
          </defs>
          <circle cx="26" cy="24" r="6" fill="url(#grapeGrad)" />
          <circle cx="38" cy="24" r="6" fill="url(#grapeGrad)" />
          <circle cx="32" cy="32" r="6" fill="url(#grapeGrad)" />
          <circle cx="24" cy="38" r="6" fill="url(#grapeGrad)" />
          <circle cx="36" cy="38" r="6" fill="url(#grapeGrad)" />
          <circle cx="30" cy="46" r="6" fill="url(#grapeGrad)" />
          <path d="M30 12 L34 18" stroke="#663300" strokeWidth="3.5" />
        </svg>
      );

    case '🍉': // Watermelon slice
      return (
        <svg {...commonSvgProps}>
          <path d="M10 24 A 22 22 0 0 0 54 24 Z" fill="#ff3333" stroke="#228b22" strokeWidth="4.5" />
          <circle cx="20" cy="30" r="1.5" fill="#000" />
          <circle cx="32" cy="34" r="1.5" fill="#000" />
          <circle cx="44" cy="30" r="1.5" fill="#000" />
        </svg>
      );

    case '🔮': // Crystal Ball
      return (
        <svg {...commonSvgProps}>
          <defs>
            <radialGradient id="crystalGrad" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#a366ff" />
              <stop offset="85%" stopColor="#3d0099" />
              <stop offset="100%" stopColor="#1a0033" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="46" rx="16" ry="6" fill="#331a00" stroke="#805500" strokeWidth="2" />
          <circle cx="32" cy="28" r="20" fill="url(#crystalGrad)" filter="drop-shadow(0 0 10px rgba(163,102,255,0.6))" />
        </svg>
      );

    case '🏹':
    case '⚔️': // Weapons Cutlass
      return (
        <svg {...commonSvgProps}>
          <path d="M12 50 L52 10" stroke="#cccccc" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M50 8 M14 52" stroke="#d4af37" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case '🔥': // Fire
      return (
        <svg {...commonSvgProps}>
          <path d="M18 52 C12 40 20 22 32 10 C44 26 48 38 42 50 C38 54 24 54 18 52 Z" fill="#ff4500" />
          <path d="M24 52 C20 44 26 32 32 20 C38 34 40 42 36 50 Z" fill="#ffcc00" />
        </svg>
      );

    case '🚀': // Rocket / Airplane alternate
      return (
        <svg {...commonSvgProps}>
          <path d="M32 6 L44 32 L32 26 L20 32 Z" fill="#ff3333" stroke="#fff" strokeWidth="1.5" />
          {/* Flame Tail */}
          <polygon points="28,28 32,46 36,28" fill="#ff9900" />
        </svg>
      );

    case '🐼': // Cute Panda silhouette vector
      return (
        <svg {...commonSvgProps}>
          <ellipse cx="32" cy="38" rx="20" ry="16" fill="#ffffff" stroke="#1c1c1e" strokeWidth="2" />
          {/* Ears */}
          <circle cx="16" cy="24" r="6" fill="#1c1c1e" />
          <circle cx="48" cy="24" r="6" fill="#1c1c1e" />
          {/* Eyes */}
          <ellipse cx="24" cy="34" rx="4" ry="5.5" fill="#1c1c1e" />
          <ellipse cx="40" cy="34" rx="4" ry="5.5" fill="#1c1c1e" />
          <circle cx="24" cy="34" r="1.5" fill="#ffffff" />
          <circle cx="40" cy="34" r="1.5" fill="#ffffff" />
          {/* Snout */}
          <polygon points="30,42 34,42 32,44" fill="#1b1c1e" />
        </svg>
      );

    case '🍀':
    case '🎋': // Bamboo green stalks
      return (
        <svg {...commonSvgProps}>
          <rect x="28" y="10" width="8" height="44" rx="2.5" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.5" />
          <line x1="28" y1="24" x2="36" y2="24" stroke="#1b5e20" strokeWidth="2.5" />
          <line x1="28" y1="38" x2="36" y2="38" stroke="#1b5e20" strokeWidth="2.5" />
        </svg>
      );

    case '⚓': // Nautical Anchor
      return (
        <svg {...commonSvgProps}>
          <path d="M32 10 L32 46 M18 30 L46 30 M14 36 A 18 18 0 0 0 50 36" fill="none" stroke="#607d8b" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="32" cy="10" r="4.5" fill="none" stroke="#607d8b" strokeWidth="3" />
        </svg>
      );

    default: // Fallback beautifully so nothing breaks!
      // If none matches we render an elegant gold ring medallion showcasing the symbol letter
      return (
        <div 
          className="rounded-2xl flex items-center justify-center bg-radial-at-t from-pink-900/50 via-[#100b1e] to-[#04020a] border border-[#e8b923]/40 shadow-inner"
          style={{ width: size, height: size }}
        >
          <span className="text-xl font-black text-[#e8b923] tracking-widest block transform uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {symbol}
          </span>
        </div>
      );
  }
};
