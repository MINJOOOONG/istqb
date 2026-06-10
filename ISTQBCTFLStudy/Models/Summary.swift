import Foundation

struct Summary: Codable, Identifiable, Hashable {
    let id: String
    let chapter: Int
    let chapterTitleEn: String
    let chapterTitleKo: String
    let section: String
    let sectionTitle: String
    let learningObjective: String?
    let kLevel: String?
    let keywords: [String]
    let summary: String
    let examPoint: String
    let relatedQuestionIds: [String]
    let importance: String

    static func == (lhs: Summary, rhs: Summary) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    var chapterDisplay: String {
        "Ch.\(chapter) \(chapterTitleKo)"
    }
}
