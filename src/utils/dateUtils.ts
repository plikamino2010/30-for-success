/** Returns today's date as an ISO date string (YYYY-MM-DD), using local time. */
export function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

/** Adds `days` (can be negative) to an ISO date string and returns a new ISO date string. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

/** Returns the number of days from `fromStr` to `toStr` (toStr - fromStr), both ISO dates. */
export function daysBetween(fromStr: string, toStr: string): number {
  const from = new Date(fromStr + 'T00:00:00');
  const to = new Date(toStr + 'T00:00:00');
  const msPerDay = 1000 * 60 * 60 * 24;
  const fromUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toUTC - fromUTC) / msPerDay);
}

/** Formats an ISO date string as a readable Thai date, e.g. "14 มิ.ย. 2569". */
export function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Returns the Gregorian year (e.g. 2026) of an ISO date string. */
export function getYear(dateStr: string): number {
  return Number(dateStr.slice(0, 4));
}

/** Returns the month (1-12) of an ISO date string. */
export function getMonth(dateStr: string): number {
  return Number(dateStr.slice(5, 7));
}

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

/** Returns the Thai name of a month (1-12). */
export function formatThaiMonthName(month: number): string {
  return THAI_MONTH_NAMES[Math.max(0, Math.min(11, month - 1))];
}

/** Converts a Gregorian year to the Buddhist Era year shown in the Thai UI (e.g. 2026 -> 2569). */
export function toBuddhistYear(year: number): number {
  return year + 543;
}
