#pragma once
/**
 * UseCaseResult — 유스케이스 표준 결과 모델
 *
 * 모든 UseCase는 이 구조체를 반환한다.
 * Actions는 이 결과를 표준 JSON 응답으로 변환하여 UI에 전달한다.
 */

#include <string>

struct UseCaseResult {
    /** 성공 여부 */
    bool ok = false;

    /** 결과 코드 */
    std::string code;

    /** 성공 시: 응답 데이터 (JSON 문자열) */
    std::string data_json;

    /** 실패 시: 에러 메시지 */
    std::string error_message;

    /** 멱등성: 이전 실행 결과를 재사용한 경우 true */
    bool is_replay = false;

    // ──── 팩토리 메서드 ────

    static UseCaseResult Success(const std::string& data_json) {
        return { true, "OK", data_json, "", false };
    }

    static UseCaseResult Replay(const std::string& data_json) {
        return { true, "OK", data_json, "", true };
    }

    static UseCaseResult Fail(const std::string& code, const std::string& message) {
        return { false, code, "", message, false };
    }

    static UseCaseResult Busy(const std::string& message = "Operation in progress") {
        return { false, "BUSY", "", message, false };
    }

    static UseCaseResult IdempotencyConflict() {
        return { false, "IDEMPOTENCY_CONFLICT", "", "Duplicate request with different parameters", false };
    }
};
