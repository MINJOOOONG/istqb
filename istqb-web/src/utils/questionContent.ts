import { normalizeExtractedQuestionText } from './text';

// --- Question body parsing ---
//
// PDF에서 추출한 지문에는 결정 테이블, 상태 전이 테이블, 실행 로그처럼
// 줄바꿈만으로는 알아볼 수 없는 블록이 섞여 있다. 이런 블록은 questions.json에
// 아래 두 가지 마크업으로 저장하고, 여기서 구조화된 블록으로 파싱한다.
//
//   표      : `| 셀 | 셀 |` 형태의 줄. `| --- |` 줄 위쪽은 헤더 행이 되고,
//             셀 값이 `>` 이면 바로 왼쪽 셀과 병합(colspan)된다.
//   코드/로그: ``` 로 감싼 줄. 원본의 정렬을 그대로 유지한다.

export interface QuestionTableCell {
  text: string;
  colSpan: number;
}

export type QuestionBlock =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'table'; headRows: QuestionTableCell[][]; bodyRows: QuestionTableCell[][] };

const CODE_FENCE = '```';
const TABLE_LINE_PATTERN = /^\s*\|/;
const SEPARATOR_CELL_PATTERN = /^:?-{3,}:?$/;
const COLSPAN_MARKER = '>';

function splitTableLine(line: string) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function isSeparatorLine(line: string) {
  const cells = splitTableLine(line);
  return cells.length > 0 && cells.every((cell) => SEPARATOR_CELL_PATTERN.test(cell));
}

function toTableRow(line: string): QuestionTableCell[] {
  return splitTableLine(line).reduce<QuestionTableCell[]>((row, cell) => {
    const previous = row[row.length - 1];
    if (cell === COLSPAN_MARKER && previous) {
      previous.colSpan += 1;
      return row;
    }
    row.push({ text: cell, colSpan: 1 });
    return row;
  }, []);
}

function toTableBlock(lines: string[]): QuestionBlock {
  const separatorIndex = lines.findIndex(isSeparatorLine);
  const headLines = separatorIndex === -1 ? [] : lines.slice(0, separatorIndex);
  const bodyLines = separatorIndex === -1 ? lines : lines.slice(separatorIndex + 1);

  return {
    type: 'table',
    headRows: headLines.map(toTableRow),
    bodyRows: bodyLines.map(toTableRow),
  };
}

function toTextBlock(lines: string[]): QuestionBlock | null {
  const text = normalizeExtractedQuestionText(lines.join('\n')).trim();
  return text ? { type: 'text', text } : null;
}

export function parseQuestionBlocks(questionText: string): QuestionBlock[] {
  const lines = questionText.split('\n');
  const blocks: QuestionBlock[] = [];
  let buffer: string[] = [];
  let bufferKind: 'text' | 'table' = 'text';

  const flush = () => {
    if (buffer.length === 0) return;
    const block = bufferKind === 'table' ? toTableBlock(buffer) : toTextBlock(buffer);
    if (block) blocks.push(block);
    buffer = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim() === CODE_FENCE) {
      flush();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== CODE_FENCE) {
        codeLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      continue;
    }

    const kind = TABLE_LINE_PATTERN.test(line) ? 'table' : 'text';
    if (kind !== bufferKind) {
      flush();
      bufferKind = kind;
    }
    buffer.push(line);
  }

  flush();
  return blocks;
}

/** 목록/미리보기처럼 표를 그릴 수 없는 곳에서 쓰는 한 줄 요약용 지문. */
export function toQuestionPreviewText(questionText: string) {
  return parseQuestionBlocks(questionText)
    .filter((block) => block.type === 'text')
    .map((block) => block.text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
}
