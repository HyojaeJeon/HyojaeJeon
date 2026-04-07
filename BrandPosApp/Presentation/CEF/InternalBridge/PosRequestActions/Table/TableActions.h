#pragma once
/**
 * TableActions — 테이블 요청 라우팅 (thin router)
 *
 * 책임: 요청 파싱, 파라미터 검증, UseCases 호출, 표준 응답 생성
 * 금지: 직접 SQL 실행, 여러 Manager 조합, 트랜잭션/락 관리
 */

#include <string>

class TableActions {
public:
    /**
     * 테이블 도메인 요청 처리
     * @param cmd            "TABLE:GET_ALL", "TABLE:SELECT"
     * @param params_json    요청 파라미터 JSON
     * @param request_id     요청 추적 ID
     * @param idempotency_key 멱등성 키
     * @return 표준 응답 JSON 문자열
     */
    static std::string Handle(
        const std::string& cmd,
        const std::string& params_json,
        const std::string& request_id,
        const std::string& idempotency_key);

private:
    static std::string HandleGetAll(
        const std::string& params_json,
        const std::string& request_id);

    static std::string HandleSelect(
        const std::string& params_json,
        const std::string& request_id,
        const std::string& idempotency_key);
};
