import { useRef, ChangeEvent } from 'react';
import { Item } from '../types';
import { exportItemsAsJson, parseImportedItems } from '../utils/storage';
import { todayISO } from '../utils/dateUtils';

interface ImportExportBarProps {
  items: Item[];
  onImport: (items: Item[], mode: 'merge' | 'replace') => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ImportExportBar({ items, onImport }: ImportExportBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportItemsAsJson(items);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wait30-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseImportedItems(text);

      const wantsImport = window.confirm(
        `พบ ${imported.length} รายการในไฟล์นี้\n\nกด OK เพื่อนำเข้าข้อมูล หรือ Cancel เพื่อยกเลิก`
      );
      if (!wantsImport) return;

      const wantsMerge = window.confirm(
        'นำเข้าแบบไหน?\n\nOK = "รวม" กับรายการที่มีอยู่ (เพิ่มรายการใหม่ต่อท้าย)\nCancel = "แทนที่" ข้อมูลทั้งหมดด้วยไฟล์นี้'
      );

      if (wantsMerge) {
        const withFreshIds = imported.map((item) => ({ ...item, id: makeId() }));
        onImport(withFreshIds, 'merge');
      } else {
        onImport(imported, 'replace');
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'ไม่สามารถนำเข้าไฟล์นี้ได้');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="flex gap-2.5">
      <button onClick={handleExport} className="btn-secondary btn-sm flex-1">
        ⬇️ ส่งออกข้อมูล
      </button>
      <button onClick={handleImportClick} className="btn-secondary btn-sm flex-1">
        ⬆️ นำเข้าข้อมูล
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
