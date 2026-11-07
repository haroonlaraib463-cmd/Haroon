export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'INR' | 'SGD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToBaseUSD: number; // Conversion rate relative to USD
}

export type ExpenseCategory =
  | 'Housing'
  | 'Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Technology'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Travel'
  | 'Subscriptions'
  | 'Investments'
  | 'Miscellaneous';

export interface ReceiptLineItem {
  name: string;
  quantity?: number;
  price: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number; // In the transaction's original currency
  currency: CurrencyCode;
  amountInBase: number; // Converted to user's primary base currency
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: string;
  taxAmount?: number;
  encryptedNotes?: string; // AES-GCM encrypted string
  isNotesEncrypted?: boolean;
  receiptImage?: string; // Base64 or preview thumbnail
  isRecurring?: boolean;
  recurrenceInterval?: 'monthly' | 'yearly' | 'weekly';
  items?: ReceiptLineItem[];
  createdAt: string;
}

export interface BudgetConfig {
  monthlyBudget: number; // In base currency
  monthlyIncome: number;
  categoryBudgets: Record<ExpenseCategory, number>;
  warningThresholdPercent: number; // e.g., 80
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
  baseCurrency: CurrencyCode;
  biometricsEnabled: boolean;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  encryptionKeyHint: string;
  lastBackupAt?: string;
  isLoggedIn: boolean;
}

export interface FinancialForecast {
  daysElapsed: number;
  totalDaysInMonth: number;
  daysRemaining: number;
  spentSoFar: number;
  dailyVelocity: number;
  scheduledRecurringPending: number;
  projectedBaselineTotal: number;
  projectedConservativeTotal: number;
  projectedAggressiveTotal: number;
  projectedSurplusOrDeficit: number;
  burnRateRunwayDays: number;
  recommendedDailyCap: number;
  paceStatus: 'optimal' | 'caution' | 'critical';
  insightSummary: string;
}

export interface FinancialNotification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'budget_warning' | 'budget_exceeded' | 'recurring_bill' | 'backup_sync';
  timestamp: string;
  read: boolean;
  amount?: number;
  currency?: CurrencyCode;
}
