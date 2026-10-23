import React from 'react';
import { Volume2, VolumeX, History, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';
import { toPersianDigits } from '../utils/persianDigits';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  usePersianDigits: boolean;
  setUsePersianDigits: (val: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  usePersianDigits,
  setUsePersianDigits,
  soundEnabled,
  onToggleSound,
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090714]/85 border-b border-purple-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element Brand wordmark with cosmic neon accent */}
        <div 
          onClick={() => setActiveTab('calculator')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-fuchsia-600 p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_20px_rgba(192,132,252,0.6)] transition-all">
            <div className="w-full h-full bg-[#0b0918] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 select-none">
            <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-fuchsia-300">
              CALC NOVA
            </span>
            <span className="text-xs text-purple-400/80 font-medium hidden sm:inline">
              کلک نووا
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop view) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-semibold ${
              activeTab === 'calculator'
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            ماشین‌حساب
          </button>

          <button
            onClick={() => setActiveTab('percentage')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-semibold ${
              activeTab === 'percentage'
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            محاسبه درصد
          </button>

          <button
            onClick={() => setActiveTab('discount')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-semibold ${
              activeTab === 'discount'
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            محاسبه تخفیف
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-semibold ${
              activeTab === 'converter'
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            تبدیل واحد
          </button>
        </nav>

        {/* Zone 3: Quick Controls (Digits toggle, sound, history) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Persian / English Digits Switcher */}
          <button
            onClick={() => setUsePersianDigits(!usePersianDigits)}
            title={usePersianDigits ? 'تغییر به اعداد لاتین' : 'تغییر به اعداد فارسی'}
            className="h-9 px-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <span className="text-[13px] font-bold">{usePersianDigits ? '۱۲۳' : '123'}</span>
            <span className="text-[11px] text-purple-400/80 hidden sm:inline">
              {usePersianDigits ? 'فارسی' : 'انگلیسی'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'قطع صدا' : 'وصل صدا'}
            className="w-9 h-9 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-purple-300 hover:text-purple-100 transition-colors flex items-center justify-center"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="تاریخچه محاسبات"
            className="h-9 px-3 rounded-lg bg-gradient-to-r from-purple-700/80 to-indigo-700/80 hover:from-purple-600 hover:to-indigo-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.3)] active:scale-95 transition-all"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تاریخچه</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                {usePersianDigits ? toPersianDigits(historyCount) : historyCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
