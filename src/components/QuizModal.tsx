import { useState } from 'react';
import { Item, QuizAnswers, QuizRecord } from '../types';
import { DEFAULT_ANSWERS, getInterpretation, getRandomQuizQuestions, getTotalScore } from '../utils/quiz';
import { getRandomQuote } from '../utils/quotes';
import { todayISO } from '../utils/dateUtils';

interface QuizModalProps {
  item: Item;
  onSubmit: (record: QuizRecord) => void;
  onClose: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const SCORE_OPTIONS = [0, 1, 2, 3, 4, 5];

type ResultState = {
  totalScore: number;
  interpretation: string;
  quote: string;
} | null;

export default function QuizModal({ item, onSubmit, onClose }: QuizModalProps) {
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [result, setResult] = useState<ResultState>(null);
  const [questions] = useState<string[]>(() => getRandomQuizQuestions());

  function setAnswer(key: keyof QuizAnswers, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const totalScore = getTotalScore(answers);
    const interpretation = getInterpretation(totalScore);
    const quote = getRandomQuote();
    setResult({ totalScore, interpretation, quote });
  }

  function handleConfirm() {
    if (!result) return;
    const record: QuizRecord = {
      id: makeId(),
      itemId: item.id,
      date: todayISO(),
      questions,
      answers,
      totalScore: result.totalScore,
      interpretation: result.interpretation,
      quote: result.quote,
    };
    onSubmit(record);
  }

  const questionKeys: (keyof QuizAnswers)[] = ['q1', 'q2', 'q3', 'q4', 'q5'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-5">
        {!result ? (
          <>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">📝 ทบทวนความต้องการ</h2>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                สำหรับ "<span className="font-bold text-slate-600">{item.name}</span>" — ให้คะแนนแต่ละคำถาม
                ตั้งแต่ 0 (ไม่เลย) ถึง 5 (มากที่สุด)
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {questionKeys.map((key, idx) => (
                <div key={key}>
                  <p className="text-sm font-bold text-slate-700 mb-2.5">
                    {idx + 1}. {questions[idx]}
                  </p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {SCORE_OPTIONS.map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setAnswer(key, score)}
                        className={`rounded-xl text-sm font-extrabold transition-colors active:scale-95 ${
                          answers[key] === score
                            ? 'bg-brand-600 text-white shadow-soft'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={onClose} className="btn-secondary">
                ยกเลิก
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                ดูผลลัพธ์
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-2">
              <div className="text-5xl mb-2">
                {result.totalScore <= 9 ? '🌱' : result.totalScore <= 17 ? '🤔' : '🔥'}
              </div>
              <div className="text-3xl font-extrabold text-brand-700 mb-1.5">{result.totalScore} / 25</div>
              <p className="text-sm font-semibold text-slate-600 px-2 leading-relaxed">{result.interpretation}</p>
            </div>

            <div className="rounded-2xl bg-brand-50 p-4 text-center">
              <p className="text-sm italic text-brand-700 leading-relaxed">"{result.quote}"</p>
            </div>

            <button onClick={handleConfirm} className="btn-primary">
              บันทึกผลการทบทวน
            </button>
          </>
        )}
      </div>
    </div>
  );
}
