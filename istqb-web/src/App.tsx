import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import EntryPage from './pages/EntryPage';
import PracticePage from './pages/PracticePage';
import QuizPage from './pages/QuizPage';
import WrongNotePage from './pages/WrongNotePage';
import SummaryPage from './pages/SummaryPage';
import SummaryDetailPage from './pages/SummaryDetailPage';
import SyllabusPage from './pages/SyllabusPage';
import QuestionSourcePage from './pages/QuestionSourcePage';

function AppContent() {
  const location = useLocation();
  const showBottomNav = location.pathname !== '/';

  return (
    <div className="app">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/wrong" element={<WrongNotePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/summary/:id" element={<SummaryDetailPage />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="/source" element={<QuestionSourcePage />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
