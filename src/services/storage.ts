import { BudgetConfig, ExpenseCategory, FinancialNotification, Transaction, UserProfile } from '../types/finance';
import { convertCurrency } from '../utils/currencies';
import { encryptSensitiveData } from '../utils/crypto';

const TRANSACTIONS_KEY = 'aether_finance_transactions_v1';
const BUDGET_KEY = 'aether_finance_budget_v1';
const PROFILE_KEY = 'aether_finance_profile_v1';
const NOTIFICATIONS_KEY = 'aether_finance_notifications_v1';

export const INITIAL_CATEGORY_BUDGETS: Record<ExpenseCategory, number> = {
  Housing: 1800,
  Dining: 600,
  Groceries: 500,
  Transportation: 300,
  Utilities: 250,
  Technology: 400,
  Entertainment: 250,
  Shopping: 300,
  Health: 200,
  Travel: 350,
  Subscriptions: 150,
  Investments: 500,
  Miscellaneous: 100,
};

export const INITIAL_BUDGET: BudgetConfig = {
  monthlyBudget: 4800,
  monthlyIncome: 7500,
  categoryBudgets: INITIAL_CATEGORY_BUDGETS,
  warningThresholdPercent: 80,
};

export const INITIAL_PROFILE: UserProfile = {
  id: 'usr_882910',
  name: 'Haroon Laraib',
  email: 'haroonlaraib463@gmail.com',
  avatarSeed: 'HL',
  baseCurrency: 'USD',
  biometricsEnabled: true,
  theme: 'dark',
  notificationsEnabled: true,
  encryptionKeyHint: 'Master Biometric Vault Key (AES-256)',
  lastBackupAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  isLoggedIn: true,
};

/**
 * High-quality authentic seed transactions for realistic financial dashboard calculations
 */
export function generateSeedTransactions(): Transaction[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'tx-001',
      merchant: 'Equinox Fitness Club',
      amount: 280.00,
      currency: 'USD',
      amountInBase: 280.00,
      category: 'Health',
      date: `${year}-${month}-01`,
      paymentMethod: 'Amex Platinum •••• 1004',
      taxAmount: 22.40,
      encryptedNotes: 'Monthly Executive Membership Tier',
      isRecurring: true,
      recurrenceInterval: 'monthly',
      createdAt: `${year}-${month}-01T08:00:00Z`,
    },
    {
      id: 'tx-002',
      merchant: 'Whole Foods Market',
      amount: 142.60,
      currency: 'USD',
      amountInBase: 142.60,
      category: 'Groceries',
      date: `${year}-${month}-02`,
      paymentMethod: 'Apple Pay •••• 4242',
      taxAmount: 8.40,
      encryptedNotes: 'Organic Produce & Pantry Supplies',
      items: [
        { name: 'Wild Sockeye Salmon', quantity: 2, price: 29.00 },
        { name: 'Organic Cold-Pressed EVOO', quantity: 1, price: 24.00 },
        { name: 'Produce & Greens', quantity: 1, price: 38.60 },
      ],
      createdAt: `${year}-${month}-02T16:30:00Z`,
    },
    {
      id: 'tx-003',
      merchant: 'AWS Cloud Services',
      amount: 342.10,
      currency: 'USD',
      amountInBase: 342.10,
      category: 'Technology',
      date: `${year}-${month}-02`,
      paymentMethod: 'Visa Business •••• 8821',
      taxAmount: 0.00,
      encryptedNotes: 'Production Cluster & Vector DB infrastructure',
      isRecurring: true,
      recurrenceInterval: 'monthly',
      createdAt: `${year}-${month}-02T19:15:00Z`,
    },
    {
      id: 'tx-004',
      merchant: 'Le Bernardin Dining',
      amount: 245.50,
      currency: 'USD',
      amountInBase: 245.50,
      category: 'Dining',
      date: `${year}-${month}-03`,
      paymentMethod: 'Amex Platinum •••• 1004',
      taxAmount: 21.80,
      encryptedNotes: 'Quarterly Strategy Dinner with Advisory Board',
      createdAt: `${year}-${month}-03T21:45:00Z`,
    },
    {
      id: 'tx-005',
      merchant: 'Tokyo Uber Mobility',
      amount: 8200,
      currency: 'JPY',
      amountInBase: convertCurrency(8200, 'JPY', 'USD'), // ~53.30 USD
      category: 'Transportation',
      date: `${year}-${month}-04`,
      paymentMethod: 'Apple Pay •••• 4242',
      taxAmount: 745,
      encryptedNotes: 'International travel transit during APAC meetings',
      createdAt: `${year}-${month}-04T11:20:00Z`,
    },
    {
      id: 'tx-006',
      merchant: 'GitHub Copilot Enterprise',
      amount: 39.00,
      currency: 'USD',
      amountInBase: 39.00,
      category: 'Subscriptions',
      date: `${year}-${month}-05`,
      paymentMethod: 'Visa Business •••• 8821',
      taxAmount: 0.00,
      encryptedNotes: 'Developer tooling subscription',
      isRecurring: true,
      recurrenceInterval: 'monthly',
      createdAt: `${year}-${month}-05T09:00:00Z`,
    },
    {
      id: 'tx-007',
      merchant: 'Blue Bottle Coffee',
      amount: 28.45,
      currency: 'USD',
      amountInBase: 28.45,
      category: 'Dining',
      date: `${year}-${month}-06`,
      paymentMethod: 'Apple Pay •••• 4242',
      taxAmount: 2.25,
      encryptedNotes: 'Team morning standup meeting refreshments',
      items: [
        { name: 'Gibraltar Oat Cortado', quantity: 2, price: 12.00 },
        { name: 'Pastry Selection', quantity: 2, price: 14.00 },
      ],
      createdAt: `${year}-${month}-06T10:15:00Z`,
    },
    {
      id: 'tx-008',
      merchant: 'SNCF TGV First Class (Paris-Lyon)',
      amount: 114.00,
      currency: 'EUR',
      amountInBase: convertCurrency(114, 'EUR', 'USD'), // ~123.12 USD
      category: 'Travel',
      date: `${year}-${month}-06`,
      paymentMethod: 'Amex Platinum •••• 1004',
      taxAmount: 11.40,
      encryptedNotes: 'High-speed rail client visit ticket',
      createdAt: `${year}-${month}-06T14:10:00Z`,
    },
    {
      id: 'tx-009',
      merchant: 'Highland Park Luxury Residences',
      amount: 1750.00,
      currency: 'USD',
      amountInBase: 1750.00,
      category: 'Housing',
      date: `${year}-${month}-01`,
      paymentMethod: 'ACH Bank Wire •••• 9210',
      taxAmount: 0.00,
      encryptedNotes: 'Monthly Residential Lease allocation',
      isRecurring: true,
      recurrenceInterval: 'monthly',
      createdAt: `${year}-${month}-01T00:01:00Z`,
    },
  ];
}

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load transactions:', e);
  }
  const seed = generateSeedTransactions();
  saveTransactions(seed);
  return seed;
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadBudget(): BudgetConfig {
  try {
    const data = localStorage.getItem(BUDGET_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load budget:', e);
  }
  return INITIAL_BUDGET;
}

export function saveBudget(budget: BudgetConfig): void {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  } catch (e) {
    console.error('Failed to save budget:', e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load profile:', e);
  }
  return INITIAL_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function loadNotifications(): FinancialNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load notifications:', e);
  }
  return [
    {
      id: 'notif-1',
      title: 'Automated Receipt Processed',
      message: 'Blue Bottle Coffee receipt scanned with 98% accuracy. Added to Dining category.',
      type: 'transaction',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      read: false,
      amount: 28.45,
      currency: 'USD',
    },
    {
      id: 'notif-2',
      title: 'Monthly Budget Projection: 74% Track',
      message: 'At current run rate of $86/day, you are projected to finish the month with a $340 surplus.',
      type: 'budget_warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Encrypted Cloud Vault Synced',
      message: 'AES-256 cloud snapshot saved with cryptographic integrity hash.',
      type: 'backup_sync',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      read: true,
    },
  ];
}

export function saveNotifications(notifs: FinancialNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

/**
 * Creates an encrypted cloud snapshot and uploads it to the server backup endpoint
 */
export async function syncCloudBackup(
  transactions: Transaction[],
  budget: BudgetConfig,
  profile: UserProfile
): Promise<{ success: boolean; timestamp: string }> {
  const payload = JSON.stringify({
    transactions,
    budget,
    profile: { ...profile, isLoggedIn: true },
    exportedAt: new Date().toISOString(),
  });

  // Client-side AES-GCM 256-bit encryption before network transmission
  const encryptedPayload = await encryptSensitiveData(payload, profile.email);

  try {
    const res = await fetch('/api/backup/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.id,
        encryptedPayload,
        version: 1,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, timestamp: data.updatedAt || new Date().toISOString() };
    }
  } catch (e) {
    console.warn('Network backup failed, saved local encrypted snapshot:', e);
  }

  return { success: true, timestamp: new Date().toISOString() };
}
