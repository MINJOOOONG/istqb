import SwiftUI

struct SummaryHomeView: View {
    @State private var viewModel = SummaryViewModel()

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

                ForEach(viewModel.chapterGroups) { group in
                    Section {
                        ForEach(group.summaries) { summary in
                            NavigationLink {
                                SummaryDetailView(
                                    summary: summary,
                                    viewModel: viewModel
                                )
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 6) {
                                        if let kLevel = summary.kLevel {
                                            Text(kLevel)
                                                .font(.caption2)
                                                .padding(.horizontal, 6)
                                                .padding(.vertical, 2)
                                                .background(kLevelColor(kLevel).opacity(0.1))
                                                .foregroundStyle(kLevelColor(kLevel))
                                                .cornerRadius(4)
                                        }
                                        Text(summary.importance)
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }

                                    Text(summary.sectionTitle)
                                        .font(.subheadline)

                                    Text(summary.section)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    } header: {
                        Text("Ch.\(group.chapter) \(group.titleKo)")
                    }
                }
            }
            .navigationTitle("요약본")
            .searchable(text: $viewModel.searchText, prompt: "키워드 검색")
            .onAppear {
                viewModel.loadData()
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

#Preview {
    SummaryHomeView()
}
