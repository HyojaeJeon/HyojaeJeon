#include "CefBootstrap.h"
#include "../../Presentation/CEF/Handlers/CefAppHandler.h"
#include "../../Presentation/CEF/Handlers/CefSchemeHandler.h"
#include "include/cef_app.h"

#include <windows.h>

namespace CefBootstrap {

bool InitCef(const std::wstring& subprocess_path,
             const std::wstring& pos_ui_out_path,
             const std::wstring& cache_path)
{
    CefMainArgs main_args(::GetModuleHandle(nullptr));

    // 서브프로세스 체크: 현재 프로세스가 렌더러/GPU/유틸리티면 여기서 종료
    int exit_code = CefExecuteProcess(main_args, nullptr, nullptr);
    if (exit_code >= 0) {
        // 서브프로세스 실행 완료
        return false;
    }

    CefSettings settings;
    settings.multi_threaded_message_loop = true;
    settings.no_sandbox = true;

    CefString(&settings.browser_subprocess_path).FromWString(subprocess_path);
    CefString(&settings.root_cache_path).FromWString(cache_path);
    CefString(&settings.cache_path).FromWString(cache_path + L"\\browser_cache");
    CefString(&settings.locale).FromASCII("ko");

#ifdef _DEBUG
    settings.log_severity = LOGSEVERITY_INFO;
    CefString(&settings.log_file).FromWString(cache_path + L"\\cef_debug.log");
#else
    settings.log_severity = LOGSEVERITY_WARNING;
#endif

    CefRefPtr<CefAppHandler> app_handler = new CefAppHandler();

    if (!CefInitialize(main_args, settings, app_handler, nullptr)) {
        return false;
    }

    // app://pos/ 커스텀 스킴 등록
    RegisterPosScheme(pos_ui_out_path);

    return true;
}

void ShutdownCef()
{
    CefShutdown();
}

}  // namespace CefBootstrap
