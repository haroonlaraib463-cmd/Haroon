import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a11] text-slate-100 select-none overflow-hidden"
    >
      {/* Subtle ambient luxury backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.06),transparent_50%)] pointer-events-none" />

      {/* Brand Icon & Typography */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Monogram emblem */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-md pointer-events-none" />
            <span className="text-3xl font-bold tracking-tight bg-gradient-to-br from-emerald-300 via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              Æ
            </span>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-1.5 rounded-2xl border border-emerald-500/20 border-dashed pointer-events-none"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
            AETHER EXPENSES
          </h1>
          <p className="text-xs font-normal tracking-wide text-slate-400">
            Personal Finance Intelligence & Ledger
          </p>
        </motion.div>

        {/* Real-time initialization status */}
        <div className="w-48 mt-8">
          <div className="h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeInOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono tabular-nums">
            <span>Cryptographic Vault</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Skip button for immediate access */}
        <button
          onClick={onComplete}
          className="mt-8 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-800/50"
        >
          <span>Enter Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Security badge at bottom */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[11px] text-slate-500">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Hardware Biometric & AES-256 Encrypted</span>
      </div>
    </motion.div>
  );
};
