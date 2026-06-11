import { useSearchParams } from 'react-router-dom';
import PdfViewer from '../components/PdfViewer';
import { getSyllabusPageForLearningObjective } from '../data/syllabusMap';

export default function SyllabusPage() {
  const [searchParams] = useSearchParams();
  const learningObjective = searchParams.get('lo') ?? '';
  const initialPage = learningObjective ? getSyllabusPageForLearningObjective(learningObjective) : 1;

  return (
    <div className="page syllabus-page">
      <header className="syllabus-header">
        <h1>CTFL 실러버스</h1>
        <p className="subtitle">
          {learningObjective ? `${learningObjective} 관련 페이지` : '한글 실러버스를 읽으며 밑줄과 형광펜 표시를 남겨보세요.'}
        </p>
      </header>
      <PdfViewer key={learningObjective || 'syllabus'} initialPage={initialPage} />
    </div>
  );
}
