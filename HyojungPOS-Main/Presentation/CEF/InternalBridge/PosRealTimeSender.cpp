#include "PosRealTimeSender.h"
#include "../Handlers/CefBrowserDlg.h"

#include <sstream>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <atomic>

static std::atomic<int> s_event_counter{0};

PosRealTimeSender::PosRealTimeSender(CefBrowserDlg* browser_dlg)
    : browser_dlg_(browser_dlg)
{
}

std::string PosRealTimeSender::GenerateEventId()
{
    int seq = s_event_counter.fetch_add(1);
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
    std::tm tm_buf;
    localtime_s(&tm_buf, &tt);
    std::ostringstream ss;
    ss << std::put_time(&tm_buf, "%FT%T%z");
    return ss.str();
}

// ──────────────────────────────────────────────
// 핵심: UI에 CustomEvent 발송
// ──────────────────────────────────────────────
void PosRealTimeSender::SendToUI(
    const std::string& type,
    const std::string& payload_json,
    const std::string& request_id)
{
    if (!browser_dlg_) return;

    std::string rid = request_id.empty() ? GenerateEventId() : request_id;
    std::string ts = GetTimestamp();

    // JS 코드 생성: window.dispatchEvent(new CustomEvent('POS_NATIVE_EVENT', { detail: {...} }))
    std::ostringstream js;
    js << "window.dispatchEvent(new CustomEvent('POS_NATIVE_EVENT',{detail:"
       << "{\"v\":1"
       << ",\"requestId\":\"" << rid << "\""
       << ",\"timestamp\":\"" << ts << "\""
       << ",\"type\":\"" << type << "\""
       << ",\"payload\":" << payload_json
       << "}}));";

    // TODO: 로그 기록
    // Logger::Info("[PosRealTimeSender] type={} requestId={}", type, rid);

    browser_dlg_->ExecuteJavaScript(js.str());
}

// ──────────────────────────────────────────────
// 도메인별 래퍼
// ──────────────────────────────────────────────
void PosRealTimeSender::NotifyTableChanged(int floor_id)
{
    std::ostringstream payload;
    payload << "{\"floorId\":" << floor_id << "}";
    SendToUI("TABLE_REFRESH", payload.str());
}

void PosRealTimeSender::NotifyNewOrder(
    const std::string& order_id,
    const std::string& table_id)
{
    std::ostringstream payload;
    payload << "{\"orderId\":\"" << order_id
            << "\",\"tableId\":\"" << table_id << "\"}";
    SendToUI("ORDER_NEW", payload.str());
}

void PosRealTimeSender::NotifyPaymentComplete(
    const std::string& payment_id,
    const std::string& order_id)
{
    std::ostringstream payload;
    payload << "{\"paymentId\":\"" << payment_id
            << "\",\"orderId\":\"" << order_id << "\"}";
    SendToUI("PAYMENT_COMPLETE", payload.str());
}

void PosRealTimeSender::NotifySyncStatusChanged(
    int backlog_count,
    const std::string& last_error_code)
{
    std::ostringstream payload;
    payload << "{\"backlogCount\":" << backlog_count
            << ",\"lastErrorCode\":\"" << last_error_code << "\"}";
    SendToUI("SYNC_STATUS_CHANGED", payload.str());
}

void PosRealTimeSender::NotifyDeviceError(
    const std::string& device,
    const std::string& code,
    const std::string& msg_key,
    const std::string& severity,
    bool recoverable,
    bool retryable,
    const std::string& action)
{
    std::ostringstream payload;
    payload << "{\"type\":\"DEVICE_ERROR\""
            << ",\"device\":\"" << device << "\""
            << ",\"code\":\"" << code << "\""
            << ",\"msgKey\":\"" << msg_key << "\""
            << ",\"msgParams\":{}"
            << ",\"severity\":\"" << severity << "\""
            << ",\"recoverable\":" << (recoverable ? "true" : "false")
            << ",\"retryable\":" << (retryable ? "true" : "false")
            << ",\"action\":\"" << action << "\"}";
    SendToUI("DEVICE_ERROR", payload.str());
}
