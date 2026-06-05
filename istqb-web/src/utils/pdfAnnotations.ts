import type { PdfAnnotation } from '../types/annotation';

export const PDF_ANNOTATIONS_KEY = 'istqb-pdf-annotations';

export function getPdfAnnotations(): PdfAnnotation[] {
  try {
    const raw = localStorage.getItem(PDF_ANNOTATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePdfAnnotations(annotations: PdfAnnotation[]) {
  localStorage.setItem(PDF_ANNOTATIONS_KEY, JSON.stringify(annotations));
}

export function createAnnotationId() {
  return `anno_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
