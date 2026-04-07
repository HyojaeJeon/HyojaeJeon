#pragma once
/**
 * PosRealTimeSender — C++ → UI 실시간 이벤트 송신 단일 창구
 *
 * UseCases만 이 클래스를 호출할 수 있다.
 * Manager/ExternalBridge에서 직접 호출 금지.
 *
 * 이벤트 규격: { v, requestId, timestamp, type, payload }
 * 내부에서 CefPostTask로 UI 스레드 전환을 보장한다.
 */

#include <string>

// 전방 선언
class CefBrowserDlg;

class PosRealTimeSender {
public:
    explicit PosRealTimeSender(CefBrowserDlg* browserDlg);

    /**
     * UI에 이벤트를 방송한다.
     * 어떤 스레드에서 호출해도 안전하다 (내부에서 UI 스레드로 전환).
     *
     * @param type       이벤트 타입 (TABLE_REFRESH, ORDER_NEW, PAYMENT_COMPLETE 등)
     * @param payload    JSON 문자열
     * @param requestId 추적용 요청 ID
     */
    void SendToUI(const std::string& type,
                  const std::string& payloadJson,
                  const std::string& requestId = "");

    // ──── 도메인별 래퍼 (편의 함수) ────

    /** 테이블 상태 변경 알림 */
    void NotifyTableChanged(int floorId = 0);

    /** 새 주문 알림 */
    void NotifyNewOrder(const std::string& orderId, const std::string& tableId);

    /** 결제 완료 알림 */
    void NotifyPaymentComplete(const std::string& paymentId,
                               const std::string& orderId);

    /** 동기화 상태 변경 알림 */
    void NotifySyncStatusChanged(int backlogCount,
                                 const std::string& lastErrorCode);

    /** 장치 에러 알림 */
    void NotifyDeviceError(const std::string& device,
                           const std::string& code,
                           const std::string& msgKey,
                           const std::string& severity,
                           bool recoverable,
                           bool retryable,
                           const std::string& action);

private:
    CefBrowserDlg* browserDlg_;  // non-owning

    static std::string GenerateEventId();
    static std::string GetTimestamp();
};
