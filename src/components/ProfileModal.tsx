import React, { useState } from 'react';
import { BudgetConfig, CurrencyCode, UserProfile } from '../types/finance';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import {
  X,
  Shield,
  Fingerprint,
  Cloud,
  CheckCircle2,
  Download,
  Upload,
  Moon,
  Sun,
  User,
  LogOut,
  RefreshCw,
  Key,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  budget: BudgetConfig;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onUpdateBudget: (updatedBudget: BudgetConfig) => void;
  onTriggerCloudSync: () => Promise<void>;
  onExportBackupFile: () => void;
  onImportBackupFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  budget,
  onUpdateProfile,
  onUpdateBudget,
  onTriggerCloudSync,
  onExportBackupFile,
  onImportBackupFile,
  onSignOut,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(profile.baseCurrency);
  const [monthlyIncome, setMonthlyIncome] = useState(budget.monthlyIncome);
  const [monthlyBudget, setMonthlyBudget] = useState(budget.monthlyBudget);
  const [warningThreshold, setWarningThreshold] = useState(budget.warningThresholdPercent || 80);
  const [biometricsEnabled, setBiometricsEnabled] = useState(profile.biometricsEnabled);
  const [theme, setTheme] = useState<'dark' | 'light'>(profile.theme);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: name.trim() || profile.name,
      email: email.trim() || profile.email,
      baseCurrency,
      biometricsEnabled,
      theme,
    });

    onUpdateBudget({
      ...budget,
      monthlyIncome: Number(monthlyIncome) || budget.monthlyIncome,
      monthlyBudget: Number(monthlyBudget) || budget.monthlyBudget,
      warningThresholdPercent: Number(warningThreshold) || 80,
    });

    onClose();
  };

  const handleCloudSyncClick = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    try {
      await onTriggerCloudSync();
      setSyncSuccessMessage('Encrypted vault synced securely with AES-GCM 256-bit encryption.');
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c101c] border border-slate-800 shadow-2xl p-6 text-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Account & Security Profile
              </h2>
              <p className="text-xs text-slate-400">
                Personalized preferences, biometric passkeys, and encrypted cloud vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-5 max-h-[72vh] overflow-y-auto pr-1">
          {/* User Personal Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Personal Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Financial Benchmarks & Targets */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Financial Targets & Currency
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Base Currency</label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Monthly Income</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Monthly Budget Target</label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Biometric Passkey Protection */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Hardware Biometric Authentication
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Use FaceID, TouchID, or WebAuthn Passkeys for account verification
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometricsEnabled}
                onChange={(e) => setBiometricsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 accent-emerald-500 cursor-pointer"
              />
            </div>
            {biometricsEnabled && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono pt-1">
                <Shield className="w-3.5 h-3.5" />
                <span>WebAuthn Credential Enrollment Active</span>
              </div>
            )}
          </div>

          {/* Secure Cloud Backup Service */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Secure Encrypted Cloud Backup
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Continuous client-side AES-GCM 256-bit snapshot synchronization
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloudSyncClick}
                disabled={isSyncing}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Vault Now'}</span>
              </button>
            </div>

            {profile.lastBackupAt && (
              <div className="text-[11px] text-slate-500 font-mono">
                Last synchronized: {new Date(profile.lastBackupAt).toLocaleString()}
              </div>
            )}

            {syncSuccessMessage && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExportBackupFile}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Encrypted .aether Vault</span>
              </button>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from File</span>
                <input
                  type="file"
                  accept=".json,.aether"
                  onChange={onImportBackupFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Theme & Display Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Visual Theme</div>
              <div className="text-[11px] text-slate-400">
                Aesthetic calibrated for high-end financial clarity
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Slate</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Architectural</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
