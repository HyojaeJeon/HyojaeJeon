/**
 * CefSubprocess — Điểm vào renderer subprocess CEF
 * CefSubprocess — CEF 렌더러 서브프로세스 진입점
 *
 * QUAN TRỌNG: OnRegisterCustomSchemes phải được gọi ở TẤT CẢ process
 * 중요: OnRegisterCustomSchemes는 모든 프로세스에서 호출되어야 함
 */

#include <windows.h>
#include "include/cef_app.h"

// Minimal CefApp — chỉ đăng ký custom scheme / 커스텀 스킴 등록만 수행
class SubprocessApp : public CefApp {
public:
    void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override {
        // Phải giống hệt với CefAppHandler::OnRegisterCustomSchemes
        // CefAppHandler::OnRegisterCustomSchemes와 동일해야 함
        registrar->AddCustomScheme("app",
            CEF_SCHEME_OPTION_STANDARD |
            CEF_SCHEME_OPTION_LOCAL |
            CEF_SCHEME_OPTION_CORS_ENABLED |
            CEF_SCHEME_OPTION_SECURE |
            CEF_SCHEME_OPTION_CSP_BYPASSING |
            CEF_SCHEME_OPTION_FETCH_ENABLED);
    }

private:
    IMPLEMENT_REFCOUNTING(SubprocessApp);
};

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int)
{
    CefMainArgs main_args(hInstance);

    // Truyền SubprocessApp để đăng ký scheme trong renderer process
    // 렌더러 프로세스에서 스킴 등록을 위해 SubprocessApp 전달
    CefRefPtr<SubprocessApp> app = new SubprocessApp();
    int exit_code = CefExecuteProcess(main_args, app, nullptr);
    return exit_code;
}
