import { useState } from 'react';
import type { Question } from '../types/question';
import OptionButton from './OptionButton';
import QuestionResult from './QuestionResult';
import { checkAnswer } from '../utils/quiz';
import { recordAnswer, removeWrongId, getWrongIds, saveWrongNote } from '../utils/storage';

// --- QuestionCard component ---

interface Props {
  question: Question;
  index: number;
  total: number;
  onNext: () => void;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  index,
  total,
  onNext,
  isLast,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (question.isMultipleAnswer) {
        if (next.has(optionId)) next.delete(optionId);
        else next.add(optionId);
      } else {
        next.clear();
        next.add(optionId);
      }
      return next;
    });
  };

  const handleCheck = () => {
    const correct = checkAnswer(question, selected);
    setIsCorrect(correct);
    setRevealed(true);
    recordAnswer(question.id, correct, {
      selectedAnswers: [...selected],
      correctAnswers: question.correctAnswers,
      chapter: question.chapter,
      section: question.section,
    });
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  const handleRemoveFromWrong = () => {
    removeWrongId(question.id);
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  const handleManualSave = () => {
    saveWrongNote({
      questionId: question.id,
      selectedAnswers: [...selected],
      correctAnswers: question.correctAnswers,
      isCorrect: false,
      date: new Date().toISOString(),
      chapter: question.chapter,
      section: question.section,
      manualSave: true,
    });
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  const handleRetry = () => {
    setSelected(new Set());
    setRevealed(false);
    setIsCorrect(false);
  };

  const isInWrong = getWrongIds().includes(question.id);
  const questionSourceLabel = `실러버스 ${question.examSet.toUpperCase()} ${question.questionNumber}번`;

  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="meta-progress">
          {index + 1} / {total}
        </span>
        <span className="meta-badge chapter">Ch.{question.chapter}</span>
        <span
          className={`meta-badge klevel ${question.kLevel.toLowerCase()}`}
        >
          {question.kLevel}
        </span>
        <span className="question-source-badge">{questionSourceLabel}</span>
        <span className="meta-lo">{question.learningObjective}</span>
      </div>

      <div className="question-text">{question.questionText}</div>

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
            revealed={revealed}
            isCorrect={question.correctAnswers.includes(opt.id)}
            explanation={
              revealed ? question.optionExplanations[opt.id] : undefined
            }
            onSelect={handleSelect}
          />
        ))}
      </div>

      {!revealed ? (
        <button
          className="btn-primary"
          onClick={handleCheck}
          disabled={selected.size === 0}
        >
          정답 확인
        </button>
      ) : (
        <QuestionResult
          question={question}
          isCorrect={isCorrect}
          isInWrong={isInWrong}
          onNext={onNext}
          onRetry={handleRetry}
          onSaveToWrongNote={!isCorrect ? handleManualSave : undefined}
          onRemoveFromWrongNote={
            isCorrect && isInWrong ? handleRemoveFromWrong : undefined
          }
          isLast={isLast}
        />
      )}
    </div>
  );
}
