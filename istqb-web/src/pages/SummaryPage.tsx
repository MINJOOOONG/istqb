import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import summaries from '../data/summaries.json';
import type { Summary } from '../types/summary';
import SummaryCard from '../components/SummaryCard';

const allSummaries = summaries as Summary[];

export default function SummaryPage() {
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map = new Map<number, Summary[]>();
    allSummaries.forEach((s) => {
      const list = map.get(s.chapter) || [];
      list.push(s);
      map.set(s.chapter, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, []);

  return (
    <div className="page summary-page">
      <h1>요약본</h1>

      {grouped.map(([chapter, items]) => (
        <div key={chapter} className="summary-group">
          <h2>Ch.{chapter} {items[0].chapterTitleKo}</h2>
          {items.map((s) => (
            <SummaryCard
              key={s.id}
              summary={s}
              onClick={() => navigate(`/summary/${s.id}`)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
