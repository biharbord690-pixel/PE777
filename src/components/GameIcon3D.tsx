import React from 'react';
import { useCasinoStore } from '../store';

interface GameIcon3DProps {
  gameId: string;
  themeColor?: string;
  className?: string;
}

export const GameIcon3D: React.FC<GameIcon3DProps> = ({ gameId, themeColor = '#e8b923', className = 'w-10 h-10' }) => {
  const store = useCasinoStore();
  const customImg = store.adminSettings?.gameImages?.[gameId];

  if (customImg) {
    return (
      <img 
        src={customImg} 
        alt={gameId} 
        referrerPolicy="no-referrer" 
        className={`${className} object-cover rounded-xl`} 
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  // Common drop-shadow and glow filter definitions that we can use across SVGs
  const filterId = `glow-${gameId}`;
  const gradId = `grad-${gameId}`;

  // We write bespoke, premium 3D/glossy SVG code for each of the 24 games
  switch (gameId) {
    case 'lucky777':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <radialGradient id={`${gradId}-inner`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffb000" />
              <stop offset="60%" stopColor="#d80000" />
              <stop offset="100%" stopColor="#500000" />
            </radialGradient>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="30%" stopColor="#e8b923" />
              <stop offset="70%" stopColor="#b48a04" />
              <stop offset="100%" stopColor="#ffea75" />
            </linearGradient>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Background glowing shield */}
          <circle cx="50" cy="50" r="44" fill={`url(#${gradId}-inner)`} stroke="url(#` + gradId + `-gold)" strokeWidth="3" filter={`url(#${filterId})`} />
          {/* 3D Gold Ribbon */}
          <path d="M 12 55 L 88 55 L 80 72 L 20 72 Z" fill="#800c0c" stroke="url(#` + gradId + `-gold)" strokeWidth="1.5" />
          {/* Jackpot Slot Row "7-7-7" in gold with black stroke */}
          <g filter="drop-shadow(0px 3px 2px rgba(0,0,0,0.7))">
            {/* Left 7 */}
            <text x="26" y="52" fill="url(#` + gradId + `-gold)" fontSize="32" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" stroke="#000" strokeWidth="1.5">7</text>
            {/* Middle 7 - larger */}
            <text x="50" y="55" fill="url(#` + gradId + `-gold)" fontSize="40" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" stroke="#000" strokeWidth="2">7</text>
            {/* Right 7 */}
            <text x="74" y="52" fill="url(#` + gradId + `-gold)" fontSize="32" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" stroke="#000" strokeWidth="1.5">7</text>
          </g>
          {/* Stars */}
          <polygon points="50,15 53,22 61,22 55,27 57,34 50,30 43,34 45,27 39,22 47,22" fill="url(#` + gradId + `-gold)" />
          <polygon points="22,25 24,29 29,29 25,32 26,36 22,34 18,36 19,32 15,29 20,29" fill="#ffea75" />
          <polygon points="78,25 80,29 85,29 81,32 82,36 78,34 74,36 75,32 71,29 76,29" fill="#ffea75" />
        </svg>
      );

    case 'fortunedragon':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {/* Outer glowing wheel */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#` + gradId + `-gold)" strokeWidth="3" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="40" fill="#000" />
          {/* Majestic Dragon Head Shape in 3D */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))">
            {/* Dragon Background Mane */}
            <path d="M 30,30 C 20,15 50,5 50,5 C 50,5 80,15 70,30 C 85,35 85,60 70,75 C 65,80 50,92 50,92 C 50,92 35,80 30,75 C 15,60 15,35 30,30 Z" fill="url(#` + gradId + `-body)" />
            {/* Golden horns */}
            <path d="M 40,25 C 35,10 25,12 25,12 C 25,12 35,20 38,28" fill="none" stroke="url(#` + gradId + `-gold)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60,25 C 65,10 75,12 75,12 C 75,12 65,20 62,28" fill="none" stroke="url(#` + gradId + `-gold)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Dragon snout overlay */}
            <path d="M 38,45 C 38,35 62,35 62,45 C 62,55 57,68 50,68 C 43,68 38,55 38,45 Z" fill="url(#` + gradId + `-gold)" />
            {/* Whiskers */}
            <path d="M 40,55 Q 20,60 15,75" fill="none" stroke="url(#` + gradId + `-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M 60,55 Q 80,60 85,75" fill="none" stroke="url(#` + gradId + `-gold)" strokeWidth="2" strokeLinecap="round" />
            {/* Glowing Eyes */}
            <ellipse cx="43" cy="40" rx="3.5" ry="2" fill="#fff" />
            <ellipse cx="57" cy="40" rx="3.5" ry="2" fill="#fff" />
            <circle cx="43" cy="40" r="1.5" fill="#f59e0b" />
            <circle cx="57" cy="40" r="1.5" fill="#f59e0b" />
            {/* Piercing look */}
            <circle cx="50" cy="80" r="8" fill="#fff" filter="drop-shadow(0 0 5px #f59e0b)" />
            <circle cx="50" cy="80" r="5" fill="#fbbf24" />
          </g>
        </svg>
      );

    case 'goldentiger':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-orange`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id={`${gradId}-stripes`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#111" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#111" stroke="#ea580c" strokeWidth="2" />
          {/* 3D tiger face */}
          <g filter="drop-shadow(0px 4px 5px rgba(0,0,0,0.7))" transform="translate(0, 3)">
            {/* Ear shapes */}
            <path d="M 22,25 C 10,12 28,5 32,18 Z" fill="url(#` + gradId + `-orange)" stroke="#000" strokeWidth="1.5" />
            <path d="M 78,25 C 90,12 72,5 68,18 Z" fill="url(#` + gradId + `-orange)" stroke="#000" strokeWidth="1.5" />
            <path d="M 25,22 C 16,14 28,10 30,18 Z" fill="#fee2e2" />
            <path d="M 75,22 C 84,14 72,10 70,18 Z" fill="#fee2e2" />
            
            {/* Main Head Base */}
            <path d="M 22,45 C 15,62 30,85 50,85 C 70,85 85,62 78,45 C 78,32 68,26 50,26 C 32,26 22,32 22,45 Z" fill="url(#` + gradId + `-orange)" stroke="#000" strokeWidth="2" />
            {/* White cheeks */}
            <path d="M 24,55 C 22,72 38,82 50,82 C 62,82 78,72 76,55 C 72,55 64,65 50,65 C 36,65 28,55 24,55 Z" fill="#fff" />
            {/* Tiger stripes */}
            <path d="M 50,26 L 50,38 M 45,28 L 47,35 M 55,28 L 53,35" fill="none" stroke="url(#` + gradId + `-stripes)" strokeWidth="2" strokeLinecap="round" />
            <path d="M 23,40 Q 32,42 35,38 M 77,40 Q 68,42 65,38 M 22,48 Q 33,50 36,45 M 78,48 Q 67,50 64,45" fill="none" stroke="url(#` + gradId + `-stripes)" strokeWidth="2" strokeLinecap="round" />
            {/* Tiger eyes - glowing teal/golden */}
            <polygon points="32,45 42,42 40,49 32,48" fill="#14b8a6" stroke="#000" strokeWidth="1" />
            <polygon points="68,45 58,42 60,49 68,48" fill="#14b8a6" stroke="#000" strokeWidth="1" />
            <circle cx="37" cy="45" r="1.5" fill="#fff" />
            <circle cx="63" cy="45" r="1.5" fill="#fff" />
            {/* Pink nose */}
            <polygon points="46,55 54,55 50,60" fill="#f43f5e" stroke="#000" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'wildwest':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-leather`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#1c1917" stroke="#ca8a04" strokeWidth="2" />
          <g filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.65))" transform="translate(0, -2)">
            {/* Crossed pistols behind */}
            <path d="M 15,80 L 45,50 L 42,45 L 12,75 Z" fill="#4b5563" />
            <path d="M 85,80 L 55,50 L 58,45 L 88,75 Z" fill="#4b5563" />
            {/* Sheriff Star */}
            <polygon points="50,15 54,26 65,26 57,33 60,44 50,38 40,44 43,33 35,26 46,26" fill="url(#` + gradId + `-gold)" stroke="#78350f" strokeWidth="1" />
            <circle cx="50" cy="29" r="3" fill="#fff" />
            
            {/* Cowboy Hat Crown */}
            <path d="M 33,52 C 30,35 40,32 50,35 C 60,32 70,35 67,52 Z" fill="url(#` + gradId + `-leather)" stroke="#270e04" strokeWidth="2" />
            {/* Gold Hatband */}
            <path d="M 32,50 C 40,47 60,47 68,50 L 67,53 C 59,50 41,50 33,53 Z" fill="url(#` + gradId + `-gold)" />
            {/* Hat Brim */}
            <path d="M 15,53 C 25,48 75,48 85,53 C 92,62 80,62 75,60 C 60,56 40,56 25,60 C 20,62 8,62 15,53 Z" fill="url(#` + gradId + `-leather)" stroke="#270e04" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'fruitfrenzy':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-rind`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id={`${gradId}-flesh`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
          {/* Glossy 3D Watermelon slice */}
          <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.5))" transform="rotate(-15 50 50)">
            {/* Rind Outer (Dark green) */}
            <path d="M 15,50 C 15,75 35,85 50,85 C 65,85 85,75 85,50 L 75,50 C 75,68 62,75 50,75 C 38,75 25,68 25,50 Z" fill="url(#` + gradId + `-rind)" />
            {/* Inner light white rind */}
            <path d="M 22,50 C 22,68 35,76 50,76 C 65,76 78,68 78,50 L 75,50 C 75,65 62,72 50,72 C 38,72 25,65 25,50 Z" fill="#f0fdf4" />
            {/* Sweet ruby flesh */}
            <path d="M 23.5,49.5 C 23.5,64 36,70 50,70 C 64,70 76.5,64 76.5,49.5 Z" fill="url(#` + gradId + `-flesh)" />
            {/* Seeds */}
            <circle cx="36" cy="54" r="2.2" fill="#111" />
            <circle cx="44" cy="62" r="2.2" fill="#111" />
            <circle cx="56" cy="62" r="2.2" fill="#111" />
            <circle cx="64" cy="54" r="2.2" fill="#111" />
            <circle cx="50" cy="53" r="2.2" fill="#111" />
            {/* Glossy Highlight overlay */}
            <ellipse cx="50" cy="22" rx="20" ry="4" fill="#fff" opacity="0.15" transform="rotate(15 50 22)" />
          </g>
        </svg>
      );

    case 'diamondrush':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <filter id={`${filterId}-sparkle`}>
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#090d16" stroke="#0ea5e9" strokeWidth="2" />
          {/* Fully faceted sapphire diamond */}
          <g filter="drop-shadow(0px 5px 8px rgba(14,165,233,0.4))" transform="translate(0, 4)">
            {/* Top base face */}
            <polygon points="30,22 70,22 85,42 15,42" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.5" />
            {/* Bottom triangular tip */}
            <polygon points="15,42 85,42 50,82" fill="url(#` + gradId + `-blue)" stroke="#0284c7" strokeWidth="1.5" />
            {/* Inside diamonds facets details */}
            <polygon points="30,22 50,22 50,42 35,42" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
            <polygon points="50,22 70,22 65,42 50,42" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
            <polygon points="50,42 15,42 35,42" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
            <polygon points="50,42 85,42 65,42" fill="#0284c7" stroke="#0284c7" strokeWidth="1" />
            <polygon points="35,42 50,42 50,82" fill="#0284c7" stroke="#0284c7" strokeWidth="1" />
            <polygon points="65,42 50,42 50,82" fill="#0369a1" stroke="#0284c7" strokeWidth="1" />
            <polygon points="15,42 35,42 50,82" fill="#075985" stroke="#0284c7" strokeWidth="1" />
            <polygon points="85,42 65,42 50,82" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1" />
            
            {/* White magical light star shine */}
            <g filter={`url(#${filterId}-sparkle)`} transform="translate(68, 16) scale(0.8)">
              <line x1="12" y1="2" x2="12" y2="22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="2" y1="12" x2="22" y2="12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.5" fill="#fff" />
            </g>
          </g>
        </svg>
      );

    case 'neonnights':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#05050a" stroke="#db2777" strokeWidth="2.5" />
          {/* Dual glowing hot-pink neon rings */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#f472b6" strokeWidth="2.5" opacity="0.8" filter="drop-shadow(0 0 6px #db2777)" />
          {/* 3D neon star retro graphic */}
          <g filter="drop-shadow(0 0 10px #f43f5e)" transform="translate(0, 1)">
            <polygon points="50,15 59,34 80,38 65,53 69,74 50,65 31,74 35,53 20,38 41,34" fill="#fb7185" stroke="#fff" strokeWidth="2" />
            <polygon points="50,22 56,36 72,39 60,50 63,66 50,59 37,66 40,50 28,39 44,36" fill="#f43f5e" />
            {/* Inner yellow glow center */}
            <polygon points="50,30 53,38 62,40 55,47 57,56 50,52 43,52 45,47 38,40 47,38" fill="#fef08a" />
          </g>
        </svg>
      );

    case 'ancientegypt':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id={`${gradId}-sky`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#` + gradId + `-sky)" stroke="url(#` + gradId + `-gold)" strokeWidth="2" />
          {/* 3D golden Pyramids with glowing sun rays */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))">
            {/* Sun core */}
            <circle cx="50" cy="30" r="12" fill="#fef08a" filter="drop-shadow(0 0 8px #eab308)" />
            {/* Sun Rays */}
            <path d="M 50,30 L 15,82 M 50,30 L 32,82 M 50,30 L 68,82 M 50,30 L 85,82" stroke="#eab308" strokeWidth="1.5" opacity="0.4" />
            
            {/* Left Big Pyramid shadow side */}
            <polygon points="45,40 20,80 48,80" fill="#a16207" />
            {/* Left Big Pyramid light side */}
            <polygon points="45,40 48,80 65,80" fill="url(#` + gradId + `-gold)" />
            {/* Small right pyramid */}
            <polygon points="68,52 52,80 68,80" fill="#854d0e" />
            <polygon points="68,52 68,80 78,80" fill="#ca8a04" />

            {/* Glowing gold sand line */}
            <path d="M 10,80 Q 50,76 90,80" fill="none" stroke="url(#` + gradId + `-gold)" strokeWidth="3" />
          </g>
        </svg>
      );

    case 'pirategold':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          <g filter="drop-shadow(0 4px 5px rgba(0,0,0,0.65))">
            {/* Stacked Gold Coins behind */}
            <ellipse cx="38" cy="65" rx="14" ry="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <ellipse cx="62" cy="70" rx="14" ry="7" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
            <ellipse cx="50" cy="68" rx="16" ry="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            {/* Classic 3D pirate black flag */}
            <path d="M 22,25 Q 40,20 54,26 Q 66,22 78,25 L 74,52 Q 60,49 46,55 Q 32,49 22,52 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Skull details in flag */}
            <path d="M 44,34 C 44,30 56,30 56,34 C 56,39 54,43 54,45 L 46,45 C 46,43 44,39 44,34 Z" fill="#fff" />
            <rect x="47" y="44" width="6" height="5" rx="1" fill="#fff" />
            {/* Eyepatch and eye circle */}
            <circle cx="48" cy="36" r="2.2" fill="#000" />
            <polygon points="50,33 55,38 52,39" fill="#000" />
            {/* Crossed bone markings */}
            <path d="M 32,44 L 40,40 M 68,44 L 60,40" stroke="#fff" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'candyblast':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-pink`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#831843" />
            </linearGradient>
            <linearGradient id={`${gradId}-yellow`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#fdf2f8" stroke="#ec4899" strokeWidth="2" />
          {/* Ultra-glossy candy wrapping with starry particles */}
          <g filter="drop-shadow(0 4px 5px rgba(219,39,119,0.35))" transform="translate(0, 1)">
            {/* Candy wrap ends */}
            <polygon points="12,35 15,65 32,50" fill="url(#` + gradId + `-yellow)" stroke="#b45309" strokeWidth="1.5" />
            <polygon points="88,35 85,65 68,50" fill="url(#` + gradId + `-yellow)" stroke="#b45309" strokeWidth="1.5" />
            {/* Candy main body (spherical 3D) */}
            <circle cx="50" cy="50" r="24" fill="url(#` + gradId + `-pink)" stroke="#9d174d" strokeWidth="2.5" />
            {/* White glossy swirls */}
            <path d="M 34,42 Q 50,28 66,42 Q 50,56 34,42 Z" fill="#fff" opacity="0.3" />
            <path d="M 38,52 Q 50,42 62,52 Q 50,62 38,52 Z" fill="#fff" opacity="0.2" />
            {/* Highlight bubble */}
            <circle cx="43" cy="38" r="4.5" fill="#fff" opacity="0.7" />
          </g>
        </svg>
      );

    case 'luckypanda':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#042f1a" stroke="#10b981" strokeWidth="2" />
          <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.6))" transform="translate(0, 3)">
            {/* Black ears */}
            <circle cx="28" cy="24" r="11" fill="#111" />
            <circle cx="72" cy="24" r="11" fill="#111" />
            {/* White Face Base */}
            <path d="M 22,50 C 20,70 32,80 50,80 C 68,80 80,70 78,50 C 78,35 68,30 50,30 C 32,35 22,50 Z" fill="#fff" stroke="#111" strokeWidth="1.5" />
            {/* Black Eye Patches */}
            <ellipse cx="38" cy="48" rx="8.5" ry="11" fill="#111" transform="rotate(-15 38 48)" />
            <ellipse cx="62" cy="48" rx="8.5" ry="11" fill="#111" transform="rotate(15 62 48)" />
            {/* Shiny Eyes */}
            <circle cx="39" cy="46" r="3.2" fill="#fff" />
            <circle cx="61" cy="46" r="3.2" fill="#fff" />
            <circle cx="40" cy="45" r="1.2" fill="#000" />
            <circle cx="60" cy="45" r="1.2" fill="#000" />
            {/* Cute glossy nose and mouth */}
            <ellipse cx="50" cy="58" rx="4" ry="2.2" fill="#111" />
            <path d="M 46,64 Q 50,67 54,64" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
            {/* Glowing Golden coin in mouth */}
            <circle cx="50" cy="71" r="7.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <rect x="47.5" y="68.5" width="5" height="5" fill="#fff" opacity="0.8" />
          </g>
        </svg>
      );

    case 'firephoenix':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-fire`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="75%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#0a0000" stroke="#ef4444" strokeWidth="2.5" />
          {/* Flame aura back */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.3" filter="drop-shadow(0 0 8px #dc2626)" />
          {/* Majestic 3D Phoenix Bird emerging */}
          <g filter="drop-shadow(0 3px 6px rgba(239,68,68,0.5))">
            {/* Fire Wings */}
            <path d="M 50,45 C 32,25 10,40 15,65 C 22,58 35,52 50,55" fill="url(#` + gradId + `-fire)" />
            <path d="M 50,45 C 68,25 90,40 85,65 C 78,58 65,52 50,55" fill="url(#` + gradId + `-fire)" />
            {/* Tail feathers */}
            <path d="M 45,55 L 43,88 L 50,75 L 57,88 L 55,55 Z" fill="url(#` + gradId + `-fire)" />
            {/* Burning Head and Crown feathers */}
            <path d="M 50,22 C 45,22 43,30 50,48 C 57,30 55,22 50,22 Z" fill="#fef08a" />
            <path d="M 50,14 C 47,8 53,8 50,14" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
            {/* Glowing Eye */}
            <circle cx="50" cy="30" r="2" fill="#fff" />
          </g>
        </svg>
      );

    case 'oceanking':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="50%" stopColor="#e8b923" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#` + gradId + `-blue)" stroke="#38bdf8" strokeWidth="2" />
          {/* Water ripples */}
          <path d="M 12,68 Q 31,63 50,68 Q 69,63 88,68" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.4" />
          <path d="M 12,78 Q 31,73 50,78 Q 69,73 88,78" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.3" />
          
          {/* Radiant 3D Gold Crown with rubies */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))" transform="translate(0, 2)">
            {/* Crown Base */}
            <path d="M 22,58 L 78,58 L 75,68 L 25,68 Z" fill="url(#` + gradId + `-gold)" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Spikes */}
            <path d="M 22,58 L 22,40 L 36,54 L 50,28 L 64,54 L 78,40 L 78,58 Z" fill="url(#` + gradId + `-gold)" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Shiny Pearls/gems */}
            <circle cx="22" cy="40" r="3.2" fill="#38bdf8" stroke="#fff" strokeWidth="0.8" />
            <circle cx="50" cy="28" r="4.2" fill="#ef4444" stroke="#fff" strokeWidth="1" filter="drop-shadow(0 0 4px #ef4444)" />
            <circle cx="78" cy="40" r="3.2" fill="#38bdf8" stroke="#fff" strokeWidth="0.8" />
            
            {/* Royal blue gems along base */}
            <circle cx="32" cy="63" r="2" fill="#3b82f6" />
            <circle cx="50" cy="63" r="2" fill="#3b82f6" />
            <circle cx="68" cy="63" r="2" fill="#3b82f6" />
          </g>
        </svg>
      );

    case 'dragonking':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-fish`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#042f2e" stroke="#14b8a6" strokeWidth="2" />
          {/* Golden bubbles */}
          <circle cx="32" cy="28" r="2" fill="#14b8a6" opacity="0.6" />
          <circle cx="25" cy="42" r="3.5" fill="#14b8a6" opacity="0.4" />
          <circle cx="78" cy="30" r="1.5" fill="#14b8a6" opacity="0.7" />
          
          {/* Metallic 3D Dragonfish jumping */}
          <g filter="drop-shadow(0 3px 5px rgba(13,148,136,0.4))" transform="rotate(-10 50 50)">
            {/* Fish tail flap (golden) */}
            <path d="M 22,65 Q 12,62 10,75 Q 22,78 28,68 Z" fill="url(#` + gradId + `-gold)" />
            {/* Fish Body */}
            <path d="M 25,65 C 38,58 48,42 62,40 C 74,38 88,48 85,58 C 76,68 55,72 25,65 Z" fill="url(#` + gradId + `-fish)" />
            {/* Fish scales details lines */}
            <path d="M 42,48 Q 45,55 42,62 M 52,44 Q 55,52 52,61 M 62,45 Q 65,52 62,60" stroke="#042f2e" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            {/* Fins */}
            <path d="M 52,44 Q 60,32 50,38" fill="url(#` + gradId + `-gold)" />
            <path d="M 58,62 Q 68,75 58,67" fill="url(#` + gradId + `-gold)" />
            {/* Fish eye */}
            <circle cx="74" cy="48" r="3.2" fill="#fff" />
            <circle cx="75" cy="48" r="1.5" fill="#000" />
          </g>
        </svg>
      );

    case 'alienhunter':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#090514" stroke="#8b5cf6" strokeWidth="2" />
          {/* Space arcade visual elements */}
          <line x1="15" y1="50" x2="85" y2="50" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
          <line x1="50" y1="15" x2="50" y2="85" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
          
          {/* Glossy Alien Spacecraft Shooter */}
          <g filter="drop-shadow(0 0 8px rgba(124,58,237,0.7))" transform="translate(0, 1)">
            {/* Spaceship side pods (cyan) */}
            <path d="M 22,55 C 22,42 32,38 38,45 L 34,68 Z" fill="#06b6d4" />
            <path d="M 78,55 C 78,42 68,38 62,45 L 66,68 Z" fill="#06b6d4" />
            {/* Spaceship main pod (3D purple) */}
            <path d="M 35,55 C 35,32 50,22 50,22 C 50,22 65,32 65,55 L 58,72 L 42,72 Z" fill="#8b5cf6" stroke="#4c1d95" strokeWidth="1.5" />
            {/* Glowing cockpit window */}
            <ellipse cx="50" cy="42" rx="6.5" ry="4.5" fill="#c084fc" stroke="#fff" strokeWidth="1.2" />
            <circle cx="48" cy="40" r="1.5" fill="#fff" />
            {/* Laser beams shooting down */}
            <g opacity="0.9">
              <line x1="50" y1="22" x2="50" y2="8" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
              <line x1="38" y1="45" x2="38" y2="12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="62" y1="45" x2="62" y2="12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      );

    case 'deepsea':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-octo`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff7043" />
              <stop offset="50%" stopColor="#f4511e" />
              <stop offset="100%" stopColor="#b71c1c" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#011627" stroke="#0891b2" strokeWidth="2" />
          {/* Deepwater bubbles */}
          <circle cx="28" cy="30" r="2.5" fill="#0891b2" opacity="0.5" />
          <circle cx="74" cy="22" r="3.2" fill="#0891b2" opacity="0.3" />
          
          {/* 3D Orange Octopus floating */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.55))">
            {/* Curly tentacles (back layer) */}
            <path d="M 32,55 Q 20,62 18,72" fill="none" stroke="url(#` + gradId + `-octo)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 68,55 Q 80,62 82,72" fill="none" stroke="url(#` + gradId + `-octo)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 42,58 Q 30,73 34,84" fill="none" stroke="url(#` + gradId + `-octo)" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 58,58 Q 70,73 66,84" fill="none" stroke="url(#` + gradId + `-octo)" strokeWidth="6.5" strokeLinecap="round" />
            
            {/* Octopus Bulbous Head */}
            <ellipse cx="50" cy="40" rx="20" ry="17" fill="url(#` + gradId + `-octo)" stroke="#880e4f" strokeWidth="1.5" />
            {/* White glossy eyes */}
            <circle cx="43" cy="42" r="4.5" fill="#fff" />
            <circle cx="57" cy="42" r="4.5" fill="#fff" />
            <circle cx="44" cy="42" r="2" fill="#000" />
            <circle cx="56" cy="42" r="2" fill="#000" />
            {/* Shiny blush */}
            <circle cx="36" cy="47" r="2" fill="#ff8a80" />
            <circle cx="64" cy="47" r="2" fill="#ff8a80" />
            {/* Bubble detail */}
            <ellipse cx="48" cy="30" rx="7" ry="2.2" fill="#fff" opacity="0.25" />
          </g>
        </svg>
      );

    case 'baccarat':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#052e16" stroke="url(#` + gradId + `-gold)" strokeWidth="2.5" />
          {/* Card stacking visual */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.75))" transform="translate(0, 1)">
            {/* Left Card (King of Diamonds) */}
            <g transform="translate(26, 46) rotate(-12)">
              <rect x="-18" y="-28" width="36" height="56" rx="4" fill="#fff" stroke="#ccd5db" strokeWidth="1.5" />
              <text x="-12" y="-14" fill="#ef4444" fontSize="11" fontWeight="950" fontFamily="serif">K</text>
              {/* Giant golden/red Diamond diamond logo */}
              <polygon points="0,-12 10,0 0,12 -10,0" fill="#ef4444" />
            </g>
            {/* Right Card (Ace of Diamonds) */}
            <g transform="translate(62, 48) rotate(10)">
              <rect x="-18" y="-28" width="36" height="56" rx="4" fill="#fff" stroke="url(#` + gradId + `-gold)" strokeWidth="2" />
              <text x="-12" y="-14" fill="#ef4444" fontSize="11" fontWeight="950" fontFamily="serif">A</text>
              <polygon points="0,-12 11,0 0,11 -11,0" fill="url(#` + gradId + `-gold)" />
              {/* Glossy crown logo */}
              <polygon points="-5,14 5,14 8,8 0,11 -8,8" fill="#eab308" />
            </g>
          </g>
        </svg>
      );

    case 'dragontiger':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#2d0601" stroke="#ea580c" strokeWidth="2.5" />
          {/* Split backdrop color - Teal vs Orange */}
          <path d="M 50,5 C 75,5 95,25 95,50 C 95,75 75,95 50,95 Z" fill="#022c22" opacity="0.3" />
          <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.85))">
            {/* Dynamic clashing Dragon Claw (cyan) vs Tiger Claw (orange/red) */}
            <g transform="translate(32, 50)">
              <circle cx="0" cy="0" r="14" fill="#0d9488" stroke="#5ef3e3" strokeWidth="2.5" />
              <text x="0" y="5" fill="#fff" fontSize="15" fontWeight="950" textAnchor="middle">D</text>
              <path d="M-8,-8 Q-18,-18 -15,-6" stroke="#99f6e4" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g transform="translate(68, 50)">
              <circle cx="0" cy="0" r="14" fill="#b91c1c" stroke="#fb923c" strokeWidth="2.5" />
              <text x="0" y="5" fill="#fff" fontSize="15" fontWeight="950" textAnchor="middle">T</text>
              <path d="M8,-8 Q18,-18 15,-6" stroke="#fecdd3" strokeWidth="3" strokeLinecap="round" />
            </g>
            
            {/* VS text in middle */}
            <circle cx="50" cy="50" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
            <text x="50" y="53.5" fill="#facc15" fontSize="10" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">VS</text>
          </g>
        </svg>
      );

    case 'teenpatti':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#450a0a" stroke="#f43f5e" strokeWidth="2" />
          {/* Card stack with Ace details */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))" transform="translate(0, 1)">
            {/* Back Card */}
            <g transform="translate(34, 48) rotate(-15)">
              <rect x="-16" y="-26" width="32" height="52" rx="3.5" fill="#fff" stroke="#ddd" strokeWidth="1.2" />
              <text x="-11" y="-12" fill="#ef4444" fontSize="10" fontWeight="950" fontFamily="serif">A</text>
              <polygon points="0,-10 8,0 0,10 -8,0" fill="#ef4444" />
            </g>
            {/* Right Back Card */}
            <g transform="translate(66, 48) rotate(15)">
              <rect x="-16" y="-26" width="32" height="52" rx="3.5" fill="#fff" stroke="#ddd" strokeWidth="1.2" />
              <text x="-11" y="-12" fill="#111" fontSize="10" fontWeight="950" fontFamily="serif">A</text>
              {/* Spades symbol */}
              <path d="M 0,-10 C 5,-4 10,0 0,10 C -10,0 -5,-4 0,-10 Z" fill="#111" />
            </g>
            {/* Front Main Card */}
            <g transform="translate(50, 48)">
              <rect x="-18" y="-28" width="36" height="56" rx="4" fill="#fcfaec" stroke="#eab308" strokeWidth="2" />
              <text x="-12" y="-14" fill="#b91c1c" fontSize="11" fontWeight="950" fontFamily="serif">A</text>
              {/* Heart logo */}
              <path d="M 0,-10 C 6,-18 16,-4 0,11 C -16,-4 -6,-18 0,-10 Z" fill="#b91c1c" />
              {/* Gold border design */}
              <rect x="-15" y="-25" width="30" height="50" fill="none" stroke="#eab308" strokeWidth="0.8" opacity="0.6" />
            </g>
          </g>
        </svg>
      );

    case 'blackjack':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#042f2e" stroke="#115e59" strokeWidth="2" />
          {/* Card stack with Chip */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.85))">
            {/* Ace card */}
            <g transform="translate(36, 44) rotate(-10)">
              <rect x="-18" y="-28" width="36" height="56" rx="4" fill="#fff" stroke="#115e59" strokeWidth="1.5" />
              <text x="-12" y="-14" fill="#111" fontSize="12" fontWeight="950" fontFamily="serif">A</text>
              <path d="M 0,-10 C 5,-5 10,-2 0,10 C -10,-2 -5,-5 0,-10 Z" fill="#111" />
              <polygon points="0,9 3,14 -3,14" fill="#111" />
            </g>
            {/* Jack card */}
            <g transform="translate(62, 46) rotate(10)">
              <rect x="-18" y="-28" width="36" height="56" rx="4" fill="#fff" stroke="#111" strokeWidth="1.5" />
              <text x="-12" y="-14" fill="#111" fontSize="12" fontWeight="950" fontFamily="serif">J</text>
              <text x="0" y="8" fill="#111" fontSize="24" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">♠</text>
            </g>
            {/* Shiny stacked Casino Poker chips */}
            <g transform="translate(50, 70)">
              <ellipse cx="0" cy="0" rx="14" ry="6" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              <ellipse cx="0" cy="-3" rx="14" ry="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <text x="0" y="-1.5" fill="#fff" fontSize="5" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">100</text>
            </g>
          </g>
        </svg>
      );

    case 'poker':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.8))">
            {/* Royal flush hand display */}
            <g transform="translate(25, 48) rotate(-15)">
              <rect x="-14" y="-22" width="28" height="44" rx="3" fill="#fff" stroke="#aaa" />
              <text x="-9" y="-10" fill="#ef4444" fontSize="8" fontWeight="bold">10</text>
            </g>
            <g transform="translate(38, 45) rotate(-5)">
              <rect x="-14" y="-22" width="28" height="44" rx="3" fill="#fff" stroke="#aaa" />
              <text x="-9" y="-10" fill="#ef4444" fontSize="8" fontWeight="bold">J</text>
            </g>
            <g transform="translate(50, 44)">
              <rect x="-14" y="-22" width="28" height="44" rx="3" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
              <text x="-9" y="-10" fill="#ef4444" fontSize="8" fontWeight="bold">Q</text>
              <path d="M 0,-4 C 3,-8 8,-3 0,4 C -8,-3 -3,-8 0,-4 Z" fill="#ef4444" />
            </g>
            <g transform="translate(62, 45) rotate(5)">
              <rect x="-14" y="-22" width="28" height="44" rx="3" fill="#fff" stroke="#aaa" />
              <text x="-9" y="-10" fill="#ef4444" fontSize="8" fontWeight="bold">K</text>
            </g>
            <g transform="translate(75, 48) rotate(15)">
              <rect x="-14" y="-22" width="28" height="44" rx="3" fill="#fff" stroke="#aaa" />
              <text x="-9" y="-10" fill="#ef4444" fontSize="8" fontWeight="bold">A</text>
            </g>
            {/* VIP Golden Overlayed Crown on the hand */}
            <path d="M 38,68 L 62,68 L 60,62 L 50,56 L 40,62 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="50" cy="56" r="1.5" fill="#ef4444" />
          </g>
        </svg>
      );

    case 'crashrocket':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-rocket`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="30%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id={`${gradId}-fire`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#020617" stroke="#ef4444" strokeWidth="2" />
          {/* Flame trajectory curve */}
          <path d="M 12,88 Q 38,78 85,25" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="6 3" opacity="0.4" />
          
          {/* Dynamic 3D metallic rocket */}
          <g filter="drop-shadow(0px 3px 5px rgba(244,63,94,0.5))" transform="translate(2, -2)">
            {/* Flame Trail */}
            <path d="M 22,78 C 22,78 12,90 8,92 C 14,88 28,78 28,78 Z" fill="url(#` + gradId + `-fire)" />
            <path d="M 30,70 L 15,85 L 20,80" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            {/* Fin wings */}
            <path d="M 32,74 L 18,78 L 30,62 Z" fill="#7f1d1d" />
            <path d="M 44,82 L 48,94 L 38,82 Z" fill="#7f1d1d" />
            {/* Rocket Body */}
            <path d="M 28,74 C 42,62 70,35 78,22 C 65,30 38,58 28,74 Z" fill="url(#` + gradId + `-rocket)" stroke="#7f1d1d" strokeWidth="1.5" />
            {/* Nosecone red cone */}
            <path d="M 68,32 C 71.5,28.5 78,22 78,22 C 78,22 71.5,28.5 68,32 Z" fill="#ef4444" />
            {/* Glowing yellow window */}
            <circle cx="48" cy="52" r="3.5" fill="#fef08a" stroke="#ef4444" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'aviator':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-prop`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
          {/* Velocity circles */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#fda4af" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.3" />
          
          {/* Classic red enamel Propeller Plane heading top-right */}
          <g filter="drop-shadow(0 4px 6px rgba(225,29,72,0.4))" transform="translate(2, -2) rotate(-5 50 50)">
            {/* Wing rear */}
            <ellipse cx="40" cy="58" rx="8" ry="24" fill="#9f1239" transform="rotate(45 40 58)" />
            {/* Main fuselage body */}
            <path d="M 18,72 C 34,60 74,42 82,36 C 75,54 38,76 18,72 Z" fill="url(#` + gradId + `-prop)" stroke="#881337" strokeWidth="1.5" />
            {/* Main Front Wings (glossy top side) */}
            <ellipse cx="56" cy="46" rx="9" ry="28" fill="#e11d48" transform="rotate(45 56 46)" stroke="#881337" strokeWidth="1.5" />
            {/* Windshield */}
            <path d="M 62,42 C 60,38 65,34 68,36 Z" fill="#93c5fd" opacity="0.8" />
            {/* Spinning propeller disk */}
            <ellipse cx="80" cy="36" rx="2" ry="14" fill="#fff" opacity="0.5" stroke="#93c5fd" strokeWidth="0.8" />
            <circle cx="80" cy="36" r="2.2" fill="#e11d48" />
          </g>
        </svg>
      );

    case 'mooncrash':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-moon`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#030712" stroke="#4f46e5" strokeWidth="2" />
          {/* Stellar stars glow */}
          <circle cx="20" cy="22" r="1" fill="#fff" />
          <circle cx="80" cy="28" r="1" fill="#fff" />
          <circle cx="28" cy="74" r="1.5" fill="#fff" opacity="0.5" />
          
          {/* Beautiful 3D crescent gold moon with craters */}
          <g filter="drop-shadow(0 0 8px rgba(251,191,36,0.55))">
            {/* Moon Crescent shape */}
            <path d="M 28,42 C 28,18 48,15 48,15 C 32,25 32,65 52,78 C 52,78 28,75 28,42 Z" fill="url(#` + gradId + `-moon)" />
            {/* Crater shadows */}
            <circle cx="34" cy="34" r="3.2" fill="#ca8a04" opacity="0.6" />
            <circle cx="34" cy="34" r="2.2" fill="#78350f" opacity="0.5" />
            
            <circle cx="35" cy="55" r="4.2" fill="#ca8a04" opacity="0.6" />
            <circle cx="35" cy="55" r="3.2" fill="#78350f" opacity="0.5" />

            <circle cx="42" cy="45" r="2.2" fill="#ca8a04" opacity="0.6" />
          </g>
        </svg>
      );

    default:
      // Fallback for slots and miscellaneous games is an elegant shiny custom 3D Slot Machine icon
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#b48a04" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="#111" stroke="url(#` + gradId + `-gold)" strokeWidth="2" />
          <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.65))" transform="translate(0, 1)">
            {/* Outer case */}
            <rect x="25" y="24" width="50" height="52" rx="6" fill="#1e1b4b" stroke="url(#` + gradId + `-gold)" strokeWidth="2.5" />
            {/* Inside slot window screen */}
            <rect x="32" y="34" width="36" height="20" rx="3" fill="#fff" stroke="#111" strokeWidth="1.5" />
            {/* Winning Bar Line */}
            <line x1="32" y1="44" x2="68" y2="44" stroke="#ff4d4d" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* 3D Fruits in Window */}
            <circle cx="40" cy="44" r="4" fill="#ff4d4d" />
            <ellipse cx="50" cy="44" rx="4" ry="4" fill="#ca8a04" />
            <circle cx="60" cy="44" r="4" fill="#15803d" />
            {/* Side handle bar */}
            <path d="M 75,54 L 84,40 M 84,40 L 84,32" stroke="url(#` + gradId + `-gold)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="84" cy="29" r="4.5" fill="#ef4444" />
          </g>
        </svg>
      );
  }
};
