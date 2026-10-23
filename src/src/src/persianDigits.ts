/**
 * Persian Digits and Formatting Utilities
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts English/ASCII digits to Persian digits
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)] ?? char);
}

/**
 * Converts Persian and Arabic digits to English/ASCII digits
 */
export function toEnglishDigits(input: string | null | undefined): string {
  if (!input) return '';
  let res = String(input);
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i));
    res = res.replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
  }
  return res;
}

/**
 * Format a number or number string with thousands separators (comma / ٬)
 */
export function formatThousands(input: string | number, usePersian: boolean = false): string {
  if (input === '' || input === null || input === undefined) return '';
  const str = toEnglishDigits(String(input));
  
  // Handle signs and decimals
  const isNegative = str.startsWith('-');
  const cleanStr = isNegative ? str.slice(1) : str;
  const parts = cleanStr.split('.');
  
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : null;

  // Add commas every 3 digits
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let result = (isNegative ? '-' : '') + integerPart + (decimalPart !== null ? '.' + decimalPart : '');
  
  if (usePersian) {
    result = toPersianDigits(result.replace(/,/g, '٬'));
  }
  
  return result;
}

/**
 * Convert timestamp to Persian friendly relative time
 */
export function getPersianRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 10) return 'هم‌اکنون';
  if (diffSec < 60) return `${toPersianDigits(diffSec)} ثانیه پیش`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${toPersianDigits(diffMin)} دقیقه پیش`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
  const diffDays = Math.floor(diffHours / 24);
  return `${toPersianDigits(diffDays)} روز پیش`;
}
