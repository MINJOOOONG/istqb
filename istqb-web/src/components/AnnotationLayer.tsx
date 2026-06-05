import type { PdfAnnotation } from '../types/annotation';

type AnnotationLayerProps = {
  annotations: PdfAnnotation[];
  onRemove: (id: string) => void;
};

export default function AnnotationLayer({ annotations, onRemove }: AnnotationLayerProps) {
  return (
    <div className="annotation-layer" aria-hidden={annotations.length === 0}>
      {annotations.flatMap((annotation) =>
        annotation.rects.map((rect, index) => (
          <button
            key={`${annotation.id}-${index}`}
            className={`pdf-annotation ${annotation.type}`}
            style={{
              left: `${rect.x}%`,
              top: `${rect.y}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
            }}
            title={annotation.selectedText}
            aria-label={`${annotation.type === 'highlight' ? '형광펜' : '밑줄'} 삭제`}
            onClick={() => onRemove(annotation.id)}
          />
        ))
      )}
    </div>
  );
}
