#pragma once

#include <optional>
#include <string>
#include <vector>

struct SyncStateEntry {
    std::string channel;
    std::string lastAttemptAt;
    std::string lastSuccessAt;
    int retryCount = 0;
    std::string lastErrorCode;
    int backlogCount = 0;
};

class SyncStateStore {
public:
    SyncStateStore();
    ~SyncStateStore();

    std::optional<SyncStateEntry> Find(const std::string& channel);
    std::vector<SyncStateEntry> ListAll();

    void MarkAttempt(const std::string& channel, int backlogCount);
    void MarkSuccess(const std::string& channel, int backlogCount);
    void MarkFailure(const std::string& channel,
                     const std::string& errorCode,
                     int backlogCount);
};
