#pragma once
/**
 * CefSchemeHandler — app://pos/ 커스텀 스킴 핸들러
 *
 * Next.js 정적 빌드 출력(PosUi/out/)을 app://pos/ URL로 서빙한다.
 * CEF가 로컬 파일시스템에서 HTML/JS/CSS를 읽어 브라우저에 제공한다.
 */

#include "include/cef_scheme.h"
#include "include/cef_resource_handler.h"

#include <string>

// ──── Factory ────
class PosSchemeHandlerFactory : public CefSchemeHandlerFactory {
public:
    explicit PosSchemeHandlerFactory(const std::wstring& base_path);

    CefRefPtr<CefResourceHandler> Create(
        CefRefPtr<CefBrowser> browser,
        CefRefPtr<CefFrame> frame,
        const CefString& scheme_name,
        CefRefPtr<CefRequest> request) override;

private:
    std::wstring base_path_;  // PosUi/out/ 절대 경로

    IMPLEMENT_REFCOUNTING(PosSchemeHandlerFactory);
};

// ──── ResourceHandler ────
class PosResourceHandler : public CefResourceHandler {
public:
    PosResourceHandler(const std::wstring& file_path, const std::string& mime_type);

    bool Open(CefRefPtr<CefRequest> request,
              bool& handle_request,
              CefRefPtr<CefCallback> callback) override;

    void GetResponseHeaders(CefRefPtr<CefResponse> response,
                            int64_t& response_length,
                            CefString& redirect_url) override;

    bool Read(void* data_out,
              int bytes_to_read,
              int& bytes_read,
              CefRefPtr<CefResourceReadCallback> callback) override;

    void Cancel() override {}

private:
    std::wstring file_path_;
    std::string  mime_type_;
    std::string  file_data_;
    size_t       offset_ = 0;

    IMPLEMENT_REFCOUNTING(PosResourceHandler);
};

// ──── 등록 헬퍼 ────
void RegisterPosScheme(const std::wstring& pos_ui_out_path);
