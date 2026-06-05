import type { PdfAnnotationType } from '../types/annotation';

type SelectionToolbarProps = {
  visible: boolean;
  top: number;
  left: number;
  onCreate: (type: PdfAnnotationType) => void;
  onCancel: () => void;
};

export default function SelectionToolbar({
  visible,
  top,
  left,
  onCreate,
  onCancel,
}: SelectionToolbarProps) {
  if (!visible) return null;

  return (
    <div className="selection-toolbar" style={{ top, left }}>
      <button type="button" onClick={() => onCreate('highlight')}>
        형광펜
      </button>
      <button type="button" onClick={() => onCreate('underline')}>
        밑줄
      </button>
      <button type="button" className="muted" onClick={onCancel}>
        취소
      </button>
    </div>
  );
}
