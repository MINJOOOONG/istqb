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

/** 표·다이어그램처럼 텍스트로 옮길 수 없는 지문을 원본 시험지에서 잘라낸 이미지 */
export interface QuestionStemImage {
  src: string;
  width: number;
  height: number;
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
  stemImage?: QuestionStemImage;
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
