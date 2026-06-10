import Foundation

final class DataLoader {
    static let shared = DataLoader()

    private init() {}

    func loadQuestions() -> [Question] {
        load(filename: "questions", type: [Question].self) ?? []
    }

    func loadSummaries() -> [Summary] {
        load(filename: "summaries", type: [Summary].self) ?? []
    }

    private func load<T: Decodable>(filename: String, type: T.Type) -> T? {
        guard let url = Bundle.main.url(forResource: filename, withExtension: "json") else {
            print("[DataLoader] \(filename).json not found in bundle")
            return nil
        }

        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(T.self, from: data)
        } catch {
            print("[DataLoader] Failed to decode \(filename).json: \(error)")
            return nil
        }
    }
}
