import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Ruler, 
  Scale, 
  Thermometer, 
  HardDrive, 
  Box, 
  Gauge, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { toPersianDigits, toEnglishDigits, formatThousands } from '../utils/persianDigits';

interface UnitDef {
  id: string;
  nameFa: string;
  symbol: string;
  // Conversion to base unit
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

interface UnitCategoryDef {
  id: string;
  titleFa: string;
  icon: React.ElementType;
  baseUnitSymbol: string;
  units: UnitDef[];
}

const CATEGORIES: UnitCategoryDef[] = [
  {
    id: 'length',
    titleFa: 'طول و مسافت',
    icon: Ruler,
    baseUnitSymbol: 'm',
    units: [
      { id: 'm', nameFa: 'متر', symbol: 'm', toBase: v => v, fromBase: v => v },
      { id: 'km', nameFa: 'کیلومتر', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'cm', nameFa: 'سانتی‌متر', symbol: 'cm', toBase: v => v / 100, fromBase: v => v * 100 },
      { id: 'mm', nameFa: 'میلی‌متر', symbol: 'mm', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'mi', nameFa: 'مایل', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
      { id: 'ft', nameFa: 'فوت', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { id: 'in', nameFa: 'اینچ', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { id: 'yd', nameFa: 'یارد', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    ],
  },
  {
    id: 'weight',
    titleFa: 'وزن و جرم',
    icon: Scale,
    baseUnitSymbol: 'kg',
    units: [
      { id: 'kg', nameFa: 'کیلوگرم', symbol: 'kg', toBase: v => v, fromBase: v => v },
      { id: 'g', nameFa: 'گرم', symbol: 'g', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'mg', nameFa: 'میلی‌گرم', symbol: 'mg', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
      { id: 't', nameFa: 'تن متریک', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'lb', nameFa: 'پوند (lb)', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
      { id: 'oz', nameFa: 'اونس (oz)', symbol: 'oz', toBase: v => v * 0.028349523, fromBase: v => v / 0.028349523 },
    ],
  },
  {
    id: 'temperature',
    titleFa: 'دما و حرارت',
    icon: Thermometer,
    baseUnitSymbol: '°C',
    units: [
      { id: 'c', nameFa: 'سلسیوس (سانتی‌گراد)', symbol: '°C', toBase: v => v, fromBase: v => v },
      { id: 'f', nameFa: 'فارنهایت', symbol: '°F', toBase: v => (v - 32) * (5 / 9), fromBase: v => (v * 9) / 5 + 32 },
      { id: 'k', nameFa: 'کلوین', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  {
    id: 'volume',
    titleFa: 'حجم و مایعات',
    icon: Box,
    baseUnitSymbol: 'L',
    units: [
      { id: 'l', nameFa: 'لیتر', symbol: 'L', toBase: v => v, fromBase: v => v },
      { id: 'ml', nameFa: 'میلی‌لیتر (cc)', symbol: 'mL', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'm3', nameFa: 'متر مکعب', symbol: 'm³', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'gal', nameFa: 'گالن آمریکایی', symbol: 'gal', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
      { id: 'cup', nameFa: 'فنجان استاندارد', symbol: 'cup', toBase: v => v * 0.24, fromBase: v => v / 0.24 },
    ],
  },
  {
    id: 'storage',
    titleFa: 'داده و حافظه دیجیتال',
    icon: HardDrive,
    baseUnitSymbol: 'MB',
    units: [
      { id: 'b', nameFa: 'بایت (Byte)', symbol: 'B', toBase: v => v / (1024 * 1024), fromBase: v => v * (1024 * 1024) },
      { id: 'kb', nameFa: 'کیلوبایت (KB)', symbol: 'KB', toBase: v => v / 1024, fromBase: v => v * 1024 },
      { id: 'mb', nameFa: 'مگابایت (MB)', symbol: 'MB', toBase: v => v, fromBase: v => v },
      { id: 'gb', nameFa: 'گیگابایت (GB)', symbol: 'GB', toBase: v => v * 1024, fromBase: v => v / 1024 },
      { id: 'tb', nameFa: 'ترابایت (TB)', symbol: 'TB', toBase: v => v * 1024 * 1024, fromBase: v => v / (1024 * 1024) },
    ],
  },
  {
    id: 'speed',
    titleFa: 'سرعت و شتاب',
    icon: Gauge,
    baseUnitSymbol: 'km/h',
    units: [
      { id: 'kmh', nameFa: 'کیلومتر بر ساعت', symbol: 'km/h', toBase: v => v, fromBase: v => v },
      { id: 'ms', nameFa: 'متر بر ثانیه', symbol: 'm/s', toBase: v => v * 3.6, fromBase: v => v / 3.6 },
      { id: 'mph', nameFa: 'مایل بر ساعت', symbol: 'mph', toBase: v => v * 1.60934, fromBase: v => v / 1.60934 },
      { id: 'knot', nameFa: 'گره دریایی', symbol: 'knot', toBase: v => v * 1.852, fromBase: v => v / 1.852 },
    ],
  },
];

interface UnitConverterProps {
  usePersianDigits: boolean;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ usePersianDigits }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('km');
  const [toUnitId, setToUnitId] = useState<string>('m');
  const [copied, setCopied] = useState<boolean>(false);

  const currentCategory = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0];
  }, [activeCategoryId]);

  // Handle category switch: adjust unit defaults
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
    if (cat.units.length >= 2) {
      setFromUnitId(cat.units[0].id);
      setToUnitId(cat.units[1].id);
    }
  };

  const fromUnit = useMemo(() => {
    return currentCategory.units.find(u => u.id === fromUnitId) || currentCategory.units[0];
  }, [currentCategory, fromUnitId]);

  const toUnit = useMemo(() => {
    return currentCategory.units.find(u => u.id === toUnitId) || currentCategory.units[1] || currentCategory.units[0];
  }, [currentCategory, toUnitId]);

  // Calculation
  const numericInput = parseFloat(toEnglishDigits(inputValue)) || 0;
  const baseValue = fromUnit.toBase(numericInput);
  const convertedValue = toUnit.fromBase(baseValue);

  // Clean float representation
  const cleanConverted = parseFloat(convertedValue.toPrecision(10));

  // Swap units
  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(cleanConverted));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const fmt = (val: number | string) => {
    return formatThousands(val, usePersianDigits);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-fuchsia-300">
          تبدیل‌گر جامع واحدهای اندازه‌گیری
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/70 max-w-lg mx-auto">
          تبدیل دقیق و آنی واحدهای متریک، امپریال، دما، حجم، جرم و داده با پشتیبانی از ارقام فارسی
        </p>
      </div>

      {/* Category Tabs Carousel/Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/40'
                  : 'bg-[#0f0b22] text-slate-400 hover:text-slate-200 hover:bg-purple-950/40 border border-purple-900/30'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{cat.titleFa}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversion Workspace Card */}
      <div className="bg-[#0e0a22]/90 backdrop-blur-xl border border-purple-800/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_30px_rgba(147,51,234,0.18)]">
        
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* FROM Unit Box (5 cols) */}
          <div className="md:col-span-5 bg-[#080514] border border-purple-900/50 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-purple-300/80">
              <span className="font-medium">از واحد:</span>
              <span className="font-mono text-purple-400 font-bold">{fromUnit.symbol}</span>
            </div>

            {/* Select Unit */}
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full bg-[#120d2b] border border-purple-800/40 rounded-xl px-3 py-2.5 text-slate-100 text-xs font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {currentCategory.units.map(u => (
                <option key={u.id} value={u.id} className="bg-[#0b081c] text-white">
                  {u.nameFa} ({u.symbol})
                </option>
              ))}
            </select>

            {/* Input Value */}
            <div>
              <input
                type="text"
                value={usePersianDigits ? toPersianDigits(inputValue) : inputValue}
                onChange={(e) => setInputValue(toEnglishDigits(e.target.value))}
                className="w-full bg-transparent border-b border-purple-800/50 py-2 text-2xl sm:text-3xl font-extrabold text-white font-mono text-left dir-ltr focus:outline-none focus:border-purple-400"
                placeholder="1"
              />
            </div>

            {/* Preset quick buttons */}
            <div className="flex gap-1.5 pt-1">
              {['1', '10', '50', '100'].map(preset => (
                <button
                  key={preset}
                  onClick={() => setInputValue(preset)}
                  className="px-2 py-0.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-900/40 text-[11px] font-mono text-purple-300"
                >
                  {usePersianDigits ? toPersianDigits(preset) : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button (1 col) */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              className="w-12 h-12 rounded-2xl bg-purple-700/40 hover:bg-purple-600/50 border border-purple-500/50 text-white flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:scale-105 active:scale-95 transition-all"
              title="جابجایی واحد مبدا و مقصد"
            >
              <ArrowLeftRight className="w-5 h-5 text-purple-200" />
            </button>
          </div>

          {/* TO Unit Box (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#120a2e] to-[#090518] border border-purple-600/40 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-purple-300/80">
              <span className="font-medium">به واحد:</span>
              <span className="font-mono text-purple-400 font-bold">{toUnit.symbol}</span>
            </div>

            {/* Select Target Unit */}
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full bg-[#170e38] border border-purple-700/50 rounded-xl px-3 py-2.5 text-slate-100 text-xs font-medium focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {currentCategory.units.map(u => (
                <option key={u.id} value={u.id} className="bg-[#0b081c] text-white">
                  {u.nameFa} ({u.symbol})
                </option>
              ))}
            </select>

            {/* Converted Output Display */}
            <div className="py-2 border-b border-purple-800/40 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white via-purple-100 to-purple-300 font-mono text-left dir-ltr truncate">
                {fmt(cleanConverted)}
              </span>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 hover:text-white transition-colors shrink-0"
                title="کپی نتیجه تبدیل"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Conversion Formula Hint */}
            <div className="text-[11px] text-purple-300/70 font-mono text-left dir-ltr pt-1 truncate">
              1 {fromUnit.symbol} ≈ {toUnit.fromBase(fromUnit.toBase(1)).toPrecision(6)} {toUnit.symbol}
            </div>
          </div>

        </div>

        {/* Additional Conversions List for current category */}
        <div className="mt-6 pt-5 border-t border-purple-900/40">
          <span className="text-xs font-bold text-purple-300 block mb-3">
            جدول مقایسه همزمان با سایر واحدهای {currentCategory.titleFa}:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {currentCategory.units.map(u => {
              const val = u.fromBase(baseValue);
              const cleanVal = parseFloat(val.toPrecision(8));
              return (
                <div
                  key={u.id}
                  onClick={() => setToUnitId(u.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    toUnitId === u.id
                      ? 'bg-purple-900/30 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                      : 'bg-[#080513] border-purple-950/60 hover:border-purple-800/40'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 truncate mb-1">{u.nameFa}</div>
                  <div className="font-mono font-bold text-white text-left dir-ltr truncate">
                    {fmt(cleanVal)} <span className="text-[10px] text-purple-400">{u.symbol}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
