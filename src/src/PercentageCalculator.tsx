import React, { useState } from 'react';
import { Percent, ArrowUpRight, ArrowDownRight, Copy, Check, RotateCcw } from 'lucide-react';
import { toPersianDigits, toEnglishDigits, formatThousands } from '../utils/persianDigits';
import { soundManager } from '../utils/sound';

interface PercentageCalculatorProps {
  usePersianDigits: boolean;
}

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({ usePersianDigits }) => {
  // Scenario 1: X% of Y = ?
  const [percent1, setPercent1] = useState<string>('15');
  const [total1, setTotal1] = useState<string>('250000');

  // Scenario 2: X is what % of Y?
  const [val2, setVal2] = useState<string>('45');
  const [total2, setTotal2] = useState<string>('180');

  // Scenario 3: Percentage change from X to Y
  const [from3, setFrom3] = useState<string>('100');
  const [to3, setTo3] = useState<string>('135');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const fmt = (val: number | string) => {
    return formatThousands(val, usePersianDigits);
  };

  // Calculations:
  // Calc 1
  const p1 = parseFloat(toEnglishDigits(percent1)) || 0;
  const t1 = parseFloat(toEnglishDigits(total1)) || 0;
  const result1 = (p1 * t1) / 100;

  // Calc 2
  const v2 = parseFloat(toEnglishDigits(val2)) || 0;
  const t2 = parseFloat(toEnglishDigits(total2)) || 0;
  const result2 = t2 !== 0 ? (v2 / t2) * 100 : 0;

  // Calc 3
  const f3 = parseFloat(toEnglishDigits(from3)) || 0;
  const target3 = parseFloat(toEnglishDigits(to3)) || 0;
  const diff3 = target3 - f3;
  const changePercent3 = f3 !== 0 ? (diff3 / Math.abs(f3)) * 100 : 0;
  const isIncrease = diff3 >= 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-fuchsia-300">
          محاسبه‌گر پیشرفته درصد
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/70 max-w-lg mx-auto">
          محاسبه سریع نسبت‌ها، تخفیف‌های درصدی، سهم کل، و نرخ افزایش یا کاهش با دقت بالا
        </p>
      </div>

      {/* Grid of Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: X% of Y */}
        <div className="bg-[#0e0a22]/90 backdrop-blur-xl border border-purple-800/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(147,51,234,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/40">
              <span className="text-sm font-bold text-purple-200 flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                <span>محاسبه مقدار درصد</span>
              </span>
              <span className="text-xs text-purple-400/80 font-mono">P% × Total</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  چند درصد؟ (%)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usePersianDigits ? toPersianDigits(percent1) : percent1}
                    onChange={(e) => setPercent1(toEnglishDigits(e.target.value))}
                    className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    placeholder="مثلاً ۱۵"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-purple-400 font-bold font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  از چه مقداری؟ (کل)
                </label>
                <input
                  type="text"
                  value={usePersianDigits ? toPersianDigits(total1) : total1}
                  onChange={(e) => setTotal1(toEnglishDigits(e.target.value))}
                  className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  placeholder="مثلاً ۲۵۰۰۰۰"
                />
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="mt-5 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300/80 block mb-0.5">نتیجه محاسبه:</span>
              <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-purple-200 font-mono">
                {fmt(parseFloat(result1.toFixed(4)))}
              </div>
            </div>
            <button
              onClick={() => handleCopy(String(result1), 'c1')}
              className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 hover:text-white transition-colors"
              title="کپی نتیجه"
            >
              {copiedKey === 'c1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card 2: X is what % of Y? */}
        <div className="bg-[#0e0a22]/90 backdrop-blur-xl border border-purple-800/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(147,51,234,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/40">
              <span className="text-sm font-bold text-purple-200 flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                <span>تشخیص درصد سهم</span>
              </span>
              <span className="text-xs text-purple-400/80 font-mono">(A ÷ B) × 100</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  مقدار جزء (A)
                </label>
                <input
                  type="text"
                  value={usePersianDigits ? toPersianDigits(val2) : val2}
                  onChange={(e) => setVal2(toEnglishDigits(e.target.value))}
                  className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  placeholder="مثلاً ۴۵"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  مقدار کل (B)
                </label>
                <input
                  type="text"
                  value={usePersianDigits ? toPersianDigits(total2) : total2}
                  onChange={(e) => setTotal2(toEnglishDigits(e.target.value))}
                  className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  placeholder="مثلاً ۱۸۰"
                />
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="mt-5 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300/80 block mb-0.5">درصد معادل:</span>
              <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-purple-200 font-mono">
                {fmt(parseFloat(result2.toFixed(2)))}%
              </div>
            </div>
            <button
              onClick={() => handleCopy(`${result2.toFixed(2)}%`, 'c2')}
              className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 hover:text-white transition-colors"
              title="کپی نتیجه"
            >
              {copiedKey === 'c2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card 3: Percentage Change (Increase / Decrease) */}
        <div className="bg-[#0e0a22]/90 backdrop-blur-xl border border-purple-800/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(147,51,234,0.15)] md:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/40">
            <span className="text-sm font-bold text-purple-200 flex items-center gap-2">
              {isIncrease ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              )}
              <span>درصد تغییر (افزایش یا کاهش)</span>
            </span>
            <span className="text-xs text-purple-400/80 font-mono">((B - A) ÷ A) × 100</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                مقدار اولیه (پایه)
              </label>
              <input
                type="text"
                value={usePersianDigits ? toPersianDigits(from3) : from3}
                onChange={(e) => setFrom3(toEnglishDigits(e.target.value))}
                className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                placeholder="مثلاً ۱۰۰"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                مقدار نهایی (جدید)
              </label>
              <input
                type="text"
                value={usePersianDigits ? toPersianDigits(to3) : to3}
                onChange={(e) => setTo3(toEnglishDigits(e.target.value))}
                className="w-full bg-[#070512] border border-purple-900/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                placeholder="مثلاً ۱۳۵"
              />
            </div>
          </div>

          {/* Change Summary Banner */}
          <div className="mt-5 p-4 rounded-2xl bg-[#070512] border border-purple-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isIncrease ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
              }`}>
                {isIncrease ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">
                  {isIncrease ? 'افزایش رخ داده است:' : 'کاهش رخ داده است:'}
                </span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${
                  isIncrease ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {isIncrease ? '+' : ''}{fmt(parseFloat(changePercent3.toFixed(2)))}%
                </span>
              </div>
            </div>

            <div className="text-left text-xs font-mono text-purple-300/80">
              اختلاف مطلق: {fmt(parseFloat(Math.abs(diff3).toFixed(2)))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
