import React, { useState, useEffect } from 'react';
import { CurrencyCode, ExpenseCategory, ReceiptLineItem, Transaction } from '../types/finance';
import { convertCurrency, formatCurrency, SUPPORTED_CURRENCIES } from '../utils/currencies';
import { encryptSensitiveData } from '../utils/crypto';
import { X, Lock, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: CurrencyCode;
  editingTransaction?: Transaction | null;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, id?: string) => void;
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

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  baseCurrency,
  editingTransaction,
  onSave,
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [category, setCategory] = useState<ExpenseCategory>('Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay •••• 4242');
  const [taxAmount, setTaxAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isNotesEncrypted, setIsNotesEncrypted] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [items, setItems] = useState<ReceiptLineItem[]>([]);

  useEffect(() => {
    if (editingTransaction) {
      setMerchant(editingTransaction.merchant);
      setAmount(editingTransaction.amount);
      setCurrency(editingTransaction.currency);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setTaxAmount(editingTransaction.taxAmount || '');
      setNotes(editingTransaction.encryptedNotes || '');
      setIsNotesEncrypted(editingTransaction.isNotesEncrypted ?? true);
      setIsRecurring(editingTransaction.isRecurring ?? false);
      setRecurrenceInterval(editingTransaction.recurrenceInterval || 'monthly');
      setItems(editingTransaction.items || []);
    } else {
      setMerchant('');
      setAmount('');
      setCurrency(baseCurrency);
      setCategory('Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Apple Pay •••• 4242');
      setTaxAmount('');
      setNotes('');
      setIsNotesEncrypted(true);
      setIsRecurring(false);
      setRecurrenceInterval('monthly');
      setItems([]);
    }
  }, [editingTransaction, baseCurrency, isOpen]);

  if (!isOpen) return null;

  const numericAmount = typeof amount === 'number' ? amount : 0;
  const convertedToBase = convertCurrency(numericAmount, currency, baseCurrency);

  const handleAddItem = () => {
    setItems([...items, { name: '', price: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ReceiptLineItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || numericAmount <= 0) return;

    onSave(
      {
        merchant: merchant.trim(),
        amount: numericAmount,
        currency,
        amountInBase: convertedToBase,
        category,
        date,
        paymentMethod,
        taxAmount: typeof taxAmount === 'number' ? taxAmount : undefined,
        encryptedNotes: notes.trim() || undefined,
        isNotesEncrypted,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        items: items.length > 0 ? items : undefined,
      },
      editingTransaction?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c101c] border border-slate-800 shadow-2xl p-6 text-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record New Expense'}
            </h2>
            <p className="text-xs text-slate-400">
              High-accuracy financial ledger entry with multi-currency conversion
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-5 space-y-4">
          {/* Merchant & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Merchant / Payee *
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Apple Fifth Avenue, Delta Air"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Amount *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full pl-3 pr-20 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  {currency}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-Currency Conversion Preview */}
          {currency !== baseCurrency && numericAmount > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between font-mono">
              <span>Automatic Conversion to Base ({baseCurrency}):</span>
              <span className="text-emerald-400 font-semibold tabular-nums">
                {formatCurrency(convertedToBase, baseCurrency)}
              </span>
            </div>
          )}

          {/* Date, Payment Method & Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g. Apple Pay, Amex •••• 1004"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sales Tax / VAT (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxAmount}
                onChange={(e) =>
                  setTaxAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Recurring Expense Checkbox */}
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Recurring Subscription / Scheduled Bill
              </div>
              <div className="text-[11px] text-slate-400">
                Auto-factors into month-end runway and forecast calculations
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRecurring && (
                <select
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value as any)}
                  className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Encrypted Sensitive Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Notes & Sensitive Metadata</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">
                AES-GCM 256-bit Encrypted
              </span>
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tax deduction reference, invoice number, or client expense reason..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Optional Itemized Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                Itemized Line Breakdown ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity || 1}
                  onChange={(e) =>
                    handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)
                  }
                  className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-100"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={item.price || ''}
                  onChange={(e) =>
                    handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)
                  }
                  className="w-24 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              {editingTransaction ? 'Save Changes' : 'Confirm & Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
