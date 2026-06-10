export interface QuestionOption {
  id: string;
  text: string;
}

export interface SyllabusReference {
  chapter: string;
  section: string;
  title: string;
  learningObjective?: string;
}

export interface Question {
  id: string;
  source: string;
  examSet: string;
  questionNumber: string;
  chapter: number;
  chapterTitleEn: string;
  chapterTitleKo: string;
  section: string;
  sectionTitle: string;
  learningObjective: string;
  kLevel: string;
  points: number;
  questionText: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation: string;
  optionExplanations: Record<string, string>;
  tags: string[];
  isMultipleAnswer: boolean;
  keyConcepts: string[];
  reviewTip: string;
  syllabusReference: SyllabusReference;
}
