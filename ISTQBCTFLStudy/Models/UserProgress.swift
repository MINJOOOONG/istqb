import Foundation

struct UserProgress: Codable {
    var answeredQuestionIds: [String]
    var correctQuestionIds: [String]
    var wrongQuestionIds: [String]
    var bookmarkedQuestionIds: [String]
    var bookmarkedSummaryIds: [String]
    var mockExamResults: [MockExamResult]

    static let empty = UserProgress(
        answeredQuestionIds: [],
        correctQuestionIds: [],
        wrongQuestionIds: [],
        bookmarkedQuestionIds: [],
        bookmarkedSummaryIds: [],
        mockExamResults: []
    )

    var totalAnswered: Int { answeredQuestionIds.count }

    var overallAccuracy: Double {
        guard totalAnswered > 0 else { return 0 }
        return Double(correctQuestionIds.count) / Double(totalAnswered) * 100
    }

    var latestMockExamScore: Int? {
        mockExamResults.last?.score
    }

    mutating func recordAnswer(questionId: String, isCorrect: Bool) {
        if !answeredQuestionIds.contains(questionId) {
            answeredQuestionIds.append(questionId)
        }
        if isCorrect {
            correctQuestionIds.removeAll { $0 == questionId }
            correctQuestionIds.append(questionId)
            wrongQuestionIds.removeAll { $0 == questionId }
        } else {
            wrongQuestionIds.removeAll { $0 == questionId }
            wrongQuestionIds.append(questionId)
            correctQuestionIds.removeAll { $0 == questionId }
        }
    }

    mutating func toggleBookmarkQuestion(_ questionId: String) {
        if bookmarkedQuestionIds.contains(questionId) {
            bookmarkedQuestionIds.removeAll { $0 == questionId }
        } else {
            bookmarkedQuestionIds.append(questionId)
        }
    }

    mutating func toggleBookmarkSummary(_ summaryId: String) {
        if bookmarkedSummaryIds.contains(summaryId) {
            bookmarkedSummaryIds.removeAll { $0 == summaryId }
        } else {
            bookmarkedSummaryIds.append(summaryId)
        }
    }
}
