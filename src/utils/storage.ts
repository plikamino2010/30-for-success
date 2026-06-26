import { Item, ItemCategory, ItemStatus, QuizRecord } from '../types';
import { todayISO } from './dateUtils';
import { getDefaultQuizQuestions } from './quiz';

const STORAGE_KEY = 'wait30_items';
const SEED_KEY = 'wait30_seeded';

const VALID_STATUSES: ItemStatus[] = ['waiting', 'ready', 'hold', 'bought', 'cancelled'];
const VALID_CATEGORIES: ItemCategory[] = ['technology', 'fashion', 'beauty', 'other'];

function makeFallbackId(): string {
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** Coerces a raw quiz history entry into a valid QuizRecord, or null if unusable. */
function sanitizeQuizRecord(raw: unknown): QuizRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const rawAnswers = (r.answers && typeof r.answers === 'object' ? r.answers : {}) as Record<
    string,
    unknown
  >;
  const toScore = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0;
  };

  const questions =
    Array.isArray(r.questions) && r.questions.every((q) => typeof q === 'string') && r.questions.length === 5
      ? (r.questions as string[])
      : getDefaultQuizQuestions();

  return {
    id: typeof r.id === 'string' ? r.id : makeFallbackId(),
    itemId: typeof r.itemId === 'string' ? r.itemId : '',
    date: typeof r.date === 'string' ? r.date : '',
    questions,
    answers: {
      q1: toScore(rawAnswers.q1),
      q2: toScore(rawAnswers.q2),
      q3: toScore(rawAnswers.q3),
      q4: toScore(rawAnswers.q4),
      q5: toScore(rawAnswers.q5),
    },
    totalScore: Number.isFinite(Number(r.totalScore)) ? Number(r.totalScore) : 0,
    interpretation: typeof r.interpretation === 'string' ? r.interpretation : '',
    quote: typeof r.quote === 'string' ? r.quote : '',
  };
}

/**
 * Fills in safe defaults for any missing/invalid fields on a stored item.
 * This protects the app from crashing if localStorage contains data from an
 * older app version, an imported file, or data that was edited/corrupted
 * outside the app.
 */
function sanitizeItem(raw: unknown): Item | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id) return null;

  const status: ItemStatus = VALID_STATUSES.includes(r.status as ItemStatus)
    ? (r.status as ItemStatus)
    : 'waiting';

  const category: ItemCategory = VALID_CATEGORIES.includes(r.category as ItemCategory)
    ? (r.category as ItemCategory)
    : 'other';

  const quizHistory = Array.isArray(r.quizHistory)
    ? r.quizHistory.map(sanitizeQuizRecord).filter((q): q is QuizRecord => q !== null)
    : [];

  const price = Number(r.price);
  const waitDays = Number(r.waitDays);
  const createdAt = typeof r.createdAt === 'string' && r.createdAt ? r.createdAt : '';

  return {
    id: r.id,
    name: typeof r.name === 'string' ? r.name : '',
    url: typeof r.url === 'string' ? r.url : '',
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    image: typeof r.image === 'string' ? r.image : '',
    reason: typeof r.reason === 'string' ? r.reason : '',
    category,
    createdAt,
    waitDays: Number.isFinite(waitDays) && waitDays >= 1 ? waitDays : 1,
    decisionDate: typeof r.decisionDate === 'string' && r.decisionDate ? r.decisionDate : '',
    status,
    statusUpdatedAt:
      typeof r.statusUpdatedAt === 'string' && r.statusUpdatedAt ? r.statusUpdatedAt : createdAt || todayISO(),
    quizHistory,
  };
}

/** Loads items from localStorage. Returns an empty array if nothing is stored, on error,
 *  or if the stored data isn't a usable array. Individual items are sanitized so
 *  malformed/legacy entries don't crash the app. */
export function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeItem).filter((item): item is Item => item !== null);
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลจาก localStorage ได้', err);
    return [];
  }
}

/**
 * Saves items to localStorage.
 * Returns true on success, false if saving failed (e.g. storage quota exceeded
 * because of large embedded images) so the caller can warn the user.
 */
export function saveItems(items: Item[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (err) {
    console.error('ไม่สามารถบันทึกข้อมูลลง localStorage ได้ (อาจเต็ม)', err);
    return false;
  }
}

/** Marks that the initial mock data has been seeded, so it isn't re-added later. */
export function hasSeeded(): boolean {
  return localStorage.getItem(SEED_KEY) === 'true';
}

export function markSeeded(): void {
  localStorage.setItem(SEED_KEY, 'true');
}

/** Shape of the JSON file produced by "ส่งออกข้อมูล" (export). */
export interface ExportPayload {
  app: 'wait30';
  version: 1;
  exportedAt: string;
  items: Item[];
}

/** Serializes all items into a downloadable JSON string. */
export function exportItemsAsJson(items: Item[]): string {
  const payload: ExportPayload = {
    app: 'wait30',
    version: 1,
    exportedAt: todayISO(),
    items,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses a JSON string produced by `exportItemsAsJson` (or a bare array of
 * items) into a sanitized item list. Throws a Thai-language error message if
 * the file can't be used at all.
 */
export function parseImportedItems(json: string): Item[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('ไฟล์นี้ไม่ใช่ไฟล์ JSON ที่ถูกต้อง');
  }

  const rawItems = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).items)
    ? (parsed as Record<string, unknown>).items
    : null;

  if (!Array.isArray(rawItems)) {
    throw new Error('ไม่พบรายการสินค้าในไฟล์นี้ — รูปแบบไฟล์ไม่ถูกต้อง');
  }

  const items = rawItems.map(sanitizeItem).filter((item): item is Item => item !== null);
  if (items.length === 0) {
    throw new Error('ไม่พบรายการที่นำเข้าได้ในไฟล์นี้');
  }
  return items;
}
