/**
 * Core application types for CALC NOVA
 */

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type ActiveTab = 'calculator' | 'percentage' | 'discount' | 'converter' | 'history';

export type CalculatorKeyType = 
  | 'digit' 
  | 'operator' 
  | 'action' 
  | 'equals' 
  | 'scientific' 
  | 'parenthesis';

export interface UnitItem {
  id: string;
  nameFa: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface UnitCategory {
  id: string;
  titleFa: string;
  iconName: string;
  units: UnitItem[];
}
