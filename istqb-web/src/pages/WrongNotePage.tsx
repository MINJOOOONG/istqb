import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import questions from '../data/questions.json';
import type { Question } from '../types/question';
import { getWrongNotes, removeWrongNote, type WrongNoteRecord } from '../utils/storage';
import QuestionResult from '../components/QuestionResult';
import { getQuestionSourceInfo } from '../utils/sourcePdfs';

const allQuestions = questions as Question[];
const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

type SortMode = 'recent' | 'frequent' | 'chapter';
type FilterMode = 'all' | 'unresolved' | number;

export default function WrongNotePage() {
  const navigate = useNavigate();
  const [wrongNotes, setWrongNotes] = useState<WrongNoteRecord[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setWrongNotes(getWrongNotes());
    update();
    window.addEventListener('wrongUpdated', update);
    return () => window.removeEventListener('wrongUpdated', update);
  }, []);

  // Available chapters from wrong notes
  const chapters = useMemo(() => {
    const chapterSet = new Set<number>();
    for (const note of wrongNotes) {
      const q = questionMap.get(note.questionId);
      if (q) chapterSet.add(q.chapter);
    }
    return Array.from(chapterSet).sort((a, b) => a - b);
  }, [wrongNotes]);

  // Filter and sort
  const filteredNotes = useMemo(() => {
    let notes = [...wrongNotes];

    // Filter
    if (filterMode === 'unresolved') {
      notes = notes.filter((n) => !n.lastRetryCorrect);
    } else if (typeof filterMode === 'number') {
      notes = notes.filter((n) => {
        const q = questionMap.get(n.questionId);
        return q?.chapter === filterMode;
      });
    }

    // Sort
    switch (sortMode) {
      case 'frequent':
        notes.sort((a, b) => b.wrongCount - a.wrongCount);
        break;
      case 'chapter':
        notes.sort((a, b) => {
          const qa = questionMap.get(a.questionId);
          const qb = questionMap.get(b.questionId);
          return (qa?.chapter ?? 0) - (qb?.chapter ?? 0);
        });
        break;
      case 'recent':
      default:
        notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return notes;
  }, [wrongNotes, sortMode, filterMode]);

  const handleRemove = (id: string) => {
    removeWrongNote(id);
    setWrongNotes(getWrongNotes());
    setExpandedId(null);
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSingleRetry = (questionId: string) => {
    navigate(`/quiz?mode=single&questionId=${questionId}`);
  };

  return (
    <div className="page wrong-page">
      <h1>오답노트</h1>
      <p className="subtitle">{wrongNotes.length}개의 틀린 문제</p>

      {wrongNotes.length > 0 && (
        <>
          <div className="quick-actions">
            <button className="btn-primary full" onClick={() => navigate('/quiz?mode=wrong')}>
              전체 오답 다시 풀기
            </button>
            <button className="btn-secondary full" onClick={() => navigate('/quiz?mode=wrongRandom')}>
              오답 랜덤 10문제
            </button>
          </div>

          {/* 필터 */}
          <div className="wrong-filters">
            <div className="filter-row">
              <button
                className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                전체
              </button>
              <button
                className={`filter-chip ${filterMode === 'unresolved' ? 'active' : ''}`}
                onClick={() => setFilterMode('unresolved')}
              >
                미해결
              </button>
              {chapters.map((ch) => (
                <button
                  key={ch}
                  className={`filter-chip ${filterMode === ch ? 'active' : ''}`}
                  onClick={() => setFilterMode(filterMode === ch ? 'all' : ch)}
                >
                  Ch.{ch}
                </button>
              ))}
            </div>

            {/* 정렬 */}
            <div className="sort-row">
              <select
                className="sort-select"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
              >
                <option value="recent">최근 틀린 순</option>
                <option value="frequent">자주 틀린 순</option>
                <option value="chapter">챕터 순</option>
              </select>
            </div>
          </div>

          <p className="filter-result-count">{filteredNotes.length}개 표시</p>
        </>
      )}

      {wrongNotes.length === 0 ? (
        <div className="empty-state">
          <p>틀린 문제가 없습니다.</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="empty-state">
          <p>조건에 맞는 문제가 없습니다.</p>
        </div>
      ) : (
        <div className="wrong-list">
          {filteredNotes.map((note) => {
            const q = questionMap.get(note.questionId);
            if (!q) return null;
            const isExpanded = expandedId === note.questionId;
            const sourceInfo = getQuestionSourceInfo(q);

            return (
              <div key={note.questionId} className="wrong-item">
                <div className="wrong-item-header">
                  <span className="meta-badge chapter">Ch.{q.chapter}</span>
                  <span className={`meta-badge klevel ${q.kLevel.toLowerCase()}`}>{q.kLevel}</span>
                  {note.wrongCount > 1 && (
                    <span className="wrong-count-badge">{note.wrongCount}회 오답</span>
                  )}
                  {note.lastRetryCorrect && (
                    <span className="retry-correct-badge">재풀이 정답</span>
                  )}
                </div>
                <button className="wrong-item-text-btn" onClick={() => handleToggleExpand(note.questionId)}>
                  <p className="wrong-item-text">
                    Q{q.questionNumber}. {q.questionText}
                  </p>
                  <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="wrong-item-detail">
                    <QuestionResult
                      question={q}
                      isCorrect={false}
                      isInWrong={true}
                      onNext={() => setExpandedId(null)}
                      onRetry={() => handleSingleRetry(note.questionId)}
                      isLast={false}
                    />
                  </div>
                )}

                {!isExpanded && (
                  <div className="wrong-item-actions">
                    <button className="btn-small" onClick={() => handleSingleRetry(note.questionId)}>
                      다시 풀기
                    </button>
                    <button className="btn-small" onClick={() => handleToggleExpand(note.questionId)}>
                      해설 보기
                    </button>
                    {sourceInfo && (
                      <button className="btn-small" onClick={() => navigate(sourceInfo.url)}>
                        원본 보기
                      </button>
                    )}
                    <button className="btn-small danger" onClick={() => handleRemove(note.questionId)}>
                      제거
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
