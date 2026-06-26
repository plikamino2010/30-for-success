import { QuizAnswers } from '../types';

/**
 * Question pool for the desire-review quiz, grouped by the 5 scoring
 * dimensions (q1-q5). Each check-in, one question is picked at random from
 * each group via `getRandomQuizQuestions()`, so repeat reviews don't feel
 * repetitive while the scoring meaning of each slot stays consistent.
 */
export const QUIZ_QUESTION_POOL: string[][] = [
  // q1: current desire
  [
    'ตอนนี้คุณยังอยากได้สิ่งนี้มากแค่ไหน?',
    'ถ้าต้องตัดสินใจซื้อวันนี้เลย คุณอยากได้มากแค่ไหน?',
    'เทียบกับวันที่เริ่มรอ ความอยากได้ของคุณตอนนี้มากแค่ไหน?',
  ],
  // q2: necessity
  [
    'สิ่งนี้จำเป็นต่อการใช้ชีวิต การทำงาน หรือสุขภาพมากแค่ไหน?',
    'ถ้าไม่มีสิ่งนี้ จะกระทบชีวิตประจำวันของคุณมากแค่ไหน?',
    'สิ่งนี้ช่วยแก้ปัญหาที่คุณมีอยู่จริงได้มากแค่ไหน?',
  ],
  // q3: frequency of use
  [
    'ใน 3 เดือนข้างหน้า คุณจะได้ใช้สิ่งนี้บ่อยแค่ไหน?',
    'คุณคิดว่าจะหยิบสิ่งนี้มาใช้บ่อยแค่ไหนในชีวิตประจำวัน?',
    'มีโอกาสมากแค่ไหนที่ซื้อมาแล้วจะถูกเก็บไว้เฉยๆ ไม่ได้ใช้? (ถ้าโอกาสสูง ให้คะแนนต่ำ)',
  ],
  // q4: substitute exists (low score if a substitute already exists)
  [
    'คุณมีของที่ใช้แทนกันได้อยู่แล้วหรือไม่? (ถ้ามี ให้คะแนนต่ำ)',
    'ของที่คุณมีอยู่ตอนนี้ใช้งานแทนสิ่งนี้ได้ดีแค่ไหน? (ถ้าใช้แทนได้ดี ให้คะแนนต่ำ)',
    'ถ้าไม่ซื้อสิ่งนี้ คุณจะเดือดร้อนเพราะไม่มีของใช้แทนแค่ไหน? (ถ้าไม่เดือดร้อน ให้คะแนนต่ำ)',
  ],
  // q5: financial impact (low score if it would hurt the budget)
  [
    'การซื้อสิ่งนี้จะกระทบเป้าหมายทางการเงินของคุณหรือไม่? (ถ้ากระทบ ให้คะแนนต่ำ)',
    'หากซื้อสิ่งนี้ เงินที่เหลือใช้ในเดือนนี้จะตึงมือแค่ไหน? (ถ้าตึงมือมาก ให้คะแนนต่ำ)',
    'เทียบกับรายจ่ายจำเป็นอื่นๆ การซื้อสิ่งนี้ตอนนี้สำคัญแค่ไหน? (ถ้าสำคัญน้อย ให้คะแนนต่ำ)',
  ],
];

/** Picks one random question per dimension (5 total) for a new review session. */
export function getRandomQuizQuestions(): string[] {
  return QUIZ_QUESTION_POOL.map((variants) => variants[Math.floor(Math.random() * variants.length)]);
}

/** First (default) question per dimension — used as a fallback for legacy quiz records. */
export function getDefaultQuizQuestions(): string[] {
  return QUIZ_QUESTION_POOL.map((variants) => variants[0]);
}

/**
 * The desire-review quiz becomes available every REVIEW_INTERVAL_DAYS days
 * since the item was created (5, 10, 15, 20, ... days), and keeps recurring
 * for as long as the item stays "waiting"/"ready" — even if a custom wait
 * period longer than 30 days was entered.
 */
export const REVIEW_INTERVAL_DAYS = 5;

export const DEFAULT_ANSWERS: QuizAnswers = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };

export function getTotalScore(answers: QuizAnswers): number {
  return answers.q1 + answers.q2 + answers.q3 + answers.q4 + answers.q5;
}

/** Returns a Thai-language interpretation of the total score (0-25). */
export function getInterpretation(total: number): string {
  if (total <= 9) return 'ความอยากลดลงแล้ว ลองพิจารณายกเลิก หรือรอเพิ่มอีกสักหน่อย';
  if (total <= 17) return 'ยังไม่แน่ใจ ลองรอต่ออีก 5-10 วัน';
  return 'ความอยากยังสูง การซื้ออาจสมเหตุสมผล ถ้าไม่กระทบงบประมาณ';
}

/** Returns the next review checkpoint (in days since creation). Always a positive multiple of 5. */
export function getNextCheckpoint(quizHistoryLength: number): number {
  return (quizHistoryLength + 1) * REVIEW_INTERVAL_DAYS;
}

/**
 * Whether an item with the given quiz history length and "days since created"
 * has reached its next review checkpoint. Shared by the dashboard summary
 * and the item card so both stay in sync.
 */
export function isCheckpointDue(quizHistoryLength: number, daysSinceCreated: number): boolean {
  return daysSinceCreated >= getNextCheckpoint(quizHistoryLength);
}
