#pragma once
/**
 * CefBrowserDlg — MFC Dialog 안에 CEF 브라우저를 호스팅
 *
 * 핵심 규칙:
 * - 메인 CefBrowser는 POS 실행 중 단일 인스턴스로 유지
 * - 화면 전환 시 CloseBrowser 호출 금지
 * - 브라우저 창은 1024x768 고정
 */

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

    /**
     * 브라우저 생성 — MFC 윈도우 핸들을 부모로 지정
     * @param parent_hwnd  부모 MFC CWnd의 HWND
     * @param url          초기 URL (예: "app://pos/")
     */
    void CreateBrowser(HWND parent_hwnd, const std::wstring& url);

    /** 브라우저가 생성되었는지 여부 */
    bool IsBrowserCreated() const { return browser_ != nullptr; }

    /** 현재 브라우저 인스턴스 */
    CefRefPtr<CefBrowser> GetBrowser() const { return browser_; }

    /**
     * JS를 브라우저에서 실행
     * PosRealTimeSender가 이벤트 전송 시 사용
     */
    void ExecuteJavaScript(const std::string& js_code);

    /** POS 종료 시에만 호출 — 브라우저 닫기 */
    void CloseBrowser();

    // CefClient
    CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
    CefRefPtr<CefDisplayHandler>  GetDisplayHandler()  override { return this; }
    CefRefPtr<CefRequestHandler>  GetRequestHandler()  override { return this; }

    // CefLifeSpanHandler
    void OnAfterCreated(CefRefPtr<CefBrowser> browser) override;
    bool DoClose(CefRefPtr<CefBrowser> browser) override;
    void OnBeforeClose(CefRefPtr<CefBrowser> browser) override;

    // CefRequestHandler — renderer crash 감지
    void OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser,
                                   TerminationStatus status) override;

private:
    CefRefPtr<CefBrowser> browser_;

    IMPLEMENT_REFCOUNTING(CefBrowserDlg);
    DISALLOW_COPY_AND_ASSIGN(CefBrowserDlg);
};
