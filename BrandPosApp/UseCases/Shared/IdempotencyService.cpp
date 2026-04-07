#include "IdempotencyService.h"
#include "../../Infrastructure/Persistence/MSSQL/Stores/RequestLedgerStore.h"

IdempotencyService::IdempotencyService(RequestLedgerStore* ledger)
    : ledger_(ledger)
{
}

IdempotencyService::CheckResult IdempotencyService::Check(
    const std::string& idempotencyKey,
    const std::string& /*requestId*/)
{
    if (idempotencyKey.empty()) {
        return CheckResult::NEW_REQUEST;
    }

    auto entry = ledger_->Find(idempotencyKey);
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
    const std::string& idempotencyKey)
{
    auto entry = ledger_->Find(idempotencyKey);
    if (entry.has_value() && !entry->resultJson.empty()) {
        return entry->resultJson;
    }
    return std::nullopt;
}

void IdempotencyService::MarkProcessing(
    const std::string& idempotencyKey,
    const std::string& requestId)
{
    ledger_->Upsert(idempotencyKey, requestId, "PROCESSING", "");
}

void IdempotencyService::MarkSucceeded(
    const std::string& idempotencyKey,
    const std::string& resultJson)
{
    ledger_->UpdateStatus(idempotencyKey, "SUCCEEDED", resultJson);
}

void IdempotencyService::MarkFailed(
    const std::string& idempotencyKey,
    const std::string& errorCode)
{
    ledger_->UpdateStatus(idempotencyKey, "FAILED", errorCode);
}
