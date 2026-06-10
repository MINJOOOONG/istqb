import Foundation
import Observation

@Observable
final class SummaryViewModel {
    private(set) var allSummaries: [Summary] = []
    private(set) var loadError: String?
    var searchText: String = ""
    private(set) var progress: UserProgress

    private let storage = ProgressStorage.shared

    init() {
        self.progress = ProgressStorage.shared.load()
    }

    var filteredSummaries: [Summary] {
        if searchText.isEmpty {
            return allSummaries
        }
        let query = searchText.lowercased()
        return allSummaries.filter {
            $0.sectionTitle.lowercased().contains(query) ||
            $0.summary.lowercased().contains(query) ||
            $0.keywords.contains(where: { $0.lowercased().contains(query) }) ||
            $0.chapterTitleKo.lowercased().contains(query) ||
            $0.chapterTitleEn.lowercased().contains(query)
        }
    }

    struct ChapterGroup: Identifiable {
        let id: Int
        let chapter: Int
        let titleEn: String
        let titleKo: String
        let summaries: [Summary]
    }

    var chapterGroups: [ChapterGroup] {
        let grouped = Dictionary(grouping: filteredSummaries) { $0.chapter }
        return grouped.keys.sorted().compactMap { chapter in
            guard let items = grouped[chapter], let first = items.first else { return nil }
            return ChapterGroup(
                id: chapter,
                chapter: chapter,
                titleEn: first.chapterTitleEn,
                titleKo: first.chapterTitleKo,
                summaries: items
            )
        }
    }

    func loadData() {
        let summaries = DataLoader.shared.loadSummaries()
        if summaries.isEmpty {
            loadError = "요약 데이터를 불러올 수 없습니다."
        } else {
            loadError = nil
        }
        allSummaries = summaries
    }

    func isBookmarked(_ summaryId: String) -> Bool {
        progress.bookmarkedSummaryIds.contains(summaryId)
    }

    func toggleBookmark(_ summaryId: String) {
        progress.toggleBookmarkSummary(summaryId)
        storage.save(progress)
    }

    func refreshProgress() {
        progress = storage.load()
    }
}
