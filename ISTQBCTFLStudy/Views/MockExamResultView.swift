import SwiftUI

struct MockExamResultView: View {
    let result: MockExamResult
    let questions: [Question]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                scoreSection
                passStatusSection
                chapterStatsSection
                kLevelStatsSection
                wrongQuestionsSection
            }
            .padding()
        }
        .navigationTitle("모의고사 결과")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("완료") {
                    dismiss()
                }
            }
        }
    }

    private var scoreSection: some View {
        VStack(spacing: 8) {
            Text("\(result.score)")
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .foregroundStyle(result.passed ? .green : .red)
            Text("/ \(result.total)점")
                .font(.title3)
                .foregroundStyle(.secondary)
            Text(String(format: "%.0f%%", result.scorePercentage))
                .font(.headline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
    }

    private var passStatusSection: some View {
        HStack {
            Image(systemName: result.passed ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                .foregroundStyle(result.passed ? .green : .orange)
            Text(result.passStatusText)
                .font(.headline)
                .foregroundStyle(result.passed ? .green : .orange)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(result.passed ? Color.green.opacity(0.08) : Color.orange.opacity(0.08))
        .cornerRadius(10)
    }

    private var chapterStatsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Chapter별 정답률")
                .font(.headline)

            ForEach(result.chapterStats.sorted(by: { $0.key < $1.key }), id: \.key) { key, value in
                HStack {
                    Text(key)
                        .font(.subheadline)
                        .frame(width: 50, alignment: .leading)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray.opacity(0.1))
                            RoundedRectangle(cornerRadius: 4)
                                .fill(value >= 65 ? Color.green.opacity(0.6) : Color.red.opacity(0.5))
                                .frame(width: geo.size.width * value / 100)
                        }
                    }
                    .frame(height: 20)
                    Text(String(format: "%.0f%%", value))
                        .font(.caption)
                        .frame(width: 40, alignment: .trailing)
                }
            }
        }
    }

    private var kLevelStatsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("K-Level별 정답률")
                .font(.headline)

            ForEach(result.kLevelStats.sorted(by: { $0.key < $1.key }), id: \.key) { key, value in
                HStack {
                    Text(key)
                        .font(.subheadline)
                        .frame(width: 50, alignment: .leading)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray.opacity(0.1))
                            RoundedRectangle(cornerRadius: 4)
                                .fill(value >= 65 ? Color.green.opacity(0.6) : Color.red.opacity(0.5))
                                .frame(width: geo.size.width * value / 100)
                        }
                    }
                    .frame(height: 20)
                    Text(String(format: "%.0f%%", value))
                        .font(.caption)
                        .frame(width: 40, alignment: .trailing)
                }
            }
        }
    }

    private var wrongQuestionsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            if !result.wrongQuestionIds.isEmpty {
                Text("틀린 문제: \(result.wrongQuestionIds.count)개")
                    .font(.headline)

                let wrongQuestions = questions.filter { result.wrongQuestionIds.contains($0.id) }
                NavigationLink {
                    QuizView(viewModel: QuizViewModel(
                        questions: wrongQuestions,
                        title: "틀린 문제 다시 풀기"
                    ))
                } label: {
                    Text("틀린 문제 다시 풀기")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)
                .tint(.black)
            }
        }
    }
}
