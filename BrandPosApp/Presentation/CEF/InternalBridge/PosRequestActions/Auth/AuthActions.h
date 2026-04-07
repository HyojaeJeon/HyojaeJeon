#pragma once
/**
 * AuthActions — 인증 요청 라우팅 (thin router)
 *
 * 역할: 요청 파싱, 파라미터 검증, UseCase 호출, 응답 포맷팅
 *
 * 금지:
 *   - 직접 SQL 실행
 *   - 직접 HTTP 호출
 *   - 트랜잭션/락/멱등성 처리 (UseCases 담당)
 */

#include <string>

class AuthActions {
public:
    static std::string Handle(
        const std::string& cmd,
        const std::string& paramsJson,
        const std::string& requestId,
        const std::string& idempotencyKey);

private:
    static std::string HandleLogin(
        const std::string& paramsJson,
        const std::string& requestId);

    static std::string HandleLogout(
        const std::string& requestId);
};
