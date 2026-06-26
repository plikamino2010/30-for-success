import { useMemo, useState } from 'react';
import { Item } from '../types';
import { daysBetween, todayISO } from '../utils/dateUtils';
import { isCheckpointDue } from '../utils/quiz';
import ItemCard from './ItemCard';
import FilterBar, { CategoryFilter, SortOption, StatusFilter } from './FilterBar';
import EmptyState from './EmptyState';

interface DashboardProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onReview: (item: Item) => void;
  onMarkBought: (id: string) => void;
  onCancel: (id: string) => void;
  onExtend: (id: string, days: number) => void;
  onHold: (id: string) => void;
  onResume: (id: string) => void;
  onAdd: () => void;
}

export default function Dashboard({
  items,
  onEdit,
  onReview,
  onMarkBought,
  onCancel,
  onExtend,
  onHold,
  onResume,
  onAdd,
}: DashboardProps) {
  const [sort, setSort] = useState<SortOption>('decisionAsc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const visibleItems = useMemo(() => {
    let result = [...items];

    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.category === categoryFilter);
    }

    switch (sort) {
      case 'decisionAsc':
        result.sort((a, b) => a.decisionDate.localeCompare(b.decisionDate));
        break;
      case 'decisionDesc':
        result.sort((a, b) => b.decisionDate.localeCompare(a.decisionDate));
        break;
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // `items` is already ordered with newest first (new items are prepended)
        break;
    }

    return result;
  }, [items, sort, statusFilter, categoryFilter]);

  // Summary counts + "needs review" count for the top of the dashboard
  const { counts, reviewDueCount } = useMemo(() => {
    const today = todayISO();
    const result = {
      waiting: 0,
      ready: 0,
      hold: 0,
      bought: 0,
      cancelled: 0,
    };
    let reviewDue = 0;

    for (const item of items) {
      result[item.status]++;
      if (item.status === 'waiting' || item.status === 'ready') {
        const daysSinceCreated = daysBetween(item.createdAt, today);
        if (isCheckpointDue(item.quizHistory.length, daysSinceCreated)) {
          reviewDue++;
        }
      }
    }

    return { counts: result, reviewDueCount: reviewDue };
  }, [items]);

  function toggleStatusFilter(status: StatusFilter) {
    setStatusFilter((current) => (current === status ? 'all' : status));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary stat tiles — tap a tile to filter by that status */}
      <div className="grid grid-cols-4 gap-2.5">
        <StatTile
          icon="⏳"
          label="กำลังรอ"
          value={counts.waiting}
          activeColor="bg-brand-50 ring-2 ring-brand-200 text-brand-700"
          active={statusFilter === 'waiting'}
          onClick={() => toggleStatusFilter('waiting')}
        />
        <StatTile
          icon="✅"
          label="พร้อมซื้อ"
          value={counts.ready}
          activeColor="bg-emerald-50 ring-2 ring-emerald-200 text-emerald-700"
          active={statusFilter === 'ready'}
          onClick={() => toggleStatusFilter('ready')}
        />
        <StatTile
          icon="🛍️"
          label="ซื้อแล้ว"
          value={counts.bought}
          activeColor="bg-slate-100 ring-2 ring-slate-300 text-slate-600"
          active={statusFilter === 'bought'}
          onClick={() => toggleStatusFilter('bought')}
        />
        <StatTile
          icon="🚫"
          label="ยกเลิก"
          value={counts.cancelled}
          activeColor="bg-rose-50 ring-2 ring-rose-200 text-rose-600"
          active={statusFilter === 'cancelled'}
          onClick={() => toggleStatusFilter('cancelled')}
        />
      </div>

      {/* Highlight banner: items ready for a decision */}
      {counts.ready > 0 && statusFilter !== 'ready' && (
        <button
          onClick={() => setStatusFilter('ready')}
          className="surface flex items-center gap-3 px-4 py-3.5 text-left bg-gradient-to-r from-emerald-50 to-white hover:from-emerald-100 active:scale-[0.99] transition"
        >
          <span className="text-2xl flex-shrink-0">🎉</span>
          <span className="flex-1 text-sm font-bold text-emerald-800">
            มี {counts.ready} รายการพร้อมให้ตัดสินใจแล้ว
          </span>
          <span className="text-xs font-bold text-emerald-600 flex-shrink-0">ดูเลย →</span>
        </button>
      )}

      {/* Highlight banner: items due for a desire-review check-in */}
      {reviewDueCount > 0 && (
        <div className="surface flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-amber-50 to-white">
          <span className="text-2xl flex-shrink-0">🔔</span>
          <span className="flex-1 text-sm font-bold text-amber-800">
            มี {reviewDueCount} รายการถึงเวลาทบทวนความต้องการแล้ว
          </span>
        </div>
      )}

      {/* Highlight banner: items on hold */}
      {counts.hold > 0 && statusFilter !== 'hold' && (
        <button
          onClick={() => setStatusFilter('hold')}
          className="surface flex items-center gap-3 px-4 py-3.5 text-left bg-gradient-to-r from-amber-50 to-white hover:from-amber-100 active:scale-[0.99] transition"
        >
          <span className="text-2xl flex-shrink-0">⏸️</span>
          <span className="flex-1 text-sm font-bold text-amber-800">มี {counts.hold} รายการพักไว้ก่อน</span>
          <span className="text-xs font-bold text-amber-600 flex-shrink-0">ดูเลย →</span>
        </button>
      )}

      <FilterBar
        sort={sort}
        onSortChange={setSort}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      {visibleItems.length === 0 ? (
        <EmptyState onAdd={onAdd} hasAnyItems={items.length > 0} />
      ) : (
        <>
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-sm font-extrabold text-slate-500">
              รายการของคุณ ({visibleItems.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={onEdit}
                onReview={onReview}
                onMarkBought={onMarkBought}
                onCancel={onCancel}
                onExtend={onExtend}
                onHold={onHold}
                onResume={onResume}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  activeColor,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  value: number;
  activeColor: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`surface flex flex-col items-center justify-center gap-0.5 py-3 px-1 text-center transition-all active:scale-95 ${
        active ? activeColor : 'text-slate-700 hover:ring-1 hover:ring-slate-200'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-lg font-extrabold leading-tight">{value}</span>
      <span className="text-[10.5px] font-bold leading-tight">{label}</span>
    </button>
  );
}
