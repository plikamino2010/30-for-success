import { Item, ItemCategory } from '../types';
import { getYear, getMonth, todayISO } from './dateUtils';

const EMPTY_CATEGORY_TOTALS = (): Record<ItemCategory, number> => ({
  technology: 0,
  fashion: 0,
  beauty: 0,
  other: 0,
});

export interface MoneyStats {
  /** Total price of all "cancelled" items — money not spent thanks to waiting. */
  totalSavedValue: number;
  /** `totalSavedValue` spread evenly across a year, i.e. the average daily rate. */
  dailySavedValuePerYear: number;
  /** Total price of everything still pending a decision (waiting/ready/hold). */
  totalToBuy: number;
  /** `totalToBuy` broken down by category. */
  toBuyByCategory: Record<ItemCategory, number>;
}

/** Money summary shown on the dashboard: saved vs. still-pending purchases. */
export function computeMoneyStats(items: Item[]): MoneyStats {
  let totalSavedValue = 0;
  let totalToBuy = 0;
  const toBuyByCategory = EMPTY_CATEGORY_TOTALS();

  for (const item of items) {
    if (item.status === 'cancelled') {
      totalSavedValue += item.price;
    } else if (item.status === 'waiting' || item.status === 'ready' || item.status === 'hold') {
      totalToBuy += item.price;
      toBuyByCategory[item.category] = (toBuyByCategory[item.category] ?? 0) + item.price;
    }
  }

  return {
    totalSavedValue,
    dailySavedValuePerYear: totalSavedValue / 365,
    totalToBuy,
    toBuyByCategory,
  };
}

export interface PeriodStats {
  /** Total spent on items marked "bought" during the period. */
  spent: number;
  /** Total saved on items marked "cancelled" during the period. */
  saved: number;
  spentByCategory: Record<ItemCategory, number>;
  savedByCategory: Record<ItemCategory, number>;
  boughtItems: Item[];
  cancelledItems: Item[];
}

/**
 * Aggregates "bought" and "cancelled" items whose `statusUpdatedAt` falls in
 * the given year (and, if provided, month 1-12). Pass `month: null` for a
 * full-year summary.
 */
export function computeMonthlyStats(items: Item[], year: number, month: number | null): PeriodStats {
  const spentByCategory = EMPTY_CATEGORY_TOTALS();
  const savedByCategory = EMPTY_CATEGORY_TOTALS();
  const boughtItems: Item[] = [];
  const cancelledItems: Item[] = [];
  let spent = 0;
  let saved = 0;

  for (const item of items) {
    if (item.status !== 'bought' && item.status !== 'cancelled') continue;
    const date = item.statusUpdatedAt || item.decisionDate || item.createdAt;
    if (!date) continue;
    if (getYear(date) !== year) continue;
    if (month !== null && getMonth(date) !== month) continue;

    if (item.status === 'bought') {
      spent += item.price;
      spentByCategory[item.category] = (spentByCategory[item.category] ?? 0) + item.price;
      boughtItems.push(item);
    } else {
      saved += item.price;
      savedByCategory[item.category] = (savedByCategory[item.category] ?? 0) + item.price;
      cancelledItems.push(item);
    }
  }

  return { spent, saved, spentByCategory, savedByCategory, boughtItems, cancelledItems };
}

/**
 * Years that have at least one relevant date on any item, plus the current
 * year, sorted newest first — used to populate the year picker.
 */
export function getAvailableYears(items: Item[]): number[] {
  const years = new Set<number>();
  years.add(getYear(todayISO()));

  for (const item of items) {
    for (const date of [item.createdAt, item.decisionDate, item.statusUpdatedAt]) {
      if (date) years.add(getYear(date));
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}
