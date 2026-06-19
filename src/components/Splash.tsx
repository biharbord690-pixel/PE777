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
    <div className="fixed inset-0 bg-[#000] flex flex-col items-center justify-center z-50 p-6 select-none overflow-hidden text-white">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-radial-at-c from-purple-950/20 via-black to-[#000] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        
        {/* Animated 3D Golden Mascot Display */}
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center mb-7"
        >
          {/* Neon/Gold Status Mascot frame */}
          <div className="relative mb-4 w-28 h-28 p-1 border-2 border-[#e8b923]/40 rounded-full bg-gradient-to-tr from-neutral-900 to-purple-950/60 shadow-[0_0_20px_rgba(232,185,35,0.25)] overflow-hidden">
            <img 
              src="/src/assets/images/bunny_luxury_mascot_1781800135949.jpg"
              alt="Golden Mascot Loading"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
            {/* Highlight pulse overlay */}
            <motion.div
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute inset-0 bg-purple-500 rounded-full filter blur-md mix-blend-screen"
            />
          </div>

          <span className="text-4xl font-black tracking-widest text-white leading-none">
            PE777
          </span>
          <span className="text-[9px] tracking-[0.3em] font-light text-[#e8b923] uppercase mt-2.5">
            LUXURY FINTECH SUPERPORTAL
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
