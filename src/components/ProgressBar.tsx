import { ItemStatus } from '../types';

interface ProgressBarProps {
  percent: number; // 0-100
  status: ItemStatus;
}

const BAR_COLOR: Record<ItemStatus, string> = {
  waiting: 'bg-brand-500',
  ready: 'bg-emerald-500',
  hold: 'bg-amber-400',
  bought: 'bg-slate-300',
  cancelled: 'bg-rose-300',
};

export default function ProgressBar({ percent, status }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${BAR_COLOR[status]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
