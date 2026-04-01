#include "RequestLedgerRepository.h"
// TODO: #include "../MSSQL/DBAccess.h"

#include <unordered_map>
#include <chrono>
#include <sstream>
#include <iomanip>

// ──── 임시 In-Memory 구현 (MSSQL 연결 전까지) ────
static std::unordered_map<std::string, LedgerEntry> s_ledger;

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

RequestLedgerRepository::RequestLedgerRepository() {}
RequestLedgerRepository::~RequestLedgerRepository() {}

std::optional<LedgerEntry> RequestLedgerRepository::Find(
    const std::string& idempotency_key)
{
    // TODO: SELECT FROM IdempotencyLedger WHERE IdempotencyKey = ?
    auto it = s_ledger.find(idempotency_key);
    if (it == s_ledger.end()) return std::nullopt;
    return it->second;
}

void RequestLedgerRepository::Upsert(
    const std::string& idempotency_key,
    const std::string& request_id,
    const std::string& status,
    const std::string& result_json)
{
    // TODO: MERGE INTO IdempotencyLedger ...
    std::string now = NowUtc();
    auto it = s_ledger.find(idempotency_key);
    if (it == s_ledger.end()) {
        s_ledger[idempotency_key] = {
            idempotency_key, request_id, status, result_json, now, now
        };
    } else {
        it->second.request_id = request_id;
        it->second.status = status;
        it->second.result_json = result_json;
        it->second.updated_at = now;
    }
}

void RequestLedgerRepository::UpdateStatus(
    const std::string& idempotency_key,
    const std::string& new_status,
    const std::string& result_json)
{
    // TODO: UPDATE IdempotencyLedger SET Status=?, ResultJson=?, UpdatedAt=SYSUTCDATETIME() WHERE IdempotencyKey=?
    auto it = s_ledger.find(idempotency_key);
    if (it != s_ledger.end()) {
        it->second.status = new_status;
        if (!result_json.empty()) {
            it->second.result_json = result_json;
        }
        it->second.updated_at = NowUtc();
    }
}

std::vector<LedgerEntry> RequestLedgerRepository::FindStaleProcessing(int /*timeout_seconds*/)
{
    // TODO: SELECT FROM IdempotencyLedger WHERE Status='PROCESSING' AND UpdatedAt < DATEADD(SECOND, -?, SYSUTCDATETIME())
    std::vector<LedgerEntry> stale;
    for (const auto& [key, entry] : s_ledger) {
        if (entry.status == "PROCESSING") {
            stale.push_back(entry);
        }
    }
    return stale;
}
