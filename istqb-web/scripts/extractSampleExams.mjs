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
    /^Page \d+/.test(trimmed) ||
    /^\d+ of \d+$/.test(trimmed)
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
  const normalized = text.replace(/\f/g, '\n');
  const marker = normalized.indexOf('정답표');
  const detailMatch = normalized.match(/\n정답\s*\n/);
  const detailMarker = detailMatch ? detailMatch.index : -1;
  const keyText = normalized.slice(marker >= 0 ? marker : 0, detailMarker >= 0 ? detailMarker : undefined);
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

/**
 * Parse detailed answer explanations from the "정답" section of the answer PDF.
 * Returns a Map<number, { optionExplanations: Record<string, string>, explanation: string }>
 */
function parseDetailedAnswers(text) {
  // Find the start of the detailed answers section (after "정답표", starts with "정답")
  // The text may have \f (form feed) characters, so we normalize first
  const normalized = text.replace(/\f/g, '\n');
  // Look for standalone "정답" line (not "정답표" or "정답이" etc.)
  const detailMatch = normalized.match(/\n정답\s*\n/);
  const detailMarker = detailMatch ? detailMatch.index : -1;
  if (detailMarker < 0) return new Map();

  // Find the end - either "부록" or "추가 샘플 문제" section
  const appendixMarker = normalized.indexOf('부록');
  const additionalMarker = normalized.indexOf('추가 샘플 문제');
  let endMarker = normalized.length;
  if (appendixMarker > detailMarker) endMarker = Math.min(endMarker, appendixMarker);
  if (additionalMarker > detailMarker) endMarker = Math.min(endMarker, additionalMarker);

  const detailText = normalized.slice(detailMarker, endMarker);
  const lines = detailText.split('\n').map(normalizeLine);

  // Clean each line: remove trailing metadata (FL-x.x.x, K-level, points) from layout columns
  const cleaned = lines.map((line) => {
    // Remove trailing "FL-x.x.x    Kx     x" metadata from the right side of layout
    return line.replace(/\s+FL-\d+\.\d+\.\d+\s+K\d\s+\d\s*$/, '').replace(/[ \t]+$/g, '');
  });

  // Filter out noise lines, page headers, table headers
  const filtered = cleaned.filter((line) => {
    const trimmed = line.trim();
    if (trimmed === '') return false;
    if (trimmed.startsWith('Korean Software Testing Qualifications Board')) return false;
    if (trimmed.startsWith('www.kstqb.org')) return false;
    if (/^\d+ of \d+$/.test(trimmed)) return false;
    if (trimmed === '정답') return false;
    // Skip table header rows
    if (trimmed.startsWith('문제 번호')) return false;
    if (trimmed.startsWith('(#)')) return false;
    if (/^정답\s+해설/.test(trimmed)) return false;
    if (/^학습목표$/.test(trimmed)) return false;
    if (/^\(LO\)$/.test(trimmed)) return false;
    if (/^K-레벨\s+배점$/.test(trimmed)) return false;
    return true;
  });

  const result = new Map();

  // Parse question blocks - they start with a question number followed by answer letter(s)
  // Pattern: "      1              c       a) 정답이 아닙니다..."
  // or:      "      6           a, e       a) 정답입니다..."
  let currentQuestion = null;
  let currentOptionId = null;
  let currentOptionLines = [];
  let preambleLines = [];

  function flushOption() {
    if (currentQuestion && currentOptionId) {
      const text = currentOptionLines
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) {
        if (!result.has(currentQuestion)) {
          result.set(currentQuestion, { optionExplanations: {}, preamble: '' });
        }
        result.get(currentQuestion).optionExplanations[currentOptionId] = text;
      }
    }
    currentOptionId = null;
    currentOptionLines = [];
  }

  function flushPreamble() {
    if (currentQuestion && preambleLines.length > 0) {
      const text = preambleLines
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text && result.has(currentQuestion)) {
        result.get(currentQuestion).preamble = text;
      }
    }
    preambleLines = [];
  }

  for (const line of filtered) {
    const trimmed = line.trim();

    // Check for new question number line
    // Pattern: number + answer + optional rest text
    // e.g., "      1              c       a) 정답이 아닙니다..."
    // e.g., "      13             a       각 항목을 살펴보면:"
    // e.g., "      23             c" (no text after answer)
    const questionMatch = trimmed.match(
      /^(\d{1,2})\s+([a-e](?:,\s*[a-e])?)\s*(.*)$/
    );

    if (questionMatch) {
      const num = Number(questionMatch[1]);
      // Validate it's a reasonable question number transition
      if (num >= 1 && num <= 40 && (!currentQuestion || num > currentQuestion || num === 1)) {
        // Flush previous
        flushOption();
        flushPreamble();
        currentQuestion = num;

        if (!result.has(num)) {
          result.set(num, { optionExplanations: {}, preamble: '' });
        }

        const rest = questionMatch[3].trim();
        if (rest) {
          // Check if rest starts with an option like "a) ..."
          const optMatch = rest.match(/^([a-e])\)\s+(.*)$/);
          if (optMatch) {
            currentOptionId = optMatch[1];
            currentOptionLines = [optMatch[2]];
          } else {
            // It's preamble text (explanation context before options)
            preambleLines = [rest];
          }
        }
        continue;
      }
    }

    // Check for option line: "a) ...", "b) ...", etc.
    const optionLineMatch = trimmed.match(/^([a-e])\)\s+(.*)$/);
    if (optionLineMatch && currentQuestion) {
      flushOption();
      currentOptionId = optionLineMatch[1];
      currentOptionLines = [optionLineMatch[2]];
      continue;
    }

    // Check for roman numeral explanations (i., ii., iii., iv., v.)
    // These are part of preamble or current option context
    const romanMatch = trimmed.match(/^([ivx]+)\.\s+(.*)$/);
    if (romanMatch && currentQuestion) {
      if (currentOptionId) {
        // Part of current option
        currentOptionLines.push(trimmed);
      } else {
        preambleLines.push(trimmed);
      }
      continue;
    }

    // Check for bullet points (•)
    if (trimmed.startsWith('•') && currentQuestion) {
      if (currentOptionId) {
        currentOptionLines.push(trimmed);
      } else {
        preambleLines.push(trimmed);
      }
      continue;
    }

    // Skip metadata that appears on question header lines (FL-x.x.x, Kx, numbers)
    if (/^FL-\d+\.\d+\.\d+/.test(trimmed)) continue;
    if (/^K\d\s+\d$/.test(trimmed)) continue;
    if (/^K\d$/.test(trimmed)) continue;

    // "따라서:" or "따라서," lines - these are preamble/transition text
    if (trimmed === '따라서:' || trimmed === '따라서,') {
      if (currentOptionId) {
        flushOption();
      }
      preambleLines.push(trimmed);
      continue;
    }

    // Continuation line
    if (currentQuestion) {
      if (currentOptionId) {
        currentOptionLines.push(trimmed);
      } else {
        preambleLines.push(trimmed);
      }
    }
  }

  // Flush last
  flushOption();
  flushPreamble();

  return result;
}

// Load summaries for keyConcepts and reviewTip matching
let summaries = [];
const summariesPath = join(root, 'src/data/summaries.json');
if (existsSync(summariesPath)) {
  summaries = JSON.parse(readFileSync(summariesPath, 'utf8'));
}

function findSummary(learningObjective) {
  return summaries.find((s) => s.learningObjective === learningObjective);
}

function questionToRecord(examSet, question, answer, detailedAnswer) {
  const chapter = Number(answer.learningObjective.match(/^FL-(\d+)/)?.[1] ?? 0);
  const [chapterTitleEn, chapterTitleKo] = chapters[chapter] ?? ['ISTQB CTFL', 'ISTQB CTFL'];
  const section = answer.learningObjective.replace(/^FL-/, '').replace(/\.\d+$/, '');

  // Build optionExplanations from detailed answers
  let optionExplanations;
  let explanation;

  if (detailedAnswer && Object.keys(detailedAnswer.optionExplanations).length > 0) {
    optionExplanations = {};
    for (const opt of question.options) {
      optionExplanations[opt.id] = detailedAnswer.optionExplanations[opt.id] || '';
    }

    // Use correct answer's explanation as the main explanation
    const correctExplanations = answer.correctAnswers
      .map((id) => detailedAnswer.optionExplanations[id])
      .filter(Boolean);

    if (detailedAnswer.preamble) {
      explanation = detailedAnswer.preamble;
      if (correctExplanations.length > 0) {
        explanation += '\n\n' + correctExplanations.join('\n');
      }
    } else if (correctExplanations.length > 0) {
      explanation = correctExplanations.join('\n');
    } else {
      const correctLabel = answer.correctAnswers.map((id) => id.toUpperCase()).join(', ');
      explanation = `샘플문제 ${examSet} 정답표 기준 정답은 ${correctLabel}입니다.`;
    }
  } else {
    const correctLabel = answer.correctAnswers.map((id) => id.toUpperCase()).join(', ');
    explanation = `샘플문제 ${examSet} 정답표 기준 정답은 ${correctLabel}입니다.`;
    optionExplanations = Object.fromEntries(
      question.options.map((option) => [
        option.id,
        answer.correctAnswers.includes(option.id)
          ? '정답표 기준 정답입니다.'
          : '정답표 기준 정답이 아닙니다.',
      ])
    );
  }

  // Build keyConcepts and reviewTip from summaries
  const summary = findSummary(answer.learningObjective);
  const keyConcepts = summary?.keywords ?? [];
  const reviewTip = summary?.examPoint ?? '';

  // Build syllabusReference
  const chapterNum = String(chapter);
  const syllabusReference = {
    chapter: `Chapter ${chapterNum}`,
    section,
    title: summary?.sectionTitle ?? chapterTitleKo,
    learningObjective: answer.learningObjective,
  };

  return {
    id: `ctfl-${examSet.toLowerCase()}-${String(question.number).padStart(2, '0')}`,
    source: 'KSTQB sample exam PDF',
    examSet,
    questionNumber: String(question.number),
    chapter,
    chapterTitleEn,
    chapterTitleKo,
    section,
    sectionTitle: answer.learningObjective,
    learningObjective: answer.learningObjective,
    kLevel: answer.kLevel,
    points: answer.points,
    questionText: question.questionText,
    options: question.options,
    correctAnswers: answer.correctAnswers,
    explanation,
    optionExplanations,
    tags: [`sample-${examSet.toLowerCase()}`, answer.learningObjective],
    isMultipleAnswer: answer.correctAnswers.length > 1,
    keyConcepts,
    reviewTip,
    syllabusReference,
  };
}

const allQuestions = [];

for (const exam of exams) {
  const questionText = pdfToText(exam.questionPdf);
  const answerText = pdfToText(exam.answerPdf);
  const questions = parseQuestions(questionText);
  const answers = parseAnswerKey(answerText);
  const detailedAnswers = parseDetailedAnswers(answerText);

  if (questions.length !== 40) {
    throw new Error(`Expected 40 questions for ${exam.set}, got ${questions.length}`);
  }
  if (answers.size !== 40) {
    throw new Error(`Expected 40 answers for ${exam.set}, got ${answers.size}`);
  }

  console.log(`Exam ${exam.set}: parsed ${detailedAnswers.size} detailed answers`);

  for (const question of questions) {
    const answer = answers.get(question.number);
    if (!answer) throw new Error(`Missing answer for ${exam.set} #${question.number}`);
    const detailed = detailedAnswers.get(question.number);
    allQuestions.push(questionToRecord(exam.set, question, answer, detailed));
  }
}

writeFileSync(
  join(root, 'src/data/questions.json'),
  `${JSON.stringify(allQuestions, null, 2)}\n`,
  'utf8'
);

console.log(`Wrote ${allQuestions.length} questions`);

// Verify detailed explanations were extracted
let withDetails = 0;
let withoutDetails = 0;
for (const q of allQuestions) {
  const hasDetail = Object.values(q.optionExplanations).some(
    (v) => v && v !== '정답표 기준 정답입니다.' && v !== '정답표 기준 정답이 아닙니다.'
  );
  if (hasDetail) withDetails++;
  else withoutDetails++;
}
console.log(`With detailed explanations: ${withDetails}/${allQuestions.length}`);
if (withoutDetails > 0) {
  console.log(`Without detailed explanations: ${withoutDetails}`);
}
