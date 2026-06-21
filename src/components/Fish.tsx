/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useCasinoStore } from '../store';
import { ArrowLeft, Coins, Shell, Target, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FishEntity {
  id: string;
  x: number;
  y: number;
  type: 'small' | 'medium' | 'large' | 'boss';
  label: string;
  emoji: string;
  speed: number;
  hp: number;
  maxHp: number;
  multiplier: number;
  size: number;
  directionY: number;
}

interface Bullet {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speedX: number;
  speedY: number;
  cost: number;
  type: 'normal' | 'lightning' | 'drill';
}

interface CoinSplat {
  x: number;
  y: number;
  amount: number;
  timer: number;
}

export default function Fish({ onBack }: { onBack: () => void }) {
  const store = useCasinoStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bullet cost options
  const bulletCosts = [1, 2, 3, 5, 10, 50, 100, 500, 1000];
  const [selectedCost, setSelectedCost] = useState(10);
  const [weaponType, setWeaponType] = useState<'normal' | 'lightning' | 'drill'>('normal');

  // Interactive statistics
  const [sessionWinnings, setSessionWinnings] = useState(0);
  const [shotsFired, setShotsFired] = useState(0);

  // Local game states to coordinate thread values safely
  const stateRef = useRef({
    fish: [] as FishEntity[],
    bullets: [] as Bullet[],
    coins: [] as CoinSplat[],
    cannonAngle: 0,
    width: 600,
    height: 400,
    bossSpawnTimer: 0,
    lastFired: 0
  });

  // Load canvas parameters and resize listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 450;
        stateRef.current.width = canvas.width;
        stateRef.current.height = canvas.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Populate initial small fish
    for (let i = 0; i < 6; i++) {
      spawnFish('small');
    }
    for (let i = 0; i < 3; i++) {
      spawnFish('medium');
    }
    spawnFish('large');

    // Run core loops
    let animId: number;
    const ctx = canvas.getContext('2d');

    const updateAndDraw = () => {
      if (!ctx) return;
      const state = stateRef.current;

      // Draw background ocean
      ctx.clearRect(0, 0, state.width, state.height);
      const grad = ctx.createLinearGradient(0, 0, 0, state.height);
      grad.addColorStop(0, '#021526');
      grad.addColorStop(0.5, '#03346E');
      grad.addColorStop(1, '#001c3d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, state.width, state.height);

      // Simple grid overlays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < state.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, state.height);
        ctx.stroke();
      }

      // Draw floating bubbles
      for (let i = 0; i < 5; i++) {
        const seed = Math.sin((Date.now() + i * 300) * 0.002);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(
          (state.width * (i + 1)) / 6 + seed * 20,
          ((Date.now() / 4 + i * 120) % state.height),
          4 + (i % 3) * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Update & Draw Fish
      state.fish.forEach((f) => {
        // Move towards left
        f.x -= f.speed;
        f.y += f.directionY;

        // Bounce from top/bottom
        if (f.y < 50 || f.y > state.height - 80) {
          f.directionY *= -1;
        }

        // Draw fish emoji representation
        ctx.save();
        ctx.translate(f.x, f.y);
        // Face moving direction left
        ctx.scale(1, 1);
        ctx.font = `${f.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.emoji, 0, 0);

        // Draw HP bar if hit
        if (f.hp < f.maxHp) {
          const barWidth = f.size * 1.5;
          ctx.fillStyle = '#444';
          ctx.fillRect(-barWidth / 2, -f.size / 1.3, barWidth, 4);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-barWidth / 2, -f.size / 1.3, barWidth * (f.hp / f.maxHp), 4);
        }

        // Label name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '8px monospace';
        ctx.fillText(`${f.label} x${f.multiplier}`, 0, f.size / 1.3);

        ctx.restore();
      });

      // Filter off-screen fish and respawn
      const originalCount = state.fish.length;
      state.fish = state.fish.filter((f) => f.x > -50);
      if (state.fish.length < 8) {
        const categories: FishEntity['type'][] = ['small', 'medium', 'large'];
        spawnFish(categories[Math.floor(Math.random() * categories.length)]);
      }

      // Spawn periodic boss boss dragon
      state.bossSpawnTimer++;
      if (state.bossSpawnTimer > 600) { // Approx 10 seconds on 60fps
        spawnFish('boss');
        state.bossSpawnTimer = 0;
      }

      // Update & Draw Bullets
      state.bullets.forEach((b) => {
        b.x += b.speedX;
        b.y += b.speedY;

        // Draw projectile
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.fillStyle = b.type === 'lightning' ? '#a78bfa' : b.type === 'drill' ? '#fb923c' : '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, b.type === 'normal' ? 5 : 8, 0, Math.PI * 2);
        ctx.fill();

        // Neon core glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.type === 'lightning' ? '#c084fc' : '#fb923c';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Collision detection on active fish
        state.fish.forEach((f) => {
          const dx = f.x - b.x;
          const dy = f.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Approximate hitbox
          if (distance < f.size / 1.2) {
            // Hit! Trigger HP deduction with boosted damage for high win satisfaction
            let damage = b.type === 'lightning' ? 3 : b.type === 'drill' ? 2 : 1;
            if (!store.hasDeposited) {
              damage = 0;
            }
            const isHighBalance = store.coins > 500;
            f.hp -= isHighBalance ? damage * 4 : damage * 15;

            // Trigger visual splash / flash
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(b.x, b.y, f.size, 0, Math.PI * 2);
            ctx.fill();

            // Destroy bullet unless drill penetrator
            if (b.type !== 'drill') {
              b.y = -100; // triggers safe disposal
            }

            // check if dead
            if (f.hp <= 0) {
              const award = b.cost * f.multiplier;
              setSessionWinnings((prev) => prev + award);
              store.addCoins(award, `Defeated ${f.label} x${f.multiplier}`, 'Ocean King', 'game_win');

              // Create Coin splat animation
              state.coins.push({
                x: f.x,
                y: f.y,
                amount: award,
                timer: 40
              });

              // Play minor bubble audio click
              playbackHitSound();

              // Dispose immediately
              f.x = -200;
            }
          }
        });
      });

      // Filter off-screen bullets
      state.bullets = state.bullets.filter(
        (b) => b.y > 0 && b.y < state.height && b.x > 0 && b.x < state.width
      );

      // Clean dead / captured fish
      state.fish = state.fish.filter((f) => f.x > 0);

      // Draw floating Coin Rewards Anim Splats
      state.coins.forEach((c) => {
        c.y -= 1; // rise up
        c.timer--;

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${c.amount.toLocaleString()}`, c.x, c.y);

        // draw tiny gold circle asset
        ctx.beginPath();
        ctx.arc(c.x, c.y - 12, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      state.coins = state.coins.filter((c) => c.timer > 0);

      // Draw primary Cannon turret layout at bottom center
      const cannonX = state.width / 2;
      const cannonY = state.height - 15;

      ctx.save();
      ctx.translate(cannonX, cannonY);
      ctx.rotate(state.cannonAngle - Math.PI / 2);

      // Cannon body
      ctx.fillStyle = '#caa01a';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.fillRect(-10, -32, 20, 32);

      // Cannon tip muzzle ring
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-12, -35, 24, 6);

      // Turret base pivot ball circle
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw floor deck panel
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, state.height - 15, state.width, 15);
      ctx.fillStyle = '#e8b923';
      ctx.fillRect(cannonX - 40, state.height - 4, 80, 4);

      animId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [selectedCost, weaponType]);

  const playbackHitSound = () => {
    if (!store.settings.sound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  const spawnFish = (type: FishEntity['type']) => {
    const state = stateRef.current;
    const spawnY = 80 + Math.random() * (state.height - 200);

    let next: FishEntity;

    if (type === 'small') {
      const smallEmojis = ['🐠', '🐟', '🐡'];
      const labels = ['Anemone Tang', 'Blue Clownfish', 'Puffer Swell'];
      const multiplier = 2 + Math.floor(Math.random() * 4);
      next = {
        id: Math.random().toString(),
        x: state.width + 50,
        y: spawnY,
        type,
        label: labels[Math.floor(Math.random() * labels.length)],
        emoji: smallEmojis[Math.floor(Math.random() * smallEmojis.length)],
        speed: 1.2 + Math.random() * 0.8,
        hp: 1,
        maxHp: 1,
        multiplier,
        size: 20,
        directionY: Math.random() > 0.5 ? 0.3 : -0.3
      };
    } else if (type === 'medium') {
      const medEmojis = ['🦑', '🦐', '🦀'];
      const multiplier = 8 + Math.floor(Math.random() * 8);
      next = {
        id: Math.random().toString(),
        x: state.width + 100,
        y: spawnY,
        type,
        label: 'Amber Shellfish',
        emoji: medEmojis[Math.floor(Math.random() * medEmojis.length)],
        speed: 1.0 + Math.random() * 0.4,
        hp: 3,
        maxHp: 3,
        multiplier,
        size: 28,
        directionY: Math.random() > 0.5 ? 0.2 : -0.2
      };
    } else if (type === 'large') {
      const largeEmojis = ['🦈', '🐋', '🐬'];
      const labels = ['Apex Great White', 'Megalodon Whale', 'Atlantic Orca'];
      const multiplier = 25 + Math.floor(Math.random() * 25);
      next = {
        id: Math.random().toString(),
        x: state.width + 150,
        y: spawnY,
        type,
        label: labels[Math.floor(Math.random() * labels.length)],
        emoji: largeEmojis[Math.floor(Math.random() * largeEmojis.length)],
        speed: 0.6 + Math.random() * 0.4,
        hp: 10,
        maxHp: 10,
        multiplier,
        size: 44,
        directionY: Math.random() > 0.5 ? 0.15 : -0.15
      };
    } else {
      // BOSS Spawn
      next = {
        id: Math.random().toString(),
        x: state.width + 200,
        y: spawnY - 20,
        type: 'boss',
        label: '🐲 GIGANTIC RED KRAKEN',
        emoji: '🐲',
        speed: 0.4,
        hp: 50,
        maxHp: 50,
        multiplier: 150,
        size: 64,
        directionY: 0.05
      };
      toast.success('⚠️ RED DRAGON BOSS APPEARED! HUNT IT DOWN NOW!', {
        duration: 4000,
        icon: '🚨'
      });
    }

    state.fish.push(next);
  };

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const state = stateRef.current;
    const cannonX = state.width / 2;
    const cannonY = state.height - 15;

    // Calculate rotation angle
    const dx = clickX - cannonX;
    const dy = clickY - cannonY;
    const angle = Math.atan2(dy, dx);
    state.cannonAngle = angle;

    // Check shoot rate constraint (limit to once per 120ms to avoid spam drain)
    const now = Date.now();
    if (now - state.lastFired < 140) return;
    state.lastFired = now;

    // Ammo cost check
    const cost = selectedCost * (weaponType === 'lightning' ? 5 : weaponType === 'drill' ? 3 : 1);
    if (store.coins < cost) {
      toast.error('Insufficient Coins! Choose lower bullets or claim rewards.');
      return;
    }

    // Deduct coins
    store.deductCoins(cost, `Fish Shot Ammo (${weaponType})`, 'Ocean King', 'bet_loss');
    setShotsFired(p => p + 1);

    // Compute speed metrics
    const speed = 10;
    const speedX = Math.cos(angle) * speed;
    const speedY = Math.sin(angle) * speed;

    // Spawn projectile
    state.bullets.push({
      x: cannonX + Math.cos(angle) * 35,
      y: cannonY + Math.sin(angle) * 35,
      targetX: clickX,
      targetY: clickY,
      speedX,
      speedY,
      cost: selectedCost,
      type: weaponType
    });

    // Retro laser trigger audio
    if (store.settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-8 flex flex-col items-center select-none">
      {/* Top Navigation */}
      <header className="w-full h-15 bg-neutral-900/90 px-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide">OCEAN KING HUNTER</h1>
            <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
              Multi-Bullet Fish Shooting
            </span>
          </div>
        </div>

        {/* Live balance banner */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
          <Coins size={14} className="text-[#e8b923]" />
          <span className="text-xs font-bold font-mono text-[#e8b923]">
            {store.coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* Main viewport */}
      <div className="w-full max-w-4xl p-4 flex-1 flex flex-col space-y-3">
        {/* Interactive stats top bars */}
        <div className="grid grid-cols-3 bg-[#111111] rounded-2xl p-3 text-center border border-neutral-800 text-xs font-semibold">
          <div>
            <span className="text-zinc-500 block text-[9px] uppercase tracking-widest">Shots Count</span>
            <span className="text-white font-mono mt-0.5 block">{shotsFired}</span>
          </div>
          <div>
            <span className="text-teal-400 block text-[9px] tracking-widest uppercase font-black">Fish Harvested Gain</span>
            <span className="text-green-500 font-mono mt-0.5 font-bold block">+{sessionWinnings.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[9px] uppercase tracking-widest">Mode API</span>
            <span className="text-yellow-500 mt-0.5 font-mono block">60 FPS</span>
          </div>
        </div>

        {/* INTERACTIVE CANVAS FIELD */}
        <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasInteraction}
            className="block w-full cursor-crosshair h-[450px]"
          />

          <div className="absolute top-3 left-4 bg-black/60 backdrop-blur border border-white/5 py-1 px-2.5 rounded-lg text-[9px] font-mono tracking-wider text-zinc-400 pointer-events-none uppercase">
            🎯 Double Tap / Click canvas to lock & rotate primary turret fire
          </div>
        </div>

        {/* WEAPONS & AMMO BET PANELS CONTAINER */}
        <div className="bg-[#121212] border border-neutral-800/80 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Shot Power cost selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                Select Bullet Ammo Weight
              </span>
              <div className="flex flex-wrap gap-1">
                {bulletCosts.map((cost) => (
                  <button
                    key={cost}
                    onClick={() => setSelectedCost(cost)}
                    className={`h-8 px-2 rounded-xl text-[10px] font-black tracking-wide transition-all uppercase cursor-pointer border ${
                      selectedCost === cost
                        ? 'bg-neutral-950 border-[#e8b923] text-[#e8b923] shadow-md'
                        : 'bg-neutral-900 border-neutral-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cost}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Special weapon choice cards */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                Special Cannons (Multipliers Cost)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal', name: 'Standard', multiplier: '1x', icon: <Target size={14} className="text-amber-500" /> },
                  { id: 'lightning', name: 'Chain Tesla', multiplier: '5x', icon: <Zap size={14} className="text-purple-400" /> },
                  { id: 'drill', name: 'Drill Lance', multiplier: '3x', icon: <Shell size={14} className="text-orange-400" /> }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWeaponType(w.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wide transition-all uppercase cursor-pointer border flex flex-col items-center justify-center gap-1 min-h-[44px] ${
                      weaponType === w.id
                        ? 'bg-neutral-950 border-[#e8b923] text-white shadow'
                        : 'bg-neutral-900 border-neutral-900 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {w.icon}
                      <span className="font-bold">{w.name}</span>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 font-extrabold">{w.multiplier} Ammo</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
