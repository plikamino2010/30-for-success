import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Item, ItemCategory } from '../types';
import { addDays, daysBetween, todayISO } from '../utils/dateUtils';
import { suggestWaitDays } from '../utils/waitDays';
import { fileToResizedDataUrl } from '../utils/image';
import { CATEGORIES, suggestCategory } from '../utils/category';

interface ItemFormProps {
  initialItem?: Item | null;
  onSubmit: (item: Item) => void;
  onCancel: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ItemForm({ initialItem, onSubmit, onCancel }: ItemFormProps) {
  const isEditing = !!initialItem;

  const [name, setName] = useState(initialItem?.name ?? '');
  const [category, setCategory] = useState<ItemCategory>(initialItem?.category ?? suggestCategory(initialItem?.name ?? ''));
  const [categoryTouched, setCategoryTouched] = useState(isEditing);
  const [url, setUrl] = useState(initialItem?.url ?? '');
  const [price, setPrice] = useState<string>(initialItem ? String(initialItem.price) : '');
  const [image, setImage] = useState(initialItem?.image ?? '');
  const [reason, setReason] = useState(initialItem?.reason ?? '');
  const [startDate, setStartDate] = useState(initialItem?.createdAt ?? todayISO());
  const [waitDays, setWaitDays] = useState<string>(
    initialItem ? String(initialItem.waitDays) : String(suggestWaitDays(0))
  );
  const [waitDaysTouched, setWaitDaysTouched] = useState(isEditing);
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!categoryTouched) {
      setCategory(suggestCategory(value));
    }
  }

  function handleCategoryChange(value: ItemCategory) {
    setCategory(value);
    setCategoryTouched(true);
  }

  function handlePriceChange(value: string) {
    setPrice(value);
    const numericPrice = Number(value);
    if (!waitDaysTouched && !isNaN(numericPrice)) {
      setWaitDays(String(suggestWaitDays(numericPrice)));
    }
  }

  function handleWaitDaysChange(value: string) {
    setWaitDays(value);
    setWaitDaysTouched(true);
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setImage(dataUrl);
    } catch (err) {
      console.error(err);
      setImageError(err instanceof Error && err.message ? err.message : 'ไม่สามารถอัปโหลดรูปภาพนี้ได้ ลองใช้รูปอื่นนะ');
    } finally {
      // Reset the input value so selecting the same file again (e.g. after
      // removing the image) still fires a change event.
      e.target.value = '';
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const numericPrice = Number(price);
    const numericWaitDays = Number(waitDays);

    if (!name.trim()) {
      setFormError('กรุณากรอกชื่อสินค้า');
      return;
    }
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError('กรุณากรอกราคาเป็นตัวเลขที่ถูกต้อง');
      return;
    }
    if (isNaN(numericWaitDays) || numericWaitDays < 1) {
      setFormError('จำนวนวันที่รอต้องมากกว่าหรือเท่ากับ 1 วัน');
      return;
    }
    if (!startDate) {
      setFormError('กรุณาเลือกวันที่เริ่ม');
      return;
    }

    const decisionDate = addDays(startDate, numericWaitDays);
    const today = todayISO();

    let status: Item['status'] = 'waiting';
    if (
      initialItem &&
      (initialItem.status === 'bought' || initialItem.status === 'cancelled' || initialItem.status === 'hold')
    ) {
      status = initialItem.status;
    } else {
      status = daysBetween(today, decisionDate) <= 0 ? 'ready' : 'waiting';
    }

    // Keep the original "status changed at" timestamp unless the status
    // itself changed as a result of this edit (e.g. extending the wait
    // period flips a "ready" item back to "waiting").
    const statusUpdatedAt =
      initialItem && initialItem.status === status ? initialItem.statusUpdatedAt : today;

    const item: Item = {
      id: initialItem?.id ?? makeId(),
      name: name.trim(),
      url: url.trim(),
      price: numericPrice,
      image,
      reason: reason.trim(),
      category,
      createdAt: startDate,
      waitDays: numericWaitDays,
      decisionDate,
      status,
      statusUpdatedAt,
      quizHistory: initialItem?.quizHistory ?? [],
    };

    onSubmit(item);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-8">
      <div className="px-1">
        <h2 className="text-xl font-extrabold text-slate-800">
          {isEditing ? '✏️ แก้ไขรายการ' : '➕ เพิ่มรายการใหม่'}
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {isEditing ? 'ปรับรายละเอียดของรายการนี้ได้ตามต้องการ' : 'ใส่ของที่อยากได้ แล้วลองรอก่อนตัดสินใจซื้อ'}
        </p>
      </div>

      {/* Basic info */}
      <div className="surface p-4 flex flex-col gap-4">
        <div>
          <label className="field-label">ชื่อสินค้า *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="เช่น หูฟังไร้สาย"
            className="field-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label mb-0">หมวดหมู่</label>
            {!categoryTouched && name.trim() && (
              <span className="text-[11px] font-bold text-brand-500">✨ AI แนะนำให้</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => handleCategoryChange(c.value)}
                className={`rounded-2xl py-2.5 text-xs font-bold flex flex-col items-center gap-1 transition-colors active:scale-95 ${
                  category === c.value ? 'bg-brand-600 text-white shadow-soft' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span className="text-lg leading-none">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">ลิงก์สินค้า</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">ราคา (บาท) *</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0"
            className="field-input"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="field-label">รูปภาพสินค้า</label>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0">
              {image ? (
                <img src={image} alt="ตัวอย่างรูปภาพ" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🖼️</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm">
                เลือกรูปภาพ
              </button>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-xs font-bold text-rose-500 text-left"
                >
                  ลบรูปภาพ
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {imageError && <p className="text-xs text-rose-500 mt-1.5 font-semibold">{imageError}</p>}
        </div>

        <div>
          <label className="field-label">เหตุผลที่อยากได้</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ทำไมถึงอยากได้สิ่งนี้?"
            rows={3}
            className="field-input resize-none"
          />
        </div>
      </div>

      {/* Waiting plan */}
      <div className="surface p-4 flex flex-col gap-4">
        <h3 className="text-sm font-extrabold text-slate-500 px-0.5">ระยะเวลารอ</h3>

        <div>
          <label className="field-label">วันที่เริ่มรอ</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">จำนวนวันที่ควรรอ</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={waitDays}
            onChange={(e) => handleWaitDaysChange(e.target.value)}
            className="field-input"
          />
          <p className="field-hint">
            ระบบแนะนำจำนวนวันให้อัตโนมัติตามราคา แต่ปรับเองได้เสมอ — ต่ำกว่า 500 บาท แนะนำ 1 วัน,
            500–2,999 บาท แนะนำ 7 วัน, 3,000–9,999 บาท แนะนำ 14 วัน, ตั้งแต่ 10,000 บาทขึ้นไป แนะนำ 30 วัน
          </p>
        </div>
      </div>

      {formError && (
        <div className="rounded-2xl bg-rose-50 text-rose-600 text-sm font-semibold px-4 py-3">
          {formError}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 pt-3 pb-1">
        <button type="button" onClick={onCancel} className="btn-secondary">
          ยกเลิก
        </button>
        <button type="submit" className="btn-primary">
          {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
        </button>
      </div>
    </form>
  );
}
