import { Link } from 'react-router-dom';
import summaries from '../data/summaries.json';
import type { Question } from '../types/question';
import type { Summary } from '../types/summary';
import { getConciseExplanationLines } from '../utils/explanations';

const allSummaries = summaries as Summary[];

interface Props {
  question: Question;
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
  isCorrect,
  isInWrong,
  onNext,
  onRetry,
  onSaveToWrongNote,
  onRemoveFromWrongNote,
  isLast,
}: Props) {
  const relatedSummary =
    allSummaries.find((summary) => summary.learningObjective === question.learningObjective) ??
    allSummaries.find(
      (summary) =>
        question.syllabusReference.learningObjective &&
        summary.learningObjective === question.syllabusReference.learningObjective,
    ) ??
    allSummaries.find(
      (summary) =>
        summary.chapter === question.chapter &&
        summary.section === (question.syllabusReference.section ?? question.section),
    );
  const summarySectionNumber =
    relatedSummary?.section ?? question.syllabusReference.section ?? question.section;
  const summaryTitle =
    relatedSummary?.sectionTitle ?? question.syllabusReference.title ?? question.sectionTitle;
  const summaryLearningObjective =
    relatedSummary?.learningObjective ??
    question.syllabusReference.learningObjective ??
    question.learningObjective;
  const summaryTarget = relatedSummary ? `/summary/${relatedSummary.id}` : '/summary';
  const explanationLines = getConciseExplanationLines(question.explanation);

  return (
    <div className="question-result">
      <div className="result-section-card solution-process">
        <h4 className="result-section-title">풀이 과정</h4>

        {explanationLines.length > 0 && (
          <div className="solution-step">
            <span className="solution-step-number">1</span>
            <div className="solution-step-body">
              <strong>풀이</strong>
              {explanationLines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="result-section-card summary-ref">
        <h4 className="result-section-title">관련 요약</h4>
        <div className="summary-info">
          <span className="meta-badge chapter">Ch.{question.chapter}</span>
          <span className="summary-section">
            {summarySectionNumber} - {summaryTitle}
          </span>
        </div>
        <div className="summary-meta-row">
          <span className="summary-lo">학습목표: {summaryLearningObjective}</span>
        </div>
        <Link
          className="btn-secondary result-action-btn summary-open-link"
          to={summaryTarget}
        >
          {relatedSummary ? '관련 요약 열기' : '요약 목록 열기'}
        </Link>
      </div>

      {/* 오답노트 상태 */}
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
