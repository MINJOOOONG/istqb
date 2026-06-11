const LEADING_RESULT_PATTERN = /^(정답입니다|정답이 아닙니다)[.。]?\s*/;

const LOW_VALUE_PATTERNS = [
  /^따라서[:：]?\s*$/i,
  /^정답입니다[.。]?\s*$/i,
  /^정답이 아닙니다[.。]?\s*$/i,
  /참조하십시오[.。]?$/i,
  /^샘플문제\s+\w+\s+정답표 기준/i,
];

const REASON_PATTERNS = [
  /아닙니다/,
  /아님/,
  /않/,
  /못/,
  /없/,
  /불가능/,
  /보장/,
  /관련/,
  /역할/,
  /목적/,
  /기준/,
  /때문/,
];

function normalizeExplanation(explanation: string) {
  return explanation
    .replace(/\r/g, '\n')
    .replace(/\s+([.,:;!?。])/g, '$1')
    .replace(/([({[])\s+/g, '$1')
    .replace(/\s+([)\]}])/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function stripResultPrefix(sentence: string) {
  return sentence.trim().replace(LEADING_RESULT_PATTERN, '').trim();
}

function splitSentences(explanation: string) {
  return normalizeExplanation(explanation)
    .replace(/\n+/g, ' ')
    .replace(/([.!?。])\s+/g, '$1\n')
    .split('\n')
    .map(stripResultPrefix)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function isLowValue(sentence: string) {
  return LOW_VALUE_PATTERNS.some((pattern) => pattern.test(sentence));
}

function trimLongSentence(sentence: string, maxChars: number) {
  const contrastTail = sentence.match(/(?:하지만|지만|그러나|반면),?\s*(.+)$/);
  if (contrastTail?.[1] && contrastTail[1].length >= 12) {
    return trimLongSentence(contrastTail[1].trim(), maxChars);
  }

  if (sentence.length <= maxChars) return sentence;

  const clauses = sentence.split(/(?<=다),\s+|(?<=며),\s+|(?<=고),\s+|(?<=지만),\s+|예를 들어/);
  const usefulClause = clauses
    .map((clause) => clause.trim())
    .find((clause) => clause.length >= 12 && clause.length <= maxChars);

  if (usefulClause) return usefulClause;

  return `${sentence.slice(0, maxChars - 1).trim()}…`;
}

function pickBestSentence(sentences: string[]) {
  const useful = sentences.filter((sentence) => !isLowValue(sentence));
  const candidates = useful.length > 0 ? useful : sentences;
  const reason = [...candidates].reverse().find((sentence) =>
    REASON_PATTERNS.some((pattern) => pattern.test(sentence)),
  );

  return reason ?? candidates[0] ?? '';
}

export function getConciseExplanation(explanation: string, maxChars = 86) {
  const sentences = splitSentences(explanation);
  const sentence = pickBestSentence(sentences);

  return trimLongSentence(sentence, maxChars);
}

export function getConciseExplanationLines(explanation: string, maxLines = 3, maxChars = 96) {
  const sentences = splitSentences(explanation).filter((sentence) => !isLowValue(sentence));
  const lines = sentences.length > 0 ? sentences : splitSentences(explanation);
  const conciseLines = lines
    .map((sentence) => trimLongSentence(sentence, maxChars))
    .filter(Boolean);

  return [...new Set(conciseLines)].slice(0, maxLines);
}
