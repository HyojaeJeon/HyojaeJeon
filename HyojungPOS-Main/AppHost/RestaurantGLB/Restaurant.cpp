/**
 * Restaurant.cpp — Điểm vào ứng dụng POS (Win32 + CEF)
 * Restaurant.cpp — POS 앱 진입점 (Win32 + CEF)
 *
 * Luồng khởi động / 부팅 흐름:
 *   1. WinMain → Khởi tạo CEF / CEF 초기화
 *   2. Tạo Win32 window 1024x768 / Win32 윈도우 생성
 *   3. Lắp ráp dependency (ComposeApp) / 의존성 조립
 *   4. Tạo CEF Browser → hiển thị app://pos/index.html
 *      CEF 브라우저 생성 → app://pos/index.html 표시
 *   5. Win32 message loop / Win32 메시지 루프
 */

#include <windows.h>
#include <string>

#include "CefBootstrap.h"
#include "../Bootstrap/ServiceRegistry.h"
#include "../Bootstrap/AppCompositionRoot.h"
#include "../../Presentation/CEF/Handlers/CefBrowserDlg.h"

// ══════════════════════════════════════════
// Biến toàn cục / 전역 변수
// ══════════════════════════════════════════

static ServiceRegistry g_Registry;
static CefRefPtr<CefBrowserDlg> g_BrowserDlg;
static HWND g_hMainWnd = nullptr;

static const wchar_t* kWindowClass = L"HyojungPOS_MainWindow";
static const wchar_t* kWindowTitle = L"HyojungPOS";
static const int kWidth  = 1024;
static const int kHeight = 768;

// ══════════════════════════════════════════
// Window Procedure / 윈도우 프로시저
// ══════════════════════════════════════════

static LRESULT CALLBACK WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    switch (msg)
    {
    case WM_SIZE:
    {
        // Resize CEF browser theo cửa sổ / CEF 브라우저를 윈도우에 맞춰 리사이즈
        if (g_BrowserDlg && g_BrowserDlg->IsBrowserCreated()) {
            HWND browser_hwnd = g_BrowserDlg->GetBrowser()->GetHost()->GetWindowHandle();
            if (browser_hwnd) {
                RECT rc;
                ::GetClientRect(hWnd, &rc);
                ::MoveWindow(browser_hwnd, 0, 0, rc.right, rc.bottom, TRUE);
            }
        }
        return 0;
    }

    case WM_CLOSE:
        // Đóng CEF browser trước / CEF 브라우저 먼저 닫기
        if (g_BrowserDlg) {
            g_BrowserDlg->CloseBrowser();
        }
        ::DestroyWindow(hWnd);
        return 0;

    case WM_DESTROY:
        ::PostQuitMessage(0);
        return 0;
    }

    return ::DefWindowProc(hWnd, msg, wParam, lParam);
}

// ══════════════════════════════════════════
// Tạo cửa sổ chính / 메인 윈도우 생성
// ══════════════════════════════════════════

static HWND CreateMainWindow(HINSTANCE hInstance)
{
    WNDCLASSEX wc = {};
    wc.cbSize        = sizeof(WNDCLASSEX);
    wc.style         = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hInstance;
    wc.hCursor       = ::LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = kWindowClass;
    wc.hIcon         = ::LoadIcon(nullptr, IDI_APPLICATION);
    ::RegisterClassEx(&wc);

    // WS_POPUP: Không viền, không title bar — toàn bộ 1024x768 là nội dung
    // WS_POPUP: 테두리 없음, 타이틀바 없음 — 전체 1024x768이 콘텐츠
    // Đặt giữa màn hình / 화면 중앙 배치
    int screenW = ::GetSystemMetrics(SM_CXSCREEN);
    int screenH = ::GetSystemMetrics(SM_CYSCREEN);
    int posX = (screenW - kWidth) / 2;
    int posY = (screenH - kHeight) / 2;

    HWND hWnd = ::CreateWindowEx(
        0,
        kWindowClass,
        kWindowTitle,
        WS_POPUP | WS_VISIBLE,
        posX, posY,
        kWidth, kHeight,
        nullptr, nullptr, hInstance, nullptr);

    return hWnd;
}

// ══════════════════════════════════════════
// Xác định đường dẫn / 경로 결정
// ══════════════════════════════════════════

static std::wstring GetExeDir()
{
    wchar_t path[MAX_PATH];
    ::GetModuleFileNameW(nullptr, path, MAX_PATH);
    std::wstring dir(path);
    auto pos = dir.rfind(L'\\');
    if (pos != std::wstring::npos) dir = dir.substr(0, pos);
    return dir;
}

// ══════════════════════════════════════════
// WinMain — Điểm vào chính / 메인 진입점
// ══════════════════════════════════════════

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int nCmdShow)
{
    // DPI awareness — ngăn Windows scale cửa sổ / Windows 스케일링 방지
    ::SetProcessDPIAware();
    std::wstring exe_dir    = GetExeDir();
    std::wstring subprocess = exe_dir + L"\\CefSubprocess.exe";
    std::wstring pos_ui_out = exe_dir + L"\\PosUI\\out";
    std::wstring cache_path = exe_dir + L"\\cache";

    // Bước 1: Khởi tạo CEF / 1단계: CEF 초기화
    if (!CefBootstrap::InitCef(subprocess, pos_ui_out, cache_path))
    {
        ::MessageBoxW(nullptr, L"CEF 초기화 실패 / CEF initialization failed",
                      L"Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    // Bước 2: Tạo Win32 window / 2단계: Win32 윈도우 생성
    g_hMainWnd = CreateMainWindow(hInstance);
    if (!g_hMainWnd) {
        CefBootstrap::ShutdownCef();
        return 1;
    }

    ::ShowWindow(g_hMainWnd, nCmdShow);
    ::UpdateWindow(g_hMainWnd);

    // Bước 3: Lắp ráp dependency / 3단계: 의존성 조립
    g_BrowserDlg = new CefBrowserDlg();
    ComposeApp(g_Registry, g_BrowserDlg.get());

    // Bước 4: Tạo CEF browser / 4단계: CEF 브라우저 생성
    g_BrowserDlg->CreateBrowser(g_hMainWnd, L"app://pos/pos/order/index.html");

    // Bước 5: Win32 message loop / 5단계: Win32 메시지 루프
    // CEF chạy multi_threaded_message_loop nên chỉ cần Win32 loop
    // CEF가 multi_threaded_message_loop이므로 Win32 루프만 필요
    MSG msg;
    while (::GetMessage(&msg, nullptr, 0, 0)) {
        ::TranslateMessage(&msg);
        ::DispatchMessage(&msg);
    }

    // Bước 6: Dọn dẹp / 6단계: 정리
    g_BrowserDlg = nullptr;
    CefBootstrap::ShutdownCef();

    return static_cast<int>(msg.wParam);
}
