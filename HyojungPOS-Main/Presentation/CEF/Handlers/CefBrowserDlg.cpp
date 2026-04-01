#include "CefBrowserDlg.h"
#include "BrowserRecoveryManager.h"
#include "include/cef_browser.h"

// ────────────────────────────────────────────
// Tạo/Hủy / 생성/소멸
// ────────────────────────────────────────────
CefBrowserDlg::CefBrowserDlg() {}
CefBrowserDlg::~CefBrowserDlg() {}

// ────────────────────────────────────────────
// Tạo browser — 1024x768 cố định / 브라우저 생성 — 1024x768 고정
// ────────────────────────────────────────────
void CefBrowserDlg::CreateBrowser(HWND parent_hwnd, const std::wstring& url)
{
    if (browser_) return;  // Đã tạo — nguyên tắc instance đơn / 이미 생성됨 — 단일 인스턴스 원칙

    CefWindowInfo window_info;
    RECT rect;
    ::GetClientRect(parent_hwnd, &rect);
    window_info.SetAsChild(parent_hwnd, CefRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top));

    CefBrowserSettings settings;

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
// Thực thi JS — dùng cho PosRealTimeSender / JS 실행 — PosRealTimeSender 용
// ────────────────────────────────────────────
void CefBrowserDlg::ExecuteJavaScript(const std::string& js_code)
{
    if (!browser_) return;

    CefRefPtr<CefFrame> frame = browser_->GetMainFrame();
    if (!frame) return;

    // Thực thi trực tiếp — CEF xử lý thread safety nội bộ
    // 직접 실행 — CEF가 내부적으로 스레드 안전성 처리
    frame->ExecuteJavaScript(CefString(js_code), "app://pos/", 0);
}

// ────────────────────────────────────────────
// Đóng browser — chỉ khi thoát POS / 브라우저 닫기 — POS 종료 시에만
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
    return false;
}

void CefBrowserDlg::OnBeforeClose(CefRefPtr<CefBrowser> /*browser*/)
{
    browser_ = nullptr;
}

// ────────────────────────────────────────────
// Phát hiện Renderer Crash / 렌더러 크래시 감지
// ────────────────────────────────────────────
void CefBrowserDlg::OnRenderProcessTerminated(
    CefRefPtr<CefBrowser> browser,
    TerminationStatus status,
    int /*error_code*/,
    const CefString& /*error_string*/)
{
    BrowserRecoveryManager::Get().OnRendererCrash(browser, status);
}
