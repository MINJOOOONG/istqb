# ISTQB CTFL Quick Study

ISTQB CTFL(Certified Tester Foundation Level) v4.0 한국어 시험 대비 웹 학습 앱입니다.
ISTQB 공식 샘플 시험 A/B/C/D 세트의 문제를 기반으로, 문제 풀이 · 모의고사 · 오답 관리 · 챕터별 요약을 한 곳에서 제공합니다.

**라이브 페이지:** [https://istqb-web.vercel.app](https://istqb-web.vercel.app)

---

## 주요 기능

### 문제 풀이 (`/practice`)
- **빠른 10문제** — 전체 문제 중 랜덤 10문제를 뽑아 빠르게 연습
- **모의고사** — Sample Exam A / B / C / D 세트 선택 후 실제 시험과 동일한 방식으로 응시 (40문제, 65% 합격 기준)
- **챕터별 문제** — 원하는 챕터를 선택하면 해당 챕터의 모든 문제를 셔플하여 출제
- **전체 문제** — 전체 문제를 셔플하여 풀기

### 퀴즈 모드 (`/quiz`)
- **일반 모드** — 문제마다 바로 정답 확인 및 해설 열람 가능. 선택한 답안, 정답 여부, 상세 해설(선지별 해설 포함)을 즉시 피드백
- **시험 모드** — 모의고사 전용. 문제 간 자유 이동(이전/다음/번호 직접 이동)이 가능하고, 모든 문제에 답을 완료해야 제출 가능. 제출 후 합격/불합격 판정과 점수, 오답 상세 리뷰 제공
- **퀴즈 이어풀기** — 챕터별 퀴즈 진행 상태(현재 문제 번호, 답안 상태)가 LocalStorage에 자동 저장되어 페이지를 벗어나도 이어서 풀기 가능

### 모의고사 결과 (`ExamResultPage`)
- 총 문제 수, 맞힌 개수, 틀린 개수, 정답률(%) 표시
- 65%(26/40) 합격 기준 바 시각화
- 틀린 문제별 상세 리뷰: 내가 선택한 답, 정답, 선지별 정오 표시, 해설, 챕터/학습목표/실라버스 참조
- 틀린 문제만 다시 풀기 / 전체 다시 풀기 선택 가능

### 오답 노트 (`/wrong`)
- 틀린 문제가 자동으로 기록되며, 오답 횟수까지 추적
- **필터** — 전체 / 미해결(재풀이 미정답) / 챕터별 필터링
- **정렬** — 최근 틀린 순 / 자주 틀린 순 / 챕터 순
- 각 오답 항목에서 해설 보기, 다시 풀기, 원본 PDF 보기, 제거 가능
- **전체 오답 다시 풀기** 또는 **오답 랜덤 10문제** 빠른 재시도
- 재풀이 시 정답을 맞히면 "재풀이 정답" 배지 표시 (오답 노트에서 자동 제거되지 않음)

### 학습 요약 (`/summary`)
- ISTQB CTFL v4.0 실라버스 기반 챕터별 핵심 요약
- 각 요약에는 학습 목표, 키워드, 시험 포인트, 중요도가 포함
- 요약 상세 페이지(`/summary/:id`)에서 개별 항목 확인

### 실라버스 뷰어 (`/syllabus`)
- ISTQB CTFL v4.0 실라버스 PDF를 앱 내에서 직접 열람

### 문제 출처 뷰어 (`/source`)
- 원본 샘플 시험 PDF를 앱 내에서 직접 열람
- 특정 문제에서 "원본 보기" 클릭 시 해당 PDF 위치로 이동

### 챕터별 통계 (`ChapterStats`)
- 챕터별로 풀이한 문제 수, 정답 수, 오답 수, 정답률을 시각적으로 확인
- 통계 초기화 기능 제공

### PWA 지원
- `manifest.json` 설정으로 모바일 홈 화면에 추가하여 네이티브 앱처럼 사용 가능
- 앱 아이콘(192px, 512px) 포함

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript 6 |
| 빌드 도구 | Vite 8 |
| 라우팅 | React Router v7 |
| PDF 렌더링 | react-pdf + pdfjs-dist |
| 상태 관리 | React useState/useMemo + LocalStorage |
| 배포 | Vercel |

---

## 데이터 구조

### 문제 (`Question`)
각 문제에는 다음 정보가 포함됩니다:
- `id`, `examSet` (A/B/C/D), `questionNumber`
- `chapter`, `chapterTitleKo`, `section`, `sectionTitle`
- `learningObjective`, `kLevel` (K1~K4 Bloom's 분류)
- `questionText`, `options` (선택지), `correctAnswers`
- `explanation` (전체 해설), `optionExplanations` (선지별 해설)
- `tags`, `keyConcepts`, `reviewTip`
- `syllabusReference` (실라버스 참조)
- `isMultipleAnswer` (복수 정답 여부)

### 오답 기록 (`WrongNoteRecord`)
- 선택한 답, 정답, 오답 횟수, 날짜, 챕터, 재풀이 결과 추적

### 학습 요약 (`Summary`)
- 챕터, 섹션, 학습 목표, 키워드, 요약 내용, 시험 포인트, 중요도

---

## 페이지 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | EntryPage | 랜딩 페이지. "시작하기" / "요약 보기" 진입 |
| `/practice` | PracticePage | 문제 풀기 허브. 빠른 퀴즈, 모의고사, 챕터별 선택 |
| `/quiz` | QuizPage | 퀴즈 진행. 쿼리 파라미터로 모드 제어 |
| `/wrong` | WrongNotePage | 오답 노트. 필터/정렬/재시도 |
| `/summary` | SummaryPage | 챕터별 학습 요약 목록 |
| `/summary/:id` | SummaryDetailPage | 개별 요약 상세 |
| `/syllabus` | SyllabusPage | 실라버스 PDF 뷰어 |
| `/source` | QuestionSourcePage | 문제 출처 PDF 뷰어 |

### 퀴즈 모드 (`/quiz?mode=`)

| mode | 설명 |
|------|------|
| `random10` | 랜덤 10문제 |
| `chapter` | 특정 챕터 문제 (`&chapter=N`) |
| `exam` | 모의고사 (`&set=Sample Exam A`) |
| `wrong` | 전체 오답 다시 풀기 |
| `wrongRandom` | 오답 중 랜덤 10문제 |
| `single` | 단일 문제 보기 (`&questionId=...`) |
| `all` | 전체 문제 셔플 |

---

## 로컬 저장소 (LocalStorage)

| 키 | 용도 |
|----|------|
| `istqb_wrong_ids` | 오답 문제 ID 목록 (레거시 호환) |
| `istqb_answered` | 문제별 정답/오답 기록 |
| `istqb_wrong_notes` | 상세 오답 기록 (횟수, 선택 답안, 재풀이 결과 등) |
| `istqb_chapter_quiz_progress` | 챕터별 퀴즈 진행 상태 (이어풀기용) |

---

## 프로젝트 구조

```
istqb/
├── istqb-web/                     # 웹 앱 (React + Vite)
│   ├── public/
│   │   ├── manifest.json          # PWA 설정
│   │   ├── icon-192.png / 512.png # 앱 아이콘
│   │   └── files/                 # PDF 파일들
│   ├── scripts/
│   │   └── extractSampleExams.mjs # 샘플 시험 PDF → JSON 변환 스크립트
│   ├── src/
│   │   ├── App.tsx                # 라우트 정의
│   │   ├── main.tsx               # 엔트리 포인트
│   │   ├── index.css              # 전역 스타일
│   │   ├── pages/
│   │   │   ├── EntryPage.tsx      # 랜딩 페이지
│   │   │   ├── PracticePage.tsx   # 문제 풀기 허브
│   │   │   ├── QuizPage.tsx       # 퀴즈 진행 (일반/시험 모드)
│   │   │   ├── WrongNotePage.tsx  # 오답 노트
│   │   │   ├── SummaryPage.tsx    # 학습 요약 목록
│   │   │   ├── SummaryDetailPage.tsx # 요약 상세
│   │   │   ├── SyllabusPage.tsx   # 실라버스 PDF 뷰어
│   │   │   └── QuestionSourcePage.tsx # 문제 출처 PDF 뷰어
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx   # 일반 모드 문제 카드
│   │   │   ├── ExamQuestionCard.tsx # 시험 모드 문제 카드
│   │   │   ├── ExamResultPage.tsx # 모의고사 결과 (합격/불합격)
│   │   │   ├── QuestionResult.tsx # 문제 결과 표시
│   │   │   ├── BottomNav.tsx      # 하단 네비게이션 바
│   │   │   ├── ChapterSelector.tsx # 챕터 선택 UI
│   │   │   ├── ChapterStats.tsx   # 챕터별 통계
│   │   │   ├── PdfViewer.tsx      # PDF 뷰어
│   │   │   └── AnnotationLayer.tsx # PDF 주석 레이어
│   │   ├── data/
│   │   │   ├── questions.json     # 전체 문제 데이터
│   │   │   ├── summaries.json     # 학습 요약 데이터
│   │   │   └── syllabusMap.ts     # 실라버스 구조 매핑
│   │   ├── types/
│   │   │   ├── question.ts        # Question 타입 정의
│   │   │   ├── summary.ts         # Summary 타입 정의
│   │   │   └── annotation.ts      # PDF 주석 타입
│   │   └── utils/
│   │       ├── quiz.ts            # 퀴즈 로직 (셔플, 필터, 채점)
│   │       ├── storage.ts         # LocalStorage CRUD, 마이그레이션
│   │       ├── explanations.ts    # 해설 텍스트 포맷팅
│   │       ├── sourcePdfs.ts      # PDF 출처 매핑
│   │       ├── text.ts            # 텍스트 유틸리티
│   │       └── pdfAnnotations.ts  # PDF 주석 유틸리티
│   ├── vercel.json                # Vercel 배포 설정
│   ├── vite.config.ts             # Vite 빌드 설정
│   ├── tsconfig.json              # TypeScript 설정
│   └── package.json               # 의존성 및 스크립트
├── ISTQBCTFLStudy/                # iOS 앱 (Swift)
├── ISTQBCTFLStudy.xcodeproj/     # Xcode 프로젝트
├── files/                         # 원본 PDF 파일
└── project.yml                    # 프로젝트 설정
```

---

## 시작하기

```bash
cd istqb-web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 빌드 및 프리뷰

```bash
# TypeScript 타입 체크 + 프로덕션 빌드
npm run build

# 빌드 결과물 로컬 프리뷰
npm run preview
```

## 문제 데이터 재생성

ISTQB 공식 샘플 시험 PDF에서 문제를 추출하여 `questions.json`을 생성합니다.
`/files` 디렉토리에 원본 PDF 파일이 필요합니다.

```bash
npm run generate:questions
```

---

## 배포

Vercel에 자동 배포됩니다. `vercel.json`에 SPA 리라이트 규칙이 설정되어 있어 클라이언트 사이드 라우팅이 정상 동작합니다.
