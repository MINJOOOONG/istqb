import type { Question } from '../types/question';
import OptionButton from './OptionButton';
import { getQuestionSourceInfo } from '../utils/sourcePdfs';
import { normalizeExtractedQuestionText } from '../utils/text';

interface Props {
  question: Question;
  index: number;
  total: number;
  answeredCount: number;
  selectedAnswers: string[];
  onSelect: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  onSubmit: () => void;
  allAnswers: Record<string, string[]>;
  questions: Question[];
  canSubmit: boolean;
}

export default function ExamQuestionCard({
  question,
  index,
  total,
  answeredCount,
  selectedAnswers,
  onSelect,
  onNext,
  onPrev,
  onGoTo,
  onSubmit,
  allAnswers,
  questions,
  canSubmit,
}: Props) {
  const selected = new Set(selectedAnswers);
  const questionText = normalizeExtractedQuestionText(question.questionText);
  const questionSourceLabel = `실러버스 ${question.examSet.toUpperCase()} ${question.questionNumber}번`;
  const sourceInfo = getQuestionSourceInfo(question);

  const handleSelect = (optionId: string) => {
    onSelect(question.id, optionId);
  };

  return (
    <div className="question-card exam-question-card">
      {/* Question number navigation grid */}
      <div className="exam-nav-grid">
        {questions.map((q, i) => {
          const hasAnswer = (allAnswers[q.id]?.length ?? 0) > 0;
          let cls = 'exam-nav-item';
          if (i === index) cls += ' current';
          else if (hasAnswer) cls += ' answered';
          return (
            <button key={q.id} className={cls} onClick={() => onGoTo(i)}>
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="exam-progress-bar">
        <div
          className="exam-progress-fill"
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>
      <p className="exam-progress-text">
        {answeredCount} / {total} 답변 완료
      </p>

      <div className="question-meta">
        <span className="meta-progress">
          {index + 1} / {total}
        </span>
        <span className="meta-badge chapter">Ch.{question.chapter}</span>
        <span className={`meta-badge klevel ${question.kLevel.toLowerCase()}`}>
          {question.kLevel}
        </span>
        <span className="question-source-badge">{questionSourceLabel}</span>
        {sourceInfo && (
          <a className="source-link-btn" href={sourceInfo.url}>
            원본 보기
          </a>
        )}
        <span className="meta-lo">{question.learningObjective}</span>
      </div>

      <div className="question-text">{questionText}</div>

      {question.isMultipleAnswer && (
        <p className="multi-hint">
          복수 정답 ({question.correctAnswers.length}개 선택)
        </p>
      )}

      <div className="options">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.id}
            option={opt}
            selected={selected.has(opt.id)}
            revealed={false}
            isCorrect={false}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="exam-actions">
        <button
          className="btn-secondary"
          onClick={onPrev}
          disabled={index === 0}
        >
          이전
        </button>
        {index < total - 1 ? (
          <button className="btn-primary" onClick={onNext}>
            다음
          </button>
        ) : (
          <button
            className="btn-primary exam-submit-btn"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            제출하기 ({answeredCount}/{total})
          </button>
        )}
      </div>

      {index < total - 1 && (
        <button
          className="btn-primary exam-submit-btn full"
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{ marginTop: '8px' }}
        >
          제출하기 ({answeredCount}/{total})
        </button>
      )}
    </div>
  );
}
