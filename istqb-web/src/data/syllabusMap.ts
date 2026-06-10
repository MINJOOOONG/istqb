export interface SyllabusSection {
  section: string;
  titleKo: string;
  learningObjective: string;
}

export interface SyllabusChapter {
  chapter: number;
  titleEn: string;
  titleKo: string;
  sections: SyllabusSection[];
}

export const syllabusMap: Record<number, SyllabusChapter> = {
  1: {
    chapter: 1,
    titleEn: 'Fundamentals of Testing',
    titleKo: '테스팅의 기초',
    sections: [
      { section: '1.1.1', titleKo: '테스트 목적', learningObjective: 'FL-1.1.1' },
      { section: '1.1.2', titleKo: '테스팅과 디버깅', learningObjective: 'FL-1.1.2' },
      { section: '1.2.1', titleKo: '테스팅이 성공에 기여하는 방법', learningObjective: 'FL-1.2.1' },
      { section: '1.2.2', titleKo: '테스팅과 품질 보증(QA)', learningObjective: 'FL-1.2.2' },
      { section: '1.2.3', titleKo: '오류, 결함, 장애, 근본 원인', learningObjective: 'FL-1.2.3' },
      { section: '1.3', titleKo: '테스팅의 7가지 원리', learningObjective: 'FL-1.3.1' },
      { section: '1.4.1', titleKo: '테스트 활동과 업무', learningObjective: 'FL-1.4.1' },
      { section: '1.4.2', titleKo: '정황에 따른 테스트 프로세스', learningObjective: 'FL-1.4.2' },
      { section: '1.4.3', titleKo: '테스트웨어', learningObjective: 'FL-1.4.3' },
      { section: '1.4.4', titleKo: '추적성의 가치', learningObjective: 'FL-1.4.4' },
      { section: '1.4.5', titleKo: '테스팅에서의 역할', learningObjective: 'FL-1.4.5' },
      { section: '1.5.1', titleKo: '테스팅에 필요한 보편적 기술', learningObjective: 'FL-1.5.1' },
      { section: '1.5.2', titleKo: '전체 팀 접근법', learningObjective: 'FL-1.5.2' },
      { section: '1.5.3', titleKo: '테스팅의 독립성', learningObjective: 'FL-1.5.3' },
    ],
  },
  2: {
    chapter: 2,
    titleEn: 'Testing Throughout the Software Development Lifecycle',
    titleKo: '소프트웨어 개발 수명주기 전반의 테스팅',
    sections: [
      { section: '2.1.1', titleKo: 'SDLC가 테스팅에 미치는 영향', learningObjective: 'FL-2.1.1' },
      { section: '2.1.2', titleKo: '좋은 테스팅 프랙티스', learningObjective: 'FL-2.1.2' },
      { section: '2.1.3', titleKo: '테스트 우선 접근법', learningObjective: 'FL-2.1.3' },
      { section: '2.1.4', titleKo: 'DevOps와 테스팅', learningObjective: 'FL-2.1.4' },
      { section: '2.1.5', titleKo: '시프트 레프트 접근법', learningObjective: 'FL-2.1.5' },
      { section: '2.1.6', titleKo: '회고와 프로세스 개선', learningObjective: 'FL-2.1.6' },
      { section: '2.2.1', titleKo: '테스트 레벨', learningObjective: 'FL-2.2.1' },
      { section: '2.2.2', titleKo: '테스트 유형', learningObjective: 'FL-2.2.2' },
      { section: '2.2.3', titleKo: '확인 테스팅과 리그레션 테스팅', learningObjective: 'FL-2.2.3' },
      { section: '2.3', titleKo: '유지보수 테스팅', learningObjective: 'FL-2.3.1' },
    ],
  },
  3: {
    chapter: 3,
    titleEn: 'Static Testing',
    titleKo: '정적 테스팅',
    sections: [
      { section: '3.1.1', titleKo: '정적 테스팅 대상 산출물', learningObjective: 'FL-3.1.1' },
      { section: '3.1.2', titleKo: '정적 테스팅의 가치', learningObjective: 'FL-3.1.2' },
      { section: '3.1.3', titleKo: '정적 테스팅과 동적 테스팅 비교', learningObjective: 'FL-3.1.3' },
      { section: '3.2.1', titleKo: '조기 피드백의 이점', learningObjective: 'FL-3.2.1' },
      { section: '3.2.2', titleKo: '리뷰 프로세스 활동', learningObjective: 'FL-3.2.2' },
      { section: '3.2.3', titleKo: '리뷰 역할과 책임', learningObjective: 'FL-3.2.3' },
      { section: '3.2.4', titleKo: '리뷰 유형', learningObjective: 'FL-3.2.4' },
      { section: '3.2.5', titleKo: '성공적인 리뷰 요소', learningObjective: 'FL-3.2.5' },
    ],
  },
  4: {
    chapter: 4,
    titleEn: 'Test Analysis and Design',
    titleKo: '테스트 분석과 설계',
    sections: [
      { section: '4.1', titleKo: '테스트 기법 분류', learningObjective: 'FL-4.1.1' },
      { section: '4.2.1', titleKo: '동등 분할', learningObjective: 'FL-4.2.1' },
      { section: '4.2.2', titleKo: '경계값 분석', learningObjective: 'FL-4.2.2' },
      { section: '4.2.3', titleKo: '결정 테이블 테스팅', learningObjective: 'FL-4.2.3' },
      { section: '4.2.4', titleKo: '상태 전이 테스팅', learningObjective: 'FL-4.2.4' },
      { section: '4.3.1', titleKo: '구문 테스팅과 구문 커버리지', learningObjective: 'FL-4.3.1' },
      { section: '4.3.2', titleKo: '분기 테스팅과 분기 커버리지', learningObjective: 'FL-4.3.2' },
      { section: '4.3.3', titleKo: '화이트박스 테스팅의 가치', learningObjective: 'FL-4.3.3' },
      { section: '4.4.1', titleKo: '오류 추정', learningObjective: 'FL-4.4.1' },
      { section: '4.4.2', titleKo: '탐색적 테스팅', learningObjective: 'FL-4.4.2' },
      { section: '4.4.3', titleKo: '체크리스트 기반 테스팅', learningObjective: 'FL-4.4.3' },
      { section: '4.5.1', titleKo: '협업 기반 사용자 스토리 작성', learningObjective: 'FL-4.5.1' },
      { section: '4.5.2', titleKo: '인수 조건 작성 방식', learningObjective: 'FL-4.5.2' },
      { section: '4.5.3', titleKo: 'ATDD로 테스트 케이스 도출', learningObjective: 'FL-4.5.3' },
    ],
  },
  5: {
    chapter: 5,
    titleEn: 'Managing the Test Activities',
    titleKo: '테스트 활동 관리',
    sections: [
      { section: '5.1.1', titleKo: '테스트 계획서의 목적과 내용', learningObjective: 'FL-5.1.1' },
      { section: '5.1.2', titleKo: '반복/릴리스 계획에서 테스터 기여', learningObjective: 'FL-5.1.2' },
      { section: '5.1.3', titleKo: '시작 조건과 완료 조건', learningObjective: 'FL-5.1.3' },
      { section: '5.1.4', titleKo: '테스트 노력 추정 기법', learningObjective: 'FL-5.1.4' },
      { section: '5.1.5', titleKo: '테스트 케이스 우선순위 지정', learningObjective: 'FL-5.1.5' },
      { section: '5.1.6', titleKo: '테스트 피라미드', learningObjective: 'FL-5.1.6' },
      { section: '5.1.7', titleKo: '테스팅 사분면', learningObjective: 'FL-5.1.7' },
      { section: '5.2.1', titleKo: '리스크 수준 식별', learningObjective: 'FL-5.2.1' },
      { section: '5.2.2', titleKo: '프로젝트 리스크와 제품 리스크', learningObjective: 'FL-5.2.2' },
      { section: '5.2.3', titleKo: '제품 리스크 분석의 영향', learningObjective: 'FL-5.2.3' },
      { section: '5.2.4', titleKo: '제품 리스크 제어', learningObjective: 'FL-5.2.4' },
      { section: '5.3.1', titleKo: '테스팅에 사용하는 메트릭', learningObjective: 'FL-5.3.1' },
      { section: '5.3.2', titleKo: '테스트 보고서', learningObjective: 'FL-5.3.2' },
      { section: '5.3.3', titleKo: '테스팅 상황 전달', learningObjective: 'FL-5.3.3' },
      { section: '5.4', titleKo: '형상 관리', learningObjective: 'FL-5.4.1' },
      { section: '5.5', titleKo: '결함 관리와 결함 보고서', learningObjective: 'FL-5.5.1' },
    ],
  },
  6: {
    chapter: 6,
    titleEn: 'Test Tools',
    titleKo: '테스트 도구',
    sections: [
      { section: '6.1', titleKo: '테스팅 지원 도구', learningObjective: 'FL-6.1.1' },
      { section: '6.2', titleKo: '테스트 자동화의 효과와 리스크', learningObjective: 'FL-6.2.1' },
    ],
  },
};

export function findSyllabusSection(learningObjective: string): SyllabusSection | undefined {
  const chapterNum = Number(learningObjective.match(/^FL-(\d+)/)?.[1] ?? 0);
  const chapter = syllabusMap[chapterNum];
  if (!chapter) return undefined;
  return chapter.sections.find((s) => s.learningObjective === learningObjective);
}
