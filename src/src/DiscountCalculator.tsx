import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check, RotateCcw, TrendingDown } from 'lucide-react';
import { toPersianDigits, toEnglishDigits, formatThousands } from '../utils/persianDigits';

interface DiscountCalculatorProps {
  usePersianDigits: boolean;
}

export const DiscountCalculator: React.FC<DiscountCalculatorProps> = ({ usePersianDigits }) => {
  const [originalPrice, setOriginalPrice] = useState<string>('1200000');
  const [discountPercent, setDiscountPercent] = useState<string>('25');
  const [extraDiscount, setExtraDiscount] = useState<string>('0');
  const [taxPercent, setTaxPercent] = useState<string>('9');
  const [copied, setCopied] = useState<boolean>(false);

  const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 50, 70];

  const price = Math.max(0, parseFloat(toEnglishDigits(originalPrice)) || 0);
  const discount1 = Math.min(100, Math.max(0, parseFloat(toEnglishDigits(discountPercent)) || 0));
  const discount2 = Math.min(100, Math.max(0, parseFloat(toEnglishDigits(extraDiscount)) || 0));
  const tax = Math.max(0, parseFloat(toEnglishDigits(taxPercent)) || 0);

  // Calculations
  // Step 1: primary discount
  const savings1 = (price * discount1) / 100;
  const priceAfterDisc1 = price - savings1;

  // Step 2: extra discount on remaining
  const savings2 = (priceAfterDisc1 * discount2) / 100;
  const priceAfterDisc2 = priceAfterDisc1 - savings2;

  const totalSavings = savings1 + savings2;
  const taxAmount = (priceAfterDisc2 * tax) / 100;
  const finalPrice = priceAfterDisc2 + taxAmount;

  const effectiveDiscountPercent = price > 0 ? (totalSavings / price) * 100 : 0;

  const fmt = (num: number | string) => {
    return formatThousands(num, usePersianDigits);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(Math.round(finalPrice)));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleReset = () => {
    setOriginalPrice('');
    setDiscountPercent('0');
    setExtraDiscount('0');
    setTaxPercent('0');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-fuchsia-300">
          محاسبه‌گر حرفه‌ای تخفیف و خرید
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/70 max-w-lg mx-auto">
          محاسبه دقیق قیمت نهایی پس از تخفیف، تخفیف‌های پلکانی، بن تخفیف و مالیات بر ارزش افزوده
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e0a22]/90 backdrop-blur-xl border border-purple-800/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(147,51,234,0.15)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
            <span className="text-sm font-bold text-purple-200 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>مشخصات قیمت و تخفیف</span>
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-purple-400 hover:text-purple-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی</span>
            </button>
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              قیمت اولیه کالا یا خدمات (تومان / ریال)
            </label>
            <div className="relative">
              <input
                type="text"
                value={usePersianDigits ? toPersianDigits(originalPrice) : originalPrice}
                onChange={(e) => setOriginalPrice(toEnglishDigits(e.target.value))}
                className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-3 text-slate-100 font-mono text-base focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                placeholder="مثلاً ۱,۲۰۰,۰۰۰"
              />
              <span className="absolute left-3 top-3 text-xs text-purple-400/80 font-medium">تومان</span>
            </div>
          </div>

          {/* Discount Percentage + Quick Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                درصد تخفیف اولیه (%)
              </label>
              <span className="text-xs font-mono text-purple-400 font-bold">
                {usePersianDigits ? toPersianDigits(discountPercent) : discountPercent}%
              </span>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={usePersianDigits ? toPersianDigits(discountPercent) : discountPercent}
                onChange={(e) => setDiscountPercent(toEnglishDigits(e.target.value))}
                className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                placeholder="مثلاً ۲۵"
              />
              <span className="absolute left-3 top-2.5 text-xs text-purple-400 font-mono font-bold">%</span>
            </div>

            {/* Quick Discount Selection Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DISCOUNTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscountPercent(String(d))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    parseFloat(discountPercent) === d
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-900/40'
                  }`}
                >
                  {usePersianDigits ? toPersianDigits(d) : d}%
                </button>
              ))}
            </div>
          </div>

          {/* Extra Coupon & Tax row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-900/30">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                کوپن / تخفیف مضاعف (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usePersianDigits ? toPersianDigits(extraDiscount) : extraDiscount}
                  onChange={(e) => setExtraDiscount(toEnglishDigits(e.target.value))}
                  className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  placeholder="۰"
                />
                <span className="absolute left-3 top-2 text-xs text-purple-400 font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                مالیات بر ارزش افزوده (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usePersianDigits ? toPersianDigits(taxPercent) : taxPercent}
                  onChange={(e) => setTaxPercent(toEnglishDigits(e.target.value))}
                  className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  placeholder="۹"
                />
                <span className="absolute left-3 top-2 text-xs text-purple-400 font-mono">%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Results Card Column (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#130b2c] to-[#0a0717] border border-purple-600/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(168,85,247,0.2)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                صورت‌حساب نهایی
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono font-bold">
                {fmt(Math.round(effectiveDiscountPercent))}% سود
              </span>
            </div>

            {/* Big Final Price to Pay */}
            <div className="p-4 rounded-2xl bg-[#080514]/80 border border-purple-900/60 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none" />
              <span className="text-xs text-purple-300/80 block mb-1">
                مبلغ قابل پرداخت نهایی:
              </span>
              <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white via-purple-100 to-purple-300 font-mono">
                {fmt(Math.round(finalPrice))} <span className="text-xs text-purple-400 font-normal">تومان</span>
              </div>

              <button
                onClick={handleCopy}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-purple-700/40 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مبلغ کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی مبلغ نهایی</span>
                  </>
                )}
              </button>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>قیمت بدون تخفیف:</span>
                <span className="font-mono text-slate-300">{fmt(price)} تومان</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>کل سود و تخفیف شما:</span>
                </span>
                <span className="font-mono font-bold">− {fmt(Math.round(totalSavings))} تومان</span>
              </div>

              {tax > 0 && (
                <div className="flex items-center justify-between text-purple-300/80">
                  <span>مالیات بر ارزش افزوده ({usePersianDigits ? toPersianDigits(tax) : tax}%):</span>
                  <span className="font-mono">+ {fmt(Math.round(taxAmount))} تومان</span>
                </div>
              )}
            </div>

            {/* Visual ratio bar */}
            {price > 0 && (
              <div className="pt-2">
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                    style={{ width: `${Math.min(100, (finalPrice / price) * 100)}%` }} 
                    title="سهم پرداختی"
                  />
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${Math.min(100, (totalSavings / price) * 100)}%` }} 
                    title="سهم تخفیف"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>پرداختی ({Math.round((finalPrice / price) * 100)}%)</span>
                  <span className="text-emerald-400">سود ({Math.round(effectiveDiscountPercent)}%)</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/30 text-center text-[11px] text-purple-400/60">
            مناسب برای فاکتور فروشگاهی، حراجی و بلک فرایدی
          </div>
        </div>

      </div>
    </div>
  );
};
