import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questions from '../data/questions.json';
import type { Question } from '../types/question';
import { getWrongIds, removeWrongId } from '../utils/storage';

const allQuestions = questions as Question[];

export default function WrongNotePage() {
  const navigate = useNavigate();
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => setWrongIds(getWrongIds());
    update();
    window.addEventListener('wrongUpdated', update);
    return () => window.removeEventListener('wrongUpdated', update);
  }, []);

  const wrongQuestions = allQuestions.filter((q) => wrongIds.includes(q.id));

  const handleRemove = (id: string) => {
    removeWrongId(id);
    setWrongIds(getWrongIds());
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  return (
    <div className="page wrong-page">
      <h1>오답노트</h1>
      <p className="subtitle">{wrongQuestions.length}개의 틀린 문제</p>

      {wrongQuestions.length > 0 && (
        <div className="quick-actions">
          <button className="btn-primary full" onClick={() => navigate('/quiz?mode=wrong')}>
            전체 오답 다시 풀기
          </button>
          <button className="btn-secondary full" onClick={() => navigate('/quiz?mode=wrongRandom')}>
            오답 랜덤 10문제
          </button>
        </div>
      )}

      {wrongQuestions.length === 0 ? (
        <div className="empty-state">
          <p>틀린 문제가 없습니다.</p>
        </div>
      ) : (
        <div className="wrong-list">
          {wrongQuestions.map((q) => (
            <div key={q.id} className="wrong-item">
              <div className="wrong-item-header">
                <span className="meta-badge chapter">Ch.{q.chapter}</span>
                <span className={`meta-badge klevel ${q.kLevel.toLowerCase()}`}>{q.kLevel}</span>
              </div>
              <p className="wrong-item-text">
                Q{q.questionNumber}. {q.questionText}
              </p>
              <div className="wrong-item-actions">
                <button className="btn-small" onClick={() => navigate(`/quiz?mode=wrong`)}>
                  풀기
                </button>
                <button className="btn-small danger" onClick={() => handleRemove(q.id)}>
                  제거
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
