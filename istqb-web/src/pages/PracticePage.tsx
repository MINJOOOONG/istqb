import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import questions from '../data/questions.json';
import type { Question } from '../types/question';
import ChapterSelector from '../components/ChapterSelector';
import ChapterStatsComponent from '../components/ChapterStats';
import { getChapterStatsWithQuestions } from '../utils/storage';

const allQuestions = questions as Question[];

export default function PracticePage() {
  const navigate = useNavigate();
  const examSets = useMemo(() => {
    return Array.from(
      allQuestions.reduce((map, question) => {
        const count = map.get(question.examSet) || 0;
        map.set(question.examSet, count + 1);
        return map;
      }, new Map<string, number>())
    ).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const chapters = useMemo(() => {
    const map = new Map<number, { titleEn: string; titleKo: string; count: number }>();
    allQuestions.forEach((q) => {
      const existing = map.get(q.chapter);
      if (existing) {
        existing.count++;
      } else {
        map.set(q.chapter, { titleEn: q.chapterTitleEn, titleKo: q.chapterTitleKo, count: 1 });
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ch, info]) => ({ chapter: ch, ...info }));
  }, []);

  return (
    <div className="page practice-page">
      <h1>문제풀기</h1>
      <p className="subtitle">총 {allQuestions.length}문제</p>

      <div className="quick-actions">
        <button className="btn-primary full" onClick={() => navigate('/quiz?mode=random10')}>
          빠른 10문제
        </button>
        <button className="btn-secondary full" onClick={() => navigate('/quiz?mode=all')}>
          전체 문제 풀기
        </button>
        <button className="btn-secondary full" onClick={() => navigate('/quiz?mode=wrongRandom')}>
          오답 랜덤 풀기
        </button>
      </div>

      <h2>모의고사</h2>
      <div className="mock-exam-grid">
        {examSets.map(([set, count]) => (
          <button
            key={set}
            className="mock-exam-btn"
            onClick={() => navigate(`/quiz?mode=exam&set=${set}`)}
          >
            <strong>{set}</strong>
            <span>{count}문제</span>
          </button>
        ))}
      </div>

      <h2>Chapter별 문제</h2>
      <ChapterSelector
        chapters={chapters}
        onSelect={(ch) => navigate(`/quiz?mode=chapter&chapter=${ch}`)}
      />

      <ChapterStatsComponent stats={getChapterStatsWithQuestions(allQuestions)} />
    </div>
  );
}
