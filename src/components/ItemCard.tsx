import { Item } from '../types';
import { daysBetween, formatThaiDate, todayISO } from '../utils/dateUtils';
import { isCheckpointDue, getNextCheckpoint } from '../utils/quiz';
import { getCategoryIcon, getCategoryLabel } from '../utils/category';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import QuizScoreChart from './QuizScoreChart';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onReview: (item: Item) => void;
  onMarkBought: (id: string) => void;
  onCancel: (id: string) => void;
  onExtend: (id: string, days: number) => void;
  onHold: (id: string) => void;
  onResume: (id: string) => void;
}

// Thin top accent strip color per status — gives each card a quick visual cue
// without relying on heavy background tints.
const ACCENT_COLOR: Record<Item['status'], string> = {
  waiting: 'bg-brand-400',
  ready: 'bg-emerald-400',
  hold: 'bg-amber-300',
  bought: 'bg-slate-300',
  cancelled: 'bg-rose-300',
};

function formatPrice(price: number): string {
  return price.toLocaleString('th-TH') + ' บาท';
}

export default function ItemCard({
  item,
  onEdit,
  onReview,
  onMarkBought,
  onCancel,
  onExtend,
  onHold,
  onResume,
}: ItemCardProps) {
  const today = todayISO();
  const daysRemaining = daysBetween(today, item.decisionDate);
  const daysSinceCreated = daysBetween(item.createdAt, today);

  const progressPercent =
    item.waitDays > 0 ? ((item.waitDays - daysRemaining) / item.waitDays) * 100 : 100;

  const nextCheckpoint = getNextCheckpoint(item.quizHistory.length);

  // "Active" = still on its waiting/decision countdown (eligible for review reminders,
  // quick-extend, and "พักไว้ก่อน").
  const isActive = item.status === 'waiting' || item.status === 'ready';
  // Items on hold can still be marked bought/cancelled directly.
  const canResolve = isActive || item.status === 'hold';

  const reviewDue = isActive && isCheckpointDue(item.quizHistory.length, daysSinceCreated);

  let countdownText: string;
  let countdownClass: string;
  if (item.status === 'hold') {
    countdownText = 'พักไว้ก่อน — ยังไม่มีกำหนดวันตัดสินใจ';
    countdownClass = 'text-amber-600';
  } else if (item.status === 'bought' || item.status === 'cancelled') {
    countdownText = `วันตัดสินใจ: ${formatThaiDate(item.decisionDate)}`;
    countdownClass = 'text-slate-400';
  } else if (daysRemaining > 0) {
    countdownText = `เหลืออีก ${daysRemaining} วัน`;
    countdownClass = 'text-slate-500';
  } else if (daysRemaining === 0) {
    countdownText = 'ถึงวันตัดสินใจแล้ว วันนี้!';
    countdownClass = 'text-emerald-600';
  } else {
    countdownText = `เกินวันตัดสินใจมาแล้ว ${Math.abs(daysRemaining)} วัน`;
    countdownClass = 'text-amber-600';
  }

  return (
    <div className="surface overflow-hidden flex flex-col">
      {/* Status accent strip */}
      <div className={`h-1.5 w-full ${ACCENT_COLOR[item.status]}`} />

      <div className="p-4 flex flex-col gap-3.5">
        {/* Image */}
        <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">🎁</span>
          )}
        </div>

        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-extrabold text-base text-slate-800 leading-snug ${
              item.status === 'cancelled' ? 'line-through text-slate-400' : ''
            }`}
          >
            {item.name}
          </h3>
          <StatusBadge status={item.status} />
        </div>

        {/* Category tag */}
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-500 text-[11px] font-bold px-2.5 py-1">
            <span>{getCategoryIcon(item.category)}</span>
            {getCategoryLabel(item.category)}
          </span>
        </div>

        {/* Price + link */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold text-brand-700">{formatPrice(item.price)}</span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-brand-600 underline underline-offset-2"
            >
              ดูสินค้า ↗
            </a>
          )}
        </div>

        {/* Reason */}
        {item.reason && (
          <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 rounded-xl px-3 py-2.5 line-clamp-2">
            <span className="font-bold text-slate-600">เหตุผล: </span>
            {item.reason}
          </p>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="font-bold text-slate-400">วันที่เพิ่ม</div>
            <div className="font-semibold text-slate-600 mt-0.5">{formatThaiDate(item.createdAt)}</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
            <div className="font-bold text-slate-400">รอทั้งหมด {item.waitDays} วัน</div>
            <div className="font-semibold text-slate-600 mt-0.5">{formatThaiDate(item.decisionDate)}</div>
          </div>
        </div>

        {/* Progress + countdown */}
        {item.status === 'hold' ? (
          <div className="rounded-xl bg-amber-50 text-amber-700 text-xs font-bold text-center py-2.5 px-3">
            ⏸️ {countdownText}
          </div>
        ) : (
          <div className="space-y-1.5">
            <ProgressBar percent={progressPercent} status={item.status} />
            <div className={`text-xs font-bold text-center ${countdownClass}`}>{countdownText}</div>
          </div>
        )}

        {/* Review reminder */}
        {reviewDue && (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl py-2 px-3">
            <span className="text-base">🔔</span>
            <span>ถึงเวลาทบทวนความต้องการแล้ว (วันที่ {nextCheckpoint})</span>
          </div>
        )}

        {/* Quick actions: extend the wait, or pause / resume */}
        {isActive && (
          <div className="grid grid-cols-3 gap-2.5">
            <button onClick={() => onExtend(item.id, 7)} className="btn-secondary btn-sm text-xs">
              +7 วัน
            </button>
            <button onClick={() => onExtend(item.id, 14)} className="btn-secondary btn-sm text-xs">
              +14 วัน
            </button>
            <button onClick={() => onHold(item.id)} className="btn-secondary btn-sm text-xs">
              ⏸️ พักไว้ก่อน
            </button>
          </div>
        )}
        {item.status === 'hold' && (
          <button onClick={() => onResume(item.id)} className="btn-amber btn-sm">
            ▶️ กลับมารอต่อ
          </button>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onReview(item)}
            disabled={!isActive}
            className={
              !isActive
                ? 'btn-muted btn-sm'
                : reviewDue
                ? 'btn-amber btn-sm'
                : 'btn-secondary btn-sm'
            }
          >
            📝 ทบทวน
          </button>
          <button onClick={() => onEdit(item)} className="btn-secondary btn-sm">
            ✏️ แก้ไข
          </button>
          <button
            onClick={() => onMarkBought(item.id)}
            disabled={!canResolve}
            className={canResolve ? 'btn-success btn-sm' : 'btn-muted btn-sm'}
          >
            🛍️ ซื้อแล้ว
          </button>
          <button
            onClick={() => onCancel(item.id)}
            disabled={!canResolve}
            className={canResolve ? 'btn-danger btn-sm' : 'btn-muted btn-sm'}
          >
            🚫 ยกเลิก
          </button>
        </div>

        {/* Quiz score trend */}
        {item.quizHistory.length >= 2 && <QuizScoreChart history={item.quizHistory} />}

        {/* Quiz history summary */}
        {item.quizHistory.length > 0 && (
          <details className="text-xs text-slate-500 group">
            <summary className="cursor-pointer font-bold text-slate-500 list-none flex items-center gap-1.5">
              <span className="inline-block transition-transform group-open:rotate-90">▸</span>
              ประวัติการทบทวน ({item.quizHistory.length} ครั้ง)
            </summary>
            <ul className="mt-2 space-y-1.5">
              {item.quizHistory.map((q) => (
                <li key={q.id} className="bg-slate-50 rounded-xl p-2.5">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>{formatThaiDate(q.date)}</span>
                    <span>{q.totalScore} / 25</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">{q.interpretation}</div>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
