#pragma once

#include <optional>
#include <string>
#include <vector>

struct SyncStateEntry {
    std::string channel;
    std::string last_attempt_at;
    std::string last_success_at;
    int retry_count = 0;
    std::string last_error_code;
    int backlog_count = 0;
};

class SyncStateStore {
public:
    SyncStateStore();
    ~SyncStateStore();

    std::optional<SyncStateEntry> Find(const std::string& channel);
    std::vector<SyncStateEntry> ListAll();

    void MarkAttempt(const std::string& channel, int backlog_count);
    void MarkSuccess(const std::string& channel, int backlog_count);
    void MarkFailure(const std::string& channel,
                     const std::string& error_code,
                     int backlog_count);
};
