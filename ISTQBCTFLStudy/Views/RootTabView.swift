import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            PracticeHomeView()
                .tabItem {
                    Label("문제풀기", systemImage: "list.clipboard")
                }
            SummaryHomeView()
                .tabItem {
                    Label("요약본", systemImage: "book")
                }
            StudyProgressView()
                .tabItem {
                    Label("학습기록", systemImage: "chart.bar")
                }
        }
        .tint(.black)
    }
}

#Preview {
    RootTabView()
}
