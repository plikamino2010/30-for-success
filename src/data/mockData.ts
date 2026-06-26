import { Item } from '../types';
import { addDays, todayISO } from '../utils/dateUtils';
import { suggestWaitDays } from '../utils/waitDays';
import { getInterpretation, getTotalScore, getDefaultQuizQuestions } from '../utils/quiz';
import { QUOTES } from '../utils/quotes';

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Builds a set of demo items relative to "today" so the dashboard always shows
 * a realistic mix of waiting / ready / hold / bought / cancelled items across
 * a few categories and months (so the money summary and monthly stats views
 * have something meaningful to display).
 */
export function getMockItems(): Item[] {
  const today = todayISO();

  // 1) Cheap item, created 2 days ago, wait 1 day -> should already be "ready"
  const earphonesCreated = addDays(today, -2);
  const earphonesWait = suggestWaitDays(390);

  // 2) Mid-price item, created 3 days ago, wait 7 days -> still waiting, no review yet
  const shoesCreated = addDays(today, -3);
  const shoesWait = suggestWaitDays(1590);

  // 3) Higher price item, created 6 days ago, wait 14 days -> waiting, review #1 due/done
  const tabletCreated = addDays(today, -6);
  const tabletWait = suggestWaitDays(8900);
  const tabletAnswers1 = { q1: 4, q2: 3, q3: 3, q4: 2, q5: 4 };
  const tabletScore1 = getTotalScore(tabletAnswers1);
  const tabletAnswers2 = { q1: 2, q2: 2, q3: 1, q4: 4, q5: 3 };
  const tabletScore2 = getTotalScore(tabletAnswers2);

  // 4) Expensive item, created 32 days ago, wait 30 days, bought 20 days ago
  const cameraCreated = addDays(today, -32);
  const cameraWait = suggestWaitDays(25900);
  const cameraBoughtAt = addDays(today, -20);

  // 5) Item that was cancelled after a review showed low desire
  const bagCreated = addDays(today, -12);
  const bagWait = suggestWaitDays(2490);
  const bagAnswers = { q1: 1, q2: 1, q3: 0, q4: 5, q5: 1 };
  const bagScore = getTotalScore(bagAnswers);
  const bagCancelledAt = addDays(today, -7);

  // 6) Beauty item, created 1 day ago, still waiting
  const serumCreated = addDays(today, -1);
  const serumWait = suggestWaitDays(1200);

  // 7) Fashion item bought last month, for the monthly stats demo
  const jacketCreated = addDays(today, -50);
  const jacketWait = suggestWaitDays(3200);
  const jacketBoughtAt = addDays(today, -45);

  const baseItems: Item[] = [
    {
      id: makeId(),
      name: 'หูฟังบลูทูธไร้สาย',
      url: 'https://example.com/product/earphones',
      price: 390,
      image: '',
      reason: 'อยากได้ไว้ฟังพอดแคสต์ตอนวิ่งออกกำลังกาย',
      category: 'technology',
      createdAt: earphonesCreated,
      waitDays: earphonesWait,
      decisionDate: addDays(earphonesCreated, earphonesWait),
      status: 'ready',
      statusUpdatedAt: earphonesCreated,
      quizHistory: [],
    },
    {
      id: makeId(),
      name: 'รองเท้าวิ่งรุ่นใหม่',
      url: 'https://example.com/product/running-shoes',
      price: 1590,
      image: '',
      reason: 'รองเท้าคู่เดิมพื้นสึกแล้ว อยากได้คู่ใหม่ไว้ซ้อมวิ่ง',
      category: 'fashion',
      createdAt: shoesCreated,
      waitDays: shoesWait,
      decisionDate: addDays(shoesCreated, shoesWait),
      status: 'waiting',
      statusUpdatedAt: shoesCreated,
      quizHistory: [],
    },
    {
      id: makeId(),
      name: 'แท็บเล็ตสำหรับวาดรูป',
      url: 'https://example.com/product/drawing-tablet',
      price: 8900,
      image: '',
      reason: 'อยากลองวาดรูปเป็นงานอดิเรกใหม่',
      category: 'technology',
      createdAt: tabletCreated,
      waitDays: tabletWait,
      decisionDate: addDays(tabletCreated, tabletWait),
      status: 'waiting',
      statusUpdatedAt: tabletCreated,
      quizHistory: [
        {
          id: makeId(),
          itemId: '',
          date: addDays(today, -5),
          questions: getDefaultQuizQuestions(),
          answers: tabletAnswers1,
          totalScore: tabletScore1,
          interpretation: getInterpretation(tabletScore1),
          quote: QUOTES[0],
        },
        {
          id: makeId(),
          itemId: '',
          date: addDays(today, -1),
          questions: getDefaultQuizQuestions(),
          answers: tabletAnswers2,
          totalScore: tabletScore2,
          interpretation: getInterpretation(tabletScore2),
          quote: QUOTES[1],
        },
      ],
    },
    {
      id: makeId(),
      name: 'กล้องมิลเลอร์เลสตัวใหม่',
      url: 'https://example.com/product/mirrorless-camera',
      price: 25900,
      image: '',
      reason: 'อยากได้กล้องตัวใหม่ไปถ่ายรูปตอนเที่ยว',
      category: 'technology',
      createdAt: cameraCreated,
      waitDays: cameraWait,
      decisionDate: addDays(cameraCreated, cameraWait),
      status: 'bought',
      statusUpdatedAt: cameraBoughtAt,
      quizHistory: [],
    },
    {
      id: makeId(),
      name: 'กระเป๋าสะพายแบรนด์เนม',
      url: 'https://example.com/product/designer-bag',
      price: 2490,
      image: '',
      reason: 'เห็นในโฆษณาแล้วอยากได้ขึ้นมา',
      category: 'fashion',
      createdAt: bagCreated,
      waitDays: bagWait,
      decisionDate: addDays(bagCreated, bagWait),
      status: 'cancelled',
      statusUpdatedAt: bagCancelledAt,
      quizHistory: [
        {
          id: makeId(),
          itemId: '',
          date: bagCancelledAt,
          questions: getDefaultQuizQuestions(),
          answers: bagAnswers,
          totalScore: bagScore,
          interpretation: getInterpretation(bagScore),
          quote: QUOTES[3],
        },
      ],
    },
    {
      id: makeId(),
      name: 'เซรั่มบำรุงผิวหน้า',
      url: 'https://example.com/product/face-serum',
      price: 1200,
      image: '',
      reason: 'เห็นรีวิวว่าช่วยลดสิวได้ อยากลองใช้',
      category: 'beauty',
      createdAt: serumCreated,
      waitDays: serumWait,
      decisionDate: addDays(serumCreated, serumWait),
      status: 'waiting',
      statusUpdatedAt: serumCreated,
      quizHistory: [],
    },
    {
      id: makeId(),
      name: 'แจ็คเก็ตหนังสำหรับฤดูหนาว',
      url: 'https://example.com/product/leather-jacket',
      price: 3200,
      image: '',
      reason: 'เดินทางไปเที่ยวที่อากาศหนาว อยากได้เสื้อกันหนาวสวยๆ',
      category: 'fashion',
      createdAt: jacketCreated,
      waitDays: jacketWait,
      decisionDate: addDays(jacketCreated, jacketWait),
      status: 'bought',
      statusUpdatedAt: jacketBoughtAt,
      quizHistory: [],
    },
  ];

  return baseItems.map((item) => ({
    ...item,
    quizHistory: item.quizHistory.map((q) => ({ ...q, itemId: item.id })),
  }));
}
