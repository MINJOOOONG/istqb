import Foundation
import Observation

@Observable
final class MockExamViewModel {
    let questions: [Question]

    private(set) var currentIndex: Int = 0
    var answers: [String: Set<String>] = [:]
    private(set) var isSubmitted: Bool = false
    private(set) var result: MockExamResult?
    private(set) var remainingSeconds: Int = 3600

    private var timer: Timer?
    private let storage = ProgressStorage.shared
    private let engine = QuizEngine.shared

    var currentQuestion: Question? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    var progressText: String {
        "\(currentIndex + 1) / \(questions.count)"
    }

    var timerText: String {
        let minutes = remainingSeconds / 60
        let seconds = remainingSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var isTimeUp: Bool {
        remainingSeconds <= 0
    }

    var canSubmit: Bool {
        !isSubmitted
    }

    var answeredCount: Int {
        answers.filter { !$0.value.isEmpty }.count
    }

    init(questions: [Question]) {
        self.questions = questions
    }

    func startTimer() {
        timer?.invalidate()
        remainingSeconds = 3600
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            if self.remainingSeconds > 0 {
                self.remainingSeconds -= 1
            } else {
                self.submit()
            }
        }
    }

    func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    func selectOption(_ optionId: String, for questionId: String) {
        guard !isSubmitted else { return }
        guard let question = questions.first(where: { $0.id == questionId }) else { return }

        if question.isMultipleAnswer {
            var current = answers[questionId] ?? []
            if current.contains(optionId) {
                current.remove(optionId)
            } else {
                current.insert(optionId)
            }
            answers[questionId] = current
        } else {
            answers[questionId] = [optionId]
        }
    }

    func goToQuestion(_ index: Int) {
        guard index >= 0, index < questions.count else { return }
        currentIndex = index
    }

    func nextQuestion() {
        if currentIndex < questions.count - 1 {
            currentIndex += 1
        }
    }

    func previousQuestion() {
        if currentIndex > 0 {
            currentIndex -= 1
        }
    }

    func submit() {
        guard !isSubmitted else { return }
        stopTimer()
        isSubmitted = true

        var score = 0
        var wrongIds: [String] = []
        var chapterCorrect: [String: Int] = [:]
        var chapterTotal: [String: Int] = [:]
        var kCorrect: [String: Int] = [:]
        var kTotal: [String: Int] = [:]

        var progress = storage.load()

        for question in questions {
            let selected = answers[question.id] ?? []
            let correct = engine.checkAnswer(question: question, selectedOptionIds: selected)

            let chapterKey = "Ch.\(question.chapter)"
            chapterTotal[chapterKey, default: 0] += 1
            kTotal[question.kLevel, default: 0] += 1

            if correct {
                score += question.points
                chapterCorrect[chapterKey, default: 0] += 1
                kCorrect[question.kLevel, default: 0] += 1
            } else {
                wrongIds.append(question.id)
            }

            progress.recordAnswer(questionId: question.id, isCorrect: correct)
        }

        var chapterStats: [String: Double] = [:]
        for (key, total) in chapterTotal {
            chapterStats[key] = Double(chapterCorrect[key, default: 0]) / Double(total) * 100
        }

        var kLevelStats: [String: Double] = [:]
        for (key, total) in kTotal {
            kLevelStats[key] = Double(kCorrect[key, default: 0]) / Double(total) * 100
        }

        let examResult = MockExamResult(
            id: UUID().uuidString,
            date: Date(),
            score: score,
            total: questions.count,
            passed: score >= 26,
            wrongQuestionIds: wrongIds,
            chapterStats: chapterStats,
            kLevelStats: kLevelStats
        )

        result = examResult
        progress.mockExamResults.append(examResult)
        storage.save(progress)
    }

    deinit {
        stopTimer()
    }
}
