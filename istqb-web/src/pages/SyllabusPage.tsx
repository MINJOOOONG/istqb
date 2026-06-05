import PdfViewer from '../components/PdfViewer';

export default function SyllabusPage() {
  return (
    <div className="page syllabus-page">
      <header className="syllabus-header">
        <h1>CTFL 실러버스</h1>
        <p className="subtitle">한글 실러버스를 읽으며 밑줄과 형광펜 표시를 남겨보세요.</p>
      </header>
      <PdfViewer />
    </div>
  );
}
