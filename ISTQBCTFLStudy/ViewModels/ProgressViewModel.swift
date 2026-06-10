import Foundation
import Observation

@Observable
final class ProgressViewModel {
    private(set) var progress: UserProgress = .empty
    private(set) var allQuestions: [Question] = []

    private let storage = ProgressStorage.shared
    private let engine = QuizEngine.shared

    var totalAnswered: Int { progress.totalAnswered }
    var overallAccuracy: Double { progress.overallAccuracy }
    var wrongCount: Int { progress.wrongQuestionIds.count }
    var bookmarkCount: Int { progress.bookmarkedQuestionIds.count }
    var latestMockScore: Int? { progress.latestMockExamScore }
    var mockExamCount: Int { progress.mockExamResults.count }

    var chapterAccuracy: [(chapter: Int, accuracy: Double)] {
        let stats = engine.chapterAccuracy(questions: allQuestions, progress: progress)
        return stats.sorted(by: { $0.key < $1.key }).map { ($0.key, $0.value) }
    }

    var kLevelAccuracy: [(kLevel: String, accuracy: Double)] {
        let stats = engine.kLevelAccuracy(questions: allQuestions, progress: progress)
        return ["K1", "K2", "K3"].compactMap { k in
            guard let acc = stats[k] else { return nil }
            return (k, acc)
        }
    }

    var worstChapter: Int? {
        engine.worstChapter(questions: allQuestions, progress: progress)
    }

    var latestMockExam: MockExamResult? {
        progress.mockExamResults.last
    }

    func loadData() {
        progress = storage.load()
        allQuestions = DataLoader.shared.loadQuestions()
    }

    func chapterName(for chapter: Int) -> String {
        let names: [Int: String] = [
            1: "테스팅의 기초",
            2: "SDLC와 테스팅",
            3: "정적 테스팅",
            4: "테스트 분석과 설계",
            5: "테스트 활동 관리",
            6: "테스트 도구"
        ]
        return names[chapter] ?? "Chapter \(chapter)"
    }
}
