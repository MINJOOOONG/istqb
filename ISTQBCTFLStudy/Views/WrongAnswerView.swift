import SwiftUI

struct WrongAnswerView: View {
    let allQuestions: [Question]
    @State private var progress = ProgressStorage.shared.load()

    private var wrongQuestions: [Question] {
        let ids = Set(progress.wrongQuestionIds)
        return allQuestions.filter { ids.contains($0.id) }
    }

    var body: some View {
        Group {
            if wrongQuestions.isEmpty {
                ContentUnavailableView(
                    "오답이 없습니다",
                    systemImage: "checkmark.circle",
                    description: Text("틀린 문제가 없습니다.")
                )
            } else {
                List {
                    Section {
                        Text("\(wrongQuestions.count)개의 틀린 문제")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Section {
                        NavigationLink {
                            QuizView(viewModel: QuizViewModel(
                                questions: wrongQuestions,
                                title: "오답노트"
                            ))
                        } label: {
                            Label("전체 오답 다시 풀기", systemImage: "arrow.counterclockwise")
                        }
                    }

                    Section("틀린 문제 목록") {
                        ForEach(wrongQuestions) { question in
                            NavigationLink {
                                QuizView(viewModel: QuizViewModel(
                                    questions: [question],
                                    title: "Q\(question.questionNumber)"
                                ))
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 6) {
                                        Text(question.chapterDisplay)
                                            .font(.caption2)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.blue.opacity(0.1))
                                            .foregroundStyle(.blue)
                                            .cornerRadius(4)
                                        Text(question.kLevel)
                                            .font(.caption2)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.orange.opacity(0.1))
                                            .foregroundStyle(.orange)
                                            .cornerRadius(4)
                                    }
                                    Text("Q\(question.questionNumber). \(question.questionText)")
                                        .font(.subheadline)
                                        .lineLimit(2)
                                }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("오답노트")
        .onAppear {
            progress = ProgressStorage.shared.load()
        }
    }
}
