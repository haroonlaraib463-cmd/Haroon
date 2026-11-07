import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, KeyRound, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

interface BiometricPromptModalProps {
  isOpen: boolean;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  userName,
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'biometric' | 'pin'>('biometric');
  const [status, setStatus] = useState<'scanning' | 'success' | 'failed'>('scanning');

  useEffect(() => {
    if (isOpen && mode === 'biometric') {
      setStatus('scanning');
      // Simulate hardware biometric scan completion
      const timer = setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 600);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, onSuccess]);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setStatus('success');
      setTimeout(onSuccess, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-6 text-center text-slate-100 overflow-hidden">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        {mode === 'biometric' ? (
          <div className="py-6 space-y-5">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Radiating biometric pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.05, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 pointer-events-none"
              />
              <div className="w-18 h-18 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 shadow-xl">
                {status === 'success' ? (
                  <Check className="w-8 h-8 text-emerald-400" />
                ) : (
                  <Fingerprint className="w-9 h-9" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Biometric Authentication
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Touch ID / Face ID verified for <span className="text-slate-200">{userName}</span>
              </p>
            </div>

            <div className="text-[11px] font-mono text-emerald-400">
              {status === 'scanning' ? 'Verifying cryptographic passkey...' : 'Authenticated Successfully'}
            </div>

            <button
              onClick={() => setMode('pin')}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2 block mx-auto"
            >
              Use Security Vault PIN instead
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="py-4 space-y-4 text-left">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Enter Master Vault PIN
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Default recovery key is 4242
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
            >
              Unlock Vault
            </button>

            <button
              type="button"
              onClick={() => setMode('biometric')}
              className="text-xs text-slate-400 hover:text-slate-200 block text-center w-full"
            >
              ← Back to Biometric Scanner
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
