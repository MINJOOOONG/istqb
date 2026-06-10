import SwiftUI

struct PracticeHomeView: View {
    @State private var viewModel = PracticeViewModel()

    var body: some View {
        NavigationStack {
            List {
                if let error = viewModel.loadError {
                    Section {
                        Text(error)
                            .foregroundStyle(.red)
                            .font(.subheadline)
                    }
                }

                Section {
                    Text(viewModel.questionCountText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("빠른 풀기") {
                    NavigationLink {
                        QuizContainerView(
                            questions: viewModel.randomQuestions(count: 10),
                            title: "빠른 10문제"
                        )
                    } label: {
                        Label("빠른 10문제", systemImage: "bolt")
                    }
                    .disabled(viewModel.allQuestions.isEmpty)
                }

                Section("Chapter별 문제 풀기") {
                    ForEach(viewModel.chapters) { ch in
                        NavigationLink {
                            QuizContainerView(
                                questions: viewModel.questionsForChapter(ch.chapter),
                                title: "Chapter \(ch.chapter)"
                            )
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Chapter \(ch.chapter)")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Text(ch.titleKo)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("\(ch.questionCount)문제")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }

                Section("K-Level별 문제 풀기") {
                    ForEach(viewModel.kLevels) { kl in
                        NavigationLink {
                            QuizContainerView(
                                questions: viewModel.questionsForKLevel(kl.kLevel),
                                title: kl.displayName
                            )
                        } label: {
                            HStack {
                                Text(kl.displayName)
                                    .font(.subheadline)
                                Spacer()
                                Text("\(kl.questionCount)문제")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }

                Section("시험 모드") {
                    NavigationLink {
                        QuizContainerView(
                            questions: viewModel.sampleExamQuestions(),
                            title: "Sample Exam A"
                        )
                    } label: {
                        Label("Sample Exam A 풀기", systemImage: "doc.text")
                    }
                    .disabled(viewModel.sampleExamQuestions().isEmpty)

                    NavigationLink {
                        MockExamContainerView(allQuestions: viewModel.allQuestions)
                    } label: {
                        Label("40문항 모의고사", systemImage: "timer")
                    }
                    .disabled(!viewModel.canStartMockExam)

                    if !viewModel.canStartMockExam {
                        Text("모의고사는 40문제 이상일 때 가능합니다.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Section("복습") {
                    NavigationLink {
                        WrongAnswerView(allQuestions: viewModel.allQuestions)
                    } label: {
                        Label("오답노트", systemImage: "xmark.circle")
                    }

                    NavigationLink {
                        BookmarkQuestionView(allQuestions: viewModel.allQuestions)
                    } label: {
                        Label("북마크 문제", systemImage: "bookmark")
                    }
                }
            }
            .navigationTitle("문제풀기")
            .onAppear {
                viewModel.loadData()
            }
        }
    }
}

/// Wrapper view that owns the QuizViewModel via @State
struct QuizContainerView: View {
    let questions: [Question]
    let title: String

    @State private var viewModel: QuizViewModel?

    var body: some View {
        Group {
            if let viewModel {
                QuizView(viewModel: viewModel)
            } else {
                ProgressView()
            }
        }
        .onAppear {
            if viewModel == nil {
                viewModel = QuizViewModel(questions: questions, title: title)
            }
        }
    }
}

/// Wrapper view that owns the MockExamViewModel via @State
struct MockExamContainerView: View {
    let allQuestions: [Question]

    @State private var viewModel: MockExamViewModel?

    var body: some View {
        Group {
            if let viewModel {
                MockExamView(viewModel: viewModel)
            } else {
                ContentUnavailableView(
                    "모의고사를 시작할 수 없습니다",
                    systemImage: "exclamationmark.triangle",
                    description: Text("40문제 이상이 필요합니다.")
                )
            }
        }
        .onAppear {
            if viewModel == nil {
                if let examQuestions = QuizEngine.shared.generateMockExam(from: allQuestions) {
                    viewModel = MockExamViewModel(questions: examQuestions)
                }
            }
        }
    }
}

#Preview {
    PracticeHomeView()
}
