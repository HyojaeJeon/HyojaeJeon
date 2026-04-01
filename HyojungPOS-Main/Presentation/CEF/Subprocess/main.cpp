/**
 * CefSubprocess — CEF 렌더러 서브프로세스 진입점
 *
 * CEF는 멀티 프로세스 아키텍처를 사용한다.
 * 메인 프로세스(RestaurantD.exe)와 별도로 렌더러 프로세스(CefSubprocess.exe)가 실행된다.
 * 이 파일은 렌더러 프로세스의 진입점이다.
 */

#include "include/cef_app.h"

#if defined(OS_WIN)
#include <windows.h>

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int)
{
    CefMainArgs main_args(hInstance);

    // 서브프로세스에서는 CefApp 구현을 넘기지 않는다.
    // 메인 프로세스의 CefAppHandler만 브라우저 프로세스 로직을 담당한다.
    int exit_code = CefExecuteProcess(main_args, nullptr, nullptr);
    return exit_code;
}

#endif  // OS_WIN
