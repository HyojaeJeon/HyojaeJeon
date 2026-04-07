#pragma once
/**
 * LoginUseCase — 로그인 유스케이스
 *
 * 책임:
 *   1. 중앙서버 인증 API 호출 (온라인)
 *   2. 인증 성공 → SQLite에 세션 저장 (오프라인 복구용)
 *   3. 오프라인 시 → SQLite 캐시로 로컬 인증
 *   4. 세션 데이터 반환
 *
 * 금지:
 *   - UI 이벤트 직접 송신 (UseCases가 PosRealTimeSender 호출 권한 보유)
 *   - 여기서는 로그인이 단순 요청/응답이므로 실시간 이벤트 불필요
 */

#include "Presentation/CEF/InternalBridge/PosRequestActions/Auth/AuthTypes.h"
#include "UseCases/Shared/UseCaseResult.h"

class LoginUseCase {
public:
    /**
     * 로그인 실행
     * @param req  로그인 요청 (사원번호, 비밀번호, 시작금액)
     * @return UseCaseResult (성공 시 AuthSession JSON, 실패 시 에러)
     */
    static UseCaseResult Run(const LoginRequest& req);

private:
    /** 중앙서버 인증 API 호출 */
    static bool AuthenticateWithServer(
        const std::string& employeeId,
        const std::string& password,
        AuthSession& outSession);

    /** SQLite 캐시 인증 (오프라인 폴백) */
    static bool AuthenticateWithCache(
        const std::string& employeeId,
        const std::string& password,
        AuthSession& outSession);

    /** SQLite에 세션 저장 */
    static void SaveSessionToDb(const AuthSession& session);

    /** SQLite에서 세션 삭제 */
    static void ClearSessionFromDb();
};
