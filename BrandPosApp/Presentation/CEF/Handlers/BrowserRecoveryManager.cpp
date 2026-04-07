#include "BrowserRecoveryManager.h"
// #include "Infrastructure/Observability/Logger.h"  // TODO: 로거 연결

BrowserRecoveryManager& BrowserRecoveryManager::Get()
{
    static BrowserRecoveryManager instance;
    return instance;
}

BrowserRecoveryManager::BrowserState BrowserRecoveryManager::GetState() const
{
    std::lock_guard<std::mutex> lock(mu_);
    return state_;
}

void BrowserRecoveryManager::OnRendererCrash(
    CefRefPtr<CefBrowser> browser,
    CefRequestHandler::TerminationStatus status)
{
    std::lock_guard<std::mutex> lock(mu_);

    auto now = std::chrono::steady_clock::now();

    // crash window 리셋
    if (crash_count_ == 0) {
        first_crash_time_ = now;
    }

    crash_count_++;

    // TODO: 로그 기록
    // Logger::Error("Renderer crashed. status={}, count={}", (int)status, crash_count_);

    if (IsCrashLoop()) {
        state_ = BrowserState::FALLBACK_REQUIRED;
        // TODO: CEF 재생성 및 복구 상태 handoff 트리거
        return;
    }

    state_ = BrowserState::RECOVERING;
    AttemptRecovery(browser);
}

void BrowserRecoveryManager::AttemptRecovery(CefRefPtr<CefBrowser> browser)
{
    // 1. Browser reload — DB 기반 재수화는 Next.js 앱 부팅 시 SYSTEM:BOOTSTRAP으로 수행
    if (browser && browser->GetMainFrame()) {
        browser->Reload();
    }

    // 복구 후 HEALTHY 복원은 페이지 로드 완료 콜백에서 수행
    // (CefLoadHandler::OnLoadEnd에서 state_를 HEALTHY로 전환)
    state_ = BrowserState::DEGRADED;
}

bool BrowserRecoveryManager::IsCrashLoop() const
{
    if (crash_count_ < kMaxCrashesBeforeLoop) return false;

    auto elapsed = std::chrono::steady_clock::now() - first_crash_time_;
    auto seconds = std::chrono::duration_cast<std::chrono::seconds>(elapsed).count();
    return seconds <= kCrashWindowSeconds;
}
