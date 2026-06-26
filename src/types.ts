export type ItemStatus = 'waiting' | 'ready' | 'hold' | 'bought' | 'cancelled';

export type ItemCategory = 'technology' | 'fashion' | 'beauty' | 'other';

export interface QuizAnswers {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}

export interface QuizRecord {
  id: string;
  itemId: string;
  date: string; // ISO date (YYYY-MM-DD)
  /** The 5 questions actually shown for this check-in (randomized from a pool). */
  questions: string[];
  answers: QuizAnswers;
  totalScore: number;
  interpretation: string;
  quote: string;
}

export interface Item {
  id: string;
  name: string;
  url: string;
  price: number;
  image: string; // data URL (base64) or empty string
  reason: string;
  category: ItemCategory;
  createdAt: string; // ISO date (YYYY-MM-DD) — when the wait period started
  waitDays: number;
  decisionDate: string; // ISO date (YYYY-MM-DD)
  status: ItemStatus;
  /** ISO date of the most recent status change (e.g. when marked bought/cancelled). */
  statusUpdatedAt: string;
  quizHistory: QuizRecord[];
}
