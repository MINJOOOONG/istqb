import type { ChapterStat } from '../utils/storage';

interface Props {
  stats: ChapterStat[];
}

const chapterNames: Record<number, string> = {
  1: '테스팅의 기초',
  2: 'SDLC 전반의 테스팅',
  3: '정적 테스팅',
  4: '테스트 분석과 설계',
  5: '테스트 활동 관리',
  6: '테스트 도구',
};

export default function ChapterStats({ stats }: Props) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="chapter-stats">
      <h2>챕터별 정답률</h2>
      <div className="stats-list">
        {stats.map((stat) => (
          <div key={stat.chapter} className="stat-item">
            <div className="stat-header">
              <span className="stat-chapter">
                Ch.{stat.chapter} {chapterNames[stat.chapter] || ''}
              </span>
              <span className={`stat-rate ${stat.rate < 60 ? 'low' : ''}`}>
                {stat.rate}%
              </span>
            </div>
            <div className="stat-bar-bg">
              <div
                className={`stat-bar-fill ${stat.rate < 60 ? 'low' : stat.rate >= 80 ? 'high' : 'mid'}`}
                style={{ width: `${stat.rate}%` }}
              />
            </div>
            <div className="stat-detail">
              <span>{stat.correct}/{stat.total} 정답</span>
              {stat.rate < 60 && <span className="priority-badge">우선 복습 추천</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
