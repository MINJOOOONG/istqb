import SwiftUI

struct BookmarkQuestionView: View {
    let allQuestions: [Question]
    @State private var progress = ProgressStorage.shared.load()

    private var bookmarkedQuestions: [Question] {
        let ids = Set(progress.bookmarkedQuestionIds)
        return allQuestions.filter { ids.contains($0.id) }
    }

    var body: some View {
        Group {
            if bookmarkedQuestions.isEmpty {
                ContentUnavailableView(
                    "북마크가 없습니다",
                    systemImage: "bookmark",
                    description: Text("문제 풀기에서 북마크를 추가하세요.")
                )
            } else {
                List {
                    Section {
                        Text("\(bookmarkedQuestions.count)개의 북마크 문제")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Section {
                        NavigationLink {
                            QuizView(viewModel: QuizViewModel(
                                questions: bookmarkedQuestions,
                                title: "북마크 문제"
                            ))
                        } label: {
                            Label("전체 북마크 풀기", systemImage: "bookmark.fill")
                        }
                    }

                    Section("북마크 문제 목록") {
                        ForEach(bookmarkedQuestions) { question in
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
        .navigationTitle("북마크 문제")
        .onAppear {
            progress = ProgressStorage.shared.load()
        }
    }
}
