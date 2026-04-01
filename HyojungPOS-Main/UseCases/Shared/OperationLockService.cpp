#include "OperationLockService.h"

OperationLockService& OperationLockService::Get()
{
    static OperationLockService instance;
    return instance;
}

std::string OperationLockService::MakeKey(
    const std::string& domain,
    const std::string& entity_id) const
{
    if (entity_id.empty()) return domain;
    return domain + ":" + entity_id;
}

bool OperationLockService::TryAcquire(
    const std::string& domain,
    const std::string& entity_id)
{
    std::lock_guard<std::mutex> lock(mu_);
    std::string key = MakeKey(domain, entity_id);

    auto it = locks_.find(key);
    if (it != locks_.end() && it->second) {
        return false;  // 이미 잠김
    }

    locks_[key] = true;
    return true;
}

void OperationLockService::Release(
    const std::string& domain,
    const std::string& entity_id)
{
    std::lock_guard<std::mutex> lock(mu_);
    std::string key = MakeKey(domain, entity_id);
    locks_[key] = false;
}

bool OperationLockService::IsLocked(
    const std::string& domain,
    const std::string& entity_id) const
{
    std::lock_guard<std::mutex> lock(mu_);
    std::string key = MakeKey(domain, entity_id);
    auto it = locks_.find(key);
    return it != locks_.end() && it->second;
}

// ──── RAII Guard ────
OperationLockService::Guard::Guard(
    OperationLockService& svc,
    const std::string& domain,
    const std::string& entity_id)
    : svc_(svc), domain_(domain), entity_id_(entity_id)
{
    acquired_ = svc_.TryAcquire(domain_, entity_id_);
}

OperationLockService::Guard::~Guard()
{
    if (acquired_) {
        svc_.Release(domain_, entity_id_);
    }
}
