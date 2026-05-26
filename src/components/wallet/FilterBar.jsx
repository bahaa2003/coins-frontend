import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const FilterBar = ({ onFilterChange, total = 0 }) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';

  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const resetFilters = () => {
    const initialFilters = {
      searchTerm: '',
      type: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    };
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  const isFiltered = useMemo(() => {
    return filters.searchTerm || filters.type !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate;
  }, [filters]);

  const typeOptions = [
    { value: 'all', label: t('wallet.allTypes') },
    { value: 'deposit', label: t('wallet.typeDeposit') },
    { value: 'withdrawal', label: t('wallet.typeWithdrawal') },
    { value: 'transfer', label: t('wallet.typeTransfer') },
    { value: 'purchase', label: t('wallet.typePurchase') }
  ];

  const statusOptions = [
    { value: 'all', label: t('wallet.allStatuses') },
    { value: 'completed', label: t('wallet.statusCompleted') },
    { value: 'pending', label: t('wallet.statusPending') },
    { value: 'failed', label: t('wallet.statusFailed') }
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mb-2"
    >
      <div className="relative overflow-hidden rounded-[16px] border border-[#1d95a8]/22 bg-white/92 p-1.5 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.36)] ring-1 ring-[#1d95a8]/8 dark:border-cyan-400/28 dark:bg-[#061f22]/96 dark:shadow-[0_12px_26px_-22px_rgba(0,120,140,0.48)] dark:ring-white/[0.03] sm:p-2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(20rem_circle_at_8%_-25%,rgba(29,149,168,0.1),transparent_46%),radial-gradient(14rem_circle_at_100%_0%,rgba(212,164,45,0.08),transparent_40%)] dark:bg-[radial-gradient(20rem_circle_at_8%_-25%,rgba(29,149,168,0.2),transparent_46%),radial-gradient(14rem_circle_at_100%_0%,rgba(12,177,196,0.11),transparent_40%)]" />

        <div className="relative z-10 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded((value) => !value)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#1d95a8]/24 bg-[#e7f7fa] text-[#0b6f83] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition hover:border-[#1d95a8]/45 hover:bg-[#d9f2f6] dark:border-cyan-200/24 dark:bg-[#073138] dark:text-cyan-50 dark:hover:border-cyan-200/45 dark:hover:bg-[#0a3a42]"
              aria-label={isExpanded ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <span className="inline-flex h-6 items-center rounded-full border border-[#1d95a8]/22 bg-[#1d95a8]/8 px-2 text-[9px] font-bold text-[#0b6f83] dark:border-cyan-200/24 dark:bg-cyan-300/10 dark:text-cyan-100">
              {total === 0 ? 'لا توجد عمليات' : `${total} نتيجة`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <div>
              <h3 className="text-[10px] font-black leading-3.5 text-slate-900 dark:text-cyan-50">
                بحث وتصفية
              </h3>
              <p className="text-[9px] font-bold leading-3 text-slate-500 dark:text-cyan-50/72">
                {isExpanded ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
              </p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1d95a8]/22 bg-[#1d95a8]/8 text-[#0b6f83] dark:border-cyan-200/24 dark:bg-cyan-300/10 dark:text-cyan-100">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 overflow-hidden"
        >
          <div className="pt-1">
            <label className="relative block">
              <input
                type="search"
                value={filters.searchTerm}
                onChange={(event) => handleFilterChange('searchTerm', event.target.value)}
                placeholder="ابحث باسم المنتج أو رقم العملية"
                className="h-8 min-h-0 w-full rounded-full border border-[#1d95a8]/24 bg-[#f8fcfc] px-3 pe-8 text-right text-[11px] font-semibold leading-none text-slate-900 outline-none transition placeholder:text-[10px] placeholder:font-semibold placeholder:text-slate-400 focus:border-[#1d95a8]/55 focus:ring-2 focus:ring-[#1d95a8]/12 dark:border-cyan-200/24 dark:bg-[#041a1d] dark:text-cyan-50 dark:placeholder:text-cyan-50/56 dark:focus:border-cyan-200/55 dark:focus:ring-cyan-200/12"
              />
              <Search className="pointer-events-none absolute right-auto top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0b6f83]/60 ltr:right-3 rtl:left-3 dark:text-cyan-50/70" />
            </label>

            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <label className="block text-right">
                <span className="mb-1 block pe-1 text-[9px] font-black leading-none text-slate-600 dark:text-cyan-100/68">الحالة</span>
                <span className="relative block">
                  <select
                    value={filters.status}
                    onChange={(event) => handleFilterChange('status', event.target.value)}
                    className="h-8 min-h-0 w-full appearance-none rounded-[10px] border border-[#1d95a8]/24 bg-[#f8fcfc] px-2 pe-7 text-right text-[11px] font-black leading-none text-slate-900 outline-none transition focus:border-[#1d95a8]/55 focus:ring-2 focus:ring-[#1d95a8]/12 dark:border-cyan-200/24 dark:bg-[#041a1d] dark:text-amber-50 dark:focus:border-cyan-200/55 dark:focus:ring-cyan-200/12"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#0b6f83]/58 dark:text-cyan-100/60" />
                </span>
              </label>

              <label className="block text-right">
                <span className="mb-1 block pe-1 text-[9px] font-black leading-none text-slate-600 dark:text-cyan-100/68">نوع العملية</span>
                <span className="relative block">
                  <select
                    value={filters.type}
                    onChange={(event) => handleFilterChange('type', event.target.value)}
                    className="h-8 min-h-0 w-full appearance-none rounded-[10px] border border-[#1d95a8]/24 bg-[#f8fcfc] px-2 pe-7 text-right text-[11px] font-black leading-none text-slate-900 outline-none transition focus:border-[#1d95a8]/55 focus:ring-2 focus:ring-[#1d95a8]/12 dark:border-cyan-200/24 dark:bg-[#041a1d] dark:text-amber-50 dark:focus:border-cyan-200/55 dark:focus:ring-cyan-200/12"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#0b6f83]/58 dark:text-cyan-100/60" />
                </span>
              </label>
            </div>

            <p className="mt-1.5 border-y border-[#1d95a8]/12 py-0.5 text-right text-[9px] font-semibold leading-4 text-slate-500 dark:border-cyan-200/16 dark:text-cyan-50/72">
              اختر مدة البحث من تاريخ إلى تاريخ، أو اتركها فارغة لعرض كل العمليات.
            </p>

            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <label className="block text-right">
                <span className="mb-1 flex items-center justify-end gap-1 pe-1 text-[9px] font-black leading-none text-slate-600 dark:text-cyan-100/68">
                  <span>إلى تاريخ</span>
                  <Calendar className="h-3 w-3" />
                </span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => handleFilterChange('endDate', event.target.value)}
                  className="h-8 min-h-0 w-full rounded-[10px] border border-[#1d95a8]/24 bg-[#f8fcfc] px-2 text-right text-[11px] font-black leading-none text-slate-900 outline-none transition [color-scheme:light] focus:border-[#1d95a8]/55 focus:ring-2 focus:ring-[#1d95a8]/12 dark:border-cyan-200/24 dark:bg-[#041a1d] dark:text-amber-50 dark:[color-scheme:dark] dark:focus:border-cyan-200/55 dark:focus:ring-cyan-200/12"
                />
              </label>

              <label className="block text-right">
                <span className="mb-1 flex items-center justify-end gap-1 pe-1 text-[9px] font-black leading-none text-slate-600 dark:text-cyan-100/68">
                  <span>من تاريخ</span>
                  <Calendar className="h-3 w-3" />
                </span>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => handleFilterChange('startDate', event.target.value)}
                  className="h-8 min-h-0 w-full rounded-[10px] border border-[#1d95a8]/24 bg-[#f8fcfc] px-2 text-right text-[11px] font-black leading-none text-slate-900 outline-none transition [color-scheme:light] focus:border-[#1d95a8]/55 focus:ring-2 focus:ring-[#1d95a8]/12 dark:border-cyan-200/24 dark:bg-[#041a1d] dark:text-amber-50 dark:[color-scheme:dark] dark:focus:border-cyan-200/55 dark:focus:ring-cyan-200/12"
                />
              </label>
            </div>

            <p className="mt-1.5 rounded-[10px] border border-[#1d95a8]/12 bg-[#f2fbfc] px-2 py-0.5 text-right text-[9px] font-semibold leading-4 text-slate-500 dark:border-cyan-200/16 dark:bg-[#041a1d]/70 dark:text-cyan-50/72">
              فلترة العمليات حسب تاريخ الإنشاء من بداية اليوم الأول لنهاية اليوم الأخير.
            </p>

            <div className="mt-1.5 flex gap-1.5">
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/28 bg-amber-100/70 text-amber-700 transition hover:border-amber-400/50 hover:bg-amber-100 dark:border-amber-300/24 dark:bg-amber-300/10 dark:text-amber-100 dark:hover:border-amber-300/45 dark:hover:bg-amber-300/15"
                  aria-label="إعادة تعيين"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onFilterChange(filters)}
                className="inline-flex h-6 flex-1 items-center justify-center gap-1 rounded-full border border-[#1d95a8]/24 bg-[linear-gradient(90deg,rgba(29,149,168,0.9),rgba(11,111,131,0.92))] text-[10px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:border-[#1d95a8]/45 hover:brightness-105 dark:border-cyan-200/24 dark:bg-[linear-gradient(90deg,rgba(29,149,168,0.55),rgba(44,32,88,0.78))] dark:text-cyan-100 dark:hover:border-cyan-200/45 dark:hover:brightness-110"
              >
                بحث
                <Search className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
