import SwiftUI

struct SummaryDetailView: View {
    let summary: Summary?
    var viewModel: SummaryViewModel?
    var section: String?

    @State private var loadedSummary: Summary?
    @State private var allQuestions: [Question] = []

    private var displaySummary: Summary? {
        summary ?? loadedSummary
    }

    init(summary: Summary, viewModel: SummaryViewModel) {
        self.summary = summary
        self.viewModel = viewModel
        self.section = nil
    }

    init(section: String) {
        self.summary = nil
        self.viewModel = nil
        self.section = section
    }

    var body: some View {
        Group {
            if let s = displaySummary {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        headerSection(s)
                        keywordsSection(s)
                        summarySection(s)
                        examPointSection(s)
                        relatedQuestionsSection(s)
                    }
                    .padding()
                }
                .navigationTitle(s.sectionTitle)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    if let vm = viewModel {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button {
                                vm.toggleBookmark(s.id)
                            } label: {
                                Image(systemName: vm.isBookmarked(s.id) ? "bookmark.fill" : "bookmark")
                            }
                        }
                    }
                }
            } else {
                ContentUnavailableView(
                    "요약을 찾을 수 없습니다",
                    systemImage: "doc.text",
                    description: Text("해당 섹션의 요약이 없습니다.")
                )
            }
        }
        .onAppear {
            if summary == nil, let section {
                let summaries = DataLoader.shared.loadSummaries()
                loadedSummary = summaries.first { $0.section == section }
            }
            allQuestions = DataLoader.shared.loadQuestions()
        }
    }

    private func headerSection(_ s: Summary) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Text("Ch.\(s.chapter)")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.blue.opacity(0.12))
                    .foregroundStyle(.blue)
                    .cornerRadius(4)

                if let kLevel = s.kLevel {
                    Text(kLevel)
                        .font(.caption2)
                        .fontWeight(.medium)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(kLevelColor(kLevel).opacity(0.12))
                        .foregroundStyle(kLevelColor(kLevel))
                        .cornerRadius(4)
                }

                Text(s.importance)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Text(s.section)
                .font(.caption)
                .foregroundStyle(.secondary)

            if let lo = s.learningObjective {
                Text("LO: \(lo)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func keywordsSection(_ s: Summary) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("핵심 키워드")
                .font(.subheadline)
                .fontWeight(.semibold)

            FlowLayout(spacing: 6) {
                ForEach(s.keywords, id: \.self) { keyword in
                    Text(keyword)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color(.systemGray6))
                        .cornerRadius(6)
                }
            }
        }
    }

    private func summarySection(_ s: Summary) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("요약")
                .font(.subheadline)
                .fontWeight(.semibold)

            Text(s.summary)
                .font(.subheadline)
                .lineSpacing(6)
                .foregroundStyle(.primary)
        }
    }

    private func examPointSection(_ s: Summary) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("시험 포인트")
                .font(.subheadline)
                .fontWeight(.semibold)

            Text(s.examPoint)
                .font(.subheadline)
                .lineSpacing(4)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.orange.opacity(0.06))
                .cornerRadius(8)
        }
    }

    private func relatedQuestionsSection(_ s: Summary) -> some View {
        Group {
            if !s.relatedQuestionIds.isEmpty {
                let related = allQuestions.filter { s.relatedQuestionIds.contains($0.id) }
                if !related.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("관련 문제")
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        NavigationLink {
                            QuizView(viewModel: QuizViewModel(
                                questions: related,
                                title: "관련 문제"
                            ))
                        } label: {
                            Label("관련 문제 풀기 (\(related.count)문제)", systemImage: "list.clipboard")
                                .font(.subheadline)
                        }
                        .buttonStyle(.bordered)
                    }
                }
            }
        }
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

// Simple flow layout for keywords
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x)
        }

        return (CGSize(width: maxX, height: y + rowHeight), positions)
    }
}
