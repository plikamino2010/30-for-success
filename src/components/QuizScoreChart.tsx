import { QuizRecord } from '../types';
import { formatThaiDate } from '../utils/dateUtils';

interface QuizScoreChartProps {
  history: QuizRecord[];
}

const WIDTH = 280;
const HEIGHT = 90;
const PAD_X = 14;
const PAD_Y = 14;
const MAX_SCORE = 25;

/** Small inline SVG line chart showing how an item's desire score has changed over time. */
export default function QuizScoreChart({ history }: QuizScoreChartProps) {
  if (history.length < 2) return null;

  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_Y * 2;

  const points = history.map((record, idx) => {
    const x = history.length === 1 ? PAD_X : PAD_X + (idx / (history.length - 1)) * innerW;
    const y = PAD_Y + innerH - (record.totalScore / MAX_SCORE) * innerH;
    return { x, y, record };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="mt-1">
      <p className="text-[11px] font-bold text-slate-400 mb-1">แนวโน้มคะแนนความอยาก (0-25)</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ maxHeight: 100 }}>
        {/* Baseline grid lines for 0 / 12.5 / 25 */}
        {[0, 0.5, 1].map((ratio) => {
          const y = PAD_Y + innerH - ratio * innerH;
          return (
            <line
              key={ratio}
              x1={PAD_X}
              y1={y}
              x2={WIDTH - PAD_X}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray={ratio === 0 ? undefined : '3 3'}
            />
          );
        })}

        <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r={3} fill="#7c3aed">
            <title>
              {formatThaiDate(p.record.date)}: {p.record.totalScore}/25
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-0.5">
        <span>{formatThaiDate(history[0].date)}</span>
        <span>{formatThaiDate(history[history.length - 1].date)}</span>
      </div>
    </div>
  );
}
