import type { Question } from '../types/question';

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function filterByChapter(questions: Question[], chapter: number): Question[] {
  return questions.filter((q) => q.chapter === chapter);
}

export function pickRandom(questions: Question[], count: number): Question[] {
  return shuffleArray(questions).slice(0, count);
}

export function checkAnswer(question: Question, selected: Set<string>): boolean {
  if (selected.size !== question.correctAnswers.length) return false;
  return question.correctAnswers.every((a) => selected.has(a));
}

// --- Exam Result ---

export interface WrongQuestionDetail {
  question: Question;
  questionIndex: number;
  selectedAnswers: string[];
}

export interface ExamResult {
  examSet: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  isPassed: boolean;
  wrongQuestions: WrongQuestionDetail[];
}

export function calculateExamResult(
  examSet: string,
  questions: Question[],
  answers: Record<string, string[]>,
): ExamResult {
  let correctCount = 0;
  const wrongQuestions: WrongQuestionDetail[] = [];

  questions.forEach((q, index) => {
    const selected = new Set(answers[q.id] ?? []);
    const correct = checkAnswer(q, selected);
    if (correct) {
      correctCount++;
    } else {
      wrongQuestions.push({
        question: q,
        questionIndex: index,
        selectedAnswers: answers[q.id] ?? [],
      });
    }
  });

  const totalQuestions = questions.length;
  const wrongCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = correctCount >= 26;

  return {
    examSet,
    totalQuestions,
    correctCount,
    wrongCount,
    percentage,
    isPassed,
    wrongQuestions,
  };
}
