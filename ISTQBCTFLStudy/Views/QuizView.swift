import SwiftUI

struct QuizView: View {
    @Bindable var viewModel: QuizViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if let question = viewModel.currentQuestion {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        questionHeader(question)
                        questionBody(question)
                        optionsSection(question)

                        if !viewModel.isAnswerRevealed {
                            checkAnswerButton
                        } else {
                            explanationSection(question)
                            actionButtons(question)
                        }
                    }
                    .padding()
                }
            } else {
                ContentUnavailableView("문제가 없습니다", systemImage: "doc.text", description: Text("선택한 조건에 해당하는 문제가 없습니다."))
            }
        }
        .navigationTitle(viewModel.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Text(viewModel.progressText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Question Header

    private func questionHeader(_ question: Question) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                badge(question.chapterDisplay, color: .blue)
                badge(question.kLevel, color: kLevelColor(question.kLevel))
                badge(question.section, color: .gray)
            }

            HStack(spacing: 6) {
                Text("LO: \(question.learningObjective)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("Q\(question.questionNumber)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            if question.isMultipleAnswer {
                Text("복수 정답 (\(question.correctAnswerCount)개 선택)")
                    .font(.caption)
                    .foregroundStyle(.orange)
                    .fontWeight(.medium)
            }
        }
    }

    // MARK: - Question Body

    private func questionBody(_ question: Question) -> some View {
        Text(question.questionText)
            .font(.body)
            .lineSpacing(4)
            .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Options

    private func optionsSection(_ question: Question) -> some View {
        VStack(spacing: 8) {
            ForEach(question.options) { option in
                optionRow(option, question: question)
            }
        }
    }

    private func optionRow(_ option: QuestionOption, question: Question) -> some View {
        Button {
            viewModel.toggleOption(option.id)
        } label: {
            HStack(alignment: .top, spacing: 12) {
                Text(option.id)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .frame(width: 24)

                Text(option.text)
                    .font(.subheadline)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)

                if viewModel.isAnswerRevealed {
                    if viewModel.isOptionCorrect(option.id) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                    } else if viewModel.isOptionSelected(option.id) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.red)
                    }
                } else if viewModel.isOptionSelected(option.id) {
                    Image(systemName: "circle.fill")
                        .font(.caption)
                        .foregroundStyle(.blue)
                }
            }
            .padding(12)
            .background(optionBackground(option))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(optionBorder(option), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .disabled(viewModel.isAnswerRevealed)
    }

    private func optionBackground(_ option: QuestionOption) -> Color {
        if viewModel.isAnswerRevealed {
            if viewModel.isOptionCorrect(option.id) {
                return .green.opacity(0.08)
            } else if viewModel.isOptionSelected(option.id) {
                return .red.opacity(0.08)
            }
        } else if viewModel.isOptionSelected(option.id) {
            return .blue.opacity(0.06)
        }
        return .clear
    }

    private func optionBorder(_ option: QuestionOption) -> Color {
        if viewModel.isAnswerRevealed {
            if viewModel.isOptionCorrect(option.id) {
                return .green.opacity(0.4)
            } else if viewModel.isOptionSelected(option.id) {
                return .red.opacity(0.4)
            }
        } else if viewModel.isOptionSelected(option.id) {
            return .blue.opacity(0.3)
        }
        return .gray.opacity(0.2)
    }

    // MARK: - Check Answer Button

    private var checkAnswerButton: some View {
        Button {
            viewModel.checkAnswer()
        } label: {
            Text("정답 확인")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .tint(.black)
        .disabled(viewModel.selectedOptionIds.isEmpty)
    }

    // MARK: - Explanation

    private func explanationSection(_ question: Question) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: viewModel.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .foregroundStyle(viewModel.isCorrect ? .green : .red)
                Text(viewModel.isCorrect ? "정답입니다!" : "오답입니다")
                    .fontWeight(.semibold)
                    .foregroundStyle(viewModel.isCorrect ? .green : .red)
            }
            .font(.subheadline)

            // Option explanations
            let optionExplanations = question.options.compactMap { option -> (String, String)? in
                guard let exp = viewModel.optionExplanation(for: option.id) else { return nil }
                return (option.id, exp)
            }
            if !optionExplanations.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(optionExplanations, id: \.0) { (optId, exp) in
                        HStack(alignment: .top, spacing: 8) {
                            Text("\(optId).")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(.secondary)
                            Text(exp)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            if !question.explanation.isEmpty {
                Text(question.explanation)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineSpacing(3)
                    .padding(12)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }
        }
    }

    // MARK: - Action Buttons

    private func actionButtons(_ question: Question) -> some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                Button {
                    viewModel.toggleBookmark()
                } label: {
                    Label(
                        viewModel.isBookmarked ? "북마크 해제" : "북마크",
                        systemImage: viewModel.isBookmarked ? "bookmark.fill" : "bookmark"
                    )
                    .font(.subheadline)
                }
                .buttonStyle(.bordered)

                NavigationLink {
                    if let section = viewModel.relatedSummarySection() {
                        SummaryDetailView(section: section)
                    }
                } label: {
                    Label("관련 요약", systemImage: "book")
                        .font(.subheadline)
                }
                .buttonStyle(.bordered)
            }

            if !viewModel.isLastQuestion {
                Button {
                    viewModel.nextQuestion()
                } label: {
                    Text("다음 문제")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(.black)
            } else {
                Button {
                    dismiss()
                } label: {
                    Text("완료")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(.black)
            }
        }
    }

    // MARK: - Helpers

    private func badge(_ text: String, color: Color) -> some View {
        Text(text)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.12))
            .foregroundStyle(color)
            .cornerRadius(4)
    }

    private func kLevelColor(_ kLevel: String) -> Color {
        switch kLevel {
        case "K1": return .green
        case "K2": return .orange
        case "K3": return .purple
        default: return .gray
        }
    }
}
