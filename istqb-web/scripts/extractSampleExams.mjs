import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const filesRoot = join(root, '..', 'files');

const exams = [
  {
    set: 'A',
    questionPdf: 'ISTQB_FL_v4.0_샘플문제_A_v1.7_한글_v1.0.pdf',
    answerPdf: 'ISTQB_FL_v4.0_샘플문제_A_v1.7_정답과_해설_한글_v1.0.pdf',
  },
  {
    set: 'B',
    questionPdf: 'ISTQB_FL_v4.0_샘플문제_B_v1.7_한글_v1.0.pdf',
    answerPdf: 'ISTQB_FL_v4.0_샘플문제_B_v1.7_정답과_해설_한글_v1.0.pdf',
  },
  {
    set: 'C',
    questionPdf: 'ISTQB_FL_v4.0_샘플문제_C_v1.6_한글_v1.0.pdf',
    answerPdf: 'ISTQB_FL_v4.0_샘플문제_C_v1.6_정답과_해설_한글_v1.0.pdf',
  },
  {
    set: 'D',
    questionPdf: 'ISTQB_FL_v4.0_샘플문제_D_v1.5_한글_v1.0.1.pdf',
    answerPdf: 'ISTQB_FL_v4.0_샘플문제_D_v1.5_정답과_해설_한글_v1.0.pdf',
  },
];

const chapters = {
  1: ['Fundamentals of Testing', '테스팅의 기초'],
  2: ['Testing Throughout the Software Development Lifecycle', '소프트웨어 개발 수명주기 전반의 테스팅'],
  3: ['Static Testing', '정적 테스팅'],
  4: ['Test Analysis and Design', '테스트 분석과 설계'],
  5: ['Managing the Test Activities', '테스트 활동 관리'],
  6: ['Test Tools', '테스트 도구'],
};

function pdfToText(pdfName) {
  const pdfPath = join(filesRoot, pdfName);
  if (!existsSync(pdfPath)) {
    throw new Error(`Missing PDF: ${pdfPath}`);
  }
  return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' });
}

function normalizeLine(line) {
  return line
    .replace(/\f/g, '')
    .replace(/[ \t]+$/g, '')
    .replace(/^\s+$/g, '');
}

function isNoise(line) {
  const trimmed = line.trim();
  return (
    trimmed === '' ||
    trimmed.startsWith('Korean Software Testing Qualifications Board') ||
    trimmed.startsWith('www.kstqb.org') ||
    /^Page \d+/.test(trimmed)
  );
}

function cleanText(lines) {
  return lines
    .map(normalizeLine)
    .filter((line) => !isNoise(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseQuestions(text) {
  const lines = text.split('\n').map(normalizeLine);
  const startIndex = lines.findIndex((line) => line.trim() === '문제 Questions');
  const body = startIndex >= 0 ? lines.slice(startIndex + 1) : lines;
  const blocks = [];
  let current = null;

  for (const line of body) {
    const match = line.match(/^\s*(\d{1,2})\.\s*(.*)$/);
    if (match) {
      const number = Number(match[1]);
      const expectedNumber = current ? current.number + 1 : 1;
      if (number === expectedNumber) {
        if (number > 40) break;
        if (current) blocks.push(current);
        current = { number, lines: [match[2]] };
        continue;
      }
    }
    if (current) current.lines.push(line);
  }
  if (current) blocks.push(current);

  return blocks
    .filter((block) => block.number >= 1 && block.number <= 40)
    .map((block) => {
      const optionStarts = [];
      block.lines.forEach((line, index) => {
        if (/^\s*[a-e]\.\s+/.test(line)) optionStarts.push(index);
      });

      const questionEnd = optionStarts[0] ?? block.lines.length;
      const questionText = cleanText(block.lines.slice(0, questionEnd));
      const options = optionStarts.map((start, optionIndex) => {
        const end = optionStarts[optionIndex + 1] ?? block.lines.length;
        const first = block.lines[start];
        const id = first.trim().slice(0, 1).toLowerCase();
        const firstText = first.replace(/^\s*[a-e]\.\s+/, '');
        const text = cleanText([firstText, ...block.lines.slice(start + 1, end)]);
        return { id, text };
      });

      return {
        number: block.number,
        questionText,
        options,
      };
    });
}

function parseAnswerKey(text) {
  const marker = text.indexOf('정답표');
  const detailMarker = text.indexOf('\n정답\n');
  const keyText = text.slice(marker >= 0 ? marker : 0, detailMarker >= 0 ? detailMarker : undefined);
  const answers = new Map();
  const pattern = /(\d{1,2})\s+([a-e](?:,\s*[a-e])?)\s+(FL-\d+\.\d+\.\d+)\s+(K\d)\s+(\d)/g;
  let match;

  while ((match = pattern.exec(keyText))) {
    const number = Number(match[1]);
    if (number < 1 || number > 40 || answers.has(number)) continue;
    answers.set(number, {
      correctAnswers: match[2].split(',').map((answer) => answer.trim()),
      learningObjective: match[3],
      kLevel: match[4],
      points: Number(match[5]),
    });
  }

  return answers;
}

function questionToRecord(examSet, question, answer) {
  const chapter = Number(answer.learningObjective.match(/^FL-(\d+)/)?.[1] ?? 0);
  const [chapterTitleEn, chapterTitleKo] = chapters[chapter] ?? ['ISTQB CTFL', 'ISTQB CTFL'];
  const correctLabel = answer.correctAnswers.map((id) => id.toUpperCase()).join(', ');

  return {
    id: `ctfl-${examSet.toLowerCase()}-${String(question.number).padStart(2, '0')}`,
    source: 'KSTQB sample exam PDF',
    examSet,
    questionNumber: String(question.number),
    chapter,
    chapterTitleEn,
    chapterTitleKo,
    section: answer.learningObjective.replace(/^FL-/, '').replace(/\.\d+$/, ''),
    sectionTitle: answer.learningObjective,
    learningObjective: answer.learningObjective,
    kLevel: answer.kLevel,
    points: answer.points,
    questionText: question.questionText,
    options: question.options,
    correctAnswers: answer.correctAnswers,
    explanation: `샘플문제 ${examSet} 정답표 기준 정답은 ${correctLabel}입니다.`,
    optionExplanations: Object.fromEntries(
      question.options.map((option) => [
        option.id,
        answer.correctAnswers.includes(option.id)
          ? '정답표 기준 정답입니다.'
          : '정답표 기준 정답이 아닙니다.',
      ])
    ),
    tags: [`sample-${examSet.toLowerCase()}`, answer.learningObjective],
    isMultipleAnswer: answer.correctAnswers.length > 1,
  };
}

const allQuestions = [];

for (const exam of exams) {
  const questionText = pdfToText(exam.questionPdf);
  const answerText = pdfToText(exam.answerPdf);
  const questions = parseQuestions(questionText);
  const answers = parseAnswerKey(answerText);

  if (questions.length !== 40) {
    throw new Error(`Expected 40 questions for ${exam.set}, got ${questions.length}`);
  }
  if (answers.size !== 40) {
    throw new Error(`Expected 40 answers for ${exam.set}, got ${answers.size}`);
  }

  for (const question of questions) {
    const answer = answers.get(question.number);
    if (!answer) throw new Error(`Missing answer for ${exam.set} #${question.number}`);
    allQuestions.push(questionToRecord(exam.set, question, answer));
  }
}

writeFileSync(
  join(root, 'src/data/questions.json'),
  `${JSON.stringify(allQuestions, null, 2)}\n`,
  'utf8'
);

console.log(`Wrote ${allQuestions.length} questions`);
