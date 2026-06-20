/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Fino Payment Shield...');

  // Cycle loading texts for premium feel
  useEffect(() => {
    const textTimer1 = setTimeout(() => {
      setLoadingText('Loading Premium Gold Dashboards...');
    }, 900);

    const textTimer2 = setTimeout(() => {
      setLoadingText('Welcome to PE777 Elite VIP');
    }, 1800);

    return () => {
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
    };
  }, []);

  // Animate progress bar (up to 100% over 2.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 85);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-luxury-holographic flex flex-col items-center justify-center z-50 p-6 select-none overflow-hidden text-white">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1d0e3a]/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        
        {/* Animated 3D Golden Mascot and Premium Image Display */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="flex flex-col items-center mb-6 w-full"
        >
          {/* Main 3D Slots Lobby Visual representation requested by user */}
          <div className="relative mb-6 w-72 h-72 p-2 border-2 border-amber-400 rounded-3xl bg-neutral-950 shadow-[0_15px_40px_rgba(232,185,35,0.3),_0_0_20px_rgba(6,182,212,0.3)] overflow-hidden group">
            <img 
              src="/src/assets/images/pe777_slots_lobby_1781925818795.jpg"
              alt="PE777 Premium Elite Slots"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl transform scale-102 hover:scale-105 transition-transform duration-700"
            />
            {/* Holographic light scan laser effect */}
            <motion.div
              animate={{ 
                top: ['-100%', '200%'],
                opacity: [0, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent skew-y-12 mix-blend-overlay pointer-events-none"
              style={{ top: '-100%' }}
            />
            {/* Ambient hot pink glow indicator inside image container */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-cyan-500/10 mix-blend-color-dodge pointer-events-none" />
          </div>

          <span className="text-4xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-250 to-pink-500 leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter">
            PE777
          </span>
          <span className="text-[10px] tracking-[0.35em] font-black text-[#e8b923] uppercase mt-2 bg-neutral-900/40 px-3 py-1 rounded-full border border-[#e8b923]/20">
            HOLOGRAPHIC VIP PLATINUM
          </span>
        </motion.div>

        {/* Progress Bar Container with sleek gold outline */}
        <div className="w-full bg-neutral-950 h-1 rounded-full border border-zinc-900/80 mb-4 overflow-hidden relative shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 via-[#e8b923] to-[#e8b923] shadow-[0_0_8px_rgba(232,185,35,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic loading text */}
        <motion.p
          key={loadingText}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -5, opacity: 0 }}
          className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase h-4"
        >
          {loadingText}
        </motion.p>
      </div>

      {/* Footer Safe Shield Marker */}
      <div className="absolute bottom-6 left-6 right-6 text-center z-10 pointer-events-none">
        <p className="text-[8px] text-zinc-700 uppercase tracking-[0.25em] max-w-md mx-auto leading-relaxed">
          PE777 Secure Gateway — End-to-end encrypted under standard Fino Escrow. Play/Simulate responsibly.
        </p>
      </div>
    </div>
  );
}
