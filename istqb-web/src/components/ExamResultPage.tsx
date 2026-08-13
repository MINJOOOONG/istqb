import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamResult } from '../utils/quiz';
import { getConciseExplanationLines } from '../utils/explanations';
import QuestionBody from './QuestionBody';

interface Props {
  result: ExamResult;
  onRetryWrong: () => void;
  onRetryAll: () => void;
}

export default function ExamResultPage({ result, onRetryWrong, onRetryAll }: Props) {
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="exam-result-page">
      {/* Header card */}
      <div className={`exam-result-header ${result.isPassed ? 'passed' : 'failed'}`}>
        <div className="exam-result-icon">
          {result.isPassed ? '🎉' : '📚'}
        </div>
        <h2 className="exam-result-title">
          모의고사 {result.examSet}
        </h2>
        <div className={`exam-result-badge ${result.isPassed ? 'passed' : 'failed'}`}>
          {result.isPassed ? '합격' : '불합격'}
        </div>
        <p className="exam-result-message">
          {result.isPassed
            ? '축하해요! 합격 기준을 넘겼어요.'
            : '아쉽지만 아직 합격 기준에 조금 부족해요. 틀린 문제를 다시 복습해봐요.'}
        </p>
      </div>

      {/* Score card */}
      <div className="exam-result-card score-card">
        <h3 className="exam-result-card-title">시험 결과</h3>
        <div className="score-grid">
          <div className="score-item">
            <span className="score-label">총 문제</span>
            <span className="score-value">{result.totalQuestions}문제</span>
          </div>
          <div className="score-item correct">
            <span className="score-label">맞힌 개수</span>
            <span className="score-value">{result.correctCount}개</span>
          </div>
          <div className="score-item wrong">
            <span className="score-label">틀린 개수</span>
            <span className="score-value">{result.wrongCount}개</span>
          </div>
          <div className="score-item">
            <span className="score-label">정답률</span>
            <span className="score-value">{result.percentage}%</span>
          </div>
        </div>
        <div className="score-bar-container">
          <div
            className={`score-bar-fill ${result.isPassed ? 'passed' : 'failed'}`}
            style={{ width: `${result.percentage}%` }}
          />
          <div className="score-bar-threshold" style={{ left: '65%' }} />
        </div>
        <p className="score-threshold-label">합격 기준: 65% (26/40)</p>
      </div>

      {/* Wrong answers section */}
      {result.wrongQuestions.length > 0 && (
        <div className="exam-result-card wrong-review-card">
          <h3 className="exam-result-card-title">
            오답 노트 ({result.wrongQuestions.length}문제)
          </h3>
          <div className="wrong-review-list">
            {result.wrongQuestions.map((item) => {
              const isExpanded = expandedQuestions.has(item.questionIndex);
              const explanationLines = getConciseExplanationLines(item.question.explanation);
              const selectedLabels = item.selectedAnswers.map((id) => id.toUpperCase());
              const correctLabels = item.question.correctAnswers.map((id) => id.toUpperCase());

              return (
                <div key={item.question.id} className="wrong-review-item">
                  <button
                    className="wrong-review-header"
                    onClick={() => toggleExpand(item.questionIndex)}
                  >
                    <span className="wrong-review-num">
                      {item.questionIndex + 1}번
                    </span>
                    <span className="wrong-review-summary">
                      <span className="wrong-review-my-answer">
                        내 답: {selectedLabels.length > 0 ? selectedLabels.join(', ') : '미답변'}
                      </span>
                      <span className="wrong-review-correct-answer">
                        정답: {correctLabels.join(', ')}
                      </span>
                    </span>
                    <span className={`wrong-review-toggle ${isExpanded ? 'open' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="wrong-review-detail">
                      <QuestionBody
                        questionText={item.question.questionText}
                        className="wrong-review-question-text"
                      />

                      <div className="wrong-review-options">
                        {item.question.options.map((opt) => {
                          const isSelected = item.selectedAnswers.includes(opt.id);
                          const isCorrect = item.question.correctAnswers.includes(opt.id);
                          let optClass = 'wrong-review-option';
                          if (isCorrect) optClass += ' correct';
                          else if (isSelected) optClass += ' wrong';

                          return (
                            <div key={opt.id} className={optClass}>
                              <span className="option-id">{opt.id.toUpperCase()}</span>
                              <span className="option-text">{opt.text}</span>
                              {isCorrect && <span className="option-icon">✓</span>}
                              {isSelected && !isCorrect && <span className="option-icon">✗</span>}
                            </div>
                          );
                        })}
                      </div>

                      {explanationLines.length > 0 && (
                        <div className="wrong-review-explanation">
                          <strong>해설</strong>
                          {explanationLines.map((line, i) => (
                            <p key={`${line}-${i}`}>{line}</p>
                          ))}
                        </div>
                      )}

                      <div className="wrong-review-meta">
                        <span className="meta-badge chapter">Ch.{item.question.chapter}</span>
                        <span className="meta-lo">{item.question.learningObjective}</span>
                        {item.question.syllabusReference.section && (
                          <span className="wrong-review-section">
                            {item.question.syllabusReference.section} - {item.question.syllabusReference.title}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="exam-result-actions">
        {result.wrongQuestions.length > 0 && (
          <button className="btn-secondary exam-action-btn" onClick={onRetryWrong}>
            틀린 문제 다시 보기
          </button>
        )}
        <button className="btn-secondary exam-action-btn" onClick={onRetryAll}>
          전체 문제 다시 풀기
        </button>
        <button
          className="btn-primary exam-action-btn"
          onClick={() => navigate('/practice')}
        >
          다른 모의고사 선택
        </button>
      </div>
    </div>
  );
}
