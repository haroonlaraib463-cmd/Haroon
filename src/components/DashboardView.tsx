import React, { useMemo } from 'react';
import { BudgetConfig, CurrencyCode, ExpenseCategory, FinancialForecast, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { calculateCategoryBreakdown } from '../utils/forecasting';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
  FileText,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  forecast: FinancialForecast;
  baseCurrency: CurrencyCode;
  onOpenAddModal: () => void;
  onOpenReceiptScanner: () => void;
  onOpenReportModal: () => void;
  onSelectTab: (tab: 'dashboard' | 'transactions' | 'forecast' | 'receipts') => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#38bdf8',
  Dining: '#f59e0b',
  Groceries: '#10b981',
  Transportation: '#a855f7',
  Utilities: '#64748b',
  Technology: '#6366f1',
  Entertainment: '#ec4899',
  Shopping: '#f97316',
  Health: '#14b8a6',
  Travel: '#06b6d4',
  Subscriptions: '#8b5cf6',
  Investments: '#10b981',
  Miscellaneous: '#94a3b8',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budget,
  forecast,
  baseCurrency,
  onOpenAddModal,
  onOpenReceiptScanner,
  onOpenReportModal,
  onSelectTab,
}) => {
  const currentMonthTransactions = useMemo(() => {
    const today = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    });
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions, budget);
  }, [transactions, budget]);

  const percentBudgetUsed = (forecast.spentSoFar / budget.monthlyBudget) * 100;
  const daysInMonth = forecast.totalDaysInMonth;
  const currentDay = forecast.daysElapsed;

  // Compute daily spend array for bar chart
  const dailySpendArray = useMemo(() => {
    const days: Array<{ day: number; amount: number; count: number }> = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, amount: 0, count: 0 });
    }
    currentMonthTransactions.forEach((t) => {
      const d = new Date(t.date).getDate();
      if (d >= 1 && d <= daysInMonth) {
        days[d - 1].amount += t.amountInBase || 0;
        days[d - 1].count += 1;
      }
    });
    return days;
  }, [currentMonthTransactions, daysInMonth]);

  const maxDailySpend = Math.max(...dailySpendArray.map((d) => d.amount), 150);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Executive Financial Portal</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <span aria-hidden="true">·</span>
            <span>Day {currentDay} of {daysInMonth}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Personal Treasury & Run-Rate
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenReceiptScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Receipt</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Statement</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <span>+ Log Expense</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Single-Elevation Flat Surface) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Month-to-Date Spend */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Month-to-Date Spent</span>
            <span className="font-mono tabular-nums text-slate-500">
              {currentMonthTransactions.length} items
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums mb-3">
            {formatCurrency(forecast.spentSoFar, baseCurrency)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Budget Ceiling</span>
            <span className="font-mono tabular-nums text-slate-300">
              {formatCurrency(budget.monthlyBudget, baseCurrency)}
            </span>
          </div>
        </div>

        {/* KPI 2: Real-Time Projected Month-End */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Forecasted Month-End</span>
            <span className={`text-[11px] font-medium font-mono ${
              forecast.paceStatus === 'optimal'
                ? 'text-emerald-400'
                : forecast.paceStatus === 'caution'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}>
              {forecast.paceStatus.toUpperCase()} PACE
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums mb-3">
            {formatCurrency(forecast.projectedBaselineTotal, baseCurrency, false)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Projected Variance</span>
            <span
              className={`font-mono tabular-nums font-medium ${
                forecast.projectedSurplusOrDeficit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {forecast.projectedSurplusOrDeficit >= 0 ? '+' : ''}
              {formatCurrency(forecast.projectedSurplusOrDeficit, baseCurrency, false)}
            </span>
          </div>
        </div>

        {/* KPI 3: Safe Daily Allowance */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Safe Daily Burn Cap</span>
            <span className="font-mono tabular-nums text-slate-500">
              {forecast.daysRemaining} days left
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums mb-3">
            {formatCurrency(forecast.recommendedDailyCap, baseCurrency, false)}
            <span className="text-sm font-normal text-slate-400"> /day</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Current Velocity</span>
            <span className="font-mono tabular-nums text-slate-300">
              {formatCurrency(forecast.dailyVelocity, baseCurrency, false)} /day
            </span>
          </div>
        </div>

        {/* KPI 4: Monthly Runway & Savings Rate */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Monthly Net Savings Est.</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {Math.round(((budget.monthlyIncome - forecast.projectedBaselineTotal) / budget.monthlyIncome) * 100)}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums mb-3">
            {formatCurrency(budget.monthlyIncome - forecast.projectedBaselineTotal, baseCurrency, false)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Gross Monthly Income</span>
            <span className="font-mono tabular-nums text-slate-300">
              {formatCurrency(budget.monthlyIncome, baseCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Forecasting Callout Strip */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${
            forecast.paceStatus === 'optimal'
              ? 'bg-emerald-500/10 text-emerald-400'
              : forecast.paceStatus === 'caution'
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            {forecast.paceStatus === 'optimal' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Real-Time Run-Rate Intelligence
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {forecast.insightSummary}
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('forecast')}
          className="self-start sm:self-center flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0"
        >
          <span>View Forecast Models</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Charts Grid: Daily Velocity Bar Chart & Category Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Velocity Bar Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">
                Daily Spending Velocity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Observed cash disbursements across all currencies converted to {baseCurrency}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-slate-600 inline-block" />
                Safe Cap
              </span>
            </div>
          </div>

          {/* SVG Daily Spending Bar Chart */}
          <div className="h-56 w-full flex items-end gap-1.5 sm:gap-2 pt-6">
            {dailySpendArray.map((item) => {
              const heightPercent = item.amount > 0 ? Math.min(100, Math.max(8, (item.amount / maxDailySpend) * 100)) : 2;
              const isPastOrToday = item.day <= currentDay;
              const isToday = item.day === currentDay;

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[11px] font-mono text-slate-200 z-20 whitespace-nowrap shadow-lg">
                    Day {item.day}: {formatCurrency(item.amount, baseCurrency)} ({item.count} tx)
                  </div>

                  {/* Bar element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isToday
                        ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                        : item.amount > 0
                        ? 'bg-emerald-500/80 hover:bg-emerald-400'
                        : isPastOrToday
                        ? 'bg-slate-800/40 hover:bg-slate-700/60'
                        : 'bg-slate-900/30'
                    }`}
                  />
                  {/* Day label */}
                  {(item.day === 1 || item.day % 5 === 0 || item.day === daysInMonth) && (
                    <span className="text-[10px] text-slate-500 font-mono mt-2 tabular-nums">
                      {item.day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Column */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">
                Category Allocations
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {categoryBreakdown.length} active
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Current burn distribution against category ceilings
            </p>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {categoryBreakdown.slice(0, 5).map((cat) => {
                const color = CATEGORY_COLORS[cat.category] || '#94a3b8';
                const percent = Math.min(100, Math.round(cat.percentUsed));

                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-200 font-medium">
                          {cat.category}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-300">
                        {formatCurrency(cat.spent, baseCurrency)}
                        <span className="text-slate-500 text-[11px] ml-1">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                    {/* Linear progress bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%`, backgroundColor: color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('transactions')}
            className="w-full mt-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
          >
            Review All Transactions
          </button>
        </div>
      </div>

      {/* Recent Transactions Ledger Stream */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Recent Disbursements
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live encrypted transaction feed with multi-currency conversion
            </p>
          </div>
          <button
            onClick={() => onSelectTab('transactions')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ledger Table (High Density & Clean Unboxed Metadata) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-medium">
                <th className="pb-3 pr-4">Merchant & Note</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Method</th>
                <th className="pb-3 pl-4 text-right">Amount ({baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 6).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-100 flex items-center gap-2">
                      <span>{tx.merchant}</span>
                      {tx.isRecurring && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Recurring)
                        </span>
                      )}
                    </div>
                    {tx.encryptedNotes && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-xs">{tx.encryptedNotes}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">
                    {tx.category}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                    <div className="text-slate-100">
                      {formatCurrency(tx.amountInBase, baseCurrency)}
                    </div>
                    {tx.currency !== baseCurrency && (
                      <div className="text-[11px] text-slate-500 font-normal">
                        Orig: {formatCurrency(tx.amount, tx.currency)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
