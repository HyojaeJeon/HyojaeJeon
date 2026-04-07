#include "LoginUseCase.h"
#include "Infrastructure/HTTP/CentralApiClient.h"
#include "Infrastructure/Persistence/SQLite/AuthSessionStore.h"

#include <chrono>
#include <sstream>
#include <iomanip>

static std::string NowISO8601() {
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf;
    localtime_s(&tm_buf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tm_buf, "%FT%T%z");
    return ss.str();
}

UseCaseResult LoginUseCase::Run(const LoginRequest& req)
{
    AuthSession session;

    // 1. 온라인 인증 시도 (중앙서버 API)
    bool online = AuthenticateWithServer(req.employeeId, req.password, session);

    if (online) {
        // 2. 인증 성공 → SQLite에 세션 + 비밀번호 해시 저장
        session.loginAt = NowISO8601();
        SaveSessionToDb(session);
        AuthSessionStore::SavePasswordHash(req.employeeId, req.password);
        return UseCaseResult::Success(session.ToJson());
    }

    // 3. 온라인 실패 → 오프라인 캐시 인증 시도
    bool cached = AuthenticateWithCache(req.employeeId, req.password, session);

    if (cached) {
        session.loginAt = NowISO8601();
        SaveSessionToDb(session);
        return UseCaseResult::Success(session.ToJson());
    }

    // 4. 둘 다 실패
    return UseCaseResult::Fail("AUTH_FAILED",
        "사원번호 또는 비밀번호가 일치하지 않습니다");
}

bool LoginUseCase::AuthenticateWithServer(
    const std::string& employeeId,
    const std::string& password,
    AuthSession& outSession)
{
    // Infrastructure/HTTP 계층 호출
    return CentralApiClient::Login(employeeId, password, outSession);
}

bool LoginUseCase::AuthenticateWithCache(
    const std::string& employeeId,
    const std::string& password,
    AuthSession& outSession)
{
    // Infrastructure/Persistence/SQLite 계층 호출
    return AuthSessionStore::VerifyCredentials(employeeId, password, outSession);
}

void LoginUseCase::SaveSessionToDb(const AuthSession& session)
{
    AuthSessionStore::SaveSession(session);
}

void LoginUseCase::ClearSessionFromDb()
{
    AuthSessionStore::ClearSession();
}
