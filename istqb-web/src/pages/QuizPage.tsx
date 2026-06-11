import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import questions from '../data/questions.json';
import type { Question } from '../types/question';
import QuestionCard from '../components/QuestionCard';
import type { QuestionAnswerState } from '../components/QuestionCard';
import { filterByChapter, pickRandom, shuffleArray } from '../utils/quiz';
import {
  clearChapterQuizProgress,
  getChapterQuizProgress,
  getWrongIds,
  saveChapterQuizProgress,
} from '../utils/storage';

const allQuestions = questions as Question[];
const questionById = new Map(allQuestions.map((question) => [question.id, question]));

type QuizRouteState = {
  quiz?: {
    key: string;
    questionIds: string[];
    currentIndex: number;
    answerStates?: Record<string, QuestionAnswerState>;
  };
};

type QuizPosition = {
  key: string;
  currentIndex: number;
};

type QuizAnswerStates = {
  key: string;
  values: Record<string, QuestionAnswerState>;
};

function getQuizKey(mode: string, chapter: number, set: string, questionId: string) {
  return JSON.stringify({ mode, chapter, set, questionId });
}

function buildQuizQuestions(mode: string, chapter: number, set: string, questionId: string) {
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
    case 'single':
      return allQuestions.filter((q) => q.id === questionId);
    case 'all':
    default:
      return shuffleArray(allQuestions);
  }
}

function clampIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

function sameQuestionIds(a: string[] | undefined, b: string[]) {
  return Boolean(a && a.length === b.length && a.every((id, index) => id === b[index]));
}

function sameAnswerStates(
  a: Record<string, QuestionAnswerState> | undefined,
  b: Record<string, QuestionAnswerState>,
) {
  const aEntries = Object.entries(a ?? {});
  const bEntries = Object.entries(b);
  if (aEntries.length !== bEntries.length) return false;

  return bEntries.every(([questionId, bState]) => {
    const aState = a?.[questionId];
    return Boolean(
      aState &&
      aState.revealed === bState.revealed &&
      aState.isCorrect === bState.isCorrect &&
      sameQuestionIds(aState.selectedAnswers, bState.selectedAnswers),
    );
  });
}

function getSavedCurrentIndex(
  savedQuiz: QuizRouteState['quiz'],
  quizKey: string,
  mode: string,
  chapter: number,
  total: number,
) {
  if (savedQuiz?.key === quizKey) {
    return clampIndex(savedQuiz.currentIndex, total);
  }

  const savedChapterProgress = mode === 'chapter' ? getChapterQuizProgress(chapter) : undefined;
  if (savedChapterProgress?.chapter === chapter) {
    return clampIndex(savedChapterProgress.currentIndex, total);
  }

  return 0;
}

function getSavedAnswerStates(
  savedQuiz: QuizRouteState['quiz'],
  quizKey: string,
  mode: string,
  chapter: number,
) {
  if (savedQuiz?.key === quizKey) {
    return savedQuiz.answerStates ?? {};
  }

  const savedChapterProgress = mode === 'chapter' ? getChapterQuizProgress(chapter) : undefined;
  if (savedChapterProgress?.chapter === chapter) {
    return savedChapterProgress.answerStates ?? {};
  }

  return {};
}

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = searchParams.get('mode') || 'all';
  const chapter = Number(searchParams.get('chapter') || 0);
  const set = searchParams.get('set') || '';
  const questionId = searchParams.get('questionId') || '';
  const quizKey = useMemo(
    () => getQuizKey(mode, chapter, set, questionId),
    [mode, chapter, set, questionId],
  );
  const routeState = location.state as QuizRouteState | null;

  const quizQuestions = useMemo(() => {
    const savedQuiz = routeState?.quiz;
    if (savedQuiz?.key === quizKey) {
      const restoredQuestions = savedQuiz.questionIds
        .map((id) => questionById.get(id))
        .filter((question): question is Question => Boolean(question));

      if (restoredQuestions.length > 0) {
        return restoredQuestions;
      }
    }

    const savedChapterProgress = mode === 'chapter' ? getChapterQuizProgress(chapter) : undefined;
    if (savedChapterProgress?.chapter === chapter) {
      const restoredQuestions = savedChapterProgress.questionIds
        .map((id) => questionById.get(id))
        .filter((question): question is Question => Boolean(question));

      if (restoredQuestions.length > 0) {
        return restoredQuestions;
      }
    }

    return buildQuizQuestions(mode, chapter, set, questionId);
  }, [mode, chapter, set, questionId, quizKey, routeState?.quiz]);

  const [quizPosition, setQuizPosition] = useState<QuizPosition>(() => {
    const currentIndex = getSavedCurrentIndex(
      routeState?.quiz,
      quizKey,
      mode,
      chapter,
      quizQuestions.length,
    );
    return { key: quizKey, currentIndex };
  });
  const [quizAnswerStates, setQuizAnswerStates] = useState<QuizAnswerStates>(() => ({
    key: quizKey,
    values: getSavedAnswerStates(routeState?.quiz, quizKey, mode, chapter),
  }));
  const currentIndex = quizPosition.key === quizKey
    ? clampIndex(quizPosition.currentIndex, quizQuestions.length)
    : getSavedCurrentIndex(routeState?.quiz, quizKey, mode, chapter, quizQuestions.length);
  const answerStates = quizAnswerStates.key === quizKey
    ? quizAnswerStates.values
    : getSavedAnswerStates(routeState?.quiz, quizKey, mode, chapter);

  useEffect(() => {
    if (quizQuestions.length === 0) return;

    const questionIds = quizQuestions.map((q) => q.id);
    const savedQuiz = routeState?.quiz;
    const savedIndex = clampIndex(currentIndex, quizQuestions.length);

    if (
      savedQuiz?.key === quizKey &&
      savedQuiz.currentIndex === savedIndex &&
      sameQuestionIds(savedQuiz.questionIds, questionIds) &&
      sameAnswerStates(savedQuiz.answerStates, answerStates)
    ) {
      return;
    }

    const nextState: QuizRouteState = {
      ...(routeState ?? {}),
      quiz: {
        key: quizKey,
        questionIds,
        currentIndex: savedIndex,
        answerStates,
      },
    };

    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: nextState },
    );
  }, [
    answerStates,
    currentIndex,
    location.pathname,
    location.search,
    navigate,
    quizKey,
    quizQuestions,
    routeState,
  ]);

  useEffect(() => {
    if (mode !== 'chapter' || quizQuestions.length === 0) return;

    saveChapterQuizProgress({
      chapter,
      questionIds: quizQuestions.map((q) => q.id),
      currentIndex: clampIndex(currentIndex, quizQuestions.length),
      answerStates,
    });
  }, [answerStates, chapter, currentIndex, mode, quizQuestions]);

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setQuizPosition({ key: quizKey, currentIndex: currentIndex + 1 });
    } else {
      if (mode === 'chapter') {
        clearChapterQuizProgress(chapter);
      }
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
  const handleAnswerStateChange = (state: QuestionAnswerState) => {
    setQuizAnswerStates((current) => ({
      key: quizKey,
      values: {
        ...(current.key === quizKey ? current.values : answerStates),
        [question.id]: state,
      },
    }));
  };

  return (
    <div className="page quiz-page">
      <QuestionCard
        key={question.id + '-' + currentIndex}
        question={question}
        index={currentIndex}
        total={quizQuestions.length}
        onNext={handleNext}
        isLast={currentIndex >= quizQuestions.length - 1}
        answerState={answerStates[question.id]}
        onAnswerStateChange={handleAnswerStateChange}
      />
    </div>
  );
}
