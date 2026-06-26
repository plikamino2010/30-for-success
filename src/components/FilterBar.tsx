import { ItemCategory } from '../types';
import { CATEGORIES } from '../utils/category';

export type SortOption =
  | 'decisionAsc'
  | 'decisionDesc'
  | 'priceAsc'
  | 'priceDesc'
  | 'newest';

export type StatusFilter = 'all' | 'waiting' | 'ready' | 'hold' | 'bought' | 'cancelled';
export type CategoryFilter = 'all' | ItemCategory;

interface FilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (category: CategoryFilter) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'decisionAsc', label: 'ใกล้วันตัดสินใจที่สุดก่อน' },
  { value: 'decisionDesc', label: 'ไกลวันตัดสินใจที่สุดก่อน' },
  { value: 'priceAsc', label: 'ราคา: น้อยไปมาก' },
  { value: 'priceDesc', label: 'ราคา: มากไปน้อย' },
  { value: 'newest', label: 'เพิ่มล่าสุดก่อน' },
];

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'waiting', label: '⏳ กำลังรอ' },
  { value: 'ready', label: '✅ พร้อม' },
  { value: 'hold', label: '⏸️ พักไว้' },
  { value: 'bought', label: '🛍️ ซื้อแล้ว' },
  { value: 'cancelled', label: '🚫 ยกเลิก' },
];

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'ทุกหมวด' },
  ...CATEGORIES.map((c) => ({ value: c.value as CategoryFilter, label: `${c.icon} ${c.label}` })),
];

export default function FilterBar({
  sort,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}: FilterBarProps) {
  return (
    <div className="space-y-2.5">
      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusFilterChange(tab.value)}
            className={`flex-shrink-0 rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors active:scale-95 ${
              statusFilter === tab.value
                ? 'bg-brand-600 text-white shadow-soft'
                : 'surface text-slate-600'
            }`}
            style={{ minHeight: '44px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onCategoryFilterChange(tab.value)}
            className={`flex-shrink-0 rounded-full px-3.5 text-xs font-bold whitespace-nowrap transition-colors active:scale-95 ${
              categoryFilter === tab.value
                ? 'bg-slate-700 text-white shadow-soft'
                : 'surface text-slate-500'
            }`}
            style={{ minHeight: '38px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2.5">
        <label htmlFor="sort-select" className="text-sm font-bold text-slate-500 flex-shrink-0">
          เรียงตาม
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="field-input flex-1 py-2.5 font-semibold"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
