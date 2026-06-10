import Foundation
import Observation

@Observable
final class PracticeViewModel {
    private(set) var allQuestions: [Question] = []
    private(set) var loadError: String?

    var canStartMockExam: Bool {
        allQuestions.count >= 40
    }

    var questionCountText: String {
        "총 \(allQuestions.count)문제"
    }

    struct ChapterInfo: Identifiable {
        let id: Int
        let chapter: Int
        let titleEn: String
        let titleKo: String
        let questionCount: Int
    }

    var chapters: [ChapterInfo] {
        let grouped = Dictionary(grouping: allQuestions) { $0.chapter }
        return grouped.keys.sorted().compactMap { chapter in
            guard let first = grouped[chapter]?.first else { return nil }
            return ChapterInfo(
                id: chapter,
                chapter: chapter,
                titleEn: first.chapterTitleEn,
                titleKo: first.chapterTitleKo,
                questionCount: grouped[chapter]?.count ?? 0
            )
        }
    }

    struct KLevelInfo: Identifiable {
        let id: String
        let kLevel: String
        let displayName: String
        let questionCount: Int
    }

    var kLevels: [KLevelInfo] {
        let kLevelNames = ["K1": "K1 기억", "K2": "K2 이해", "K3": "K3 적용"]
        let grouped = Dictionary(grouping: allQuestions) { $0.kLevel }
        return ["K1", "K2", "K3"].compactMap { kLevel in
            KLevelInfo(
                id: kLevel,
                kLevel: kLevel,
                displayName: kLevelNames[kLevel] ?? kLevel,
                questionCount: grouped[kLevel]?.count ?? 0
            )
        }
    }

    func loadData() {
        let questions = DataLoader.shared.loadQuestions()
        if questions.isEmpty {
            loadError = "문제 데이터를 불러올 수 없습니다."
        } else {
            loadError = nil
        }
        allQuestions = questions
    }

    func questionsForChapter(_ chapter: Int) -> [Question] {
        QuizEngine.shared.filterByChapter(chapter, from: allQuestions)
    }

    func questionsForKLevel(_ kLevel: String) -> [Question] {
        QuizEngine.shared.filterByKLevel(kLevel, from: allQuestions)
    }

    func randomQuestions(count: Int) -> [Question] {
        QuizEngine.shared.randomQuestions(count: min(count, allQuestions.count), from: allQuestions)
    }

    func sampleExamQuestions() -> [Question] {
        allQuestions.filter { $0.source == "Sample Exam A" }
    }
}
