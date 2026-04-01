#pragma once
/**
 * CefBootstrap — CEF 초기화/종료 헬퍼
 *
 * MFC 앱 시작 시 InitCef()를 호출하고, 종료 시 ShutdownCef()를 호출한다.
 * 메인 메시지루프는 MFC가 담당하고, CEF는 multi_threaded_message_loop 모드로 동작한다.
 */

#include <string>

namespace CefBootstrap {

/**
 * CEF를 초기화한다.
 * @param subprocess_path  CefSubprocess.exe 경로
 * @param pos_ui_out_path  PosUI/out/ 정적 빌드 경로
 * @param cache_path       CEF 캐시 디렉토리 경로
 * @return true 성공, false 실패
 */
bool InitCef(const std::wstring& subprocess_path,
             const std::wstring& pos_ui_out_path,
             const std::wstring& cache_path);

/**
 * CEF를 종료한다.
 * MFC 앱 종료 직전에 호출한다.
 */
void ShutdownCef();

}  // namespace CefBootstrap
