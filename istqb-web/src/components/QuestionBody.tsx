import { parseQuestionBlocks } from '../utils/questionContent';
import type { QuestionTableCell } from '../utils/questionContent';

// --- QuestionBody component ---
// 지문 안에 섞여 있는 표/로그 블록을 원본 PDF와 같은 형태로 그려준다.

interface Props {
  questionText: string;
  className?: string;
}

/** `| 결과 | > | > |` 처럼 행 전체를 차지하는 구분 행인지 확인한다. */
function isSectionRow(row: QuestionTableCell[]) {
  return row.length === 1 && row[0].colSpan > 1;
}

function renderCells(row: QuestionTableCell[], rowIndex: number, isHead: boolean) {
  return row.map((cell, cellIndex) => {
    const isRowHeader = !isHead && cellIndex === 0;
    const key = `${rowIndex}-${cellIndex}`;

    if (isHead || isRowHeader) {
      return (
        <th
          key={key}
          scope={isHead ? 'col' : 'row'}
          className={isRowHeader ? 'question-table-row-head' : undefined}
          colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
        >
          {cell.text}
        </th>
      );
    }

    return (
      <td key={key} colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}>
        {cell.text}
      </td>
    );
  });
}

export default function QuestionBody({ questionText, className = 'question-text' }: Props) {
  const blocks = parseQuestionBlocks(questionText);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'text') {
          return (
            <p key={index} className="question-paragraph">
              {block.text}
            </p>
          );
        }

        if (block.type === 'code') {
          return (
            <pre key={index} className="question-code">
              {block.text}
            </pre>
          );
        }

        return (
          <div key={index} className="question-table-wrap">
            <table className="question-table">
              {block.headRows.length > 0 && (
                <thead>
                  {block.headRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>{renderCells(row, rowIndex, true)}</tr>
                  ))}
                </thead>
              )}
              <tbody>
                {block.bodyRows.map((row, rowIndex) =>
                  isSectionRow(row) ? (
                    <tr key={rowIndex} className="question-table-section">
                      <th colSpan={row[0].colSpan}>
                        {/* 가로 스크롤 중에도 구분 라벨이 보이도록 안쪽만 고정한다 */}
                        <span>{row[0].text}</span>
                      </th>
                    </tr>
                  ) : (
                    <tr key={rowIndex}>{renderCells(row, rowIndex, false)}</tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
