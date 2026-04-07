#pragma once
/**
 * OperationLockService — 작업 단위별 락 서비스
 *
 * 설계 원칙 (8.5):
 * - 전역 단일 락 금지 — Payment, Order, Print를 분리된 락으로 관리
 * - 결제 중에도 테이블 조회는 허용
 * - 동일 요청 진행 중이면 BUSY 에러 즉시 반환
 * - std::atomic<bool>은 동일 프로세스 내 경합 제어용 (최종 근거는 Ledger)
 */

#include <atomic>
#include <string>
#include <unordered_map>
#include <mutex>

class OperationLockService {
public:
    static OperationLockService& Get();

    /**
     * 락 획득 시도
     * @param domain  "PAYMENT", "ORDER", "PRINT" 등
     * @param entityId  orderId, paymentId 등 (선택)
     * @return true 획득 성공, false 이미 잠김
     */
    bool TryAcquire(const std::string& domain, const std::string& entityId = "");

    /**
     * 락 해제
     */
    void Release(const std::string& domain, const std::string& entityId = "");

    /**
     * 현재 잠김 여부
     */
    bool IsLocked(const std::string& domain, const std::string& entityId = "") const;

    /** RAII 가드 */
    class Guard {
    public:
        Guard(OperationLockService& svc, const std::string& domain, const std::string& entityId = "");
        ~Guard();

        bool Acquired() const { return acquired_; }

        Guard(const Guard&) = delete;
        Guard& operator=(const Guard&) = delete;

    private:
        OperationLockService& svc_;
        std::string domain_;
        std::string entityId_;
        bool acquired_;
    };

private:
    OperationLockService() = default;

    std::string MakeKey(const std::string& domain, const std::string& entityId) const;

    mutable std::mutex mu_;
    std::unordered_map<std::string, bool> locks_;
};
