import React from 'react';
import { CurrencyCode } from '../types/finance';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import { Bell, ShieldCheck, Plus, Sparkles, User, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'transactions' | 'forecast' | 'receipts';
  onSelectTab: (tab: 'dashboard' | 'transactions' | 'forecast' | 'receipts') => void;
  baseCurrency: CurrencyCode;
  onChangeBaseCurrency: (currency: CurrencyCode) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onQuickAddExpense: () => void;
  onOpenReceiptScanner: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  baseCurrency,
  onChangeBaseCurrency,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile,
  onQuickAddExpense,
  onOpenReceiptScanner,
  theme,
  onToggleTheme,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-sm">
            Æ
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Aether Expenses
          </span>
        </div>

        {/* Zone 2: 4 Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              currentTab === 'dashboard'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              currentTab === 'transactions'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => onSelectTab('forecast')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              currentTab === 'forecast'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forecasting
          </button>
          <button
            onClick={() => onSelectTab('receipts')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              currentTab === 'receipts'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Receipt Scanner
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Base Currency Selector */}
          <div className="relative">
            <select
              value={baseCurrency}
              onChange={(e) => onChangeBaseCurrency(e.target.value as CurrencyCode)}
              className="appearance-none bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 py-1.5 pl-2.5 pr-6 rounded-lg hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              title="Change Global Base Currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              ▼
            </span>
          </div>

          {/* Quick Scan Receipt Button */}
          <button
            onClick={onOpenReceiptScanner}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Scan paper receipt with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Receipt</span>
          </button>

          {/* Quick Add Expense Button (Primary Action) */}
          <button
            onClick={onQuickAddExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Add Expense</span>
          </button>

          {/* Real-Time Notifications Toggle */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="View Real-Time Activity & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
            )}
          </button>

          {/* User Profile Avatar / Settings Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="User Profile & Security Settings"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-[11px] font-semibold text-slate-200">
              {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 px-4 py-2 bg-[#090d16]/95 justify-around text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`py-1 px-2.5 rounded-md ${
            currentTab === 'dashboard' ? 'text-emerald-400 font-semibold bg-slate-800/70' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('transactions')}
          className={`py-1 px-2.5 rounded-md ${
            currentTab === 'transactions' ? 'text-emerald-400 font-semibold bg-slate-800/70' : 'text-slate-400'
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => onSelectTab('forecast')}
          className={`py-1 px-2.5 rounded-md ${
            currentTab === 'forecast' ? 'text-emerald-400 font-semibold bg-slate-800/70' : 'text-slate-400'
          }`}
        >
          Forecast
        </button>
        <button
          onClick={() => onSelectTab('receipts')}
          className={`py-1 px-2.5 rounded-md ${
            currentTab === 'receipts' ? 'text-emerald-400 font-semibold bg-slate-800/70' : 'text-slate-400'
          }`}
        >
          Scanner
        </button>
      </div>
    </header>
  );
};
