#pragma once
/**
 * CefBrowserDlg — Hosting CEF browser bên trong Win32 window
 * CefBrowserDlg — Win32 윈도우 안에 CEF 브라우저 호스팅
 *
 * Quy tắc chính / 핵심 규칙:
 * - CefBrowser duy nhất suốt thời gian chạy POS / POS 실행 중 단일 CefBrowser 유지
 * - Không gọi CloseBrowser khi chuyển màn hình / 화면 전환 시 CloseBrowser 호출 금지
 */

#include <windows.h>

#include "include/cef_client.h"
#include "include/cef_life_span_handler.h"
#include "include/cef_display_handler.h"
#include "include/cef_request_handler.h"

#include <string>

class CefBrowserDlg
    : public CefClient
    , public CefLifeSpanHandler
    , public CefDisplayHandler
    , public CefRequestHandler
{
public:
    CefBrowserDlg();
    ~CefBrowserDlg();

    // Tạo browser — parent là Win32 HWND / 브라우저 생성 — 부모는 Win32 HWND
    void CreateBrowser(HWND parent_hwnd, const std::wstring& url);

    bool IsBrowserCreated() const { return browser_ != nullptr; }

    CefRefPtr<CefBrowser> GetBrowser() const { return browser_; }

    // Thực thi JS trên browser / 브라우저에서 JS 실행
    void ExecuteJavaScript(const std::string& js_code);

    // Chỉ gọi khi thoát POS / POS 종료 시에만 호출
    void CloseBrowser();

    // CefClient
    CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
    CefRefPtr<CefDisplayHandler>  GetDisplayHandler()  override { return this; }
    CefRefPtr<CefRequestHandler>  GetRequestHandler()  override { return this; }

    // CefLifeSpanHandler
    void OnAfterCreated(CefRefPtr<CefBrowser> browser) override;
    bool DoClose(CefRefPtr<CefBrowser> browser) override;
    void OnBeforeClose(CefRefPtr<CefBrowser> browser) override;

    // CefRequestHandler — Phát hiện renderer crash / 렌더러 크래시 감지
    void OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser,
                                   TerminationStatus status,
                                   int error_code,
                                   const CefString& error_string) override;

private:
    CefRefPtr<CefBrowser> browser_;

    IMPLEMENT_REFCOUNTING(CefBrowserDlg);
    DISALLOW_COPY_AND_ASSIGN(CefBrowserDlg);
};
