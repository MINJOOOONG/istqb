import { useParams, useNavigate } from 'react-router-dom';
import summaries from '../data/summaries.json';
import type { Summary } from '../types/summary';

const allSummaries = summaries as Summary[];

function getSummaryLineClass(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return 'summary-note-line is-empty';
  if (trimmed.endsWith(':')) return 'summary-note-line is-heading';
  if (trimmed.startsWith('-')) return 'summary-note-line is-bullet';
  return 'summary-note-line';
}

export default function SummaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const summary = allSummaries.find((s) => s.id === id);

  if (!summary) {
    return (
      <div className="page empty-page">
        <p>요약을 찾을 수 없습니다.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}>← 뒤로</button>

      <div className="detail-header">
        <span className="meta-badge chapter">Ch.{summary.chapter}</span>
        {summary.kLevel && (
          <span className={`meta-badge klevel ${summary.kLevel.toLowerCase()}`}>{summary.kLevel}</span>
        )}
      </div>

      <h1>{summary.section} {summary.sectionTitle}</h1>

      <p className="detail-lo">LO: {summary.learningObjective}</p>

      <button
        className="syllabus-jump-btn"
        onClick={() => navigate(`/syllabus?lo=${summary.learningObjective}`)}
      >
        관련 실러버스 바로가기
      </button>

      <div className="detail-keywords">
        {summary.keywords.map((kw) => (
          <span key={kw} className="keyword-tag">{kw}</span>
        ))}
      </div>

      <div className="detail-section">
        <h2>요약</h2>
        <div className="detail-body">
          {summary.summary.split('\n').map((line, i) => (
            <p key={i} className={getSummaryLineClass(line)}>
              {line.replace(/^-+\s*/, '')}
            </p>
          ))}
        </div>
      </div>

      <div className="detail-section exam-point">
        <h2>시험 포인트</h2>
        <p>{summary.examPoint}</p>
      </div>
    </div>
  );
}
