import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle,
  Clock,
  Copy,
  Hash,
  Hourglass,
  ReceiptText,
  RefreshCw,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../ui/Toast';
import { formatDateTime } from '../../utils/intl';
import { formatWalletAmount } from '../../utils/storefront';

const getTransactionIcon = (type) => {
  switch (type) {
    case 'deposit':
      return WalletCards;
    case 'withdrawal':
      return ArrowUpRight;
    case 'transfer':
      return RefreshCw;
    case 'purchase':
      return ReceiptText;
    default:
      return ArrowDownLeft;
  }
};

const getTransactionTone = (type) => {
  switch (type) {
    case 'deposit':
      return {
        cardClass: 'border-green-200/50 bg-gradient-to-br from-green-50/80 via-white/90 to-emerald-50/60 shadow-[0_8px_16px_-6px_rgba(34,197,94,0.12)] dark:border-green-900/40 dark:from-green-950/30 dark:via-gray-900/80 dark:to-green-950/20 dark:shadow-[0_8px_16px_-6px_rgba(34,197,94,0.08)]',
        iconBgClass: 'bg-gradient-to-br from-green-500 to-emerald-500 text-white',
        badgeClass: 'border-green-300/60 bg-gradient-to-r from-green-100/70 to-emerald-100/50 text-green-700 dark:border-green-900/50 dark:from-green-950/40 dark:to-emerald-950/30 dark:text-green-300',
        compactClass: 'border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(255,255,255,0.92))] text-emerald-700 dark:border-emerald-400/22 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.11),rgba(8,47,73,0.2))] dark:text-emerald-300',
        amountClass: 'text-green-700 dark:text-green-300',
        statusClass: 'text-green-700 dark:text-green-300',
      };
    case 'withdrawal':
      return {
        cardClass: 'border-red-200/50 bg-gradient-to-br from-red-50/80 via-white/90 to-rose-50/60 shadow-[0_8px_16px_-6px_rgba(239,68,68,0.12)] dark:border-red-900/40 dark:from-red-950/30 dark:via-gray-900/80 dark:to-red-950/20 dark:shadow-[0_8px_16px_-6px_rgba(239,68,68,0.08)]',
        iconBgClass: 'bg-gradient-to-br from-red-500 to-rose-500 text-white',
        badgeClass: 'border-red-300/60 bg-gradient-to-r from-red-100/70 to-rose-100/50 text-red-700 dark:border-red-900/50 dark:from-red-950/40 dark:to-rose-950/30 dark:text-red-300',
        compactClass: 'border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,255,255,0.92))] text-rose-700 dark:border-rose-400/22 dark:bg-[linear-gradient(135deg,rgba(244,63,94,0.1),rgba(8,47,73,0.2))] dark:text-rose-300',
        amountClass: 'text-red-700 dark:text-red-300',
        statusClass: 'text-red-700 dark:text-red-300',
      };
    case 'transfer':
      return {
        cardClass: 'border-teal-200/50 bg-gradient-to-br from-teal-50/80 via-white/90 to-teal-50/60 shadow-[0_8px_16px_-6px_rgba(59,130,246,0.12)] dark:border-teal-900/40 dark:from-teal-950/30 dark:via-gray-900/80 dark:to-teal-950/20 dark:shadow-[0_8px_16px_-6px_rgba(59,130,246,0.08)]',
        iconBgClass: 'bg-gradient-to-br from-teal-500 to-teal-500 text-white',
        badgeClass: 'border-teal-300/60 bg-gradient-to-r from-teal-100/70 to-teal-100/50 text-teal-700 dark:border-teal-900/50 dark:from-teal-950/40 dark:to-teal-950/30 dark:text-teal-300',
        compactClass: 'border-cyan-200 bg-[linear-gradient(135deg,rgba(236,254,255,0.98),rgba(255,255,255,0.92))] text-cyan-700 dark:border-cyan-400/22 dark:bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(8,47,73,0.2))] dark:text-cyan-300',
        amountClass: 'text-teal-700 dark:text-teal-300',
        statusClass: 'text-teal-700 dark:text-teal-300',
      };
    case 'purchase':
      return {
        cardClass: 'border-amber-200/50 bg-gradient-to-br from-amber-50/80 via-white/90 to-yellow-50/60 shadow-[0_8px_16px_-6px_rgba(212,164,45,0.12)] dark:border-amber-900/40 dark:from-amber-950/30 dark:via-gray-900/80 dark:to-amber-950/20 dark:shadow-[0_8px_16px_-6px_rgba(212,164,45,0.08)]',
        iconBgClass: 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white',
        badgeClass: 'border-amber-300/60 bg-gradient-to-r from-amber-100/70 to-yellow-100/50 text-amber-700 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-yellow-950/30 dark:text-amber-300',
        compactClass: 'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.92))] text-amber-700 dark:border-amber-400/22 dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(8,47,73,0.2))] dark:text-amber-300',
        amountClass: 'text-amber-700 dark:text-amber-300',
        statusClass: 'text-amber-700 dark:text-amber-300',
      };
    default:
      return {
        cardClass: 'border-gray-200/50 bg-gradient-to-br from-gray-50/80 via-white/90 to-gray-50/60 shadow-[0_8px_16px_-6px_rgba(107,114,128,0.12)] dark:border-gray-800/40 dark:from-gray-950/30 dark:via-gray-900/80 dark:to-gray-950/20 dark:shadow-[0_8px_16px_-6px_rgba(107,114,128,0.08)]',
        iconBgClass: 'bg-gradient-to-br from-gray-500 to-slate-500 text-white',
        badgeClass: 'border-gray-300/60 bg-gradient-to-r from-gray-100/70 to-gray-100/50 text-gray-700 dark:border-gray-800/50 dark:from-gray-950/40 dark:to-gray-900/30 dark:text-gray-300',
        compactClass: 'border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(255,255,255,0.92))] text-slate-700 dark:border-slate-400/22 dark:bg-[linear-gradient(135deg,rgba(148,163,184,0.1),rgba(8,47,73,0.2))] dark:text-slate-300',
        amountClass: 'text-gray-700 dark:text-gray-300',
        statusClass: 'text-gray-700 dark:text-gray-300',
      };
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return BadgeCheck;
    case 'failed':
      return XCircle;
    case 'pending':
    default:
      return Hourglass;
  }
};

const getStatusTone = (status) => {
  switch (status) {
    case 'completed':
      return 'border-green-300/60 bg-gradient-to-r from-green-100/70 to-emerald-100/50 text-green-700 dark:border-green-900/50 dark:from-green-950/40 dark:to-emerald-950/30 dark:text-green-300';
    case 'failed':
      return 'border-red-300/60 bg-gradient-to-r from-red-100/70 to-rose-100/50 text-red-700 dark:border-red-900/50 dark:from-red-950/40 dark:to-rose-950/30 dark:text-red-300';
    case 'pending':
    default:
      return 'border-amber-300/60 bg-gradient-to-r from-amber-100/70 to-yellow-100/50 text-amber-700 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-yellow-950/30 dark:text-amber-300';
  }
};

const getCompactStatusTone = (status) => {
  switch (status) {
    case 'completed':
      return 'border-emerald-300/70 bg-emerald-100/72 text-emerald-700 dark:border-emerald-400/24 dark:bg-emerald-400/10 dark:text-emerald-300';
    case 'failed':
      return 'border-rose-300/70 bg-rose-100/72 text-rose-700 dark:border-rose-400/24 dark:bg-rose-400/10 dark:text-rose-300';
    case 'pending':
    default:
      return 'border-amber-300/70 bg-amber-100/72 text-amber-700 dark:border-amber-400/24 dark:bg-amber-400/10 dark:text-amber-300';
  }
};

const TransactionCard = ({ transaction, index }) => {
  const { dir } = useLanguage();
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  const locale = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('en')
    ? 'en-US'
    : 'ar-EG';

  const statusLabelKey = `wallet.status${transaction.status?.charAt(0)?.toUpperCase() || ''}${transaction.status?.slice(1) || ''}`;
  const typeLabelKey = `wallet.type${transaction.type?.charAt(0)?.toUpperCase() || ''}${transaction.type?.slice(1) || ''}`;
  const rawDescription = transaction.descriptionKey
    ? t(transaction.descriptionKey)
    : (transaction.description ?? transaction.type);
  const transactionDescription = (() => {
    if (rawDescription === null || rawDescription === undefined) return '';
    if (typeof rawDescription === 'string' || typeof rawDescription === 'number') return String(rawDescription);
    if (typeof rawDescription === 'object') {
      const picked = rawDescription?.label || rawDescription?.title || rawDescription?.name || rawDescription?.text || '';
      return String(picked || '');
    }
    return String(rawDescription);
  })();
  const originalCurrency = String(transaction.originalCurrency || '').trim().toUpperCase();
  const currentCurrency = String(transaction.currentCurrency || '').trim().toUpperCase();
  const showOriginalCurrency = Boolean(originalCurrency) && originalCurrency !== currentCurrency;
  const originalAmount = Number(transaction.originalAmount);
  const showOriginalAmount = showOriginalCurrency && Number.isFinite(originalAmount) && originalAmount > 0;
  const hasBalanceSnapshot = transaction?.balanceBefore !== null
    && transaction?.balanceBefore !== undefined
    && transaction?.balanceAfter !== null
    && transaction?.balanceAfter !== undefined;

  const Icon = getTransactionIcon(transaction.type);
  const StatusIcon = getStatusIcon(transaction.status);
  const tone = getTransactionTone(transaction.type);

  const referenceText = (() => {
    const value = transaction?.reference;
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim();

    if (typeof value === 'object') {
      const candidate =
        value?.reference
        || value?.referenceId
        || value?.orderNumber
        || value?.siteOrderNumber
        || value?._id
        || value?.id
        || '';
      return String(candidate || '').trim();
    }

    return String(value).trim();
  })();

  const handleCopyReference = async () => {
    const value = referenceText;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      addToast(t('wallet.transactionNumberCopied', { defaultValue: 'Transaction number copied' }), 'success');
    } catch (_error) {
      addToast(t('wallet.copyTransactionNumberFailed', { defaultValue: 'Unable to copy transaction number' }), 'error');
    }
  };

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.018, 0.14) }}
      className={`group relative overflow-hidden rounded-[14px] border px-3 py-2.5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.38)] transition hover:-translate-y-0.5 hover:border-[#1d95a8]/32 hover:shadow-[0_18px_32px_-24px_rgba(15,23,42,0.28)] dark:shadow-[0_12px_24px_-22px_rgba(8,47,73,0.65)] dark:hover:border-cyan-300/32 dark:hover:shadow-[0_18px_32px_-24px_rgba(34,211,238,0.28)] ${tone.compactClass}`}
    >
      <div className="pointer-events-none absolute inset-y-2 right-0 w-1 rounded-l-full bg-current/45" />

      <div className={`flex items-start gap-2.5 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-current/18 bg-current/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Icon className="h-[18px] w-[18px]" />
        </span>

        <div className="min-w-0 flex-1">
          <div className={`flex min-w-0 flex-wrap items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <span className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-black leading-none ${getCompactStatusTone(transaction.status)}`}>
              <StatusIcon className="h-2.5 w-2.5" />
              {t(statusLabelKey, { defaultValue: transaction.status })}
            </span>
            <span className="inline-flex h-5 shrink-0 items-center gap-1 rounded-full border border-current/15 bg-current/[0.07] px-2 text-[10px] font-black leading-none">
              <Icon className="h-2.5 w-2.5" />
              {t(typeLabelKey, { defaultValue: transaction.type })}
            </span>
          </div>

          <h4 className="mt-1 min-w-0 truncate text-[13px] font-black leading-5 text-slate-950 dark:text-slate-50">
            {transactionDescription}
          </h4>

          <div className={`mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] font-semibold leading-4 text-slate-600 dark:text-slate-400 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            {referenceText ? (
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex h-6 min-w-0 max-w-[12rem] items-center gap-1 truncate rounded-full border border-slate-300/70 bg-white/72 px-2 text-slate-600 transition hover:border-[#1d95a8]/32 hover:text-[#0b6f83] dark:border-slate-400/16 dark:bg-slate-950/28 dark:text-slate-300 dark:hover:border-cyan-300/28 dark:hover:text-cyan-100"
                title={t('wallet.copyTransactionNumber', { defaultValue: 'Copy transaction number' })}
              >
                <Hash className="h-3 w-3 shrink-0 opacity-70" />
                <span className="truncate">{referenceText}</span>
                <Copy className="h-3 w-3 shrink-0" />
              </button>
            ) : null}
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-slate-300/70 bg-white/65 px-2 text-slate-600 dark:border-slate-400/12 dark:bg-slate-950/20 dark:text-slate-300">
              <CalendarClock className="h-3 w-3 opacity-70" />
              {formatDateTime(transaction.date, locale, {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {(hasBalanceSnapshot || showOriginalCurrency) && (
            <div className={`mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] font-bold leading-4 text-slate-600 dark:text-slate-400 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {showOriginalCurrency && (
                <span className="truncate rounded-full border border-current/12 bg-current/[0.05] px-2 py-0.5">
                  {showOriginalAmount
                    ? formatWalletAmount(originalAmount, originalCurrency)
                    : originalCurrency}
                </span>
              )}
              {hasBalanceSnapshot && (
                <span className="truncate rounded-full border border-slate-300/70 bg-white/65 px-2 py-0.5 [direction:ltr] dark:border-slate-400/12 dark:bg-slate-950/18">
                  {formatWalletAmount(transaction.balanceBefore, transaction.currency)}
                  <span className="px-1 text-slate-400 dark:text-slate-500">→</span>
                  {formatWalletAmount(transaction.balanceAfter, transaction.currency)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`shrink-0 rounded-[10px] border border-current/14 bg-current/[0.06] px-2.5 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] [direction:ltr] ${tone.amountClass}`}>
          <p className="text-[14px] font-black leading-5">
            {formatWalletAmount(transaction.amount, transaction.currency, { signed: true })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;
