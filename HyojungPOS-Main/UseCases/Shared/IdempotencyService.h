#pragma once
/**
 * IdempotencyService — 멱등성 검사 서비스
 *
 * 결제/주문/배달 수신은 requestId + idempotencyKey 기준으로 중복 여부를 판별한다.
 * 동일 idempotencyKey가 재수신되면 신규 실행 대신 기존 결과를 재반환한다.
 *
 * Ledger 최소 상태: RECEIVED, PROCESSING, SUCCEEDED, FAILED, COMPENSATED
 */

#include "UseCaseResult.h"

#include <string>
#include <optional>

// 전방 선언
class RequestLedgerRepository;

class IdempotencyService {
public:
    explicit IdempotencyService(RequestLedgerRepository* ledger);

    enum class CheckResult {
        NEW_REQUEST,         // 새 요청 → 정상 실행 진행
        DUPLICATE_SUCCESS,   // 이미 성공 → 기존 결과 재반환
        DUPLICATE_FAILED,    // 이미 실패 → 재시도 허용 여부 판단
        IN_PROGRESS,         // 현재 처리 중 → BUSY 반환
    };

    /**
     * 멱등성 검사
     * @param idempotency_key  멱등성 키
     * @param request_id       현재 요청 ID
     * @return 검사 결과
     */
    CheckResult Check(const std::string& idempotency_key,
                      const std::string& request_id);

    /**
     * 기존 성공 결과 조회 (DUPLICATE_SUCCESS 시 사용)
     */
    std::optional<std::string> GetPreviousResult(const std::string& idempotency_key);

    /**
     * 처리 시작 기록 (RECEIVED → PROCESSING)
     */
    void MarkProcessing(const std::string& idempotency_key,
                        const std::string& request_id);

    /**
     * 처리 완료 기록 (PROCESSING → SUCCEEDED)
     */
    void MarkSucceeded(const std::string& idempotency_key,
                       const std::string& result_json);

    /**
     * 처리 실패 기록 (PROCESSING → FAILED)
     */
    void MarkFailed(const std::string& idempotency_key,
                    const std::string& error_code);

private:
    RequestLedgerRepository* ledger_;  // non-owning
};
