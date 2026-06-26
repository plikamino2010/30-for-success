import { ItemCategory } from '../types';

export const CATEGORIES: { value: ItemCategory; label: string; icon: string }[] = [
  { value: 'technology', label: 'เทคโนโลยี', icon: '📱' },
  { value: 'fashion', label: 'เสื้อผ้า/แฟชั่น', icon: '👗' },
  { value: 'beauty', label: 'ความงาม', icon: '💄' },
  { value: 'other', label: 'อื่นๆ', icon: '🛍️' },
];

const CATEGORY_LABEL: Record<ItemCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {} as Record<ItemCategory, string>
);

const CATEGORY_ICON: Record<ItemCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.icon }),
  {} as Record<ItemCategory, string>
);

export function getCategoryLabel(category: ItemCategory): string {
  return CATEGORY_LABEL[category] ?? CATEGORY_LABEL.other;
}

export function getCategoryIcon(category: ItemCategory): string {
  return CATEGORY_ICON[category] ?? CATEGORY_ICON.other;
}

/**
 * Keyword-based "AI suggest" for an item's category based on its name.
 * Covers common Thai & English keywords for impulse-buy items
 * (electronics, fashion, beauty). Falls back to "other".
 */
const KEYWORDS: { category: ItemCategory; words: string[] }[] = [
  {
    category: 'technology',
    words: [
      'หูฟัง', 'มือถือ', 'โทรศัพท์', 'แล็ปท็อป', 'โน้ตบุ๊ก', 'โน๊ตบุ๊ก', 'คอม', 'แท็บเล็ต',
      'กล้อง', 'ลำโพง', 'สมาร์ทวอทช์', 'นาฬิกาสมาร์ท', 'เกม', 'จอ', 'มอนิเตอร์',
      'คีย์บอร์ด', 'เม้าส์', 'เมาส์', 'พาวเวอร์แบงค์', 'ชาร์จ', 'จอย', 'ไมค์', 'ดราม่า',
      'เราเตอร์', 'หุ่นยนต์', 'โดรน', 'แท็บเลต', 'ไอแพด', 'ipad', 'iphone', 'macbook',
      'laptop', 'phone', 'headphone', 'earphone', 'tablet', 'camera', 'console',
      'airpods', 'watch', 'tv', 'ทีวี',
    ],
  },
  {
    category: 'fashion',
    words: [
      'เสื้อ', 'กางเกง', 'รองเท้า', 'กระเป๋า', 'เดรส', 'แจ็คเก็ต', 'แจ็กเก็ต', 'สนีกเกอร์',
      'สนีคเกอร์', 'หมวก', 'แว่นกันแดด', 'แว่นตา', 'เข็มขัด', 'ผ้าพันคอ', 'กระโปรง',
      'ชุด', 'รัดเกล้า', 'สร้อย', 'แหวน', 'ต่างหู', 'เครื่องประดับ', 'นาฬิกาแบรนด์',
      'jacket', 'shoes', 'sneaker', 'bag', 'dress', 'shirt', 'jeans', 'watch', 'sunglasses',
      'wallet', 'belt',
    ],
  },
  {
    category: 'beauty',
    words: [
      'เครื่องสำอาง', 'น้ำหอม', 'ลิป', 'ลิปสติก', 'สกินแคร์', 'ครีม', 'แป้ง', 'มาสคาร่า',
      'เซรั่ม', 'อายแชโดว์', 'บลัชออน', 'รองพื้น', 'คอนซีลเลอร์', 'มอยส์เจอไรเซอร์',
      'คลีนเซอร์', 'เครื่องสำอางค์', 'ทำผม', 'แชมพู', 'หอม', 'เล็บ', 'เจล',
      'perfume', 'makeup', 'lipstick', 'serum', 'skincare', 'cream', 'cosmetic',
      'shampoo', 'foundation', 'mascara',
    ],
  },
];

export function suggestCategory(name: string): ItemCategory {
  const normalized = name.toLowerCase();
  if (!normalized.trim()) return 'other';

  for (const group of KEYWORDS) {
    if (group.words.some((word) => normalized.includes(word.toLowerCase()))) {
      return group.category;
    }
  }
  return 'other';
}
