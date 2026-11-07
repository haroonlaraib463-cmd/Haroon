import { BudgetConfig, ExpenseCategory, FinancialForecast, Transaction } from '../types/finance';

/**
 * Calculates high-precision real-time budget forecasting and run-rate projections
 */
export function calculateBudgetForecast(
  transactions: Transaction[],
  budget: BudgetConfig,
  currentDate: Date = new Date()
): FinancialForecast {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayOfMonth = currentDate.getDate();

  const daysElapsed = Math.max(1, dayOfMonth);
  const daysRemaining = Math.max(0, daysInMonth - daysElapsed);

  // Filter current month's transactions
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const spentSoFar = currentMonthTransactions.reduce((acc, t) => acc + (t.amountInBase || 0), 0);

  // Identify recurring subscriptions & scheduled commitments
  const recurringActive = transactions.filter((t) => t.isRecurring);
  // Recurring items that still need to be paid in the remainder of the month
  let scheduledRecurringPending = 0;
  recurringActive.forEach((rec) => {
    const recDay = new Date(rec.date).getDate();
    // If recurring date is in the remaining days of this month
    if (recDay > dayOfMonth) {
      scheduledRecurringPending += rec.amountInBase;
    }
  });

  // Calculate daily velocity (discretionary spending run-rate)
  const nonRecurringSpent = currentMonthTransactions
    .filter((t) => !t.isRecurring)
    .reduce((acc, t) => acc + (t.amountInBase || 0), 0);

  const dailyVelocity = nonRecurringSpent / daysElapsed;

  // Baseline projection: current spent + (daily velocity * remaining days) + scheduled recurring
  const projectedDiscretionary = dailyVelocity * daysRemaining;
  const projectedBaselineTotal = spentSoFar + projectedDiscretionary + scheduledRecurringPending;

  // Scenario modeling
  // Conservative: Discretionary velocity moderates by 15%
  const projectedConservativeTotal =
    spentSoFar + projectedDiscretionary * 0.85 + scheduledRecurringPending;

  // Aggressive: Discretionary velocity surges by 20%
  const projectedAggressiveTotal =
    spentSoFar + projectedDiscretionary * 1.2 + scheduledRecurringPending;

  const monthlyBudget = budget.monthlyBudget || 4500;
  const projectedSurplusOrDeficit = monthlyBudget - projectedBaselineTotal;

  // Budget runway calculation
  const remainingBudget = Math.max(0, monthlyBudget - spentSoFar);
  const burnRateRunwayDays =
    dailyVelocity > 0 ? Math.min(daysRemaining, Math.floor(remainingBudget / dailyVelocity)) : daysRemaining;

  // Safe daily spending ceiling for the rest of the month
  const uncommittedBudget = Math.max(0, remainingBudget - scheduledRecurringPending);
  const recommendedDailyCap = daysRemaining > 0 ? uncommittedBudget / daysRemaining : 0;

  // Determine pacing status
  let paceStatus: 'optimal' | 'caution' | 'critical' = 'optimal';
  const projectedRatio = projectedBaselineTotal / monthlyBudget;
  if (projectedRatio > 1.0) {
    paceStatus = 'critical';
  } else if (projectedRatio >= (budget.warningThresholdPercent || 80) / 100) {
    paceStatus = 'caution';
  }

  // Generate actionable summary
  let insightSummary = '';
  if (paceStatus === 'optimal') {
    const surplusStr = Math.round(projectedSurplusOrDeficit);
    insightSummary = `Your spending velocity is disciplined. Projected month-end surplus is approx. $${surplusStr.toLocaleString()}. Safe daily allowance is $${Math.round(recommendedDailyCap)}/day.`;
  } else if (paceStatus === 'caution') {
    const projectedOverage = Math.round(projectedBaselineTotal - monthlyBudget * 0.8);
    insightSummary = `Velocity is elevated. You are tracking within 20% of your total budget ceiling. Keep daily spend below $${Math.round(recommendedDailyCap)} to protect your target.`;
  } else {
    const overage = Math.round(Math.abs(projectedSurplusOrDeficit));
    insightSummary = `Warning: Current burn rate projects an estimated budget breach of $${overage.toLocaleString()} by day ${daysInMonth}. Adjust discretionary expenses immediately.`;
  }

  return {
    daysElapsed,
    totalDaysInMonth: daysInMonth,
    daysRemaining,
    spentSoFar,
    dailyVelocity,
    scheduledRecurringPending,
    projectedBaselineTotal,
    projectedConservativeTotal,
    projectedAggressiveTotal,
    projectedSurplusOrDeficit,
    burnRateRunwayDays,
    recommendedDailyCap,
    paceStatus,
    insightSummary,
  };
}

/**
 * Computes category-level breakdown and percentage of assigned category budgets
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  budget: BudgetConfig,
  currentDate: Date = new Date()
): Array<{
  category: ExpenseCategory;
  spent: number;
  allocatedBudget: number;
  percentUsed: number;
  transactionCount: number;
}> {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totals: Record<string, { spent: number; count: number }> = {};

  currentMonthTransactions.forEach((t) => {
    if (!totals[t.category]) {
      totals[t.category] = { spent: 0, count: 0 };
    }
    totals[t.category].spent += t.amountInBase || 0;
    totals[t.category].count += 1;
  });

  const categories = Object.keys(totals) as ExpenseCategory[];

  return categories.map((cat) => {
    const spent = totals[cat].spent;
    const allocatedBudget = budget.categoryBudgets[cat] || (budget.monthlyBudget * 0.15);
    const percentUsed = allocatedBudget > 0 ? (spent / allocatedBudget) * 100 : 0;
    return {
      category: cat,
      spent,
      allocatedBudget,
      percentUsed,
      transactionCount: totals[cat].count,
    };
  }).sort((a, b) => b.spent - a.spent);
}
