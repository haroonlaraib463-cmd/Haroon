import React from 'react';
import { FinancialNotification } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { Bell, X, CheckCheck, Trash2, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: FinancialNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 240 }}
        className="w-full max-w-md h-full bg-[#0c101c] border-l border-slate-800 shadow-2xl flex flex-col text-slate-100"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Real-Time Activity Feed
            </h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Chronological Audit Trail</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllAsRead}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClearAll}
              className="hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No recent notifications or alerts.
            </div>
          ) : (
            notifications.map((notif) => {
              const isTransaction = notif.type === 'transaction';
              const isAlert = notif.type === 'budget_warning' || notif.type === 'budget_exceeded';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    !notif.read
                      ? 'bg-slate-900/80 border-slate-700/80 ring-1 ring-emerald-500/20'
                      : 'bg-slate-900/30 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      {isAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <span>{notif.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.amount !== undefined && notif.currency && (
                    <div className="mt-2 text-xs font-mono font-semibold text-emerald-400">
                      Amount: {formatCurrency(notif.amount, notif.currency)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
