import SwiftUI

struct MockExamView: View {
    @Bindable var viewModel: MockExamViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showSubmitAlert = false

    var body: some View {
        if viewModel.isSubmitted, let result = viewModel.result {
            MockExamResultView(result: result, questions: viewModel.questions)
        } else {
            examContent
        }
    }

    private var examContent: some View {
        VStack(spacing: 0) {
            examToolbar
            Divider()

            if let question = viewModel.currentQuestion {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        questionHeader(question)

                        Text(question.questionText)
                            .font(.body)
                            .lineSpacing(4)

                        if question.isMultipleAnswer {
                            Text("복수 정답 (\(question.correctAnswerCount)개 선택)")
                                .font(.caption)
                                .foregroundStyle(.orange)
                                .fontWeight(.medium)
                        }

                        optionsSection(question)
                    }
                    .padding()
                }
            }

            Divider()
            navigationBar
        }
        .navigationTitle("모의고사")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("취소") {
                    viewModel.stopTimer()
                    dismiss()
                }
            }
        }
        .onAppear {
            viewModel.startTimer()
        }
        .alert("모의고사 제출", isPresented: $showSubmitAlert) {
            Button("취소", role: .cancel) {}
            Button("제출", role: .destructive) {
                viewModel.submit()
            }
        } message: {
            Text("\(viewModel.answeredCount)/\(viewModel.questions.count)문제를 답했습니다. 제출하시겠습니까?")
        }
    }

    private var examToolbar: some View {
        HStack {
            Text(viewModel.timerText)
                .font(.system(.headline, design: .monospaced))
                .foregroundStyle(viewModel.remainingSeconds < 300 ? .red : .primary)

            Spacer()

            Text(viewModel.progressText)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Spacer()

            Button("제출") {
                showSubmitAlert = true
            }
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 6)
            .background(.black)
            .cornerRadius(6)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    private func questionHeader(_ question: Question) -> some View {
        HStack(spacing: 6) {
            Text("Q\(viewModel.currentIndex + 1)")
                .font(.subheadline)
                .fontWeight(.semibold)

            Spacer()

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
    }

    private func optionsSection(_ question: Question) -> some View {
        VStack(spacing: 8) {
            ForEach(question.options) { option in
                Button {
                    viewModel.selectOption(option.id, for: question.id)
                } label: {
                    let selected = viewModel.answers[question.id]?.contains(option.id) ?? false
                    HStack(alignment: .top, spacing: 12) {
                        Text(option.id)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .frame(width: 24)
                        Text(option.text)
                            .font(.subheadline)
                            .multilineTextAlignment(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        if selected {
                            Image(systemName: "circle.fill")
                                .font(.caption)
                                .foregroundStyle(.blue)
                        }
                    }
                    .padding(12)
                    .background(selected ? Color.blue.opacity(0.06) : .clear)
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(selected ? Color.blue.opacity(0.3) : Color.gray.opacity(0.2), lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var navigationBar: some View {
        HStack {
            Button {
                viewModel.previousQuestion()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.headline)
            }
            .disabled(viewModel.currentIndex == 0)

            Spacer()

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 4) {
                    ForEach(0..<viewModel.questions.count, id: \.self) { index in
                        Button {
                            viewModel.goToQuestion(index)
                        } label: {
                            let answered = viewModel.answers[viewModel.questions[index].id]?.isEmpty == false
                            Text("\(index + 1)")
                                .font(.caption2)
                                .frame(width: 28, height: 28)
                                .background(
                                    index == viewModel.currentIndex ? Color.black :
                                    answered ? Color.blue.opacity(0.15) : Color.gray.opacity(0.1)
                                )
                                .foregroundStyle(index == viewModel.currentIndex ? .white : .primary)
                                .cornerRadius(4)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            Spacer()

            Button {
                viewModel.nextQuestion()
            } label: {
                Image(systemName: "chevron.right")
                    .font(.headline)
            }
            .disabled(viewModel.currentIndex >= viewModel.questions.count - 1)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}
