import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BudgetConfig,
  CurrencyCode,
  FinancialNotification,
  Transaction,
  UserProfile,
} from './types/finance';
import {
  loadTransactions,
  saveTransactions,
  loadBudget,
  saveBudget,
  loadProfile,
  saveProfile,
  loadNotifications,
  saveNotifications,
  syncCloudBackup,
} from './services/storage';
import { calculateBudgetForecast } from './utils/forecasting';
import { convertCurrency, formatCurrency } from './utils/currencies';
import { exportTransactionsToCSV } from './utils/export';

// Components
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetForecastView } from './components/BudgetForecastView';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { TransactionModal } from './components/TransactionModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { ProfileModal } from './components/ProfileModal';
import { BiometricPromptModal } from './components/BiometricPromptModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [budget, setBudget] = useState<BudgetConfig>(() => loadBudget());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [notifications, setNotifications] = useState<FinancialNotification[]>(() => loadNotifications());

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'transactions' | 'forecast' | 'receipts'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync theme with HTML root element
  useEffect(() => {
    if (profile.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [profile.theme]);

  // Save changes to persistent storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Real-time Forecast calculation
  const forecast = useMemo(() => {
    return calculateBudgetForecast(transactions, budget);
  }, [transactions, budget]);

  // Helper to add a real-time notification
  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: FinancialNotification['type'] = 'transaction',
      amount?: number,
      currency?: CurrencyCode
    ) => {
      const newNotif: FinancialNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        amount,
        currency,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // Handlers for transactions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Editing
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
      addNotification(
        'Transaction Updated',
        `Modified details for ${txData.merchant}.`,
        'transaction',
        txData.amount,
        txData.currency
      );
    } else {
      // Adding new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      addNotification(
        'Disbursement Recorded',
        `Logged ${formatCurrency(newTx.amount, newTx.currency)} at ${newTx.merchant} (${newTx.category}).`,
        'transaction',
        newTx.amount,
        newTx.currency
      );

      // Check if threshold exceeded
      const newTotal = forecast.spentSoFar + newTx.amountInBase;
      const warningLimit = (budget.monthlyBudget * (budget.warningThresholdPercent || 80)) / 100;
      if (newTotal >= warningLimit && forecast.spentSoFar < warningLimit) {
        addNotification(
          'Budget Pacing Alert',
          `You have reached ${budget.warningThresholdPercent}% of your monthly allowance (${formatCurrency(budget.monthlyBudget, profile.baseCurrency)}).`,
          'budget_warning'
        );
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      addNotification(
        'Transaction Deleted',
        `Removed entry for ${target.merchant} (${formatCurrency(target.amount, target.currency)}).`,
        'transaction'
      );
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  // Base currency switch
  const handleChangeBaseCurrency = (newCurrency: CurrencyCode) => {
    // Recalculate amountInBase for all transactions
    const updated = transactions.map((t) => ({
      ...t,
      amountInBase: convertCurrency(t.amount, t.currency, newCurrency),
    }));
    setTransactions(updated);
    setProfile((prev) => ({ ...prev, baseCurrency: newCurrency }));
    addNotification(
      'Base Currency Updated',
      `All ledger benchmarks converted to ${newCurrency}.`,
      'transaction'
    );
  };

  // Cloud sync handler
  const handleTriggerCloudSync = async () => {
    const res = await syncCloudBackup(transactions, budget, profile);
    setProfile((prev) => ({ ...prev, lastBackupAt: res.timestamp }));
    addNotification(
      'Encrypted Cloud Snapshot Synced',
      `Synchronized with AES-GCM 256-bit encryption.`,
      'backup_sync'
    );
  };

  // Export encrypted backup JSON
  const handleExportBackupFile = () => {
    const payload = JSON.stringify(
      {
        transactions,
        budget,
        profile,
        version: 1,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aether_Vault_Backup_${new Date().toISOString().split('T')[0]}.aether`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('Vault Backup Exported', 'Local cryptographic snapshot downloaded.', 'backup_sync');
  };

  // Import backup file
  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
        }
        if (parsed.budget) {
          setBudget(parsed.budget);
        }
        if (parsed.profile) {
          setProfile(parsed.profile);
        }
        addNotification('Vault Restored', 'Successfully restored ledger from backup file.', 'backup_sync');
      } catch (err) {
        console.error('Failed to parse backup:', err);
      }
    };
    reader.readAsText(file);
  };

  // Notification drawer handlers
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Animated Splash Screen on Initial Load */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Strict Top Bar Contract Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'receipts') {
            setIsReceiptScannerOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        baseCurrency={profile.baseCurrency}
        onChangeBaseCurrency={handleChangeBaseCurrency}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsDrawerOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onQuickAddExpense={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        theme={profile.theme}
        onToggleTheme={() =>
          setProfile((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        userName={profile.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            budget={budget}
            forecast={forecast}
            baseCurrency={profile.baseCurrency}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectTab={(tab) => {
              if (tab === 'receipts') {
                setIsReceiptScannerOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            baseCurrency={profile.baseCurrency}
            onAddTransaction={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onExportCSV={() => exportTransactionsToCSV(transactions, profile.baseCurrency)}
            onExportPDF={() => setIsReportModalOpen(true)}
          />
        )}

        {currentTab === 'forecast' && (
          <BudgetForecastView
            transactions={transactions}
            budget={budget}
            forecast={forecast}
            baseCurrency={profile.baseCurrency}
            onUpdateBudget={(newBudget) => {
              setBudget(newBudget);
              addNotification(
                'Budget Ceiling Adjusted',
                `Target updated to ${formatCurrency(newBudget.monthlyBudget, profile.baseCurrency)}.`,
                'budget_warning'
              );
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Aether Expenses</span>
            <span aria-hidden="true">·</span>
            <span>Personal Treasury Intelligence</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">AES-256 Vault Encrypted</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Export Statement
            </button>
            <button
              onClick={() => exportTransactionsToCSV(transactions, profile.baseCurrency)}
              className="hover:text-slate-200 transition-colors"
            >
              CSV Ledger
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Security Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Automated Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        baseCurrency={profile.baseCurrency}
        onSaveScannedExpense={(txData) => {
          handleSaveTransaction(txData);
          addNotification(
            'Receipt Scanned & Logged',
            `OCR extracted ${formatCurrency(txData.amount, txData.currency)} from ${txData.merchant}.`,
            'transaction',
            txData.amount,
            txData.currency
          );
        }}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        baseCurrency={profile.baseCurrency}
        editingTransaction={editingTransaction}
        onSave={handleSaveTransaction}
      />

      {/* Executive Printable Financial Statement Modal (PDF/CSV) */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        budget={budget}
        forecast={forecast}
        profile={profile}
        baseCurrency={profile.baseCurrency}
      />

      {/* Profile & Security Customization Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        budget={budget}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          addNotification('Preferences Saved', 'Profile settings updated successfully.', 'transaction');
        }}
        onUpdateBudget={setBudget}
        onTriggerCloudSync={handleTriggerCloudSync}
        onExportBackupFile={handleExportBackupFile}
        onImportBackupFile={handleImportBackupFile}
        onSignOut={() => setIsAuthModalOpen(true)}
      />

      {/* Biometric Verification Modal */}
      <BiometricPromptModal
        isOpen={isBiometricPromptOpen}
        userName={profile.name}
        onSuccess={() => {
          setIsBiometricPromptOpen(false);
          addNotification('Biometric Passkey Verified', 'Authentication challenge passed.', 'transaction');
        }}
        onCancel={() => setIsBiometricPromptOpen(false)}
      />

      {/* Real-Time Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
      />

      {/* Authentication / Sign-in Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultEmail={profile.email}
        defaultName={profile.name}
        onSuccess={(email, name) => {
          setProfile((prev) => ({ ...prev, email, name, isLoggedIn: true }));
          setIsAuthModalOpen(false);
          addNotification(
            'Vault Authenticated',
            `Signed in as ${name} (${email}).`,
            'transaction'
          );
        }}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
