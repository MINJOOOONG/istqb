import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import summaries from '../data/summaries.json';
import type { Summary } from '../types/summary';
import SummaryCard from '../components/SummaryCard';

const allSummaries = summaries as Summary[];

export default function SummaryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allSummaries;
    const q = search.toLowerCase();
    return allSummaries.filter(
      (s) =>
        s.sectionTitle.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.toLowerCase().includes(q)) ||
        s.chapterTitleKo.includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<number, Summary[]>();
    filtered.forEach((s) => {
      const list = map.get(s.chapter) || [];
      list.push(s);
      map.set(s.chapter, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <div className="page summary-page">
      <h1>요약본</h1>
      <input
        className="search-input"
        type="text"
        placeholder="키워드 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {grouped.length === 0 ? (
        <div className="empty-state">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        grouped.map(([chapter, items]) => (
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
        ))
      )}
    </div>
  );
}
