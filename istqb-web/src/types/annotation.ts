export type PdfAnnotationType = 'underline' | 'highlight';

export type PdfAnnotationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PdfAnnotation = {
  id: string;
  pageNumber: number;
  type: PdfAnnotationType;
  selectedText: string;
  rects: PdfAnnotationRect[];
  createdAt: string;
};
