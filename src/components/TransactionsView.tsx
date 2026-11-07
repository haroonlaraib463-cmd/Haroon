import React, { useState, useMemo } from 'react';
import { CurrencyCode, ExpenseCategory, Transaction } from '../types/finance';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../utils/currencies';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Download,
  Trash2,
  Edit2,
  FileText,
  Lock,
  ChevronDown,
  ArrowUpDown,
  ListFilter,
  Check,
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  baseCurrency: CurrencyCode;
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenReceiptScanner: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Dining',
  'Groceries',
  'Transportation',
  'Utilities',
  'Technology',
  'Entertainment',
  'Shopping',
  'Health',
  'Travel',
  'Subscriptions',
  'Investments',
  'Miscellaneous',
];

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  baseCurrency,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenReceiptScanner,
  onExportCSV,
  onExportPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.encryptedNotes && tx.encryptedNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
        const matchesCurrency = selectedCurrency === 'all' || tx.currency === selectedCurrency;

        return matchesSearch && matchesCategory && matchesCurrency;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amountInBase - a.amountInBase;
        if (sortBy === 'amount-asc') return a.amountInBase - b.amountInBase;
        return 0;
      });
  }, [transactions, searchTerm, selectedCategory, selectedCurrency, sortBy]);

  const totalFilteredSum = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.amountInBase || 0), 0);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* View Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Primary Ledger</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{transactions.length} Total Records</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Multi-Currency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Transactions & Ledgers
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Download formatted RFC CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Print Executive Statement"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Statement PDF</span>
          </button>
          <button
            onClick={onOpenReceiptScanner}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Receipt</span>
          </button>
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search merchant, payment method, or encrypted note..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Dropdown */}
          <div className="w-full md:w-36">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Currencies</option>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Active Filter Metrics */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
          <span>
            Showing {filteredTransactions.length} of {transactions.length} entries
          </span>
          <span className="text-slate-200 font-semibold tabular-nums">
            Filtered Total: {formatCurrency(totalFilteredSum, baseCurrency)}
          </span>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              No matching transactions found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing category filters, or log a new transaction.
            </p>
            <button
              onClick={onAddTransaction}
              className="mt-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-xs text-slate-400 font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Merchant & Items</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Original Amount</th>
                  <th className="py-3 px-4 text-right">In {baseCurrency}</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const hasItems = tx.items && tx.items.length > 0;

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-slate-800/30 transition-colors group">
                        {/* Date */}
                        <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap">
                          {tx.date}
                        </td>

                        {/* Merchant */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-100">
                              {tx.merchant}
                            </span>
                            {tx.isRecurring && (
                              <span className="text-[10px] text-emerald-400 font-mono">
                                [Recurring]
                              </span>
                            )}
                            {hasItems && (
                              <button
                                onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                              >
                                {tx.items?.length} items {isExpanded ? '▲' : '▼'}
                              </button>
                            )}
                          </div>
                          {tx.encryptedNotes && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate max-w-sm">{tx.encryptedNotes}</span>
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-xs text-slate-300 whitespace-nowrap">
                          {tx.category}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {tx.paymentMethod}
                        </td>

                        {/* Original Currency Amount */}
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-slate-400 whitespace-nowrap">
                          {formatCurrency(tx.amount, tx.currency)}
                        </td>

                        {/* Base Currency Amount */}
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-100 whitespace-nowrap">
                          {formatCurrency(tx.amountInBase, baseCurrency)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded itemized lines row */}
                      {isExpanded && hasItems && (
                        <tr className="bg-slate-950/60 border-y border-slate-800">
                          <td colSpan={7} className="px-6 py-3">
                            <div className="text-xs font-semibold text-slate-300 mb-2">
                              Itemized Breakdown from Scanned Receipt:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {tx.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/60 font-mono"
                                >
                                  <span className="text-slate-300">
                                    {item.quantity ? `${item.quantity}x ` : ''}
                                    {item.name}
                                  </span>
                                  <span className="text-slate-100 tabular-nums">
                                    {formatCurrency(item.price, tx.currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {tx.taxAmount !== undefined && tx.taxAmount > 0 && (
                              <div className="mt-2 text-right text-xs text-slate-400 font-mono">
                                Sales Tax / VAT: {formatCurrency(tx.taxAmount, tx.currency)}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
