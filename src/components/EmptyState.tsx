interface EmptyStateProps {
  onAdd: () => void;
  hasAnyItems: boolean;
}

export default function EmptyState({ onAdd, hasAnyItems }: EmptyStateProps) {
  return (
    <div className="surface flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="text-6xl mb-4">{hasAnyItems ? '🔍' : '🛒'}</div>
      <h2 className="text-lg font-extrabold text-slate-700 mb-1.5">
        {hasAnyItems ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีรายการในวิชลิสต์'}
      </h2>
      <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
        {hasAnyItems
          ? 'ลองเลือก "ทั้งหมด" หรือเปลี่ยนการเรียงลำดับดูนะ'
          : 'อยากได้อะไรก็เพิ่มไว้ก่อน แล้วลองรอดูสักพักก่อนตัดสินใจซื้อจริง'}
      </p>
      {!hasAnyItems && (
        <button onClick={onAdd} className="btn-primary px-6">
          <span className="text-lg leading-none">+</span> เพิ่มรายการแรกของคุณ
        </button>
      )}
    </div>
  );
}
