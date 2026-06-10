import Foundation

struct Question: Codable, Identifiable, Hashable {
    let id: String
    let source: String
    let examSet: String?
    let questionNumber: String
    let chapter: Int
    let chapterTitleEn: String
    let chapterTitleKo: String
    let section: String
    let sectionTitle: String
    let learningObjective: String
    let kLevel: String
    let points: Int
    let questionText: String
    let options: [QuestionOption]
    let correctAnswers: [String]
    let explanation: String
    let optionExplanations: [String: String]
    let tags: [String]
    let isMultipleAnswer: Bool

    static func == (lhs: Question, rhs: Question) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    var chapterDisplay: String {
        "Ch.\(chapter)"
    }

    var kLevelDisplay: String {
        kLevel
    }

    var correctAnswerCount: Int {
        correctAnswers.count
    }
}
