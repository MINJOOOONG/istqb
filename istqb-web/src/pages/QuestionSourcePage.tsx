import { useNavigate, useSearchParams } from 'react-router-dom';
import PdfViewer from '../components/PdfViewer';
import { getSourcePdfPage, getSourcePdfPath } from '../utils/sourcePdfs';

export default function QuestionSourcePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examSet = (searchParams.get('set') || 'A').toUpperCase();
  const questionNumber = Number(searchParams.get('question') || 1);
  const pdfPath = getSourcePdfPath(examSet);
  const pageNumber = getSourcePdfPage(examSet, questionNumber);

  if (!pdfPath) {
    return (
      <div className="page empty-page">
        <p>원본 PDF를 찾을 수 없습니다.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="page source-page">
      <header className="source-header">
        <button className="source-back-link" onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
        <div>
          <h1>원본 문제</h1>
          <p className="subtitle">
            샘플문제 {examSet} {questionNumber}번
          </p>
        </div>
      </header>
      <PdfViewer
        key={`${examSet}-${questionNumber}`}
        pdfPath={pdfPath}
        initialPage={pageNumber}
        enableAnnotations={false}
      />
    </div>
  );
}
