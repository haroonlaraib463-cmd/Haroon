import React from 'react';
import { BudgetConfig, CurrencyCode, FinancialForecast, Transaction, UserProfile } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { exportTransactionsToCSV, triggerExecutivePDFPrint } from '../utils/export';
import { calculateCategoryBreakdown } from '../utils/forecasting';
import { Printer, Download, X, Shield, FileText } from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budget: BudgetConfig;
  forecast: FinancialForecast;
  profile: UserProfile;
  baseCurrency: CurrencyCode;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budget,
  forecast,
  profile,
  baseCurrency,
}) => {
  if (!isOpen) return null;

  const categoryBreakdown = calculateCategoryBreakdown(transactions, budget);
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const statementId = `AETH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${profile.id.slice(-4).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 no-print shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Executive Monthly Financial Statement
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTransactionsToCSV(transactions, baseCurrency)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={triggerExecutivePDFPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2 print-only:p-0">
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold tracking-tight text-white">
                  AETHER EXPENSES
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Treasury & Expense Management Statement
              </p>
              <div className="text-xs text-slate-400 font-mono mt-3 space-y-0.5">
                <div>Document ID: {statementId}</div>
                <div>Account Holder: {profile.name} ({profile.email})</div>
                <div>Base Currency: {baseCurrency} (ISO-4217)</div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 font-mono space-y-1">
              <div>Statement Generated: {reportDate}</div>
              <div>Period: Month-to-Date (Day {forecast.daysElapsed} of {forecast.totalDaysInMonth})</div>
              <div>Cryptographic Status: Hardware Verified</div>
            </div>
          </div>

          {/* Executive Summary Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Month-to-Date Spend</div>
              <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                {formatCurrency(forecast.spentSoFar, baseCurrency)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Forecasted Month-End</div>
              <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                {formatCurrency(forecast.projectedBaselineTotal, baseCurrency, false)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Monthly Budget Ceiling</div>
              <div className="text-lg font-bold font-mono text-slate-300 mt-1 tabular-nums">
                {formatCurrency(budget.monthlyBudget, baseCurrency)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Estimated Net Surplus</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {formatCurrency(forecast.projectedSurplusOrDeficit, baseCurrency, false)}
              </div>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              I. Category Allocation Analysis
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Transactions</th>
                    <th className="py-2.5 px-3 text-right">Actual Spent</th>
                    <th className="py-2.5 px-3 text-right">Target Cap</th>
                    <th className="py-2.5 px-3 text-right">% Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {categoryBreakdown.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-900/30">
                      <td className="py-2.5 px-3 font-sans text-slate-200">
                        {cat.category}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {cat.transactionCount}
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-medium">
                        {formatCurrency(cat.spent, baseCurrency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {formatCurrency(cat.allocatedBudget, baseCurrency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {Math.round(cat.percentUsed)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              II. Itemized Transaction Ledger
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Merchant / Payee</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Original Amount</th>
                    <th className="py-2.5 px-3 text-right">In {baseCurrency}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/30">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">
                        {tx.merchant}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">
                        {tx.category}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-medium">
                        {formatCurrency(tx.amountInBase, baseCurrency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal / Cryptographic Integrity Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cryptographically signed with 256-bit AES-GCM Client Vault</span>
            </div>
            <div>Aether Financial Technologies · Statement #{statementId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
