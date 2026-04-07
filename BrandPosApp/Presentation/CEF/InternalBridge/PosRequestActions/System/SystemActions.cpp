#include "SystemActions.h"
#include "SystemTypes.h"
#include "Infrastructure/Persistence/SQLite/AuthSessionStore.h"
#include "Infrastructure/Persistence/SQLite/LocalSettingStore.h"
#include "Presentation/CEF/InternalBridge/PosRequestActions/Auth/AuthTypes.h"

#include <sstream>
#include <chrono>
#include <ctime>
#include <iomanip>

static std::string GetTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf;
    localtime_s(&tm_buf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tm_buf, "%FT%T%z");
    return ss.str();
}

static std::string MakeSuccess(const std::string& request_id, const std::string& data) {
    std::ostringstream ss;
    ss << R"({"v":1,"requestId":")" << request_id
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":true,"code":"OK","data":)" << data << "}";
    return ss.str();
}

static std::string MakeError(const std::string& request_id,
                              const std::string& code,
                              const std::string& msg) {
    std::ostringstream ss;
    ss << R"({"v":1,"requestId":")" << request_id
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":false,"code":")" << code
       << R"(","error":{"message":")" << msg << R"("}})";
    return ss.str();
}

std::string SystemActions::Handle(
    const std::string& cmd,
    const std::string& params_json,
    const std::string& request_id,
    const std::string& /*idempotency_key*/)
{
    if (cmd == "SYSTEM:BOOTSTRAP") {
        return HandleBootstrap(request_id);
    }
    if (cmd == "SYSTEM:SET_THEME") {
        return HandleSetTheme(params_json, request_id);
    }

    return MakeError(request_id, "UNKNOWN_SYSTEM_CMD", "Unknown system command: " + cmd);
}

std::string SystemActions::HandleBootstrap(const std::string& request_id)
{
    // TODO: LoadBootstrapDataUseCase::Run() 호출
    // 현재는 시스템 정보 직접 수집 + SQLite 세션 로드

    // SQLite에서 마지막 세션 로드
    AuthSession session;
    bool hasSession = AuthSessionStore::LoadLastSession(session);

    std::string sessionJson = hasSession ? session.ToJson() : "null";

    // SQLite LocalSetting에서 테마 로드
    std::string theme = LocalSettingStore::Get("theme", "light");

    std::ostringstream data;
    data << R"({)"
         << R"("posId":"POS-001",)"
         << R"("storeName":"효정 테스트 매장",)"
         << R"("dbConnected":true,)"
         << R"("internetConnected":true,)"
         << R"("mqttConnected":false,)"
         << R"("printerConnected":false,)"
         << R"("syncBacklogCount":0,)"
         << R"("session":)" << sessionJson << ","
         << R"("theme":")" << theme << R"(")"
         << "}";

    return MakeSuccess(request_id, data.str());
}

std::string SystemActions::HandleSetTheme(
    const std::string& params_json,
    const std::string& request_id)
{
    // 파라미터에서 theme 추출
    std::string theme = "light";
    auto pos = params_json.find("\"theme\"");
    if (pos != std::string::npos) {
        auto valStart = params_json.find('"', params_json.find(':', pos) + 1);
        auto valEnd = params_json.find('"', valStart + 1);
        if (valStart != std::string::npos && valEnd != std::string::npos) {
            theme = params_json.substr(valStart + 1, valEnd - valStart - 1);
        }
    }

    // SQLite LocalSetting에 영구 저장
    LocalSettingStore::Set("theme", theme);

    std::ostringstream data;
    data << R"({"theme":")" << theme << R"("})";
    return MakeSuccess(request_id, data.str());
}
