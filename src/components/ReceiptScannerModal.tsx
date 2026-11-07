import React, { useState } from 'react';
import { CurrencyCode, ExpenseCategory, Transaction } from '../types/finance';
import { SAMPLE_RECEIPTS, scanReceiptWithAI, ScannedReceiptResult } from '../services/receiptScanner';
import { convertCurrency, formatCurrency } from '../utils/currencies';
import {
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: CurrencyCode;
  onSaveScannedExpense: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  baseCurrency,
  onSaveScannedExpense,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [scannedResult, setScannedResult] = useState<ScannedReceiptResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle preset sample receipt selection
  const handleSelectSample = (sample: typeof SAMPLE_RECEIPTS[0]) => {
    setIsScanning(true);
    setScanStepText('Synthesizing image via Gemini 3.8 Flash multimodal vision...');
    setPreviewImage(sample.thumbnail);

    setTimeout(() => {
      setScanStepText('Extracting line items, sales tax, and merchant metadata...');
    }, 600);

    setTimeout(() => {
      setScannedResult(sample.mockData);
      setIsScanning(false);
    }, 1200);
  };

  // Handle user's uploaded receipt image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setIsScanning(true);
      setScanStepText('Uploading to server & invoking Gemini 3.8 Flash OCR...');

      try {
        const result = await scanReceiptWithAI(base64, file.type);
        setScannedResult(result);
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm and save expense
  const handleConfirmAndSave = () => {
    if (!scannedResult) return;

    const amountInBase = convertCurrency(
      scannedResult.totalAmount,
      scannedResult.currency,
      baseCurrency
    );

    onSaveScannedExpense({
      merchant: scannedResult.merchant,
      amount: scannedResult.totalAmount,
      currency: scannedResult.currency,
      amountInBase,
      category: scannedResult.category,
      date: scannedResult.date,
      paymentMethod: scannedResult.paymentMethod,
      taxAmount: scannedResult.taxAmount,
      encryptedNotes: scannedResult.notes,
      items: scannedResult.items,
      receiptImage: previewImage || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c101c] border border-slate-800 shadow-2xl p-6 text-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Automated Receipt Scanner
              </h2>
              <p className="text-xs text-slate-400">
                Gemini 3.8 Flash Multimodal OCR extraction for physical & digital receipts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-6">
          {!scannedResult && !isScanning && (
            <>
              {/* Dropzone Upload */}
              <label className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/30 group">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  Upload receipt photo or invoice
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPEG, WEBP up to 25MB · Camera capture supported
                </p>
              </label>

              {/* Instant Test Presets */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-medium text-slate-300">
                    Or select an instant sample receipt:
                  </span>
                  <span>Instant OCR simulation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_RECEIPTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60">
                        <img
                          src={sample.thumbnail}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {sample.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {sample.subtitle}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Scanning Animation State */}
          {isScanning && (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin flex items-center justify-center" />
                <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">
                  Scanning Receipt with Gemini Multimodal AI
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {scanStepText}
                </p>
              </div>
            </div>
          )}

          {/* Scanned Result Review */}
          {scannedResult && !isScanning && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      Scan Completed ({Math.round(scannedResult.rawConfidence * 100)}% Confidence)
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white mt-1">
                    {scannedResult.merchant}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {scannedResult.date} · {scannedResult.category} · {scannedResult.paymentMethod}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Amount</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(scannedResult.totalAmount, scannedResult.currency)}
                  </div>
                  {scannedResult.currency !== baseCurrency && (
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      ≈ {formatCurrency(
                        convertCurrency(scannedResult.totalAmount, scannedResult.currency, baseCurrency),
                        baseCurrency
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Line Items */}
              {scannedResult.items && scannedResult.items.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2">
                    Itemized Items ({scannedResult.items.length})
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {scannedResult.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs font-mono"
                      >
                        <span className="text-slate-300">
                          {item.quantity ? `${item.quantity}x ` : ''}
                          {item.name}
                        </span>
                        <span className="text-slate-100 font-semibold tabular-nums">
                          {formatCurrency(item.price, scannedResult.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Details In-Place */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Merchant</label>
                  <input
                    type="text"
                    value={scannedResult.merchant}
                    onChange={(e) =>
                      setScannedResult({ ...scannedResult, merchant: e.target.value })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Total ({scannedResult.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={scannedResult.totalAmount}
                    onChange={(e) =>
                      setScannedResult({
                        ...scannedResult,
                        totalAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {scannedResult ? (
            <button
              onClick={() => {
                setScannedResult(null);
                setPreviewImage(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ← Scan Another Receipt
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-mono">
              Ready for real-time document analysis
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {scannedResult && (
              <button
                onClick={handleConfirmAndSave}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Log to Ledger</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
