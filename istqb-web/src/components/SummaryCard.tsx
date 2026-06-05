import type { Summary } from '../types/summary';

interface Props {
  summary: Summary;
  onClick: () => void;
}

export default function SummaryCard({ summary, onClick }: Props) {
  return (
    <button className="summary-card" onClick={onClick}>
      <div className="summary-card-header">
        <span className="meta-badge chapter">Ch.{summary.chapter}</span>
        {summary.kLevel && (
          <span className={`meta-badge klevel ${summary.kLevel.toLowerCase()}`}>{summary.kLevel}</span>
        )}
        <span className={`importance-badge ${summary.importance}`}>{summary.importance === 'high' ? '중요' : summary.importance === 'very-high' ? '매우 중요' : '보통'}</span>
      </div>
      <p className="summary-card-title">{summary.section} {summary.sectionTitle}</p>
    </button>
  );
}
