import React from 'react';
import { Calculator, Percent, Tag, ArrowLeftRight, History } from 'lucide-react';
import { ActiveTab } from '../types';
import { toPersianDigits } from '../utils/persianDigits';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenHistory: () => void;
  historyCount: number;
  usePersianDigits: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenHistory,
  historyCount,
  usePersianDigits,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090615]/95 backdrop-blur-xl border-t border-purple-900/40 px-2 py-1 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto">
        
        {/* Tab 1: Calculator */}
        <button
          onClick={() => setActiveTab('calculator')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'calculator'
              ? 'text-purple-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            activeTab === 'calculator' ? 'bg-purple-600/25 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : ''
          }`}>
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">حسابگر</span>
        </button>

        {/* Tab 2: Percentage */}
        <button
          onClick={() => setActiveTab('percentage')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'percentage'
              ? 'text-purple-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            activeTab === 'percentage' ? 'bg-purple-600/25 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : ''
          }`}>
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">درصد</span>
        </button>

        {/* Tab 3: Discount */}
        <button
          onClick={() => setActiveTab('discount')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'discount'
              ? 'text-purple-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            activeTab === 'discount' ? 'bg-purple-600/25 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : ''
          }`}>
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">تخفیف</span>
        </button>

        {/* Tab 4: Unit Converter */}
        <button
          onClick={() => setActiveTab('converter')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'converter'
              ? 'text-purple-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            activeTab === 'converter' ? 'bg-purple-600/25 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : ''
          }`}>
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">تبدیل واحد</span>
        </button>

        {/* Tab 5: History Sheet trigger */}
        <button
          onClick={onOpenHistory}
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-400 hover:text-purple-300 relative transition-all"
        >
          <div className="p-1 rounded-xl relative">
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                {usePersianDigits ? toPersianDigits(historyCount) : historyCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">تاریخچه</span>
        </button>

      </div>
    </div>
  );
};
