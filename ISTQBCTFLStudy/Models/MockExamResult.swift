import Foundation

struct MockExamResult: Codable, Identifiable {
    let id: String
    let date: Date
    let score: Int
    let total: Int
    let passed: Bool
    let wrongQuestionIds: [String]
    let chapterStats: [String: Double]
    let kLevelStats: [String: Double]

    var scorePercentage: Double {
        guard total > 0 else { return 0 }
        return Double(score) / Double(total) * 100
    }

    var passStatusText: String {
        passed ? "합격 가능" : "추가 학습 필요"
    }
}
