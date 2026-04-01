#include "IdempotencyService.h"
#include "../../Infrastructure/Persistence/MSSQL/Stores/RequestLedgerStore.h"

IdempotencyService::IdempotencyService(RequestLedgerStore* ledger)
    : ledger_(ledger)
{
}

IdempotencyService::CheckResult IdempotencyService::Check(
    const std::string& idempotency_key,
    const std::string& /*request_id*/)
{
    if (idempotency_key.empty()) {
        return CheckResult::NEW_REQUEST;
    }

    auto entry = ledger_->Find(idempotency_key);
    if (!entry.has_value()) {
        return CheckResult::NEW_REQUEST;
    }

    const auto& status = entry->status;
    if (status == "SUCCEEDED") {
        return CheckResult::DUPLICATE_SUCCESS;
    }
    if (status == "PROCESSING") {
        return CheckResult::IN_PROGRESS;
    }
    if (status == "FAILED") {
        return CheckResult::DUPLICATE_FAILED;
    }

    return CheckResult::NEW_REQUEST;
}

std::optional<std::string> IdempotencyService::GetPreviousResult(
    const std::string& idempotency_key)
{
    auto entry = ledger_->Find(idempotency_key);
    if (entry.has_value() && !entry->result_json.empty()) {
        return entry->result_json;
    }
    return std::nullopt;
}

void IdempotencyService::MarkProcessing(
    const std::string& idempotency_key,
    const std::string& request_id)
{
    ledger_->Upsert(idempotency_key, request_id, "PROCESSING", "");
}

void IdempotencyService::MarkSucceeded(
    const std::string& idempotency_key,
    const std::string& result_json)
{
    ledger_->UpdateStatus(idempotency_key, "SUCCEEDED", result_json);
}

void IdempotencyService::MarkFailed(
    const std::string& idempotency_key,
    const std::string& error_code)
{
    ledger_->UpdateStatus(idempotency_key, "FAILED", error_code);
}
