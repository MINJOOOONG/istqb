import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { Document, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import PdfPage from './PdfPage';
import SelectionToolbar from './SelectionToolbar';
import type { PdfAnnotation, PdfAnnotationRect, PdfAnnotationType } from '../types/annotation';
import { createAnnotationId, getPdfAnnotations, savePdfAnnotations } from '../utils/pdfAnnotations';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDF_PATH = '/files/ctfl-syllabus-ko.pdf';
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;

type PendingSelection = {
  pageNumber: number;
  selectedText: string;
  rects: PdfAnnotationRect[];
  toolbarTop: number;
  toolbarLeft: number;
};

type ReactTouchList = TouchEvent<HTMLDivElement>['touches'];

export default function PdfViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const pinchStartDistanceRef = useRef(0);
  const pinchStartZoomRef = useRef(1);
  const isPinchingRef = useRef(false);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(360);
  const [zoom, setZoom] = useState(1);
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>(() => getPdfAnnotations());
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.max(280, Math.floor(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    savePdfAnnotations(annotations);
  }, [annotations]);

  const pageWidth = Math.max(280, Math.floor(containerWidth * zoom));
  const pageAnnotations = useMemo(
    () => annotations.filter((annotation) => annotation.pageNumber === pageNumber),
    [annotations, pageNumber]
  );

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setPendingSelection(null);
  }, []);

  const captureSelection = useCallback(() => {
    const selection = window.getSelection();
    const pageElement = pageRef.current;
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !pageElement) {
      setPendingSelection(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setPendingSelection(null);
      return;
    }

    const pageBox = pageElement.getBoundingClientRect();
    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects())
      .map((rect) => {
        const left = Math.max(rect.left, pageBox.left);
        const right = Math.min(rect.right, pageBox.right);
        const top = Math.max(rect.top, pageBox.top);
        const bottom = Math.min(rect.bottom, pageBox.bottom);

        if (right <= left || bottom <= top) return null;

        return {
          x: ((left - pageBox.left) / pageBox.width) * 100,
          y: ((top - pageBox.top) / pageBox.height) * 100,
          width: ((right - left) / pageBox.width) * 100,
          height: ((bottom - top) / pageBox.height) * 100,
        };
      })
      .filter((rect): rect is PdfAnnotationRect => rect !== null && rect.width > 0.15);

    if (rects.length === 0) {
      setPendingSelection(null);
      return;
    }

    const firstRect = range.getBoundingClientRect();
    setPendingSelection({
      pageNumber,
      selectedText,
      rects,
      toolbarTop: Math.max(72, firstRect.top - 52),
      toolbarLeft: Math.min(window.innerWidth - 156, Math.max(12, firstRect.left)),
    });
  }, [pageNumber]);

  const createAnnotation = useCallback(
    (type: PdfAnnotationType) => {
      if (!pendingSelection) return;

      const rects =
        type === 'underline'
          ? pendingSelection.rects.map((rect) => ({
              ...rect,
              y: rect.y + Math.max(0, rect.height - 0.45),
              height: 0.35,
            }))
          : pendingSelection.rects;

      const nextAnnotation: PdfAnnotation = {
        id: createAnnotationId(),
        pageNumber: pendingSelection.pageNumber,
        type,
        selectedText: pendingSelection.selectedText,
        rects,
        createdAt: new Date().toISOString(),
      };

      setAnnotations((current) => [...current, nextAnnotation]);
      clearSelection();
    },
    [clearSelection, pendingSelection]
  );

  const removeAnnotation = useCallback((id: string) => {
    const target = annotations.find((annotation) => annotation.id === id);
    const label = target?.type === 'highlight' ? '형광펜' : '밑줄';
    if (!window.confirm(`${label} 표시를 삭제할까요?`)) return;
    setAnnotations((current) => current.filter((annotation) => annotation.id !== id));
  }, [annotations]);

  const clearAll = useCallback(() => {
    if (annotations.length === 0) return;
    if (!window.confirm('저장된 모든 밑줄과 형광펜 표시를 삭제할까요?')) return;
    setAnnotations([]);
    clearSelection();
  }, [annotations.length, clearSelection]);

  const getTouchDistance = (touches: ReactTouchList) => {
    const [first, second] = [touches[0], touches[1]];
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  };

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    isPinchingRef.current = true;
    pinchStartDistanceRef.current = getTouchDistance(event.touches);
    pinchStartZoomRef.current = zoom;
    clearSelection();
  }, [clearSelection, zoom]);

  const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!isPinchingRef.current || event.touches.length !== 2) return;

    event.preventDefault();
    const nextDistance = getTouchDistance(event.touches);
    const scale = nextDistance / pinchStartDistanceRef.current;
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * scale));
    setZoom(nextZoom);
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!isPinchingRef.current) {
      captureSelection();
      return;
    }

    if (event.touches.length < 2) {
      window.setTimeout(() => {
        isPinchingRef.current = false;
      }, 120);
    }
  }, [captureSelection]);

  return (
    <section className="pdf-viewer" ref={containerRef}>
      <div className="pdf-status-row">
        <strong>
          {pageNumber} / {numPages || '-'}
        </strong>
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      <div className="pdf-controls" aria-label="PDF 컨트롤">
        <button type="button" onClick={() => setPageNumber((page) => Math.max(1, page - 1))} disabled={pageNumber <= 1}>
          이전
        </button>
        <button
          type="button"
          onClick={() => setPageNumber((page) => (numPages ? Math.min(numPages, page + 1) : page))}
          disabled={numPages === 0 || pageNumber >= numPages}
        >
          다음
        </button>
        <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1}>
          기준
        </button>
        <button type="button" className="danger" onClick={clearAll} disabled={annotations.length === 0}>
          전체 삭제
        </button>
      </div>

      {loadError ? (
        <div className="pdf-empty">
          PDF 파일을 public/files/ctfl-syllabus-ko.pdf 위치에 추가해주세요.
        </div>
      ) : (
        <div
          className="pdf-scroll"
          onMouseUp={captureSelection}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Document
            file={PDF_PATH}
            loading={<div className="pdf-empty">PDF를 불러오는 중...</div>}
            error={<div className="pdf-empty">PDF 파일을 public/files/ctfl-syllabus-ko.pdf 위치에 추가해주세요.</div>}
            onLoadSuccess={({ numPages: nextNumPages }) => {
              setNumPages(nextNumPages);
              setLoadError(false);
            }}
            onLoadError={() => setLoadError(true)}
          >
            <PdfPage
              pageNumber={pageNumber}
              width={pageWidth}
              annotations={pageAnnotations}
              pageRef={(node) => {
                pageRef.current = node;
              }}
              onRemoveAnnotation={removeAnnotation}
              onRenderSuccess={clearSelection}
            />
          </Document>
        </div>
      )}

      <SelectionToolbar
        visible={pendingSelection !== null}
        top={pendingSelection?.toolbarTop ?? 0}
        left={pendingSelection?.toolbarLeft ?? 0}
        onCreate={createAnnotation}
        onCancel={clearSelection}
      />
    </section>
  );
}
