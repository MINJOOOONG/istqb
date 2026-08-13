import { useEffect, useState } from 'react';
import type { Question } from '../types/question';
import QuestionBody from './QuestionBody';

// --- QuestionStem component ---
// 표·다이어그램이 있는 문항은 원본 시험지를 잘라낸 이미지를 그대로 보여주고,
// 나머지 문항은 텍스트로 보여준다. 이미지를 탭하면 전체 화면으로 확대된다.

interface Props {
  question: Question;
  className?: string;
}

export default function QuestionStem({ question, className = 'question-text' }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const image = question.stemImage;

  useEffect(() => {
    if (!zoomed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomed(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [zoomed]);

  if (!image || imageFailed) {
    return <QuestionBody questionText={question.questionText} className={className} />;
  }

  const label = `실러버스 ${question.examSet.toUpperCase()} ${question.questionNumber}번 원본 지문`;

  return (
    <div className={`${className} question-stem-image`}>
      <button
        type="button"
        className="question-image-btn"
        onClick={() => {
          setEnlarged(false);
          setZoomed(true);
        }}
      >
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={label}
          onError={() => setImageFailed(true)}
        />
      </button>
      <span className="question-image-hint">탭하면 크게 볼 수 있습니다</span>

      {zoomed && (
        <div
          className="question-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setZoomed(false)}
        >
          <button type="button" className="question-image-close" onClick={() => setZoomed(false)}>
            닫기
          </button>
          <div className="question-image-scroll" onClick={(event) => event.stopPropagation()}>
            <img
              className={enlarged ? 'enlarged' : undefined}
              src={image.src}
              alt={label}
              onClick={() => setEnlarged((previous) => !previous)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
