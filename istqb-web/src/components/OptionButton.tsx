import type { QuestionOption } from '../types/question';
import { getConciseExplanation } from '../utils/explanations';

interface Props {
  option: QuestionOption;
  selected: boolean;
  revealed: boolean;
  isCorrect: boolean;
  explanation?: string;
  onSelect: (id: string) => void;
}

export default function OptionButton({ option, selected, revealed, isCorrect, explanation, onSelect }: Props) {
  let className = 'option-btn';
  if (revealed) {
    if (isCorrect) className += ' correct';
    else if (selected) className += ' wrong';
    else className += ' dimmed';
  } else if (selected) {
    className += ' selected';
  }
  const conciseExplanation = explanation ? getConciseExplanation(explanation) : undefined;

  return (
    <button
      type="button"
      className={className}
      onClick={() => onSelect(option.id)}
      disabled={revealed}
    >
      <span className="option-id">{option.id.toUpperCase()}</span>
      <span className="option-body">
        <span className="option-text">{option.text}</span>
        {revealed && conciseExplanation && (
          <span className="option-explanation">{conciseExplanation}</span>
        )}
      </span>
      {revealed && (isCorrect || selected) && (
        <span className="option-icon">{isCorrect ? '✓' : '✗'}</span>
      )}
    </button>
  );
}
