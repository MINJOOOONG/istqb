import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import questions from '../data/questions.json';
import type { Question } from '../types/question';
import QuestionCard from '../components/QuestionCard';
import { filterByChapter, pickRandom, shuffleArray } from '../utils/quiz';
import { getWrongIds } from '../utils/storage';

const allQuestions = questions as Question[];

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'all';
  const chapter = Number(searchParams.get('chapter') || 0);
  const set = searchParams.get('set') || '';
  const questionId = searchParams.get('questionId') || '';

  const quizQuestions = useMemo(() => {
    switch (mode) {
      case 'random10':
        return pickRandom(allQuestions, 10);
      case 'chapter':
        return shuffleArray(filterByChapter(allQuestions, chapter));
      case 'exam':
        return allQuestions
          .filter((q) => q.examSet === set)
          .sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber));
      case 'wrongRandom': {
        const wrongIds = new Set(getWrongIds());
        const wrongQs = allQuestions.filter((q) => wrongIds.has(q.id));
        return shuffleArray(wrongQs).slice(0, 10);
      }
      case 'wrong': {
        const wrongIds = new Set(getWrongIds());
        return allQuestions.filter((q) => wrongIds.has(q.id));
      }
      case 'single': {
        const found = allQuestions.filter((q) => q.id === questionId);
        return found;
      }
      case 'all':
      default:
        return shuffleArray(allQuestions);
    }
  }, [mode, chapter, set, questionId]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      navigate(-1);
    }
  };

  if (quizQuestions.length === 0) {
    return (
      <div className="page empty-page">
        <p>풀 문제가 없습니다.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>돌아가기</button>
      </div>
    );
  }

  const question = quizQuestions[currentIndex];

  return (
    <div className="page quiz-page">
      <QuestionCard
        key={question.id + '-' + currentIndex}
        question={question}
        index={currentIndex}
        total={quizQuestions.length}
        onNext={handleNext}
        isLast={currentIndex >= quizQuestions.length - 1}
      />
    </div>
  );
}
