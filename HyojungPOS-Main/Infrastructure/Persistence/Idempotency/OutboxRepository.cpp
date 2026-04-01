#include "OutboxRepository.h"
// TODO: #include "../MSSQL/DBAccess.h"

#include <vector>
#include <chrono>
#include <sstream>
#include <iomanip>
#include <atomic>

// ──── 임시 In-Memory 구현 (MSSQL 연결 전까지) ────
static std::vector<OutboxEntry> s_outbox;
static std::atomic<int64_t> s_next_id{1};

static std::string NowUtc() {
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

OutboxRepository::OutboxRepository() {}
OutboxRepository::~OutboxRepository() {}

int64_t OutboxRepository::Insert(
    const std::string& channel,
    const std::string& payload_json)
{
    // TODO: INSERT INTO SyncOutbox (Channel, PayloadJson) VALUES (?, ?)
    int64_t id = s_next_id.fetch_add(1);
    std::string now = NowUtc();
    s_outbox.push_back({
        id, channel, payload_json, "PENDING", 0, "", now, now
    });
    return id;
}

std::vector<OutboxEntry> OutboxRepository::FindPending(int limit)
{
    // TODO: SELECT TOP(?) FROM SyncOutbox WHERE Status IN ('PENDING','FAILED_RETRYABLE') ORDER BY CreatedAt
    std::vector<OutboxEntry> result;
    for (const auto& entry : s_outbox) {
        if (entry.status == "PENDING" || entry.status == "FAILED_RETRYABLE") {
            result.push_back(entry);
            if (static_cast<int>(result.size()) >= limit) break;
        }
    }
    return result;
}

void OutboxRepository::UpdateStatus(
    int64_t id,
    const std::string& new_status,
    const std::string& error)
{
    // TODO: UPDATE SyncOutbox SET Status=?, LastError=?, RetryCount=RetryCount+1, UpdatedAt=SYSUTCDATETIME() WHERE Id=?
    for (auto& entry : s_outbox) {
        if (entry.id == id) {
            entry.status = new_status;
            if (!error.empty()) entry.last_error = error;
            entry.retry_count++;
            entry.updated_at = NowUtc();
            break;
        }
    }
}

int OutboxRepository::GetBacklogCount()
{
    // TODO: SELECT COUNT(*) FROM SyncOutbox WHERE Status IN ('PENDING','DISPATCHING','FAILED_RETRYABLE')
    int count = 0;
    for (const auto& entry : s_outbox) {
        if (entry.status == "PENDING" ||
            entry.status == "DISPATCHING" ||
            entry.status == "FAILED_RETRYABLE") {
            count++;
        }
    }
    return count;
}
