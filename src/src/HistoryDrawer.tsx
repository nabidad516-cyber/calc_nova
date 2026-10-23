import React, { useState } from 'react';
import { X, Trash2, Copy, Check, CornerDownLeft, Clock } from 'lucide-react';
import { HistoryItem } from '../types';
import { toPersianDigits, getPersianRelativeTime } from '../utils/persianDigits';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  usePersianDigits: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onSelectHistoryItem,
  usePersianDigits,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (item: HistoryItem) => {
    const text = `${item.expression} = ${item.result}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const formatDisplay = (str: string) => {
    return usePersianDigits ? toPersianDigits(str) : str;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#0d0a1d] border-l border-purple-900/40 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-purple-100">تاریخچه محاسبات</h2>
            <span className="text-xs text-purple-400/80 mr-1">
              ({formatDisplay(String(history.length))} مورد)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="پاکسازی تمام تاریخچه"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-purple-950/40 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-center text-purple-400">
                <Clock className="w-7 h-7 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-300">هنوز محاسبه‌ای ثبت نشده است</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                هر محاسبه‌ای که با زدن دکمه مساوی (=) انجام دهید، در این بخش برای دسترسی سریع ذخیره می‌شود.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative p-3.5 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-900/30 hover:border-purple-600/40 transition-all duration-150"
              >
                {/* Time & actions header */}
                <div className="flex items-center justify-between text-[11px] text-purple-400/80 mb-1.5">
                  <span className="font-mono">{getPersianRelativeTime(item.timestamp)}</span>
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(item)}
                      title="کپی نتیجه"
                      className="p-1 rounded text-purple-300 hover:text-white hover:bg-purple-800/40 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {/* Delete single item */}
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      title="حذف این مورد"
                      className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expression */}
                <div 
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="cursor-pointer space-y-1"
                >
                  <div className="text-xs text-slate-400 font-mono tracking-wide text-left dir-ltr truncate">
                    {formatDisplay(item.expression)}
                  </div>
                  {/* Result */}
                  <div className="flex items-center justify-between pt-1 border-t border-purple-900/20">
                    <span className="text-[11px] text-purple-400/70 flex items-center gap-1">
                      <CornerDownLeft className="w-3 h-3 text-purple-400" />
                      <span>استفاده در ورودی</span>
                    </span>
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-l from-purple-200 to-white font-mono text-left dir-ltr">
                      = {formatDisplay(item.result)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-purple-900/30 text-center text-[11px] text-purple-400/70">
          تاریخچه محاسبات در حافظه دستگاه شما ذخیره می‌شود.
        </div>
      </div>
    </div>
  );
};
