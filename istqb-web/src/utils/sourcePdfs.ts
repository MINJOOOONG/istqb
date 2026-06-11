import type { Question } from '../types/question';

const SAMPLE_PDF_PATHS: Record<string, string> = {
  A: '/files/sample-exam-a-ko.pdf',
  B: '/files/sample-exam-b-ko.pdf',
  C: '/files/sample-exam-c-ko.pdf',
  D: '/files/sample-exam-d-ko.pdf',
};

const SAMPLE_QUESTION_PAGES: Record<string, Record<number, number>> = {
  A: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 5, 7: 5, 8: 5, 9: 6, 10: 6,
    11: 6, 12: 7, 13: 7, 14: 8, 15: 8, 16: 9, 17: 9, 18: 9, 19: 10, 20: 10,
    21: 11, 22: 12, 23: 13, 24: 13, 25: 14, 26: 14, 27: 14, 28: 15, 29: 15,
    30: 16, 31: 16, 32: 16, 33: 17, 34: 17, 35: 18, 36: 18, 37: 19, 38: 19,
    39: 20, 40: 20,
  },
  B: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 6,
    11: 6, 12: 6, 13: 7, 14: 7, 15: 7, 16: 8, 17: 8, 18: 9, 19: 9, 20: 10,
    21: 10, 22: 11, 23: 12, 24: 12, 25: 13, 26: 13, 27: 13, 28: 14, 29: 14,
    30: 15, 31: 15, 32: 16, 33: 16, 34: 17, 35: 17, 36: 18, 37: 18, 38: 19,
    39: 20, 40: 20,
  },
  C: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 5, 7: 5, 8: 5, 9: 6, 10: 6,
    11: 6, 12: 7, 13: 7, 14: 7, 15: 8, 16: 8, 17: 9, 18: 9, 19: 10, 20: 10,
    21: 11, 22: 11, 23: 12, 24: 13, 25: 13, 26: 14, 27: 14, 28: 15, 29: 15,
    30: 16, 31: 16, 32: 17, 33: 17, 34: 18, 35: 18, 36: 18, 37: 19, 38: 19,
    39: 20, 40: 20,
  },
  D: {
    1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 7: 5, 8: 6, 9: 6, 10: 7,
    11: 7, 12: 7, 13: 8, 14: 8, 15: 8, 16: 9, 17: 9, 18: 10, 19: 10, 20: 11,
    21: 12, 22: 12, 23: 13, 24: 13, 25: 14, 26: 14, 27: 15, 28: 15, 29: 16,
    30: 17, 31: 17, 32: 18, 33: 18, 34: 19, 35: 19, 36: 20, 37: 20, 38: 21,
    39: 22, 40: 22,
  },
};

export function getQuestionSourceInfo(question: Question) {
  const examSet = question.examSet.toUpperCase();
  const questionNumber = Number(question.questionNumber);
  const pdfPath = SAMPLE_PDF_PATHS[examSet];
  const pageNumber = SAMPLE_QUESTION_PAGES[examSet]?.[questionNumber] ?? 1;

  if (!pdfPath) return null;

  return {
    examSet,
    questionNumber,
    pageNumber,
    pdfPath,
    url: `/source?set=${examSet}&question=${questionNumber}`,
  };
}

export function getSourcePdfPath(examSet: string) {
  return SAMPLE_PDF_PATHS[examSet.toUpperCase()] ?? null;
}

export function getSourcePdfPage(examSet: string, questionNumber: number) {
  return SAMPLE_QUESTION_PAGES[examSet.toUpperCase()]?.[questionNumber] ?? 1;
}
