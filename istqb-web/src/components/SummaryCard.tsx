import type { Summary } from '../types/summary';

interface Props {
  summary: Summary;
  onClick: () => void;
}

export default function SummaryCard({ summary, onClick }: Props) {
  const importanceLabel =
    summary.importance === 'very-high' ? '매우 중요' : summary.importance === 'high' ? '중요' : '보통';

  return (
    <button className="summary-card" onClick={onClick}>
      <div className="summary-card-main">
        <p className="summary-card-title">{summary.section} {summary.sectionTitle}</p>
        <span className={`importance-badge ${summary.importance}`}>{importanceLabel}</span>
      </div>
    </button>
  );
}
