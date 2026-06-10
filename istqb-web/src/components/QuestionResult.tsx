import { useState } from 'react';
import type { Question } from '../types/question';

interface Props {
  question: Question;
  selectedAnswers: string[];
  isCorrect: boolean;
  isInWrong: boolean;
  onNext: () => void;
  onRetry?: () => void;
  onSaveToWrongNote?: () => void;
  onRemoveFromWrongNote?: () => void;
  isLast: boolean;
}

export default function QuestionResult({
  question,
  selectedAnswers,
  isCorrect,
  isInWrong,
  onNext,
  onRetry,
  onSaveToWrongNote,
  onRemoveFromWrongNote,
  isLast,
}: Props) {
  const [allExpanded, setAllExpanded] = useState(false);

  const correctLabels = question.correctAnswers.map((id) => id.toUpperCase()).join(', ');
  const selectedLabels = selectedAnswers.map((id) => id.toUpperCase()).join(', ');

  // Find the explanation for the user's selected answer
  const selectedExplanations = selectedAnswers
    .map((id) => question.optionExplanations[id])
    .filter(Boolean);

  // Find the explanation for the correct answer
  const correctExplanations = question.correctAnswers
    .map((id) => question.optionExplanations[id])
    .filter(Boolean);

  const hasKeyConcepts = question.keyConcepts && question.keyConcepts.length > 0;
  const hasReviewTip = question.reviewTip && question.reviewTip.length > 0;
  const hasSyllabusRef = question.syllabusReference;

  return (
    <div className="question-result">
      {/* 1. 정답/오답 배너 */}
      <div className={`result-banner ${isCorrect ? 'correct' : 'wrong'}`}>
        {isCorrect ? '정답입니다' : '아쉽지만 틀렸어요'}
      </div>

      {/* 2. 정답 / 내 답 비교 */}
      {!isCorrect && (
        <div className="result-compare">
          <div className="compare-item my-answer">
            <span className="compare-label">내 답</span>
            <span className="compare-value">{selectedLabels || '-'}</span>
          </div>
          <div className="compare-item correct-answer">
            <span className="compare-label">정답</span>
            <span className="compare-value">{correctLabels}</span>
          </div>
        </div>
      )}

      {/* 3. 왜 틀렸는지 / 왜 맞았는지 */}
      {!isCorrect && selectedExplanations.length > 0 && (
        <div className="result-section-card wrong-reason">
          <h4 className="result-section-title">내가 선택한 답의 해설</h4>
          {selectedAnswers.map((id) => {
            const exp = question.optionExplanations[id];
            if (!exp) return null;
            return (
              <p key={id} className="result-section-text">
                <strong>{id.toUpperCase()}.</strong> {exp}
              </p>
            );
          })}
        </div>
      )}

      {/* 4. 정답 해설 */}
      {correctExplanations.length > 0 && (
        <div className="result-section-card correct-reason">
          <h4 className="result-section-title">정답 해설</h4>
          {question.correctAnswers.map((id) => {
            const exp = question.optionExplanations[id];
            if (!exp) return null;
            return (
              <p key={id} className="result-section-text">
                <strong>{id.toUpperCase()}.</strong> {exp}
              </p>
            );
          })}
        </div>
      )}

      {/* 5. 선택지별 해설 (접기/펼치기) */}
      <div className="result-section-card all-explanations">
        <button
          className="toggle-btn"
          onClick={() => setAllExpanded(!allExpanded)}
        >
          <span>전체 선택지 해설</span>
          <span className="toggle-icon">{allExpanded ? '▲' : '▼'}</span>
        </button>
        {allExpanded && (
          <div className="toggle-content">
            {question.options.map((opt) => {
              const exp = question.optionExplanations[opt.id];
              const isCorrectOption = question.correctAnswers.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  className={`option-explanation-row ${isCorrectOption ? 'is-correct' : ''}`}
                >
                  <span className="option-explanation-id">
                    {opt.id.toUpperCase()}.{' '}
                    {isCorrectOption && <span className="correct-mark">✓</span>}
                  </span>
                  <p className="option-explanation-text">{exp || '-'}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. 실러버스 복습 위치 */}
      {hasSyllabusRef && (
        <div className="result-section-card syllabus-ref">
          <h4 className="result-section-title">실러버스 복습 위치</h4>
          <div className="syllabus-info">
            <span className="meta-badge chapter">{question.syllabusReference.chapter}</span>
            <span className="syllabus-section">
              {question.syllabusReference.section} - {question.syllabusReference.title}
            </span>
          </div>
          {question.syllabusReference.learningObjective && (
            <span className="syllabus-lo">
              학습목표: {question.syllabusReference.learningObjective}
            </span>
          )}
        </div>
      )}

      {/* 7. 암기 포인트 */}
      {(hasKeyConcepts || hasReviewTip) && (
        <div className="result-section-card review-tip">
          <h4 className="result-section-title">암기 포인트</h4>
          {hasReviewTip && (
            <p className="result-section-text tip-text">{question.reviewTip}</p>
          )}
          {hasKeyConcepts && (
            <div className="key-concepts">
              {question.keyConcepts.map((concept, i) => (
                <span key={i} className="keyword-tag">{concept}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. 오답노트 상태 + 액션 */}
      {!isCorrect && !isInWrong && onSaveToWrongNote && (
        <p className="wrong-saved">오답노트에 자동 저장됨</p>
      )}

      {/* 액션 버튼 */}
      <div className="result-actions">
        {isCorrect && isInWrong && onRemoveFromWrongNote && (
          <button className="btn-remove-wrong" onClick={onRemoveFromWrongNote}>
            오답노트에서 제거
          </button>
        )}
        {!isCorrect && onSaveToWrongNote && (
          <button className="btn-secondary result-action-btn" onClick={onSaveToWrongNote}>
            오답노트에 수동 저장
          </button>
        )}
        {onRetry && (
          <button className="btn-secondary result-action-btn" onClick={onRetry}>
            다시 풀기
          </button>
        )}
        <button className="btn-primary" onClick={onNext}>
          {isLast ? '완료' : '다음 문제'}
        </button>
      </div>
    </div>
  );
}
