#include "CefBrowserDlg.h"
#include "BrowserRecoveryManager.h"
#include "include/cef_browser.h"
#include "include/cef_task.h"

// ────────────────────────────────────────────
// 생성/소멸
// ────────────────────────────────────────────
CefBrowserDlg::CefBrowserDlg() {}
CefBrowserDlg::~CefBrowserDlg() {}

// ────────────────────────────────────────────
// 브라우저 생성 — 1024x768 고정
// ────────────────────────────────────────────
void CefBrowserDlg::CreateBrowser(HWND parent_hwnd, const std::wstring& url)
{
    if (browser_) return;  // 이미 생성됨 — 단일 인스턴스 원칙

    CefWindowInfo window_info;
    RECT rect = { 0, 0, 1024, 768 };
    window_info.SetAsChild(parent_hwnd, rect);

    CefBrowserSettings settings;
    settings.javascript_access_clipboard = STATE_DISABLED;
    settings.local_storage = STATE_ENABLED;

    CefBrowserHost::CreateBrowser(
        window_info,
        this,
        CefString(url),
        settings,
        nullptr,  // extra_info
        nullptr   // request_context
    );
}

// ────────────────────────────────────────────
// JS 실행 — PosRealTimeSender 용
// ────────────────────────────────────────────
void CefBrowserDlg::ExecuteJavaScript(const std::string& js_code)
{
    if (!browser_) return;

    CefRefPtr<CefFrame> frame = browser_->GetMainFrame();
    if (!frame) return;

    // UI 스레드에서 실행 보장
    if (CefCurrentlyOn(TID_UI)) {
        frame->ExecuteJavaScript(CefString(js_code), "app://pos/", 0);
    } else {
        CefPostTask(TID_UI, base::BindOnce(
            [](CefRefPtr<CefFrame> f, std::string code) {
                f->ExecuteJavaScript(CefString(code), "app://pos/", 0);
            },
            frame, js_code));
    }
}

// ────────────────────────────────────────────
// 브라우저 닫기 — POS 종료 시에만
// ────────────────────────────────────────────
void CefBrowserDlg::CloseBrowser()
{
    if (browser_) {
        browser_->GetHost()->CloseBrowser(/*force_close=*/true);
    }
}

// ────────────────────────────────────────────
// CefLifeSpanHandler
// ────────────────────────────────────────────
void CefBrowserDlg::OnAfterCreated(CefRefPtr<CefBrowser> browser)
{
    browser_ = browser;
}

bool CefBrowserDlg::DoClose(CefRefPtr<CefBrowser> /*browser*/)
{
    // false = 기본 종료 허용 (POS 종료 시)
    return false;
}

void CefBrowserDlg::OnBeforeClose(CefRefPtr<CefBrowser> /*browser*/)
{
    browser_ = nullptr;
}

// ────────────────────────────────────────────
// Renderer Crash 감지
// ────────────────────────────────────────────
void CefBrowserDlg::OnRenderProcessTerminated(
    CefRefPtr<CefBrowser> browser,
    TerminationStatus status)
{
    // BrowserRecoveryManager에 위임
    BrowserRecoveryManager::Get().OnRendererCrash(browser, status);
}
