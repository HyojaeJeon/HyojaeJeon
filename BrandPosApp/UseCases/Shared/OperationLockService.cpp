#include "OperationLockService.h"

OperationLockService& OperationLockService::Get()
{
    static OperationLockService instance;
    return instance;
}

std::string OperationLockService::MakeKey(
    const std::string& domain,
    const std::string& entityId) const
{
    if (entityId.empty()) return domain;
    return domain + ":" + entityId;
}

bool OperationLockService::TryAcquire(
    const std::string& domain,
    const std::string& entityId)
{
    std::lock_guard<std::mutex> lock(mu_);
    std::string key = MakeKey(domain, entityId);

    auto it = locks_.find(key);
    if (it != locks_.end() && it->second) {
        return false;  // 이미 잠김
    }

    locks_[key] = true;
    return true;
}

void OperationLockService::Release(
    const std::string& domain,
    const std::string& entityId)
{
    std::lock_guard<std::mutex> lock(mu_);
    std::string key = MakeKey(domain, entityId);
    locks_[key] = false;
}

bool OperationLockService::IsLocked(
    const std::string& domain,
    const std::string& entityId) const
{
    std::lock_guard<std::mutex> lock(mu_);
    std::string key = MakeKey(domain, entityId);
    auto it = locks_.find(key);
    return it != locks_.end() && it->second;
}

// ──── RAII Guard ────
OperationLockService::Guard::Guard(
    OperationLockService& svc,
    const std::string& domain,
    const std::string& entityId)
    : svc_(svc), domain_(domain), entityId_(entityId)
{
    acquired_ = svc_.TryAcquire(domain_, entityId_);
}

OperationLockService::Guard::~Guard()
{
    if (acquired_) {
        svc_.Release(domain_, entityId_);
    }
}
