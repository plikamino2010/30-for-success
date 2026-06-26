import { useMemo } from 'react';
import { Item } from '../types';
import { computeMoneyStats } from '../utils/stats';
import { CATEGORIES } from '../utils/category';

function formatBaht(value: number, maxFractionDigits = 0): string {
  return value.toLocaleString('th-TH', { maximumFractionDigits: maxFractionDigits }) + ' บาท';
}

export default function MoneySummary({ items }: { items: Item[] }) {
  const stats = useMemo(() => computeMoneyStats(items), [items]);

  const hasAnyPending = stats.totalToBuy > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Money saved by cancelling impulse buys */}
      <div className="surface p-4 flex flex-col gap-1 bg-gradient-to-br from-emerald-50 to-white">
        <p className="text-xs font-bold text-emerald-700">💰 เงินที่ประหยัดได้ (ยกเลิกแล้ว)</p>
        <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatBaht(stats.totalSavedValue)}</p>
        <p className="text-[11px] font-semibold text-emerald-600/80">
          เฉลี่ย {formatBaht(stats.dailySavedValuePerYear, 2)} / วัน (เทียบรายปี)
        </p>
      </div>

      {/* Money still pending a decision */}
      <div className="surface p-4 flex flex-col gap-1 bg-gradient-to-br from-brand-50 to-white">
        <p className="text-xs font-bold text-brand-700">🧾 เงินที่ต้องใช้ถ้าซื้อทั้งหมด</p>
        <p className="text-2xl font-extrabold text-brand-700 mt-1">{formatBaht(stats.totalToBuy)}</p>
        {hasAnyPending ? (
          <div className="mt-1.5 space-y-1">
            {CATEGORIES.map((c) => {
              const amount = stats.toBuyByCategory[c.value] ?? 0;
              if (amount <= 0) return null;
              const percent = (amount / stats.totalToBuy) * 100;
              return (
                <div key={c.value} className="flex items-center gap-2 text-[11px]">
                  <span className="w-20 flex-shrink-0 font-semibold text-slate-500 truncate">
                    {c.icon} {c.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="font-bold text-slate-500 flex-shrink-0">{formatBaht(amount)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] font-semibold text-brand-600/70">ยังไม่มีรายการที่รอตัดสินใจ</p>
        )}
      </div>
    </div>
  );
}
