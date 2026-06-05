import { Page } from 'react-pdf';
import AnnotationLayer from './AnnotationLayer';
import type { PdfAnnotation } from '../types/annotation';

type PdfPageProps = {
  pageNumber: number;
  width: number;
  annotations: PdfAnnotation[];
  pageRef: (node: HTMLDivElement | null) => void;
  onRemoveAnnotation: (id: string) => void;
  onRenderSuccess: () => void;
};

export default function PdfPage({
  pageNumber,
  width,
  annotations,
  pageRef,
  onRemoveAnnotation,
  onRenderSuccess,
}: PdfPageProps) {
  return (
    <div className="pdf-page-shell" ref={pageRef} data-page-number={pageNumber}>
      <Page
        pageNumber={pageNumber}
        width={width}
        renderTextLayer
        renderAnnotationLayer={false}
        loading={<div className="pdf-page-loading">페이지를 불러오는 중...</div>}
        onRenderSuccess={onRenderSuccess}
      />
      <AnnotationLayer annotations={annotations} onRemove={onRemoveAnnotation} />
    </div>
  );
}
