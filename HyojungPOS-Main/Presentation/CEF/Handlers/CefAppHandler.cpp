#include "CefAppHandler.h"

CefAppHandler::CefAppHandler() {}

void CefAppHandler::OnBeforeCommandLineProcessing(
    const CefString& process_type,
    CefRefPtr<CefCommandLine> command_line)
{
    // multi_threaded_message_loop: MFC 메시지루프와 CEF 메시지루프 병행
    command_line->AppendSwitch("multi-threaded-message-loop");

    // POS 환경: GPU 가속 비활성화 (안정성 우선)
    command_line->AppendSwitch("disable-gpu");
    command_line->AppendSwitch("disable-gpu-compositing");

    // 보안: remote debugging은 개발 빌드에서만 허용
#ifdef _DEBUG
    command_line->AppendSwitchWithValue("remote-debugging-port", "9222");
#endif
}

void CefAppHandler::OnContextInitialized()
{
    // CEF 브라우저 프로세스 컨텍스트 초기화 완료
    // 여기서 CefBrowserDlg를 통해 첫 번째 브라우저를 생성한다.
    // 실제 브라우저 생성은 AppHost가 MFC Dialog 생성 후 호출한다.
}
