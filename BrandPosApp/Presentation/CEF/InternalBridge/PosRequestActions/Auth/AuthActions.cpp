#include "AuthActions.h"
#include "AuthTypes.h"
#include "UseCases/Auth/LoginUseCase.h"
#include "UseCases/Shared/UseCaseResult.h"

#include <sstream>
#include <chrono>
#include <iomanip>

// third-party JSON (nlohmann/json 또는 프로젝트 공용 JSON 파서)
// TODO: 프로젝트 JSON 라이브러리 통일 후 교체
#include "nlohmann/json.hpp"
using json = nlohmann::json;

static std::string GetTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf;
    localtime_s(&tm_buf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tm_buf, "%FT%T%z");
    return ss.str();
}

static std::string MakeSuccess(const std::string& requestId, const std::string& data) {
    std::ostringstream ss;
    ss << R"({"v":1,"requestId":")" << requestId
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":true,"code":"OK","data":)" << data << "}";
    return ss.str();
}

static std::string MakeError(const std::string& requestId,
                              const std::string& code,
                              const std::string& msg) {
    std::ostringstream ss;
    ss << R"({"v":1,"requestId":")" << requestId
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":false,"code":")" << code
       << R"(","error":{"message":")" << msg << R"("}})";
    return ss.str();
}

std::string AuthActions::Handle(
    const std::string& cmd,
    const std::string& paramsJson,
    const std::string& requestId,
    const std::string& /*idempotencyKey*/)
{
    if (cmd == "AUTH:LOGIN") {
        return HandleLogin(paramsJson, requestId);
    }
    if (cmd == "AUTH:LOGOUT") {
        return HandleLogout(requestId);
    }

    return MakeError(requestId, "UNKNOWN_AUTH_CMD", "Unknown auth command: " + cmd);
}

std::string AuthActions::HandleLogin(
    const std::string& paramsJson,
    const std::string& requestId)
{
    // 파라미터 파싱
    LoginRequest req;
    try {
        auto j = json::parse(paramsJson);
        req.employeeId = j.value("employeeId", "");
        req.password = j.value("password", "");
        req.depositAmount = j.value("depositAmount", 0);
    } catch (...) {
        return MakeError(requestId, "INVALID_PARAMS", "잘못된 요청 파라미터입니다");
    }

    // 파라미터 검증
    if (req.employeeId.empty()) {
        return MakeError(requestId, "MISSING_EMPLOYEE_ID", "사원번호를 입력해주세요");
    }
    if (req.password.empty()) {
        return MakeError(requestId, "MISSING_PASSWORD", "비밀번호를 입력해주세요");
    }

    // UseCase 호출
    UseCaseResult result = LoginUseCase::Run(req);

    if (result.ok) {
        return MakeSuccess(requestId, result.dataJson);
    }
    return MakeError(requestId, result.code, result.errorMessage);
}

std::string AuthActions::HandleLogout(const std::string& requestId)
{
    // TODO: LogoutUseCase::Run() — SQLite 세션 삭제
    // 현재는 세션만 클리어
    return MakeSuccess(requestId, "null");
}
