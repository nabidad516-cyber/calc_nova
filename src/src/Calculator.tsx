import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Delete, 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { HistoryItem } from '../types';
import { evaluateExpression } from '../utils/mathEngine';
import { toPersianDigits, toEnglishDigits, formatThousands } from '../utils/persianDigits';
import { soundManager } from '../utils/sound';

interface CalculatorProps {
  onAddHistory: (item: Omit<HistoryItem, 'id'>) => void;
  usePersianDigits: boolean;
  recalledItem: HistoryItem | null;
  onClearRecalledItem: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  onAddHistory,
  usePersianDigits,
  recalledItem,
  onClearRecalledItem,
}) => {
  // State for current expression & display
  const [expression, setExpression] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isScientific, setIsScientific] = useState<boolean>(false);
  const displayContainerRef = useRef<HTMLDivElement>(null);

  // Handle recalled item from history
  useEffect(() => {
    if (recalledItem) {
      setExpression(recalledItem.expression + ' =');
      setCurrentInput(recalledItem.result);
      setIsCalculated(true);
      setErrorMsg(null);
      onClearRecalledItem();
    }
  }, [recalledItem, onClearRecalledItem]);

  // Digits input handler
  const handleDigit = useCallback((digit: string) => {
    soundManager.playDigitClick();
    setErrorMsg(null);

    if (isCalculated) {
      // Start fresh
      setExpression('');
      setCurrentInput(digit);
      setIsCalculated(false);
      return;
    }

    if (currentInput === '0' || currentInput === 'خطا') {
      setCurrentInput(digit);
    } else {
      // Prevent unreasonably long input strings
      if (currentInput.length > 25) return;
      setCurrentInput(prev => prev + digit);
    }
  }, [currentInput, isCalculated]);

  // Decimal dot
  const handleDecimal = useCallback(() => {
    soundManager.playDigitClick();
    setErrorMsg(null);

    if (isCalculated) {
      setExpression('');
      setCurrentInput('0.');
      setIsCalculated(false);
      return;
    }

    if (!currentInput.includes('.')) {
      setCurrentInput(prev => prev + '.');
    }
  }, [currentInput, isCalculated]);

  // Operator input (+, -, ×, ÷, ^)
  const handleOperator = useCallback((op: string) => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    const asciiOp = op === '×' ? '*' : op === '÷' ? '/' : op;

    if (isCalculated) {
      setExpression(`${currentInput} ${asciiOp}`);
      setCurrentInput('0');
      setIsCalculated(false);
      return;
    }

    if (currentInput !== '0' && currentInput !== '') {
      // Push current number and operator to expression
      setExpression(prev => (prev ? `${prev} ${currentInput} ${asciiOp}` : `${currentInput} ${asciiOp}`));
      setCurrentInput('0');
    } else if (expression) {
      // Replace last operator if user pressed another operator
      const tokens = expression.trim().split(' ');
      const lastToken = tokens[tokens.length - 1];
      if (['+', '-', '*', '/', '^'].includes(lastToken)) {
        tokens[tokens.length - 1] = asciiOp;
        setExpression(tokens.join(' '));
      }
    }
  }, [currentInput, expression, isCalculated]);

  // Backspace / Delete last digit
  const handleBackspace = useCallback(() => {
    soundManager.playClear();
    setErrorMsg(null);

    if (isCalculated) {
      setExpression('');
      setIsCalculated(false);
      return;
    }

    if (currentInput.length > 1) {
      setCurrentInput(prev => prev.slice(0, -1));
    } else {
      setCurrentInput('0');
    }
  }, [currentInput, isCalculated]);

  // Clear current input (C)
  const handleClear = useCallback(() => {
    soundManager.playClear();
    setCurrentInput('0');
    setErrorMsg(null);
  }, []);

  // All Clear (AC)
  const handleAllClear = useCallback(() => {
    soundManager.playClear();
    setCurrentInput('0');
    setExpression('');
    setErrorMsg(null);
    setIsCalculated(false);
  }, []);

  // Toggle positive/negative (±)
  const handleToggleSign = useCallback(() => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    if (currentInput === '0' || currentInput === 'خطا') return;

    if (currentInput.startsWith('-')) {
      setCurrentInput(currentInput.slice(1));
    } else {
      setCurrentInput('-' + currentInput);
    }
  }, [currentInput]);

  // Square Root (√)
  const handleSquareRoot = useCallback(() => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    const val = parseFloat(toEnglishDigits(currentInput));
    if (Number.isNaN(val)) return;

    if (val < 0) {
      setErrorMsg('جذر عدد منفی امکان‌پذیر نیست');
      soundManager.playError();
      return;
    }

    const res = Math.sqrt(val);
    const cleaned = parseFloat(res.toPrecision(12));
    const fullExpr = `√(${currentInput})`;
    
    setExpression(fullExpr + ' =');
    setCurrentInput(String(cleaned));
    setIsCalculated(true);
    soundManager.playEquals();

    onAddHistory({
      expression: fullExpr,
      result: String(cleaned),
      timestamp: Date.now(),
    });
  }, [currentInput, onAddHistory]);

  // Square (x²)
  const handleSquare = useCallback(() => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    const val = parseFloat(toEnglishDigits(currentInput));
    if (Number.isNaN(val)) return;

    const res = val * val;
    const cleaned = parseFloat(res.toPrecision(12));
    const fullExpr = `(${currentInput})²`;

    setExpression(fullExpr + ' =');
    setCurrentInput(String(cleaned));
    setIsCalculated(true);
    soundManager.playEquals();

    onAddHistory({
      expression: fullExpr,
      result: String(cleaned),
      timestamp: Date.now(),
    });
  }, [currentInput, onAddHistory]);

  // Percentage (%)
  const handlePercentage = useCallback(() => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    const val = parseFloat(toEnglishDigits(currentInput));
    if (Number.isNaN(val)) return;

    // If there is a preceding expression, e.g. "200 - 20%" -> 20% of 200 is 40
    if (expression) {
      const tokens = expression.trim().split(' ');
      const lastOp = tokens[tokens.length - 1];
      const baseNumStr = tokens[tokens.length - 2];
      const baseNum = parseFloat(baseNumStr);

      if (['+', '-'].includes(lastOp) && !Number.isNaN(baseNum)) {
        const percentValue = (baseNum * val) / 100;
        setCurrentInput(String(percentValue));
        return;
      }
    }

    // Default simple percentage: val / 100
    const res = val / 100;
    setCurrentInput(String(parseFloat(res.toPrecision(12))));
  }, [currentInput, expression]);

  // Scientific functions (sin, cos, tan, log, ln, etc.)
  const handleScientificFunction = useCallback((func: string) => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    const val = parseFloat(toEnglishDigits(currentInput));
    if (Number.isNaN(val)) return;

    const fullExpr = `${func}(${currentInput})`;
    const evalRes = evaluateExpression(fullExpr);

    if (evalRes.success && evalRes.formattedResult) {
      setExpression(fullExpr + ' =');
      setCurrentInput(evalRes.formattedResult);
      setIsCalculated(true);
      soundManager.playEquals();

      onAddHistory({
        expression: fullExpr,
        result: evalRes.formattedResult,
        timestamp: Date.now(),
      });
    } else {
      setErrorMsg(evalRes.error || 'خطای محاسبه');
      soundManager.playError();
    }
  }, [currentInput, onAddHistory]);

  // Insert constant (π, e)
  const handleConstant = useCallback((c: 'π' | 'e') => {
    soundManager.playDigitClick();
    setErrorMsg(null);
    const val = c === 'π' ? String(Math.PI) : String(Math.E);
    setCurrentInput(val.slice(0, 10));
    setIsCalculated(false);
  }, []);

  // Parentheses ( )
  const handleParenthesis = useCallback((p: '(' | ')') => {
    soundManager.playOperatorClick();
    setErrorMsg(null);

    if (p === '(') {
      if (expression && !expression.endsWith(' ') && !expression.endsWith('(')) {
        setExpression(prev => `${prev} * (`);
      } else {
        setExpression(prev => `${prev}(`);
      }
      setCurrentInput('0');
    } else {
      if (currentInput !== '0') {
        setExpression(prev => `${prev} ${currentInput} )`);
        setCurrentInput('0');
      } else {
        setExpression(prev => `${prev} )`);
      }
    }
  }, [currentInput, expression]);

  // Equal / Calculate (=)
  const handleEquals = useCallback(() => {
    setErrorMsg(null);

    // Build the full formula
    let fullExpr = expression.replace(/=$/, '').trim();
    if (currentInput !== '0' || !fullExpr) {
      fullExpr = fullExpr ? `${fullExpr} ${currentInput}` : currentInput;
    }

    if (!fullExpr) return;

    const evalRes = evaluateExpression(fullExpr);

    if (evalRes.success && evalRes.formattedResult) {
      soundManager.playEquals();
      const resultStr = evalRes.formattedResult;
      
      // Update states
      setExpression(fullExpr + ' =');
      setCurrentInput(resultStr);
      setIsCalculated(true);

      // Add to persistent history
      onAddHistory({
        expression: fullExpr,
        result: resultStr,
        timestamp: Date.now(),
      });
    } else {
      soundManager.playError();
      setErrorMsg(evalRes.error || 'خطا در محاسبه');
    }
  }, [expression, currentInput, onAddHistory]);

  // Copy current display result
  const handleCopyDisplay = useCallback(() => {
    navigator.clipboard.writeText(currentInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [currentInput]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input element elsewhere
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      } else if (key === '.' || key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+' || key === '-') {
        e.preventDefault();
        handleOperator(key);
      } else if (key === '*' || key === 'x' || key === 'X') {
        e.preventDefault();
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '^') {
        e.preventDefault();
        handleOperator('^');
      } else if (key === '%') {
        e.preventDefault();
        handlePercentage();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleAllClear();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleParenthesis(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handlePercentage,
    handleEquals,
    handleBackspace,
    handleAllClear,
    handleParenthesis,
  ]);

  // Format expression for visual display with operators replaced nicely
  const formattedExpression = expression
    ? expression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
    : '';

  const displayExpression = usePersianDigits
    ? toPersianDigits(formattedExpression)
    : formattedExpression;

  const displayCurrentInput = usePersianDigits
    ? toPersianDigits(currentInput)
    : currentInput;

  // Responsive font size for big numbers
  const inputLength = currentInput.length;
  const fontSizeClass =
    inputLength > 16
      ? 'text-2xl sm:text-3xl'
      : inputLength > 11
      ? 'text-3xl sm:text-4xl'
      : inputLength > 8
      ? 'text-4xl sm:text-5xl'
      : 'text-5xl sm:text-6xl';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      
      {/* Calculator Body Container */}
      <div className="w-full bg-[#0d091e]/90 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 border border-purple-800/40 shadow-[0_0_40px_rgba(147,51,234,0.18)] transition-all">
        
        {/* Top Control Bar: Mode Toggle and Status */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-950/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#c084fc]" />
            <span className="text-purple-300 font-semibold tracking-wide">
              {isScientific ? 'حالت پیشرفته مهندسی' : 'حالت استاندارد'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsScientific(!isScientific)}
              className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
              title={isScientific ? 'جابجایی به حالت ساده' : 'جابجایی به حالت مهندسی'}
            >
              {isScientific ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>ساده</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>پیشرفته (Scientific)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div 
          ref={displayContainerRef}
          className="relative w-full bg-[#070511] rounded-2xl p-4 sm:p-5 mb-5 border border-purple-900/50 shadow-inner flex flex-col justify-end min-h-[135px] overflow-hidden"
        >
          {/* Subtle cosmic glow inside display */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Upper row: Ongoing expression */}
          <div className="h-6 flex items-center justify-between text-xs text-purple-300/70 font-mono dir-ltr select-none">
            <div className="truncate text-left w-full pr-2">
              {displayExpression || <span className="opacity-0">0</span>}
            </div>

            {/* Quick Copy Result button */}
            <button
              onClick={handleCopyDisplay}
              title="کپی نتیجه فعلی"
              className="p-1 rounded text-purple-400 hover:text-purple-100 hover:bg-purple-900/40 transition-colors shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Lower row: Primary Input / Result */}
          <div className="mt-1 flex items-baseline justify-end font-mono font-bold tracking-tight text-white dir-ltr select-all">
            <span className={`${fontSizeClass} font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-white via-purple-100 to-purple-300 transition-all duration-150`}>
              {displayCurrentInput}
            </span>
          </div>

          {/* Error Message Toast inside display */}
          {errorMsg && (
            <div className="absolute bottom-2 left-3 right-3 py-1.5 px-3 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Scientific Mode Extra Row (if active) */}
        {isScientific && (
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-3 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => handleScientificFunction('sin')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 text-xs font-semibold"
            >
              sin
            </button>
            <button
              onClick={() => handleScientificFunction('cos')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 text-xs font-semibold"
            >
              cos
            </button>
            <button
              onClick={() => handleScientificFunction('tan')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 text-xs font-semibold"
            >
              tan
            </button>
            <button
              onClick={() => handleScientificFunction('ln')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 text-xs font-semibold"
            >
              ln
            </button>
            <button
              onClick={() => handleScientificFunction('log')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 text-xs font-semibold"
            >
              log
            </button>

            <button
              onClick={() => handleParenthesis('(')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-sm font-bold font-mono"
            >
              (
            </button>
            <button
              onClick={() => handleParenthesis(')')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-sm font-bold font-mono"
            >
              )
            </button>
            <button
              onClick={() => handleOperator('^')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-sm font-semibold"
            >
              xʸ
            </button>
            <button
              onClick={() => handleConstant('π')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-sm font-semibold"
            >
              π
            </button>
            <button
              onClick={() => handleConstant('e')}
              className="calc-btn-press h-11 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-sm font-semibold"
            >
              e
            </button>
          </div>
        )}

        {/* Standard Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          
          {/* Row 1: AC, C, Backspace, Division */}
          <button
            onClick={handleAllClear}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 hover:text-white font-bold text-base sm:text-lg flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.15)]"
            title="پاکسازی کامل (AC / Esc)"
          >
            AC
          </button>

          <button
            onClick={handleClear}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/30 text-purple-200 hover:text-white font-bold text-base sm:text-lg flex items-center justify-center"
            title="پاک کردن ورودی فعلی (C)"
          >
            C
          </button>

          <button
            onClick={handleBackspace}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/30 text-purple-300 hover:text-white font-medium text-base sm:text-lg flex items-center justify-center"
            title="حذف آخرین رقم (Backspace)"
          >
            <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => handleOperator('÷')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-700/40 hover:bg-purple-600/50 border border-purple-500/50 text-purple-100 font-extrabold text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            title="تقسیم"
          >
            ÷
          </button>

          {/* Row 2: Powers, Sqrt, %, Multiplication */}
          <button
            onClick={handleSquareRoot}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/30 text-purple-200 font-bold text-lg flex items-center justify-center"
            title="جذر (√)"
          >
            √
          </button>

          <button
            onClick={handleSquare}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/30 text-purple-200 font-bold text-lg flex items-center justify-center"
            title="توان دو (x²)"
          >
            x²
          </button>

          <button
            onClick={handlePercentage}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/30 text-purple-200 font-bold text-lg flex items-center justify-center"
            title="درصد (%)"
          >
            %
          </button>

          <button
            onClick={() => handleOperator('×')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-700/40 hover:bg-purple-600/50 border border-purple-500/50 text-purple-100 font-extrabold text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            title="ضرب"
          >
            ×
          </button>

          {/* Row 3: 7, 8, 9, Subtraction */}
          <button
            onClick={() => handleDigit('7')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۷' : '7'}
          </button>

          <button
            onClick={() => handleDigit('8')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۸' : '8'}
          </button>

          <button
            onClick={() => handleDigit('9')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۹' : '9'}
          </button>

          <button
            onClick={() => handleOperator('-')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-700/40 hover:bg-purple-600/50 border border-purple-500/50 text-purple-100 font-extrabold text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            title="تفریق"
          >
            −
          </button>

          {/* Row 4: 4, 5, 6, Addition */}
          <button
            onClick={() => handleDigit('4')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۴' : '4'}
          </button>

          <button
            onClick={() => handleDigit('5')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۵' : '5'}
          </button>

          <button
            onClick={() => handleDigit('6')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۶' : '6'}
          </button>

          <button
            onClick={() => handleOperator('+')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-purple-700/40 hover:bg-purple-600/50 border border-purple-500/50 text-purple-100 font-extrabold text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            title="جمع"
          >
            +
          </button>

          {/* Row 5: 1, 2, 3, Equals (spanning into Row 6) */}
          <button
            onClick={() => handleDigit('1')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۱' : '1'}
          </button>

          <button
            onClick={() => handleDigit('2')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۲' : '2'}
          </button>

          <button
            onClick={() => handleDigit('3')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۳' : '3'}
          </button>

          {/* Equals Button (=) with vibrant neon purple gradient and glow */}
          <button
            onClick={handleEquals}
            className="calc-btn-press row-span-2 rounded-2xl bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border border-purple-400/50 text-white font-black text-3xl flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.5)] active:shadow-[0_0_35px_rgba(192,132,252,0.8)]"
            title="محاسبه نتیجه (Enter یا =)"
          >
            =
          </button>

          {/* Row 6: ± (Sign), 0, Decimal point */}
          <button
            onClick={handleToggleSign}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-purple-200 hover:text-white font-bold text-xl flex items-center justify-center"
            title="تغییر علامت منفی/مثبت (±)"
          >
            ±
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-slate-100 hover:text-white font-bold text-2xl flex items-center justify-center font-mono"
          >
            {usePersianDigits ? '۰' : '0'}
          </button>

          <button
            onClick={handleDecimal}
            className="calc-btn-press h-14 sm:h-16 rounded-2xl bg-[#141029]/80 hover:bg-purple-900/40 border border-purple-900/40 text-purple-200 hover:text-white font-extrabold text-2xl flex items-center justify-center"
            title="ممیز اعشاری (.)"
          >
            .
          </button>

        </div>

      </div>

      {/* Helpful keyboard shortcut hints */}
      <div className="mt-4 text-center text-xs text-purple-400/70 hidden sm:flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-900/40 font-mono">0-9</span>
        <span>اعداد</span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-900/40 font-mono">+ − * /</span>
        <span>عملگرها</span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-900/40 font-mono">Enter</span>
        <span>مساوی</span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-900/40 font-mono">Esc</span>
        <span>پاک کردن</span>
      </div>

    </div>
  );
};
