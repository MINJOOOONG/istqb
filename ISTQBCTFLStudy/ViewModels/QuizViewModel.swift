import Foundation
import Observation

@Observable
final class QuizViewModel {
    let questions: [Question]
    let title: String

    private(set) var currentIndex: Int = 0
    var selectedOptionIds: Set<String> = []
    private(set) var isAnswerRevealed: Bool = false
    private(set) var isCorrect: Bool = false
    private(set) var progress: UserProgress

    private let storage = ProgressStorage.shared

    var currentQuestion: Question? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    var progressText: String {
        "\(currentIndex + 1) / \(questions.count)"
    }

    var isLastQuestion: Bool {
        currentIndex >= questions.count - 1
    }

    var hasQuestions: Bool {
        !questions.isEmpty
    }

    var isBookmarked: Bool {
        guard let q = currentQuestion else { return false }
        return progress.bookmarkedQuestionIds.contains(q.id)
    }

    init(questions: [Question], title: String) {
        self.questions = questions
        self.title = title
        self.progress = ProgressStorage.shared.load()
    }

    func checkAnswer() {
        guard let question = currentQuestion else { return }
        let correct = QuizEngine.shared.checkAnswer(question: question, selectedOptionIds: selectedOptionIds)
        isCorrect = correct
        isAnswerRevealed = true
        progress.recordAnswer(questionId: question.id, isCorrect: correct)
        storage.save(progress)
    }

    func nextQuestion() {
        guard !isLastQuestion else { return }
        currentIndex += 1
        selectedOptionIds = []
        isAnswerRevealed = false
        isCorrect = false
    }

    func toggleBookmark() {
        guard let question = currentQuestion else { return }
        progress.toggleBookmarkQuestion(question.id)
        storage.save(progress)
    }

    func toggleOption(_ optionId: String) {
        guard !isAnswerRevealed else { return }
        guard let question = currentQuestion else { return }

        if question.isMultipleAnswer {
            if selectedOptionIds.contains(optionId) {
                selectedOptionIds.remove(optionId)
            } else {
                selectedOptionIds.insert(optionId)
            }
        } else {
            selectedOptionIds = [optionId]
        }
    }

    func isOptionSelected(_ optionId: String) -> Bool {
        selectedOptionIds.contains(optionId)
    }

    func isOptionCorrect(_ optionId: String) -> Bool {
        guard let question = currentQuestion else { return false }
        return question.correctAnswers.contains(optionId)
    }

    func optionExplanation(for optionId: String) -> String? {
        currentQuestion?.optionExplanations[optionId]
    }

    func relatedSummarySection() -> String? {
        currentQuestion?.section
    }
}
