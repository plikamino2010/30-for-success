import { useMemo, useState } from 'react';
import { Item } from '../types';
import { computeMonthlyStats, getAvailableYears } from '../utils/stats';
import { CATEGORIES, getCategoryIcon, getCategoryLabel } from '../utils/category';
import { formatThaiDate, formatThaiMonthName, toBuddhistYear } from '../utils/dateUtils';

interface StatsViewProps {
  items: Item[];
}

function formatBaht(value: number): string {
  return value.toLocaleString('th-TH', { maximumFractionDigits: 0 }) + ' บาท';
}

const MONTH_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // 0 = whole year

export default function StatsView({ items }: StatsViewProps) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(years[0]);
  const [month, setMonth] = useState(0); // 0 = whole year

  const stats = useMemo(() => computeMonthlyStats(items, year, month === 0 ? null : month), [items, year, month]);

  const periodLabel = month === 0 ? `ปี ${toBuddhistYear(year)}` : `${formatThaiMonthName(month)} ${toBuddhistYear(year)}`;

  const combinedHistory = useMemo(
    () =>
      [...stats.boughtItems, ...stats.cancelledItems].sort((a, b) =>
        (b.statusUpdatedAt || '').localeCompare(a.statusUpdatedAt || '')
      ),
    [stats]
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">📊 สรุปผลรายเดือน/รายปี</h2>
        <p className="text-sm text-slate-400 mt-0.5">ดูยอดซื้อจริงและยอดที่ประหยัดได้ในแต่ละช่วง</p>
      </div>

      {/* Period picker */}
      <div className="surface p-3 flex gap-2.5">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="field-input flex-1 py-2.5 font-semibold"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              ปี {toBuddhistYear(y)}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="field-input flex-1 py-2.5 font-semibold"
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m === 0 ? 'ทั้งปี' : formatThaiMonthName(m)}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs font-bold text-slate-400 px-1">สรุปสำหรับ {periodLabel}</p>

      {/* Spent vs saved summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="surface p-4 flex flex-col gap-1 bg-gradient-to-br from-slate-50 to-white">
          <p className="text-xs font-bold text-slate-600">🛍️ ยอดซื้อจริง</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{formatBaht(stats.spent)}</p>
          <p className="text-[11px] font-semibold text-slate-400">{stats.boughtItems.length} รายการ</p>
          <CategoryBreakdown totals={stats.spentByCategory} total={stats.spent} barColor="bg-slate-400" />
        </div>

        <div className="surface p-4 flex flex-col gap-1 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-xs font-bold text-emerald-700">💰 ยอดที่ประหยัดได้</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatBaht(stats.saved)}</p>
          <p className="text-[11px] font-semibold text-emerald-600/80">{stats.cancelledItems.length} รายการ</p>
          <CategoryBreakdown totals={stats.savedByCategory} total={stats.saved} barColor="bg-emerald-400" />
        </div>
      </div>

      {/* Item list for the period */}
      {combinedHistory.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center text-center py-10 px-6">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm font-bold text-slate-500">ยังไม่มีรายการ "ซื้อแล้ว" หรือ "ยกเลิก" ในช่วงนี้</p>
        </div>
      ) : (
        <div className="surface divide-y divide-slate-100">
          {combinedHistory.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl flex-shrink-0">{getCategoryIcon(item.category)}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold text-slate-700 truncate ${
                    item.status === 'cancelled' ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {item.name}
                </p>
                <p className="text-[11px] font-semibold text-slate-400">
                  {getCategoryLabel(item.category)} · {formatThaiDate(item.statusUpdatedAt)}
                </p>
              </div>
              <span
                className={`text-sm font-extrabold flex-shrink-0 ${
                  item.status === 'bought' ? 'text-slate-700' : 'text-emerald-600'
                }`}
              >
                {item.status === 'bought' ? '-' : '+'}
                {formatBaht(item.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryBreakdown({
  totals,
  total,
  barColor,
}: {
  totals: Record<string, number>;
  total: number;
  barColor: string;
}) {
  if (total <= 0) return null;
  return (
    <div className="mt-1.5 space-y-1">
      {CATEGORIES.map((c) => {
        const amount = totals[c.value] ?? 0;
        if (amount <= 0) return null;
        const percent = (amount / total) * 100;
        return (
          <div key={c.value} className="flex items-center gap-2 text-[11px]">
            <span className="w-20 flex-shrink-0 font-semibold text-slate-500 truncate">
              {c.icon} {c.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
            </div>
            <span className="font-bold text-slate-500 flex-shrink-0">{formatBaht(amount)}</span>
          </div>
        );
      })}
    </div>
  );
}
