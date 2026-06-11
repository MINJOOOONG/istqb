const STRUCTURED_LINE_PATTERN =
  /^(\d+\.|[A-Z]\.|[ivxlcdm]+\.\s|[•-]\s|TC\d+|AC\d+|조건|동작|번호|첫 번째|두 번째|세 번째|사용자 스토리|인수 조건|다음 중)/i;

const SENTENCE_END_PATTERN = /[.!?:;。！？)”’]$/;

function joinExtractedLines(previous: string, next: string) {
  const separator = SENTENCE_END_PATTERN.test(previous) ? ' ' : '';
  return `${previous}${separator}${next}`;
}

export function normalizeExtractedQuestionText(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph.split('\n').map((line) => line.trim());

      return lines.reduce<string[]>((result, line) => {
        if (!line) return result;

        const previous = result[result.length - 1];
        if (!previous || STRUCTURED_LINE_PATTERN.test(line)) {
          result.push(line);
          return result;
        }

        result[result.length - 1] = joinExtractedLines(previous, line);
        return result;
      }, []).join('\n');
    })
    .join('\n\n');
}
