#pragma once
/**
 * AppCompositionRoot — Gốc tổ hợp ứng dụng (khai báo)
 * AppCompositionRoot — 앱 조합 루트 (선언)
 *
 * Tầng: AppHost/Bootstrap / 계층: AppHost/Bootstrap
 *
 * Vai trò / 역할:
 *   Điểm DUY NHẤT nơi tất cả dependency được tạo và kết nối.
 *   모든 의존성이 생성되고 연결되는 유일한 지점.
 *
 *   Hàm ComposeApp() được gọi MỘT LẦN khi khởi động ứng dụng.
 *   ComposeApp() 함수는 앱 시작 시 한 번만 호출된다.
 *
 *   Sau khi ComposeApp() hoàn tất:
 *   ComposeApp() 완료 후:
 *     - ServiceRegistry chứa tất cả service đã lắp ráp
 *       ServiceRegistry에 조립된 모든 서비스가 들어있음
 *     - Mỗi tầng chỉ nhận dependency mà nó CẦN
 *       각 계층은 자기가 필요한 의존성만 받음
 *     - Quy tắc thiết kế được enforce bằng cấu trúc code
 *       설계 규칙이 코드 구조로 강제됨
 */

#include "ServiceRegistry.h"

// Chuyển tiếp khai báo CEF browser / CEF 브라우저 전방 선언
class CefBrowserDlg;

// ──────────────────────────────────────────
// ComposeApp — Lắp ráp toàn bộ dependency graph
// ComposeApp — 전체 의존성 그래프 조립
//
// Gọi một lần khi ứng dụng khởi động (từ Restaurant.cpp hoặc CefBootstrap).
// 앱 시작 시 한 번 호출 (Restaurant.cpp 또는 CefBootstrap에서).
//
// @param registry      Bộ đăng ký service (output)
//                      서비스 레지스트리 (출력)
// @param browser_dlg   Con trỏ CEF browser đã khởi tạo
//                      초기화된 CEF 브라우저 포인터
// ──────────────────────────────────────────
void ComposeApp(ServiceRegistry& registry, CefBrowserDlg* browser_dlg);
