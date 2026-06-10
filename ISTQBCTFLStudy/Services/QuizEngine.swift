import Foundation

final class QuizEngine {
    static let shared = QuizEngine()

    private init() {}

    func filterByChapter(_ chapter: Int, from questions: [Question]) -> [Question] {
        questions.filter { $0.chapter == chapter }
    }

    func filterByKLevel(_ kLevel: String, from questions: [Question]) -> [Question] {
        questions.filter { $0.kLevel == kLevel }
    }

    func filterBySection(_ section: String, from questions: [Question]) -> [Question] {
        questions.filter { $0.section == section }
    }

    func filterByLearningObjective(_ lo: String, from questions: [Question]) -> [Question] {
        questions.filter { $0.learningObjective == lo }
    }

    func filterByIds(_ ids: [String], from questions: [Question]) -> [Question] {
        let idSet = Set(ids)
        return questions.filter { idSet.contains($0.id) }
    }

    func randomQuestions(count: Int, from questions: [Question]) -> [Question] {
        Array(questions.shuffled().prefix(count))
    }

    func generateMockExam(from questions: [Question]) -> [Question]? {
        guard questions.count >= 40 else { return nil }
        return randomQuestions(count: 40, from: questions)
    }

    func checkAnswer(question: Question, selectedOptionIds: Set<String>) -> Bool {
        Set(question.correctAnswers) == selectedOptionIds
    }

    func chapterAccuracy(questions: [Question], progress: UserProgress) -> [Int: Double] {
        var chapterCorrect: [Int: Int] = [:]
        var chapterTotal: [Int: Int] = [:]

        for question in questions {
            if progress.answeredQuestionIds.contains(question.id) {
                chapterTotal[question.chapter, default: 0] += 1
                if progress.correctQuestionIds.contains(question.id) {
                    chapterCorrect[question.chapter, default: 0] += 1
                }
            }
        }

        var result: [Int: Double] = [:]
        for (chapter, total) in chapterTotal {
            let correct = chapterCorrect[chapter, default: 0]
            result[chapter] = total > 0 ? Double(correct) / Double(total) * 100 : 0
        }
        return result
    }

    func kLevelAccuracy(questions: [Question], progress: UserProgress) -> [String: Double] {
        var kCorrect: [String: Int] = [:]
        var kTotal: [String: Int] = [:]

        for question in questions {
            if progress.answeredQuestionIds.contains(question.id) {
                kTotal[question.kLevel, default: 0] += 1
                if progress.correctQuestionIds.contains(question.id) {
                    kCorrect[question.kLevel, default: 0] += 1
                }
            }
        }

        var result: [String: Double] = [:]
        for (kLevel, total) in kTotal {
            let correct = kCorrect[kLevel, default: 0]
            result[kLevel] = total > 0 ? Double(correct) / Double(total) * 100 : 0
        }
        return result
    }

    func worstChapter(questions: [Question], progress: UserProgress) -> Int? {
        let accuracy = chapterAccuracy(questions: questions, progress: progress)
        return accuracy.min(by: { $0.value < $1.value })?.key
    }
}
