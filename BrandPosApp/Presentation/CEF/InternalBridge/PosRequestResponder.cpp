#include "PosRequestResponder.h"
#include "PosRequestActions/Table/TableActions.h"
#include "PosRequestActions/System/SystemActions.h"
#include "PosRequestActions/Auth/AuthActions.h"
// #include "PosRequestActions/Order/OrderActions.h"
// #include "PosRequestActions/Payment/PaymentActions.h"

// JSON 파싱은 nlohmann/json 사용 (SharedKernel/Foundation에 배치 예정)
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

    auto quoteStart = json.find('"', colon + 1);
    if (quoteStart == std::string::npos) return "";

    auto quoteEnd = json.find('"', quoteStart + 1);
    if (quoteEnd == std::string::npos) return "";

    return json.substr(quoteStart + 1, quoteEnd - quoteStart - 1);
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
    std::tm tmBuf;
    localtime_s(&tmBuf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tmBuf, "%FT%T%z");
    return ss.str();
}

// ──────────────────────────────────────────────
// HandleRequest
// ──────────────────────────────────────────────
void PosRequestResponder::HandleRequest(
    const std::string& requestJson,
    std::function<void(const std::string&)> onSuccess,
    std::function<void(int, const std::string&)> onFailure)
{
    // 1. 버전 검사
    int v = ExtractJsonInt(requestJson, "v");
    if (v != PROTOCOL_VERSION) {
        onSuccess(MakeErrorResponse("", "VERSION_MISMATCH",
            "Expected v=" + std::to_string(PROTOCOL_VERSION) +
            ", got v=" + std::to_string(v)));
        return;
    }

    // 2. 필수 필드 추출
    std::string requestId = ExtractJsonString(requestJson, "requestId");
    std::string cmd = ExtractJsonString(requestJson, "cmd");
    std::string idempotencyKey = ExtractJsonString(requestJson, "idempotencyKey");
    std::string paramsJson = ExtractJsonObject(requestJson, "params");

    if (cmd.empty()) {
        onSuccess(MakeErrorResponse(requestId, "INVALID_REQUEST", "cmd is required"));
        return;
    }

    // 3. 라우팅
    std::string response = RouteCommand(cmd, paramsJson, requestId, idempotencyKey);
    onSuccess(response);
}

// ──────────────────────────────────────────────
// RouteCommand — thin router
// ──────────────────────────────────────────────
std::string PosRequestResponder::RouteCommand(
    const std::string& cmd,
    const std::string& paramsJson,
    const std::string& requestId,
    const std::string& idempotencyKey)
{
    // 도메인 접두사로 1차 분기
    if (cmd.find("TABLE:") == 0) {
        return TableActions::Handle(cmd, paramsJson, requestId, idempotencyKey);
    }
    if (cmd.find("SYSTEM:") == 0) {
        return SystemActions::Handle(cmd, paramsJson, requestId, idempotencyKey);
    }
    if (cmd.find("AUTH:") == 0) {
        return AuthActions::Handle(cmd, paramsJson, requestId, idempotencyKey);
    }
    // TODO: ORDER:, PAYMENT: 라우팅 추가
    // if (cmd.find("ORDER:") == 0) {
    //     return OrderActions::Handle(cmd, paramsJson, requestId, idempotencyKey);
    // }
    // if (cmd.find("PAYMENT:") == 0) {
    //     return PaymentActions::Handle(cmd, paramsJson, requestId, idempotencyKey);
    // }

    return MakeErrorResponse(requestId, "UNKNOWN_CMD", "Unknown command: " + cmd);
}

// ──────────────────────────────────────────────
// 응답 포맷팅
// ──────────────────────────────────────────────
std::string PosRequestResponder::MakeSuccessResponse(
    const std::string& requestId,
    const std::string& dataJson)
{
    std::ostringstream ss;
    ss << R"({"v":)" << PROTOCOL_VERSION
       << R"(,"requestId":")" << requestId
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":true,"code":"OK","data":)" << dataJson
       << "}";
    return ss.str();
}

std::string PosRequestResponder::MakeErrorResponse(
    const std::string& requestId,
    const std::string& code,
    const std::string& message)
{
    std::ostringstream ss;
    ss << R"({"v":)" << PROTOCOL_VERSION
       << R"(,"requestId":")" << requestId
       << R"(","timestamp":")" << GetTimestamp()
       << R"(","ok":false,"code":")" << code
       << R"(","error":{"message":")" << message
       << R"("}})";
    return ss.str();
}
