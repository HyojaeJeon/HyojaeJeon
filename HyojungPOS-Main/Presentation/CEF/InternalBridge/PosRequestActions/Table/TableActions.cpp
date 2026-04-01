#include "TableActions.h"
#include "TableTypes.h"
// TODO: #include "UseCases/Table/SelectTableUseCase.h"
// TODO: #include "UseCases/Table/RefreshTablesUseCase.h"

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

// ──── 라우터 ────
std::string TableActions::Handle(
    const std::string& cmd,
    const std::string& params_json,
    const std::string& request_id,
    const std::string& idempotency_key)
{
    if (cmd == "TABLE:GET_ALL") {
        return HandleGetAll(params_json, request_id);
    }
    if (cmd == "TABLE:SELECT") {
        return HandleSelect(params_json, request_id, idempotency_key);
    }

    return MakeError(request_id, "UNKNOWN_TABLE_CMD", "Unknown table command: " + cmd);
}

// ──── TABLE:GET_ALL ────
std::string TableActions::HandleGetAll(
    const std::string& /*params_json*/,
    const std::string& request_id)
{
    // TODO: RefreshTablesUseCase::Run() 호출
    // 현재는 UseCases 미구현이므로 직접 Manager 호출 (임시)
    // auto result = RefreshTablesUseCase::Run(RequestContext{request_id});

    // 임시: DB 연결 전 하드코딩 응답 (Phase 4에서 UseCase 연결)
    std::string data = R"({
        "tables": [
            {"id":"T1","label":"1번","status":"EMPTY","orderSummary":"","totalAmount":0,"guests":0,"elapsedTimeMin":0},
            {"id":"T2","label":"2번","status":"EMPTY","orderSummary":"","totalAmount":0,"guests":0,"elapsedTimeMin":0},
            {"id":"T3","label":"3번","status":"EMPTY","orderSummary":"","totalAmount":0,"guests":0,"elapsedTimeMin":0},
            {"id":"T4","label":"4번","status":"EMPTY","orderSummary":"","totalAmount":0,"guests":0,"elapsedTimeMin":0}
        ]
    })";

    return MakeSuccess(request_id, data);
}

// ──── TABLE:SELECT ────
std::string TableActions::HandleSelect(
    const std::string& params_json,
    const std::string& request_id,
    const std::string& idempotency_key)
{
    // TODO: 파라미터 파싱 + SelectTableUseCase::Run() 호출
    // auto params = ParseSelectTableParams(params_json);
    // auto result = SelectTableUseCase::Run(RequestContext{request_id, idempotency_key}, params.table_id);

    // 임시 응답
    return MakeSuccess(request_id, R"({"tableId":"T1","status":"OCCUPIED"})");
}
