import { BudgetConfig, CurrencyCode, Transaction } from '../types/finance';
import { formatCurrency } from './currencies';

/**
 * Generates an RFC-compliant CSV file and triggers a direct browser download.
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  baseCurrency: CurrencyCode = 'USD'
): void {
  const headers = [
    'Transaction ID',
    'Date',
    'Merchant',
    'Category',
    'Amount (Original)',
    'Currency',
    'Amount (Base USD/Equiv)',
    'Tax Amount',
    'Payment Method',
    'Recurring',
    'Created At',
  ];

  const escapeCSV = (str: string | number | undefined | boolean): string => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = transactions.map((t) => [
    escapeCSV(t.id),
    escapeCSV(t.date),
    escapeCSV(t.merchant),
    escapeCSV(t.category),
    escapeCSV(t.amount.toFixed(2)),
    escapeCSV(t.currency),
    escapeCSV(t.amountInBase.toFixed(2)),
    escapeCSV(t.taxAmount ? t.taxAmount.toFixed(2) : '0.00'),
    escapeCSV(t.paymentMethod),
    escapeCSV(t.isRecurring ? 'Yes' : 'No'),
    escapeCSV(t.createdAt),
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Aether_Expenses_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers the browser window print dialog styled for PDF export.
 */
export function triggerExecutivePDFPrint(): void {
  window.print();
}
