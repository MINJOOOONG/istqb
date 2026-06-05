import { useState } from 'react';
import type { Question } from '../types/question';
import OptionButton from './OptionButton';
import { checkAnswer } from '../utils/quiz';
import { recordAnswer, removeWrongId, getWrongIds } from '../utils/storage';

interface Props {
  question: Question;
  index: number;
  total: number;
  onNext: () => void;
  isLast: boolean;
}

export default function QuestionCard({ question, index, total, onNext, isLast }: Props) {
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
    recordAnswer(question.id, correct);
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  const handleRemoveFromWrong = () => {
    removeWrongId(question.id);
    window.dispatchEvent(new Event('wrongUpdated'));
  };

  const isInWrong = getWrongIds().includes(question.id);

  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="meta-progress">{index + 1} / {total}</span>
        <span className="meta-badge chapter">Ch.{question.chapter}</span>
        <span className={`meta-badge klevel ${question.kLevel.toLowerCase()}`}>{question.kLevel}</span>
        <span className="meta-lo">{question.learningObjective}</span>
      </div>

      <p className="question-text">{question.questionText}</p>

      {question.isMultipleAnswer && (
        <p className="multi-hint">복수 정답 ({question.correctAnswers.length}개 선택)</p>
      )}

      <div className="options">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.id}
            option={opt}
            selected={selected.has(opt.id)}
            revealed={revealed}
            isCorrect={question.correctAnswers.includes(opt.id)}
            explanation={revealed ? question.optionExplanations[opt.id] : undefined}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {!revealed ? (
        <button className="btn-primary" onClick={handleCheck} disabled={selected.size === 0}>
          정답 확인
        </button>
      ) : (
        <div className="result-section">
          <div className={`result-banner ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? '✓ 정답입니다!' : '✗ 오답입니다'}
          </div>

          {question.explanation && (
            <div className="explanation">{question.explanation}</div>
          )}

          {!isCorrect && (
            <p className="wrong-saved">오답노트에 저장됨</p>
          )}

          {revealed && isCorrect && isInWrong && (
            <button className="btn-remove-wrong" onClick={handleRemoveFromWrong}>
              오답노트에서 제거
            </button>
          )}

          <button className="btn-primary" onClick={onNext}>
            {isLast ? '완료' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
}
