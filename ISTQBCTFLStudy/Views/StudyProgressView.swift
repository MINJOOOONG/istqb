import SwiftUI

struct StudyProgressView: View {
    @State private var viewModel = ProgressViewModel()

    var body: some View {
        NavigationStack {
            List {
                Section("전체 현황") {
                    statRow(title: "풀이 문제 수", value: "\(viewModel.totalAnswered)문제")
                    statRow(title: "전체 정답률", value: String(format: "%.1f%%", viewModel.overallAccuracy))
                    statRow(title: "오답노트", value: "\(viewModel.wrongCount)문제")
                    statRow(title: "북마크", value: "\(viewModel.bookmarkCount)문제")
                    statRow(title: "모의고사 응시", value: "\(viewModel.mockExamCount)회")
                    if let score = viewModel.latestMockScore {
                        statRow(title: "최근 모의고사 점수", value: "\(score)/40")
                    }
                }

                if let worst = viewModel.worstChapter {
                    Section {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.orange)
                            Text("가장 취약: Ch.\(worst) \(viewModel.chapterName(for: worst))")
                                .font(.subheadline)
                        }
                    }
                }

                if !viewModel.chapterAccuracy.isEmpty {
                    Section("Chapter별 정답률") {
                        ForEach(viewModel.chapterAccuracy, id: \.chapter) { item in
                            HStack {
                                Text("Ch.\(item.chapter)")
                                    .font(.subheadline)
                                    .frame(width: 40, alignment: .leading)
                                Text(viewModel.chapterName(for: item.chapter))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Text(String(format: "%.0f%%", item.accuracy))
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundStyle(item.accuracy >= 65 ? .green : .red)
                            }
                        }
                    }
                }

                if !viewModel.kLevelAccuracy.isEmpty {
                    Section("K-Level별 정답률") {
                        ForEach(viewModel.kLevelAccuracy, id: \.kLevel) { item in
                            HStack {
                                Text(item.kLevel)
                                    .font(.subheadline)
                                    .frame(width: 40, alignment: .leading)
                                Text(kLevelName(item.kLevel))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Text(String(format: "%.0f%%", item.accuracy))
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundStyle(item.accuracy >= 65 ? .green : .red)
                            }
                        }
                    }
                }

                if let latest = viewModel.latestMockExam {
                    Section("최근 모의고사") {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("\(latest.score)/\(latest.total)점")
                                    .font(.headline)
                                Spacer()
                                Text(latest.passStatusText)
                                    .font(.subheadline)
                                    .foregroundStyle(latest.passed ? .green : .orange)
                            }
                            Text(latest.date.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("학습기록")
            .onAppear {
                viewModel.loadData()
            }
        }
    }

    private func statRow(title: String, value: String) -> some View {
        HStack {
            Text(title)
                .font(.subheadline)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }

    private func kLevelName(_ kLevel: String) -> String {
        switch kLevel {
        case "K1": return "기억"
        case "K2": return "이해"
        case "K3": return "적용"
        default: return kLevel
        }
    }
}

#Preview {
    StudyProgressView()
}
