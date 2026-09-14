import React, { useState, useRef, useCallback } from 'react';
import {
  Camera, Upload, X, Check, AlertCircle, Loader2,
  ChevronDown, Edit3, Receipt, Calendar, DollarSign,
  Tag, RefreshCw, Info,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { Transaction, TransactionType, EXPENSE_CATEGORIES } from '../types/finance';

interface ScanReceiptScreenProps {
  onSaveTransaction: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
  existingTransactions: Transaction[];
  currency: string;
}

type ScanStep = 'capture' | 'processing' | 'review' | 'success' | 'error';

interface ParsedReceipt {
  merchant: string;
  date: string;
  amount: number | null;
  category: string;
  rawText: string;
  confidence: number;
}

// ── Receipt parser ─────────────────────────────────────────────────────────────

const MERCHANT_TO_CATEGORY: Record<string, string> = {
  walmart: 'Groceries', kroger: 'Groceries', whole: 'Groceries', trader: 'Groceries',
  aldi: 'Groceries', lidl: 'Groceries', costco: 'Groceries', safeway: 'Groceries',
  carrefour: 'Groceries', tesco: 'Groceries', sainsbury: 'Groceries', asda: 'Groceries',
  mcdonald: 'Food', burger: 'Food', kfc: 'Food', subway: 'Food', pizza: 'Food',
  starbucks: 'Food', dunkin: 'Food', panera: 'Food', chipotle: 'Food', wendy: 'Food',
  uber: 'Transport', lyft: 'Transport', taxi: 'Transport', metro: 'Transport',
  shell: 'Transport', bp: 'Transport', exxon: 'Transport', chevron: 'Transport',
  amazon: 'Shopping', target: 'Shopping', bestbuy: 'Shopping', apple: 'Shopping',
  netflix: 'Subscriptions', spotify: 'Subscriptions', hulu: 'Subscriptions',
  cvs: 'Health', walgreen: 'Health', pharmacy: 'Health', hospital: 'Health',
  electric: 'Bills', internet: 'Bills', phone: 'Bills', att: 'Bills', verizon: 'Bills',
  hotel: 'Travel', airbnb: 'Travel', marriott: 'Travel', hilton: 'Travel',
  cinema: 'Entertainment', theater: 'Entertainment', netflix_: 'Entertainment',
  school: 'Education', university: 'Education', college: 'Education', tuition: 'Education',
};

function detectCategory(merchant: string, text: string): string {
  const combined = (merchant + ' ' + text).toLowerCase();
  for (const [keyword, category] of Object.entries(MERCHANT_TO_CATEGORY)) {
    if (combined.includes(keyword)) return category;
  }
  return 'Shopping';
}

function extractAmount(text: string): number | null {
  // Priority patterns for total amount
  const totalPatterns = [
    /(?:grand\s+)?total\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /amount\s+(?:due|paid|tendered)\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /balance\s+(?:due|owed)\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /to\s+pay\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /(?:sub)?total\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /(?:you\s+)?(?:owe|paid|charged)\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /(?:charge|payment)\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
    /[$£€]\s*([\d,]+\.\d{2})\b/,
    /\b([\d,]+\.\d{2})\b/,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, '');
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0 && val < 100000) return val;
    }
  }
  return null;
}

function extractDate(text: string): string {
  const today = new Date().toISOString().split('T')[0];

  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\.,]?\s+(\d{4})/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,
  ];

  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) {
      try {
        const raw = m[0];
        // Try parsing
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
        // Handle DD/MM/YYYY
        if (pattern === patterns[0]) {
          const [, d, mo, y] = m;
          const attempt = new Date(`${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`);
          if (!isNaN(attempt.getTime())) return attempt.toISOString().split('T')[0];
        }
        if (pattern === patterns[1]) {
          const [, y, mo, d] = m;
          return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
        }
      } catch {
        // ignore
      }
    }
  }
  return today;
}

function extractMerchant(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  // First substantial line is usually the merchant name
  for (const line of lines.slice(0, 5)) {
    if (line.length >= 3 && line.length <= 60 && !/^\d/.test(line) && !/receipt|invoice|order/i.test(line)) {
      // Clean it up
      return line.replace(/[*#_|]/g, '').trim();
    }
  }
  return 'Unknown Merchant';
}

function parseReceiptText(text: string): ParsedReceipt {
  const merchant = extractMerchant(text);
  const date = extractDate(text);
  const amount = extractAmount(text);
  const category = detectCategory(merchant, text);

  // Rough confidence: did we get all key fields?
  let confidence = 0.3;
  if (merchant !== 'Unknown Merchant') confidence += 0.2;
  if (amount !== null) confidence += 0.35;
  if (date !== new Date().toISOString().split('T')[0]) confidence += 0.15;

  return { merchant, date, amount, category, rawText: text, confidence };
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const ScanReceiptScreen: React.FC<ScanReceiptScreenProps> = ({
  onSaveTransaction,
  existingTransactions,
  currency,
}) => {
  const { isDark, colors } = useTheme();
  const { goBack } = useNavigation();

  const [step, setStep] = useState<ScanStep>('capture');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('Initialising…');
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Editable review fields
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('Shopping');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const checkDuplicate = useCallback((amount: number | null, date: string): boolean => {
    if (!amount) return false;
    return existingTransactions.some(tx =>
      tx.amount === amount && tx.date === date,
    );
  }, [existingTransactions]);

  const processImage = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or similar).');
      setStep('error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image is too large. Please use an image under 20 MB.');
      setStep('error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setStep('processing');
    setProgress(5);
    setProgressMsg('Reading image…');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 80) + 15);
            setProgressMsg('Extracting text…');
          } else if (m.status === 'loading tesseract core') {
            setProgress(8);
            setProgressMsg('Loading OCR engine…');
          } else if (m.status === 'loading language traineddata') {
            setProgress(12);
            setProgressMsg('Loading language data…');
          }
        },
      });

      setProgress(15);
      setProgressMsg('Processing receipt…');

      const { data } = await worker.recognize(file);
      await worker.terminate();

      setProgress(95);
      setProgressMsg('Analysing content…');

      const text = data.text;

      if (!text || text.trim().length < 10) {
        setErrorMsg("Couldn't read the receipt. The image may be too blurry, too dark, or not contain text. Please try a clearer photo.");
        setStep('error');
        return;
      }

      const result = parseReceiptText(text);
      setParsed(result);

      // Populate edit fields
      setEditMerchant(result.merchant);
      setEditAmount(result.amount !== null ? result.amount.toFixed(2) : '');
      setEditDate(result.date);
      setEditCategory(result.category);

      // Check for duplicates
      const dup = checkDuplicate(result.amount, result.date);
      setIsDuplicate(dup);

      setProgress(100);
      setStep('review');

    } catch (err) {
      console.error('OCR error:', err);
      setErrorMsg('Could not process the image. Please check your connection and try again.');
      setStep('error');
    }
  }, [checkDuplicate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    e.target.value = '';
  };

  const handleConfirmSave = () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    onSaveTransaction({
      type: editType,
      amount,
      description: editMerchant || 'Receipt',
      category: editCategory,
      date: editDate,
    });
    setStep('success');
  };

  const cardStyle = {
    background: isDark ? '#0d0d10' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#ececf0'}`,
  };

  // ── CAPTURE step ────────────────────────────────────────────────────────────
  if (step === 'capture') {
    return (
      <div className="page-enter px-4 pt-4 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goBack} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: colors.textMuted }}>
            <X size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>Scan Receipt</h1>
            <p className="text-xs" style={{ color: colors.textMuted }}>Take a photo or upload from your gallery</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="rounded-3xl flex flex-col items-center justify-center gap-4 mb-5 cursor-pointer transition-all active:scale-[0.99]"
          style={{ ...cardStyle, minHeight: 260, padding: 32, borderStyle: 'dashed', borderWidth: 2, borderColor: isDark ? 'rgba(45,212,191,0.25)' : 'rgba(45,212,191,0.4)' }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
            <Receipt size={36} style={{ color: '#2dd4bf' }} />
          </div>
          <div className="text-center">
            <p className="text-base font-bold mb-1" style={{ color: colors.textPrimary }}>Upload Receipt</p>
            <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>Select an image from your gallery</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        {/* Camera button */}
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mb-4"
          style={{ background: '#2dd4bf', color: '#0d1117' }}
        >
          <Camera size={18} />
          Take Photo
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        {/* Tips */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <Info size={13} style={{ color: '#2dd4bf' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Tips for best results</p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              'Keep the receipt flat and wrinkle-free',
              'Ensure good lighting — avoid shadows',
              'Capture the full receipt including total',
              'Hold the camera steady or use the upload option',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2dd4bf' }} />
                <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PROCESSING step ─────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="page-enter px-4 pt-4 pb-28 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
            <Loader2 size={18} className="animate-spin" style={{ color: '#2dd4bf' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Scanning…</h1>
            <p className="text-xs" style={{ color: colors.textMuted }}>{progressMsg}</p>
          </div>
        </div>

        {imagePreview && (
          <div className="rounded-2xl overflow-hidden mb-5" style={{ maxHeight: 220 }}>
            <img src={imagePreview} alt="Receipt" className="w-full object-cover" style={{ maxHeight: 220, objectPosition: 'top' }} />
          </div>
        )}

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{progressMsg}</p>
            <span className="text-sm font-bold" style={{ color: '#2dd4bf' }}>{progress}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2dd4bf, #0ea5e9)' }}
            />
          </div>
          <p className="text-xs mt-3 text-center" style={{ color: colors.textMuted }}>
            Tesseract OCR is reading your receipt…
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR step ──────────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="page-enter px-4 pt-4 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goBack} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: colors.textMuted }}>
            <X size={18} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Scan Failed</h1>
        </div>

        <div className="rounded-3xl p-8 text-center mb-5" style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <AlertCircle size={28} style={{ color: '#ef4444' }} />
          </div>
          <p className="text-base font-bold mb-2" style={{ color: colors.textPrimary }}>Could Not Read Receipt</p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: colors.textSecondary }}>{errorMsg}</p>
          <button
            onClick={() => setStep('capture')}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background: '#2dd4bf', color: '#0d1117' }}
          >
            Try Again
          </button>
        </div>

        {/* Manual entry fallback */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>Alternative</p>
          <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Enter the transaction details manually.</p>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setParsed({ merchant: '', date: today, amount: null, category: 'Shopping', rawText: '', confidence: 0 });
              setEditMerchant('');
              setEditAmount('');
              setEditDate(today);
              setEditCategory('Shopping');
              setStep('review');
            }}
            className="flex items-center gap-2 text-sm font-bold"
            style={{ color: '#2dd4bf' }}
          >
            <Edit3 size={14} />
            Enter manually
          </button>
        </div>
      </div>
    );
  }

  // ── SUCCESS step ────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="page-enter px-4 pt-16 pb-28 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(34,197,94,0.15)', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
          <Check size={40} style={{ color: '#22c55e' }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary, letterSpacing: '-0.03em' }}>Transaction Added!</h2>
        <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
          {editMerchant || 'Receipt'} · {currency} {parseFloat(editAmount || '0').toFixed(2)}
        </p>
        <p className="text-xs mb-8" style={{ color: colors.textMuted }}>
          It now appears in your transactions, home, and insights.
        </p>
        <button
          onClick={goBack}
          className="w-full py-4 rounded-2xl font-bold text-sm mb-3 transition-all active:scale-[0.98]"
          style={{ background: '#22c55e', color: '#fff' }}
        >
          Done
        </button>
        <button
          onClick={() => { setStep('capture'); setImagePreview(null); setParsed(null); }}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: colors.textMuted }}
        >
          <RefreshCw size={13} />
          Scan another receipt
        </button>
      </div>
    );
  }

  // ── REVIEW step ─────────────────────────────────────────────────────────────
  const amountNum = parseFloat(editAmount || '0');
  const canSave = editMerchant.trim().length > 0 && !isNaN(amountNum) && amountNum > 0 && editDate.length === 10;

  return (
    <div className="page-enter px-4 pt-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setStep('capture')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: colors.textMuted }}>
          <X size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Review Receipt</h1>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {parsed && parsed.confidence > 0
              ? `${Math.round(parsed.confidence * 100)}% confidence · Edit anything incorrect`
              : 'Enter the receipt details'}
          </p>
        </div>
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="rounded-2xl overflow-hidden mb-4" style={{ maxHeight: 140 }}>
          <img src={imagePreview} alt="Receipt" className="w-full object-cover" style={{ maxHeight: 140, objectPosition: 'top' }} />
        </div>
      )}

      {/* Duplicate warning */}
      {isDuplicate && (
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <AlertCircle size={16} style={{ color: '#fbbf24' }} />
          <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
            A transaction with this amount and date already exists. You can still save if it's different.
          </p>
        </div>
      )}

      {/* Low confidence warning */}
      {parsed && parsed.confidence < 0.5 && parsed.confidence > 0 && (
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#f87171' }} />
          <p className="text-xs font-semibold" style={{ color: '#f87171' }}>
            Low confidence scan. Please verify all fields before saving.
          </p>
        </div>
      )}

      {/* Type selector */}
      <div className="rounded-2xl p-4 mb-3" style={cardStyle}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>Transaction Type</p>
        <div className="flex gap-2">
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => setEditType(t)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all"
              style={{
                background: editType === t ? (t === 'expense' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                color: editType === t ? (t === 'expense' ? '#ef4444' : '#22c55e') : colors.textMuted,
                border: editType === t ? `1px solid ${t === 'expense' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` : '1px solid transparent',
              }}
            >
              {t === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>
      </div>

      {/* Merchant */}
      <div className="rounded-2xl p-4 mb-3" style={cardStyle}>
        <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: colors.textMuted }}>
          <span className="flex items-center gap-1.5"><Tag size={10} /> Merchant / Description</span>
        </label>
        <input
          className="w-full bg-transparent text-sm font-semibold outline-none"
          style={{ color: colors.textPrimary }}
          value={editMerchant}
          onChange={e => setEditMerchant(e.target.value)}
          placeholder="e.g. Starbucks, Amazon"
        />
      </div>

      {/* Amount */}
      <div className="rounded-2xl p-4 mb-3" style={cardStyle}>
        <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: colors.textMuted }}>
          <span className="flex items-center gap-1.5"><DollarSign size={10} /> Amount</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: colors.textMuted }}>{currency}</span>
          <input
            type="number"
            step="0.01"
            min="0"
            className="flex-1 bg-transparent text-2xl font-bold outline-none"
            style={{ color: colors.textPrimary, letterSpacing: '-0.03em' }}
            value={editAmount}
            onChange={e => setEditAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        {!editAmount && (
          <p className="text-xs mt-1" style={{ color: '#f87171' }}>Amount not detected — please enter it manually</p>
        )}
      </div>

      {/* Date */}
      <div className="rounded-2xl p-4 mb-3" style={cardStyle}>
        <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: colors.textMuted }}>
          <span className="flex items-center gap-1.5"><Calendar size={10} /> Date</span>
        </label>
        <input
          type="date"
          className="w-full bg-transparent text-sm font-semibold outline-none"
          style={{ color: colors.textPrimary }}
          value={editDate}
          onChange={e => setEditDate(e.target.value)}
        />
      </div>

      {/* Category */}
      <div className="rounded-2xl p-4 mb-6" style={cardStyle}>
        <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: colors.textMuted }}>
          <span className="flex items-center gap-1.5"><Tag size={10} /> Category</span>
        </label>
        <button
          onClick={() => setShowCategoryPicker(!showCategoryPicker)}
          className="flex items-center justify-between w-full text-sm font-semibold"
          style={{ color: colors.textPrimary }}
        >
          <span>{editCategory}</span>
          <ChevronDown size={16} style={{ color: colors.textMuted, transform: showCategoryPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showCategoryPicker && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {EXPENSE_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => { setEditCategory(cat.name); setShowCategoryPicker(false); }}
                className="py-2 px-2 rounded-xl text-[10px] font-bold text-center transition-all"
                style={{
                  background: editCategory === cat.name ? `${cat.color}20` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  color: editCategory === cat.name ? cat.color : colors.textMuted,
                  border: editCategory === cat.name ? `1px solid ${cat.color}40` : '1px solid transparent',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleConfirmSave}
        disabled={!canSave}
        className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] mb-3 disabled:opacity-40"
        style={{ background: canSave ? '#2dd4bf' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'), color: canSave ? '#0d1117' : colors.textMuted }}
      >
        {canSave ? 'Confirm & Save Transaction' : 'Fill in the required fields'}
      </button>
      <button onClick={() => setStep('capture')} className="w-full py-3 rounded-2xl text-sm font-semibold transition-all" style={{ color: colors.textMuted }}>
        Cancel
      </button>
    </div>
  );
};
