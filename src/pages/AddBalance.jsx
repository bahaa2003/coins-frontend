import React, { useEffect, useMemo, useState } from 'react';
// dev: touch to trigger rebuild
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, ChevronDown, Smartphone, Wallet, Shield, FileText, Headphones, Zap, CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatWalletNumber } from '../utils/storefront';
import { getActivePaymentGroups } from '../utils/paymentSettings';

const getMethodsCountLabel = (count, isRTL) => {
    const safeCount = Number(count) || 0;

    if (!isRTL) {
        return `${safeCount} methods`;
    }

    if (safeCount === 1) return 'وسيلة واحدة';
    if (safeCount === 2) return 'وسيلتان';
    if (safeCount >= 3 && safeCount <= 10) return `${safeCount} وسائل`;
    return `${safeCount} وسيلة`;
};

const getGroupSummary = (group, isRTL) => {
    if (group?.description) return group.description;

    return isRTL
        ? `اختر من ${getMethodsCountLabel(group?.methods?.length, true)} المتاحة للشحن اليدوي.`
        : `Choose from ${getMethodsCountLabel(group?.methods?.length, false)} available for manual top-up.`;
};

const getMethodPresentation = (method) => {
    const token = `${method?.id || ''} ${method?.name || ''}`.toLowerCase();

    if (token.includes('vodafone')) {
        return { icon: Smartphone, color: 'from-red-500 via-rose-500 to-yellow-500', glow: 'shadow-[0_0_0_1px_rgba(244,63,94,0.18),0_12px_24px_-16px_rgba(244,63,94,0.7)]' };
    }
    if (token.includes('etisalat')) {
        return { icon: Smartphone, color: 'from-emerald-500 via-green-500 to-teal-500', glow: 'shadow-[0_0_0_1px_rgba(34,197,94,0.18),0_12px_24px_-16px_rgba(34,197,94,0.7)]' };
    }
    if (token.includes('orange')) {
        return { icon: Smartphone, color: 'from-orange-500 via-amber-500 to-red-500', glow: 'shadow-[0_0_0_1px_rgba(249,115,22,0.18),0_12px_24px_-16px_rgba(249,115,22,0.72)]' };
    }
    if (String(method?.type || '') === 'bank_transfer') {
        return { icon: Building2, color: 'from-sky-500 via-teal-500 to-indigo-500', glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_24px_-16px_rgba(59,130,246,0.72)]' };
    }

    return { icon: Smartphone, color: 'from-emerald-500 via-teal-500 to-sky-500', glow: 'shadow-[0_0_0_1px_rgba(34,197,94,0.16),0_12px_24px_-16px_rgba(34,197,94,0.68)]' };
};

const CompactPaymentMethodTile = ({ method, presentation, onSelect, index, isRTL }) => {
    const IconComponent = presentation.icon;
    const hasImage = Boolean(method?.image);
    const ActionIcon = isRTL ? ArrowLeft : ArrowRight;

    return (
        <motion.button
            type="button"
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: index * 0.05, type: 'spring', stiffness: 400 }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method)}
            className="group relative isolate flex w-[118px] flex-col items-center justify-start overflow-hidden rounded-[15px] border border-gray-200/50 bg-gradient-to-br from-white via-white/95 to-gray-50/80 p-1.5 pb-2 text-center shadow-[0_8px_16px_-8px_rgba(0,0,0,0.08)] transition-all hover:border-[#c89a3a]/45 hover:shadow-[0_12px_24px_-18px_rgba(200,154,58,0.24)] hover:from-white hover:to-[#faf8f3]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89a3a] dark:border-gray-700/50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900/80 dark:hover:border-[#d8b45f]/45 dark:hover:from-gray-800 dark:hover:to-gray-900 sm:w-[128px] sm:rounded-[17px] sm:p-2 sm:pb-2.5"
        >
            <div className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c89a3a]/5 via-transparent to-transparent" />
            </div>

            {hasImage ? (
                <img
                    src={resolveImageUrl(method.image)}
                    alt={method.name}
                    className="h-[72px] w-[72px] rounded-[16px] border border-gray-200/60 bg-white object-cover shadow-[0_8px_16px_-10px_rgba(0,0,0,0.15)] transition-all group-hover:scale-[1.02] dark:border-gray-600/50 dark:bg-gray-950 sm:h-20 sm:w-20 sm:rounded-[18px]"
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-[16px] bg-gradient-to-br ${presentation.color} text-white shadow-[0_12px_24px_-12px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-[1.02] sm:h-20 sm:w-20 sm:rounded-[18px] ${presentation.glow}`}>
                    <IconComponent className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
            )}

            <div className="mt-1.5 space-y-1">
                <span className="line-clamp-1 text-[11px] font-bold leading-4 text-gray-900 dark:text-white">
                    {method.name}
                </span>
                <motion.span
                    whileHover={{ scale: 1.02 }}
                    className="inline-flex items-center gap-1 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-primary)] shadow-sm transition-all"
                >
                    <span>{isRTL ? 'متابعة' : 'Continue'}</span>
                    <ActionIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </motion.span>
            </div>
        </motion.button>
    );
};

const AddBalance = () => {
    const { dir } = useLanguage();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { paymentSettings, loadPaymentSettings } = useSystemStore();
    const isRTL = dir === 'rtl';

    const [openGroupId, setOpenGroupId] = useState(null);

    useEffect(() => {
        void loadPaymentSettings({ force: true }).catch(() => null);
    }, [loadPaymentSettings]);

    const currentBalance = Number(user?.walletBalance ?? user?.coins ?? user?.balance ?? 0);
    const currentCurrency = String(user?.currency || 'USD').toUpperCase();
    const balanceDisplayValue = formatWalletNumber(currentBalance, false, { maximumFractionDigits: 3 });
    const debtLimitValue = Number(user?.creditLimit ?? 0);
    const debtLimitDisplayValue = formatWalletNumber(debtLimitValue, false, { maximumFractionDigits: 3 });
    const isNegativeBalance = currentBalance < 0;

    const paymentGroups = useMemo(
        () => getActivePaymentGroups(paymentSettings, { fallbackToDefault: false }),
        [paymentSettings]
    );

    useEffect(() => {
        if (!paymentGroups.length) {
            setOpenGroupId(null);
            return;
        }

        setOpenGroupId((previous) => (
            paymentGroups.some((group) => group.id === previous) ? previous : paymentGroups[0].id
        ));
    }, [paymentGroups]);

    const handleMethodSelect = (method) => {
        navigate(`/wallet/payment-details/${method.id}`);
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-5 text-slate-950 dark:bg-[#040f12] dark:text-white sm:pb-8" dir={dir}>
            <div className="mx-auto w-full max-w-4xl space-y-3 px-3 pt-3 sm:px-4 sm:pt-4">
                <motion.section
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden rounded-[18px] border border-[#1d95a8]/24 bg-white/86 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.42)] dark:border-cyan-300/18 dark:bg-[#071b20]/92"
                >
                    <div className={`flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                            <div className={`flex flex-wrap items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                <span className="inline-flex h-7 items-center gap-1 rounded-full border border-[#1d95a8]/24 bg-[#1d95a8]/10 px-2.5 text-[11px] font-black text-[#0b6f83] dark:text-cyan-200">
                                    <Zap className="h-3.5 w-3.5" />
                                    {isRTL ? 'شحن يدوي' : 'Manual Top-up'}
                                </span>
                                <span className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-slate-300 bg-slate-100 px-2.5 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {isRTL ? 'شحن تلقائي' : 'Auto Top-up'}
                                    <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] dark:bg-slate-800">
                                        {isRTL ? 'قريبًا' : 'Soon'}
                                    </span>
                                </span>
                            </div>

                            <h1 className="mt-2 text-xl font-black leading-7 tracking-normal text-slate-950 dark:text-white sm:text-2xl">
                                {t('wallet.addBalance')}
                            </h1>
                        </div>

                        <div className={`flex min-w-[13.5rem] items-center gap-2 rounded-[14px] border border-[#1d95a8]/22 bg-[#edfafa] px-3 py-2 dark:bg-[#05262c] ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#0b6f83] text-white shadow-[0_10px_22px_-14px_rgba(29,149,168,0.8)]">
                                <Wallet className="h-4.5 w-4.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-black text-[#0b6f83]/72 dark:text-cyan-200/70">
                                    {t('wallet.currentBalance')}
                                </p>
                                <div className={`mt-0.5 flex items-end gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <strong className={`text-lg font-black leading-5 ${isNegativeBalance ? 'text-red-600 dark:text-red-400' : 'text-slate-950 dark:text-white'}`}>
                                        {balanceDisplayValue}
                                    </strong>
                                    <span className="rounded-full border border-[#1d95a8]/24 bg-white/80 px-1.5 py-0.5 text-[9px] font-black text-[#0b6f83] dark:bg-cyan-950/30 dark:text-cyan-200">
                                        {currentCurrency}
                                    </span>
                                </div>
                                <div className={`mt-1 flex flex-wrap items-center gap-1 text-[10px] font-bold text-[#0b6f83]/70 dark:text-cyan-200/70 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <span>{isRTL ? 'حد الدين' : 'Debt limit'}</span>
                                    <strong className="text-[#0b6f83] dark:text-cyan-100" dir="ltr">
                                        {debtLimitDisplayValue} {currentCurrency}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    className="rounded-[18px] border border-slate-200 bg-white/92 p-3 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.38)] dark:border-cyan-300/14 dark:bg-[#071b20]/92 sm:p-4"
                >
                    <div className={`flex flex-wrap items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <div>
                            <span className="inline-flex h-7 items-center gap-1 rounded-full border border-amber-300/32 bg-amber-100/60 px-2.5 text-[11px] font-black text-amber-700 dark:border-amber-300/18 dark:bg-amber-300/10 dark:text-amber-200">
                                <CreditCard className="h-3.5 w-3.5" />
                                {isRTL ? 'خيارات الدفع' : 'Payment Options'}
                            </span>
                            <h2 className="mt-2 text-base font-black text-slate-950 dark:text-white">
                                {isRTL ? 'اختر وسيلة الدفع' : 'Choose Payment Method'}
                            </h2>
                            <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                                {isRTL
                                    ? 'اختر الطريقة المناسبة واضغط متابعة لإكمال عملية التحويل'
                                    : 'Select your preferred payment method and continue.'}
                            </p>
                        </div>
                    </div>

                    {paymentGroups.length > 0 ? (
                        <div className="mt-4 space-y-2.5">
                            {paymentGroups.map((group, index) => {
                                const isOpen = openGroupId === group.id;

                                return (
                                    <motion.div
                                        key={group.id}
                                        initial={{ y: 12, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.28, delay: 0.1 + index * 0.04 }}
                                        className="overflow-hidden rounded-[14px] border border-slate-200 bg-slate-50/80 dark:border-cyan-300/12 dark:bg-[#041418]"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenGroupId((previous) => (previous === group.id ? null : group.id))}
                                            className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start transition hover:bg-[#1d95a8]/5 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                                        >
                                            <div className={`flex min-w-0 items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                {group.image ? (
                                                    <img
                                                        src={resolveImageUrl(group.image)}
                                                        alt={group.name}
                                                        className="h-10 w-10 shrink-0 rounded-[11px] border border-slate-200 bg-white object-cover dark:border-slate-700 dark:bg-slate-950"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#0b6f83] text-white">
                                                        <Building2 className="h-4.5 w-4.5" />
                                                    </span>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-black text-slate-950 dark:text-white">
                                                        {group.name}
                                                    </h3>
                                                    <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                        {getGroupSummary(group, isRTL)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`flex shrink-0 items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                {group.currency && (
                                                    <span className="rounded-full border border-[#1d95a8]/20 bg-[#1d95a8]/8 px-2 py-0.5 text-[10px] font-black text-[#0b6f83] dark:text-cyan-200">
                                                        {String(group.currency).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="rounded-full border border-amber-300/24 bg-amber-100/50 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                                                    {getMethodsCountLabel(group.methods.length, isRTL)}
                                                </span>
                                                <motion.span
                                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                                >
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                </motion.span>
                                            </div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.24, ease: 'easeOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex flex-wrap justify-center gap-2 border-t border-slate-200 px-2 py-2 dark:border-cyan-300/12">
                                                        {group.methods.map((method, methodIndex) => {
                                                            const presentation = getMethodPresentation(method);
                                                            const mappedMethod = {
                                                                ...method,
                                                                icon: presentation.icon,
                                                                color: presentation.color,
                                                                available: method.isActive !== false,
                                                            };

                                                            return (
                                                                <CompactPaymentMethodTile
                                                                    key={method.id}
                                                                    method={mappedMethod}
                                                                    presentation={presentation}
                                                                    onSelect={handleMethodSelect}
                                                                    index={methodIndex}
                                                                    isRTL={isRTL}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.28, delay: 0.12 }}
                            className={`mt-4 flex items-start gap-3 rounded-[14px] border border-amber-300/30 bg-amber-50/70 p-3 dark:border-amber-300/16 dark:bg-amber-300/8 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                        >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-amber-500 text-white">
                                <CreditCard className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-slate-950 dark:text-white">
                                    {isRTL ? 'لا توجد طرق دفع متاحة' : 'No payment methods available'}
                                </h3>
                                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                                    {isRTL
                                        ? `لا توجد طرق دفع متاحة حاليًا لعملة ${currentCurrency}. تواصل مع الدعم لتفعيل وسيلة مناسبة.`
                                        : `No payment methods are currently available for ${currentCurrency}. Contact support to enable a suitable option.`}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.section>

                <section className="grid grid-cols-3 gap-1.5">
                    {[
                        {
                            icon: Shield,
                            title: isRTL ? 'شحن آمن' : 'Secure top-up',
                            desc: isRTL ? 'حماية ومراجعة للعمليات' : 'Protected transaction flow',
                        },
                        {
                            icon: FileText,
                            title: isRTL ? 'إيصال محفوظ' : 'Saved receipt',
                            desc: isRTL ? 'سجل واضح لكل عملية' : 'Clear record for every transfer',
                        },
                        {
                            icon: Headphones,
                            title: isRTL ? 'دعم مباشر' : 'Live support',
                            desc: isRTL ? 'مساعدة عند الحاجة' : 'Help when you need it',
                        },
                    ].map((benefit) => (
                        <div
                            key={benefit.title}
                            className={`flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white/70 px-2 py-1.5 dark:border-cyan-300/12 dark:bg-[#071b20]/72 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                        >
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border border-[#1d95a8]/18 bg-[#1d95a8]/8 text-[#0b6f83] dark:text-cyan-200">
                                <benefit.icon className="h-3 w-3" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-[10px] font-black leading-3 text-slate-950 dark:text-white">
                                    {benefit.title}
                                </h3>
                                <p className="mt-0.5 truncate text-[9px] font-semibold leading-3 text-slate-500 dark:text-slate-400">
                                    {benefit.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default AddBalance;
