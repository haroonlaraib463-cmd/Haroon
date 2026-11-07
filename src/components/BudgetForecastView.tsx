import React, { useState, useMemo } from 'react';
import { BudgetConfig, CurrencyCode, ExpenseCategory, FinancialForecast, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { calculateCategoryBreakdown } from '../utils/forecasting';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface BudgetForecastViewProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  forecast: FinancialForecast;
  baseCurrency: CurrencyCode;
  onUpdateBudget: (newBudget: BudgetConfig) => void;
}

export const BudgetForecastView: React.FC<BudgetForecastViewProps> = ({
  transactions,
  budget,
  forecast,
  baseCurrency,
  onUpdateBudget,
}) => {
  const [simulatedBudget, setSimulatedBudget] = useState(budget.monthlyBudget);
  const [velocityMultiplier, setVelocityMultiplier] = useState(1.0);

  // Recompute simulated outcomes in real-time
  const simulatedOutcome = useMemo(() => {
    const adjustedVelocity = forecast.dailyVelocity * velocityMultiplier;
    const projectedSpend =
      forecast.spentSoFar +
      adjustedVelocity * forecast.daysRemaining +
      forecast.scheduledRecurringPending;
    const variance = simulatedBudget - projectedSpend;
    const runwayDays =
      adjustedVelocity > 0
        ? Math.min(forecast.daysRemaining, Math.floor((simulatedBudget - forecast.spentSoFar) / adjustedVelocity))
        : forecast.daysRemaining;

    return {
      projectedSpend,
      variance,
      runwayDays,
      adjustedVelocity,
    };
  }, [forecast, simulatedBudget, velocityMultiplier]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions, budget);
  }, [transactions, budget]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Stochastic & Velocity Analysis</span>
          <span aria-hidden="true">·</span>
          <span>End-of-Month Run-Rate</span>
          <span aria-hidden="true">·</span>
          <span>Day {forecast.daysElapsed} of {forecast.totalDaysInMonth}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Real-Time Budget Forecasting
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Continuous algorithmic projection based on observed daily spending velocity, recurring commitments, and statistical scenario variance.
        </p>
      </div>

      {/* 3-Scenario Monte Carlo Modeling Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario 1: Conservative (Optimistic) */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-emerald-400">Conservative (-15%)</span>
              <span className="font-mono text-[11px] text-slate-500">Tuned Discretionary</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white my-2">
              {formatCurrency(forecast.projectedConservativeTotal, baseCurrency, false)}
            </div>
            <p className="text-xs text-slate-400">
              Assuming discretionary spending reduces by 15% for the remaining {forecast.daysRemaining} days.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Surplus at Month-End</span>
            <span className="text-emerald-400 font-mono font-medium">
              +{formatCurrency(budget.monthlyBudget - forecast.projectedConservativeTotal, baseCurrency, false)}
            </span>
          </div>
        </div>

        {/* Scenario 2: Baseline (Current Run-Rate) */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/40 relative flex flex-col justify-between shadow-lg">
          <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            CURRENT BASELINE
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-200">Baseline Extrapolation</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white my-2">
              {formatCurrency(forecast.projectedBaselineTotal, baseCurrency, false)}
            </div>
            <p className="text-xs text-slate-400">
              Extrapolating exact observed velocity ({formatCurrency(forecast.dailyVelocity, baseCurrency, false)}/day) + scheduled recurring.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Estimated Variance</span>
            <span
              className={`font-mono font-medium ${
                forecast.projectedSurplusOrDeficit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {forecast.projectedSurplusOrDeficit >= 0 ? '+' : ''}
              {formatCurrency(forecast.projectedSurplusOrDeficit, baseCurrency, false)}
            </span>
          </div>
        </div>

        {/* Scenario 3: Aggressive Surge (+20%) */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-amber-400">Surge Shock (+20%)</span>
              <span className="font-mono text-[11px] text-slate-500">Weekend & Travel Surge</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white my-2">
              {formatCurrency(forecast.projectedAggressiveTotal, baseCurrency, false)}
            </div>
            <p className="text-xs text-slate-400">
              Simulating a 20% spike in discretionary expenses over weekends or seasonal outings.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Projected Position</span>
            <span
              className={`font-mono font-medium ${
                budget.monthlyBudget >= forecast.projectedAggressiveTotal ? 'text-slate-300' : 'text-rose-400'
              }`}
            >
              {formatCurrency(budget.monthlyBudget - forecast.projectedAggressiveTotal, baseCurrency, false)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive What-If Scenario Simulator */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Interactive Scenario Simulator
            </h2>
          </div>
          <button
            onClick={() => {
              setSimulatedBudget(budget.monthlyBudget);
              setVelocityMultiplier(1.0);
            }}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Reset Simulator
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Monthly Budget Ceiling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Monthly Budget</span>
              <span className="text-slate-200 font-mono font-semibold tabular-nums">
                {formatCurrency(simulatedBudget, baseCurrency)}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="10000"
              step="100"
              value={simulatedBudget}
              onChange={(e) => setSimulatedBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{formatCurrency(2000, baseCurrency, false)}</span>
              <span>{formatCurrency(6000, baseCurrency, false)}</span>
              <span>{formatCurrency(10000, baseCurrency, false)}</span>
            </div>
          </div>

          {/* Slider 2: Daily Velocity Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Discretionary Velocity Adjustment</span>
              <span className="text-slate-200 font-mono font-semibold tabular-nums">
                {(velocityMultiplier * 100).toFixed(0)}% (
                {formatCurrency(simulatedOutcome.adjustedVelocity, baseCurrency, false)}/day)
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={velocityMultiplier}
              onChange={(e) => setVelocityMultiplier(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50% (Strict)</span>
              <span>Baseline (100%)</span>
              <span>+100% (Surge)</span>
            </div>
          </div>
        </div>

        {/* Real-Time Simulated Output Strip */}
        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-400">Simulated Month-End: </span>
            <span className="text-white font-bold tabular-nums">
              {formatCurrency(simulatedOutcome.projectedSpend, baseCurrency, false)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Simulated Net Variance: </span>
            <span
              className={`font-bold tabular-nums ${
                simulatedOutcome.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {simulatedOutcome.variance >= 0 ? '+' : ''}
              {formatCurrency(simulatedOutcome.variance, baseCurrency, false)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Runway at this Velocity: </span>
            <span className="text-slate-200 font-bold tabular-nums">
              {simulatedOutcome.runwayDays} days
            </span>
          </div>
          {simulatedBudget !== budget.monthlyBudget && (
            <button
              onClick={() => onUpdateBudget({ ...budget, monthlyBudget: simulatedBudget })}
              className="px-3 py-1 bg-emerald-400 text-slate-950 rounded font-sans font-semibold hover:bg-emerald-300 transition-colors"
            >
              Save as New Target
            </button>
          )}
        </div>
      </div>

      {/* Category Exhaustion Risk Grid */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <h2 className="text-base font-semibold text-white mb-2">
          Category Runway & Burn-Rate Matrix
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Category-by-category burn velocity relative to allocated monthly ceilings
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-medium">
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3 text-right">Spent So Far</th>
                <th className="pb-3 px-3 text-right">Allocated Cap</th>
                <th className="pb-3 px-3 text-right">% Consumed</th>
                <th className="pb-3 px-3 text-right">Burn Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {categoryBreakdown.map((cat) => {
                const percent = Math.round(cat.percentUsed);
                const isOver = percent >= 100;
                const isWarning = percent >= 80 && !isOver;

                return (
                  <tr key={cat.category} className="hover:bg-slate-800/20">
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      {cat.category}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-100">
                      {formatCurrency(cat.spent, baseCurrency)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-400">
                      {formatCurrency(cat.allocatedBudget, baseCurrency)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span
                        className={
                          isOver ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400' : 'text-slate-300'
                        }
                      >
                        {percent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`text-[11px] font-sans ${
                          isOver
                            ? 'text-rose-400 font-semibold'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {isOver ? 'Over Budget' : isWarning ? 'Pacing High' : 'Nominal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
