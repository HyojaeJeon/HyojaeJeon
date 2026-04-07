#include "PosRealTimeSender.h"
#include "../Handlers/CefBrowserDlg.h"

#include <sstream>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <atomic>

static std::atomic<int> sEventCounter{0};

PosRealTimeSender::PosRealTimeSender(CefBrowserDlg* browserDlg)
    : browserDlg_(browserDlg)
{
}

std::string PosRealTimeSender::GenerateEventId()
{
    int seq = sEventCounter.fetch_add(1);
    auto now = std::chrono::system_clock::now();
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        now.time_since_epoch()).count();
    std::ostringstream ss;
    ss << "evt-" << ms << "-" << seq;
    return ss.str();
}

std::string PosRealTimeSender::GetTimestamp()
{
    auto now = std::chrono::system_clock::now();
    auto tt = std::chrono::system_clock::to_time_t(now);
    std::tm tmBuf;
    localtime_s(&tmBuf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tmBuf, "%FT%T%z");
    return ss.str();
}

// ──────────────────────────────────────────────
// 핵심: UI에 CustomEvent 발송
// ──────────────────────────────────────────────
void PosRealTimeSender::SendToUI(
    const std::string& type,
    const std::string& payloadJson,
    const std::string& requestId)
{
    if (!browserDlg_) return;

    std::string rid = requestId.empty() ? GenerateEventId() : requestId;
    std::string ts = GetTimestamp();

    // JS 코드 생성: window.dispatchEvent(new CustomEvent('POS_NATIVE_EVENT', { detail: {...} }))
    std::ostringstream js;
    js << "window.dispatchEvent(new CustomEvent('POS_NATIVE_EVENT',{detail:"
       << "{\"v\":1"
       << ",\"requestId\":\"" << rid << "\""
       << ",\"timestamp\":\"" << ts << "\""
       << ",\"type\":\"" << type << "\""
       << ",\"payload\":" << payloadJson
       << "}}));";

    // TODO: 로그 기록
    // Logger::Info("[PosRealTimeSender] type={} requestId={}", type, rid);

    browserDlg_->ExecuteJavaScript(js.str());
}

// ──────────────────────────────────────────────
// 도메인별 래퍼
// ──────────────────────────────────────────────
void PosRealTimeSender::NotifyTableChanged(int floorId)
{
    std::ostringstream payload;
    payload << "{\"floorId\":" << floorId << "}";
    SendToUI("TABLE_REFRESH", payload.str());
}

void PosRealTimeSender::NotifyNewOrder(
    const std::string& orderId,
    const std::string& tableId)
{
    std::ostringstream payload;
    payload << "{\"orderId\":\"" << orderId
            << "\",\"tableId\":\"" << tableId << "\"}";
    SendToUI("ORDER_NEW", payload.str());
}

void PosRealTimeSender::NotifyPaymentComplete(
    const std::string& paymentId,
    const std::string& orderId)
{
    std::ostringstream payload;
    payload << "{\"paymentId\":\"" << paymentId
            << "\",\"orderId\":\"" << orderId << "\"}";
    SendToUI("PAYMENT_COMPLETE", payload.str());
}

void PosRealTimeSender::NotifySyncStatusChanged(
    int backlogCount,
    const std::string& lastErrorCode)
{
    std::ostringstream payload;
    payload << "{\"backlogCount\":" << backlogCount
            << ",\"lastErrorCode\":\"" << lastErrorCode << "\"}";
    SendToUI("SYNC_STATUS_CHANGED", payload.str());
}

void PosRealTimeSender::NotifyDeviceError(
    const std::string& device,
    const std::string& code,
    const std::string& msgKey,
    const std::string& severity,
    bool recoverable,
    bool retryable,
    const std::string& action)
{
    std::ostringstream payload;
    payload << "{\"type\":\"DEVICE_ERROR\""
            << ",\"device\":\"" << device << "\""
            << ",\"code\":\"" << code << "\""
            << ",\"msgKey\":\"" << msgKey << "\""
            << ",\"msgParams\":{}"
            << ",\"severity\":\"" << severity << "\""
            << ",\"recoverable\":" << (recoverable ? "true" : "false")
            << ",\"retryable\":" << (retryable ? "true" : "false")
            << ",\"action\":\"" << action << "\"}";
    SendToUI("DEVICE_ERROR", payload.str());
}
