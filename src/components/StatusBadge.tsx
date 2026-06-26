import { ItemStatus } from '../types';

interface StatusBadgeProps {
  status: ItemStatus;
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; className: string; dotClassName: string }> = {
  waiting: {
    label: 'กำลังรอ',
    className: 'bg-brand-50 text-brand-700',
    dotClassName: 'bg-brand-400',
  },
  ready: {
    label: 'พร้อมตัดสินใจ',
    className: 'bg-emerald-50 text-emerald-700',
    dotClassName: 'bg-emerald-400',
  },
  hold: {
    label: 'พักไว้ก่อน',
    className: 'bg-amber-50 text-amber-700',
    dotClassName: 'bg-amber-400',
  },
  bought: {
    label: 'ซื้อแล้ว',
    className: 'bg-slate-100 text-slate-500',
    dotClassName: 'bg-slate-400',
  },
  cancelled: {
    label: 'ยกเลิกแล้ว',
    className: 'bg-rose-50 text-rose-500',
    dotClassName: 'bg-rose-400',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`badge ${config.className}`}>
      <span className={`badge-dot ${config.dotClassName}`} />
      {config.label}
    </span>
  );
}
