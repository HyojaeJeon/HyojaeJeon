#include "SyncStateStore.h"

#include <chrono>
#include <iomanip>
#include <sstream>
#include <unordered_map>

namespace {

std::unordered_map<std::string, SyncStateEntry> g_sync_state;

std::string NowUtc() {
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf;
#ifdef _WIN32
    gmtime_s(&tm_buf, &tt);
#else
    gmtime_r(&tt, &tm_buf);
#endif
    std::ostringstream ss;
    ss << std::put_time(&tm_buf, "%FT%TZ");
    return ss.str();
}

SyncStateEntry& EnsureEntry(const std::string& channel) {
    auto [it, inserted] = g_sync_state.emplace(channel, SyncStateEntry{});
    if (inserted) {
        it->second.channel = channel;
    }
    return it->second;
}

}  // namespace

SyncStateStore::SyncStateStore() {}
SyncStateStore::~SyncStateStore() {}

std::optional<SyncStateEntry> SyncStateStore::Find(const std::string& channel) {
    auto it = g_sync_state.find(channel);
    if (it == g_sync_state.end()) {
        return std::nullopt;
    }
    return it->second;
}

std::vector<SyncStateEntry> SyncStateStore::ListAll() {
    std::vector<SyncStateEntry> entries;
    entries.reserve(g_sync_state.size());
    for (const auto& [channel, entry] : g_sync_state) {
        (void)channel;
        entries.push_back(entry);
    }
    return entries;
}

void SyncStateStore::MarkAttempt(const std::string& channel, int backlog_count) {
    SyncStateEntry& entry = EnsureEntry(channel);
    entry.last_attempt_at = NowUtc();
    entry.backlog_count = backlog_count;
}

void SyncStateStore::MarkSuccess(const std::string& channel, int backlog_count) {
    SyncStateEntry& entry = EnsureEntry(channel);
    const std::string now = NowUtc();
    entry.last_attempt_at = now;
    entry.last_success_at = now;
    entry.last_error_code.clear();
    entry.backlog_count = backlog_count;
}

void SyncStateStore::MarkFailure(const std::string& channel,
                                 const std::string& error_code,
                                 int backlog_count) {
    SyncStateEntry& entry = EnsureEntry(channel);
    entry.last_attempt_at = NowUtc();
    entry.retry_count += 1;
    entry.last_error_code = error_code;
    entry.backlog_count = backlog_count;
}
