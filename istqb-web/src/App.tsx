import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import PracticePage from './pages/PracticePage';
import QuizPage from './pages/QuizPage';
import WrongNotePage from './pages/WrongNotePage';
import SummaryPage from './pages/SummaryPage';
import SummaryDetailPage from './pages/SummaryDetailPage';
import SyllabusPage from './pages/SyllabusPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PracticePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/wrong" element={<WrongNotePage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/summary/:id" element={<SummaryDetailPage />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
