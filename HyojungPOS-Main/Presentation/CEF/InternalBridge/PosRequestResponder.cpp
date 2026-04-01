#include "PosRequestResponder.h"
#include "PosRequestActions/Table/TableActions.h"
#include "PosRequestActions/System/SystemActions.h"
// #include "PosRequestActions/Order/OrderActions.h"
// #include "PosRequestActions/Payment/PaymentActions.h"

// JSON 파싱은 nlohmann/json 사용 (SharedCpp/Foundation에 배치 예정)
// 현재는 경량 파싱으로 구현
#include <sstream>
#include <chrono>
#include <ctime>
#include <iomanip>

// 간이 JSON 값 추출 (nlohmann/json 도입 전까지 임시)
static std::string ExtractJsonString(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    auto pos = json.find(search);
    if (pos == std::string::npos) return "";

    auto colon = json.find(':', pos + search.size());
    if (colon == std::string::npos) return "";

    auto quote_start = json.find('"', colon + 1);
    if (quote_start == std::string::npos) return "";

    auto quote_end = json.find('"', quote_start + 1);
    if (quote_end == std::string::npos) return "";

    return json.substr(quote_start + 1, quote_end - quote_start - 1);
}

static int ExtractJsonInt(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    auto pos = json.find(search);
    if (pos == std::string::npos) return -1;

    auto colon = json.find(':', pos + search.size());
    if (colon == std::string::npos) return -1;

    auto start = json.find_first_of("-0123456789", colon + 1);
    if (start == std::string::npos) return -1;

    auto end = json.find_first_not_of("-0123456789", start);
    return std::stoi(json.substr(start, end - start));
}

static std::string ExtractJsonObject(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    auto pos = json.find(search);
    if (pos == std::string::npos) return "{}";

    auto brace = json.find('{', pos + search.size());
    if (brace == std::string::npos) return "{}";

    int depth = 0;
    for (size_t i = brace; i < json.size(); ++i) {
        if (json[i] == '{') depth++;
        if (json[i] == '}') depth--;
        if (depth == 0) return json.substr(brace, i - brace + 1);
    }
    return "{}";
}

static std::string GetTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf;
    localtime_s(&tm_buf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tm_buf, "%FT%T%z");
    return ss.str();
}

// ──────────────────────────────────────────────
// HandleRequest
// ──────────────────────────────────────────────
void PosRequestResponder::HandleRequest(
    const std::string& request_json,
    std::function<void(const std::string&)> on_success,
    std::function<void(int, const std::string&)> on_failure)
{
    // 1. 버전 검사
    int v = ExtractJsonInt(request_json, "v");
    if (v != PROTOCOL_VERSION) {
        on_success(MakeErrorResponse("", "VERSION_MISMATCH",
            "Expected v=" + std::to_string(PROTOCOL_VERSION) +
            ", got v=" + std::to_string(v)));
        return;
    }

    // 2. 필수 필드 추출
    std::string request_id = ExtractJsonString(request_json, "requestId");
    std::string cmd = ExtractJsonString(request_json, "cmd");
    std::string idempotency_key = ExtractJsonString(request_json, "idempotencyKey");
    std::string params_json = ExtractJsonObject(request_json, "params");

    if (cmd.empty()) {
        on_success(MakeErrorResponse(request_id, "INVALID_REQUEST", "cmd is required"));
        return;
    }

    // 3. 라우팅
    std::string response = RouteCommand(cmd, params_json, request_id, idempotency_key);
    on_success(response);
}

// ──────────────────────────────────────────────
// RouteCommand — thin router
// ──────────────────────────────────────────────
std::string PosRequestResponder::RouteCommand(
    const std::string& cmd,
    const std::string& params_json,
    const std::string& request_id,
    const std::string& idempotency_key)
{
    // 도메인 접두사로 1차 분기
    if (cmd.find("TABLE:") == 0) {
        return TableActions::Handle(cmd, params_json, request_id, idempotency_key);
    }
    if (cmd.find("SYSTEM:") == 0) {
        return SystemActions::Handle(cmd, params_json, request_id, idempotency_key);
    }
    // TODO: ORDER:, PAYMENT: 라우팅 추가
    // if (cmd.find("ORDER:") == 0) {
    //     return OrderActions::Handle(cmd, params_json, request_id, idempotency_key);
    // }
    // if (cmd.find("PAYMENT:") == 0) {
    //     return PaymentActions::Handle(cmd, params_json, request_id, idempotency_key);
    // }

    return MakeErrorResponse(request_id, "UNKNOWN_CMD", "Unknown command: " + cmd);
}

// ──────────────────────────────────────────────
// 응답 포맷팅
// ──────────────────────────────────────────────
std::string PosRequestResponder::MakeSuccessResponse(
    const std::string& request_id,
    const std::string& data_json)
{
    std::ostringstream ss;
    ss << R"({"v":)" << PROTOCOL_VERSION
       << R"(,"requestId":")" << request_id
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":true,"code":"OK","data":)" << data_json
       << "}";
    return ss.str();
}

std::string PosRequestResponder::MakeErrorResponse(
    const std::string& request_id,
    const std::string& code,
    const std::string& message)
{
    std::ostringstream ss;
    ss << R"({"v":)" << PROTOCOL_VERSION
       << R"(,"requestId":")" << request_id
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":false,"code":")" << code
       << R"(","error":{"message":")" << message
       << R"("}})";
    return ss.str();
}
