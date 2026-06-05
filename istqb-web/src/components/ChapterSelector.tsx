interface ChapterItem {
  chapter: number;
  titleEn: string;
  titleKo: string;
  count: number;
}

interface Props {
  chapters: ChapterItem[];
  onSelect: (chapter: number) => void;
}

export default function ChapterSelector({ chapters, onSelect }: Props) {
  return (
    <div className="chapter-list">
      {chapters.map((ch) => (
        <button key={ch.chapter} className="chapter-btn" onClick={() => onSelect(ch.chapter)}>
          <div className="chapter-info">
            <strong>Ch.{ch.chapter}</strong>
            <span>{ch.titleKo}</span>
          </div>
          <span className="chapter-count">{ch.count}문제</span>
        </button>
      ))}
    </div>
  );
}
