import React, { useState, useEffect } from 'react';
import { StarryBackground } from './components/StarryBackground';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { PercentageCalculator } from './components/PercentageCalculator';
import { DiscountCalculator } from './components/DiscountCalculator';
import { UnitConverter } from './components/UnitConverter';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ActiveTab, HistoryItem } from './types';
import { soundManager } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [usePersianDigits, setUsePersianDigits] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [recalledItem, setRecalledItem] = useState<HistoryItem | null>(null);

  // Load saved preferences and history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('calc_nova_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedDigits = localStorage.getItem('calc_nova_digits');
      if (savedDigits !== null) {
        setUsePersianDigits(savedDigits === 'fa');
      }

      setSoundEnabled(soundManager.isEnabled());
    } catch {
      // LocalStorage errors ignored in sandbox if private mode
    }
  }, []);

  // Save history to localStorage
  const handleAddHistory = (item: Omit<HistoryItem, 'id'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // Keep last 50
      try {
        localStorage.setItem('calc_nova_history', JSON.stringify(updated));
      } catch {
        // storage overflow fallback
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('calc_nova_history');
    } catch {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('calc_nova_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setRecalledItem(item);
    setActiveTab('calculator');
  };

  const handleToggleDigits = (val: boolean) => {
    setUsePersianDigits(val);
    try {
      localStorage.setItem('calc_nova_digits', val ? 'fa' : 'en');
    } catch {}
  };

  const handleToggleSound = () => {
    const res = soundManager.toggle();
    setSoundEnabled(res);
  };

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white relative font-sans">
      
      {/* Dynamic Cosmic Background */}
      <StarryBackground />

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usePersianDigits={usePersianDigits}
        setUsePersianDigits={handleToggleDigits}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12 z-10 flex flex-col items-center justify-center">
        {activeTab === 'calculator' && (
          <Calculator
            onAddHistory={handleAddHistory}
            usePersianDigits={usePersianDigits}
            recalledItem={recalledItem}
            onClearRecalledItem={() => setRecalledItem(null)}
          />
        )}

        {activeTab === 'percentage' && (
          <PercentageCalculator usePersianDigits={usePersianDigits} />
        )}

        {activeTab === 'discount' && (
          <DiscountCalculator usePersianDigits={usePersianDigits} />
        )}

        {activeTab === 'converter' && (
          <UnitConverter usePersianDigits={usePersianDigits} />
        )}
      </main>

      {/* Slide-over History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onSelectHistoryItem={handleSelectHistoryItem}
        usePersianDigits={usePersianDigits}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        usePersianDigits={usePersianDigits}
      />

      {/* Subtle Desktop Footer */}
      <footer className="hidden md:block w-full border-t border-purple-950/40 py-4 px-6 text-center text-xs text-purple-400/60 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-300">CALC NOVA</span>
            <span>·</span>
            <span>ماشین‌حساب آنلاین هوشمند و محاسبات دقیق</span>
          </div>
          <div>
            طراحی شده با React و استانداردهای ریاضی بدون خطا
          </div>
        </div>
      </footer>

    </div>
  );
}
