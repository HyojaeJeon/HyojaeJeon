#pragma once
/**
 * CefAppHandler — CEF 프로세스 초기화 핸들러
 *
 * CefApp 인터페이스를 구현하여 브라우저 프로세스와 렌더러 프로세스를 초기화한다.
 * multi_threaded_message_loop = true 모드에서 동작한다.
 */

#include "include/cef_app.h"

class CefAppHandler : public CefApp, public CefBrowserProcessHandler {
public:
    CefAppHandler();

    // CefApp
    CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() override {
        return this;
    }

    // Đăng ký custom scheme "app" — cần gọi trước CefInitialize
    // 커스텀 스킴 "app" 등록 — CefInitialize 전에 호출 필요
    void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override;

    void OnBeforeCommandLineProcessing(
        const CefString& process_type,
        CefRefPtr<CefCommandLine> command_line) override;

    // CefBrowserProcessHandler
    void OnContextInitialized() override;

    void OnScheduleMessagePumpWork(int64_t delay_ms) override {}

private:
    IMPLEMENT_REFCOUNTING(CefAppHandler);
    DISALLOW_COPY_AND_ASSIGN(CefAppHandler);
};
