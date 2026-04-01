#include "SystemActions.h"
#include "SystemTypes.h"
// TODO: #include "UseCases/System/LoadBootstrapDataUseCase.h"

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
    const std::string& /*params_json*/,
    const std::string& request_id,
    const std::string& /*idempotency_key*/)
{
    if (cmd == "SYSTEM:BOOTSTRAP") {
        return HandleBootstrap(request_id);
    }

    return MakeError(request_id, "UNKNOWN_SYSTEM_CMD", "Unknown system command: " + cmd);
}

std::string SystemActions::HandleBootstrap(const std::string& request_id)
{
    // TODO: LoadBootstrapDataUseCase::Run() 호출
    // 현재는 시스템 정보 직접 수집 (Phase 4에서 UseCase 연결)

    std::string data = R"({
        "posId": "POS-001",
        "storeName": "효정 테스트 매장",
        "operatorId": "admin",
        "dbConnected": true,
        "internetConnected": true,
        "mqttConnected": false,
        "paymentGatewayConnected": false,
        "printerConnected": false,
        "syncBacklogCount": 0
    })";

    return MakeSuccess(request_id, data);
}
