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
