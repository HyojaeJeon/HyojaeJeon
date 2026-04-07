#pragma once
/**
 * BrowserRecoveryManager — renderer crash 감시/복구
 *
 * 복구 규칙 (설계 문서 8.18):
 * - 첫 crash: 입력 차단 → 로그 기록 → Browser reload → DB 기반 재수화
 * - 5분 내 2회 이상: crash loop → FALLBACK_REQUIRED
 * - 브라우저 메모리/Redux snapshot은 복구 근거가 아니다
 */

#include "include/cef_browser.h"
#include "include/cef_request_handler.h"

#include <chrono>
#include <mutex>

class BrowserRecoveryManager {
public:
    enum class BrowserState {
        HEALTHY,
        RECOVERING,
        DEGRADED,
        FALLBACK_REQUIRED,
    };

    static BrowserRecoveryManager& Get();

    void OnRendererCrash(CefRefPtr<CefBrowser> browser,
                         CefRequestHandler::TerminationStatus status);

    BrowserState GetState() const;

private:
    BrowserRecoveryManager() = default;

    void AttemptRecovery(CefRefPtr<CefBrowser> browser);
    bool IsCrashLoop() const;

    mutable std::mutex mu_;
    BrowserState state_ = BrowserState::HEALTHY;
    int crash_count_ = 0;
    std::chrono::steady_clock::time_point first_crash_time_;

    static constexpr int    kMaxCrashesBeforeLoop = 2;
    static constexpr int    kCrashWindowSeconds   = 300;  // 5분
};
