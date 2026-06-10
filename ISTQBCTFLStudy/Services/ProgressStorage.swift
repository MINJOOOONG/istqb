import Foundation

final class ProgressStorage {
    static let shared = ProgressStorage()

    private let key = "userProgress"
    private let defaults = UserDefaults.standard

    private init() {}

    func load() -> UserProgress {
        guard let data = defaults.data(forKey: key) else {
            return .empty
        }
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(UserProgress.self, from: data)
        } catch {
            print("[ProgressStorage] Failed to decode progress: \(error)")
            return .empty
        }
    }

    func save(_ progress: UserProgress) {
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(progress)
            defaults.set(data, forKey: key)
        } catch {
            print("[ProgressStorage] Failed to encode progress: \(error)")
        }
    }

    func reset() {
        defaults.removeObject(forKey: key)
    }
}
