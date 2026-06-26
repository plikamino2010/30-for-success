import { useEffect, useState } from 'react';
import { Item, ItemStatus, QuizRecord } from './types';
import { loadItems, saveItems, hasSeeded, markSeeded } from './utils/storage';
import { addDays, daysBetween, todayISO } from './utils/dateUtils';
import { getMockItems } from './data/mockData';
import Dashboard from './components/Dashboard';
import ItemForm from './components/ItemForm';
import QuizModal from './components/QuizModal';
import StatsView from './components/StatsView';
import MoneySummary from './components/MoneySummary';
import ImportExportBar from './components/ImportExportBar';

type View = 'dashboard' | 'form' | 'stats';

function App() {
  const [items, setItems] = useState<Item[]>(() => {
    const loaded = loadItems();
    if (loaded.length > 0) return loaded;
    if (!hasSeeded()) {
      markSeeded();
      return getMockItems();
    }
    return [];
  });

  const [view, setView] = useState<View>('dashboard');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [quizItem, setQuizItem] = useState<Item | null>(null);
  const [saveError, setSaveError] = useState(false);

  // Tracks "today" as an ISO date string. Re-checked when the app regains
  // focus/visibility (common on mobile after the app sits in the background
  // overnight) and on a periodic timer, so date-dependent UI (countdowns,
  // waiting -> ready flips, review reminders) stays correct during long
  // sessions without requiring a page reload.
  const [today, setToday] = useState(todayISO());

  useEffect(() => {
    function refreshToday() {
      setToday(todayISO());
    }
    document.addEventListener('visibilitychange', refreshToday);
    window.addEventListener('focus', refreshToday);
    const interval = setInterval(refreshToday, 60 * 1000);
    return () => {
      document.removeEventListener('visibilitychange', refreshToday);
      window.removeEventListener('focus', refreshToday);
      clearInterval(interval);
    };
  }, []);

  // Persist items to localStorage whenever they change
  useEffect(() => {
    const ok = saveItems(items);
    setSaveError(!ok);
  }, [items]);

  // Auto-flip any "waiting" items whose decision date has arrived to "ready".
  // Runs on initial load and again whenever `today` changes.
  useEffect(() => {
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.status === 'waiting' && daysBetween(today, item.decisionDate) <= 0) {
          changed = true;
          return { ...item, status: 'ready' as ItemStatus };
        }
        return item;
      });
      return changed ? next : prev;
    });
  }, [today]);

  function openAddForm() {
    setEditingItem(null);
    setView('form');
  }

  function openEditForm(item: Item) {
    setEditingItem(item);
    setView('form');
  }

  function goToDashboard() {
    setEditingItem(null);
    setView('dashboard');
  }

  const closeForm = goToDashboard;

  function handleFormSubmit(item: Item) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [item, ...prev];
    });
    closeForm();
  }

  function setStatus(id: string, status: ItemStatus) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, statusUpdatedAt: today } : i))
    );
  }

  /** Pushes an item's decision date back by `days` and keeps its status in sync. */
  function handleExtend(id: string, days: number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const decisionDate = addDays(i.decisionDate, days);
        const waitDays = i.waitDays + days;
        // If a "ready" item gets pushed back into the future, it's waiting again.
        if (i.status === 'ready' && daysBetween(today, decisionDate) > 0) {
          return { ...i, decisionDate, waitDays, status: 'waiting' as ItemStatus, statusUpdatedAt: today };
        }
        return { ...i, decisionDate, waitDays };
      })
    );
  }

  /** Pauses an item with no fixed timeline ("พักไว้ก่อน"). */
  function handleHold(id: string) {
    setStatus(id, 'hold');
  }

  /** Resumes a held item, restarting its wait period from today. */
  function handleResume(id: string) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          status: 'waiting' as ItemStatus,
          createdAt: today,
          decisionDate: addDays(today, i.waitDays),
          statusUpdatedAt: today,
        };
      })
    );
  }

  /** Replaces or merges in items imported from a backup JSON file. */
  function handleImport(importedItems: Item[], mode: 'merge' | 'replace') {
    if (mode === 'replace') {
      setItems(importedItems);
    } else {
      setItems((prev) => [...importedItems, ...prev]);
    }
  }

  function handleQuizSubmit(record: QuizRecord) {
    setItems((prev) =>
      prev.map((i) => (i.id === record.itemId ? { ...i, quizHistory: [...i.quizHistory, record] } : i))
    );
    setQuizItem(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Header */}
        <header className="sticky top-0 z-10 -mx-4 px-4 pt-5 pb-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>⏳</span> Wait 30
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                รอก่อนซื้อ คิดให้ชัวร์ก่อนตัดสินใจ
              </p>
            </div>
            {view === 'dashboard' ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setView('stats')}
                  className="btn-secondary px-3.5"
                  aria-label="สรุปผลรายเดือน/รายปี"
                >
                  📊
                </button>
                <button onClick={openAddForm} className="btn-primary px-5">
                  <span className="text-lg leading-none">+</span> เพิ่มรายการ
                </button>
              </div>
            ) : (
              <button onClick={goToDashboard} className="btn-secondary px-4 flex-shrink-0">
                <span>←</span> กลับ
              </button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="mt-4">
          {saveError && (
            <div className="surface flex items-start gap-3 px-4 py-3.5 mb-4 bg-gradient-to-r from-rose-50 to-white">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div className="flex-1 text-sm">
                <p className="font-bold text-rose-700">บันทึกข้อมูลล่าสุดไม่สำเร็จ</p>
                <p className="text-rose-500 mt-0.5 leading-relaxed">
                  พื้นที่เก็บข้อมูลในเครื่องอาจเต็ม ลองลบรูปภาพบางรายการ หรือลบรายการที่ไม่ใช้แล้ว
                </p>
              </div>
              <button
                onClick={() => setSaveError(false)}
                className="text-rose-400 font-bold text-lg leading-none flex-shrink-0"
                aria-label="ปิด"
              >
                ×
              </button>
            </div>
          )}
          {view === 'dashboard' && (
            <div className="flex flex-col gap-4 mb-4">
              <MoneySummary items={items} />
              <ImportExportBar items={items} onImport={handleImport} />
            </div>
          )}
          {view === 'dashboard' ? (
            <Dashboard
              items={items}
              onEdit={openEditForm}
              onReview={(item) => setQuizItem(item)}
              onMarkBought={(id) => setStatus(id, 'bought')}
              onCancel={(id) => setStatus(id, 'cancelled')}
              onExtend={handleExtend}
              onHold={handleHold}
              onResume={handleResume}
              onAdd={openAddForm}
            />
          ) : view === 'stats' ? (
            <StatsView items={items} />
          ) : (
            <ItemForm initialItem={editingItem} onSubmit={handleFormSubmit} onCancel={closeForm} />
          )}
        </main>
      </div>

      {/* Review quiz modal */}
      {quizItem && (
        <QuizModal item={quizItem} onSubmit={handleQuizSubmit} onClose={() => setQuizItem(null)} />
      )}
    </div>
  );
}

export default App;
