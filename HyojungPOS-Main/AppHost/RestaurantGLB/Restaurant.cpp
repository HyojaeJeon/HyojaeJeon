/**
 * Restaurant.cpp — Điểm vào ứng dụng POS (MFC + CEF)
 * Restaurant.cpp — POS 앱 진입점 (MFC + CEF)
 *
 * Tương đương code cũ / 대응하는 기존 코드:
 *   HJ-POS-TEST/Restaurant.cpp — CRestaurantApp::InitInstance()
 *
 * Luồng khởi động / 부팅 흐름:
 *   1. MFC WinApp khởi tạo / MFC WinApp 초기화
 *   2. CEF khởi tạo (CefBootstrap::InitCef)
 *      CEF 초기화
 *   3. Dependency lắp ráp (ComposeApp)
 *      의존성 조립
 *   4. CEF Browser tạo → hiển thị app://pos/index.html
 *      CEF 브라우저 생성 → app://pos/index.html 표시
 *   5. MFC message loop chạy
 *      MFC 메시지 루프 실행
 *
 * ※ Code cũ: InitInstance() → tạo hàng loạt Dialog (TableDlg, OrderDlg...)
 *    기존: InitInstance() → Dialog 대량 생성 (TableDlg, OrderDlg...)
 * ※ Code mới: InitInstance() → CEF Browser 1개 → Next.js React
 *    신규: InitInstance() → CEF 브라우저 1개 → Next.js React
 */

#include <afxwin.h>
#include "Restaurant.h"
#include "CefBootstrap.h"
#include "../Bootstrap/ServiceRegistry.h"
#include "../Bootstrap/AppCompositionRoot.h"
#include "../../Presentation/CEF/Handlers/CefBrowserDlg.h"

// ══════════════════════════════════════════
// Biến toàn cục / 전역 변수
// ══════════════════════════════════════════

// Đối tượng ứng dụng MFC duy nhất / 유일한 MFC 앱 객체
CRestaurantApp theApp;

// Service registry — Nơi chứa tất cả service đã lắp ráp
// 서비스 레지스트리 — 조립된 모든 서비스를 보관하는 곳
ServiceRegistry g_Registry;

// CEF Browser dialog — Cửa sổ duy nhất hosting CEF
// CEF 브라우저 다이얼로그 — CEF를 호스팅하는 유일한 윈도우
CefBrowserDlg* g_BrowserDlg = nullptr;


// ══════════════════════════════════════════
// MFC Message Map
// ══════════════════════════════════════════

BEGIN_MESSAGE_MAP(CRestaurantApp, CWinApp)
END_MESSAGE_MAP()


// ══════════════════════════════════════════
// Constructor
// ══════════════════════════════════════════

CRestaurantApp::CRestaurantApp()
{
    // Tương tự code cũ: CRestaurantApp::CRestaurantApp() — rỗng
    // 기존 코드와 동일: CRestaurantApp::CRestaurantApp() — 비어있음
}


// ══════════════════════════════════════════
// InitInstance — Khởi động ứng dụng
// InitInstance — 앱 시작
//
// Đây là hàm "main" thực chất của MFC app.
// 이것이 MFC 앱의 실질적인 "main" 함수.
// ══════════════════════════════════════════

BOOL CRestaurantApp::InitInstance()
{
    CWinApp::InitInstance();

    // ──────────────────────────────────────
    // Bước 1: Khởi tạo MFC cơ bản
    // 1단계: MFC 기본 초기화
    //
    // Tương tự code cũ: AfxEnableControlContainer(), CoInitialize...
    // 기존 코드와 유사: AfxEnableControlContainer(), CoInitialize...
    // ──────────────────────────────────────
    AfxEnableControlContainer();
    CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);

    // ──────────────────────────────────────
    // Bước 2: Xác định đường dẫn / 경로 결정
    //
    // exe_dir: Thư mục chứa exe hiện tại
    //          현재 exe가 있는 디렉토리
    // pos_ui_out: PosUI/out/ — Next.js static build
    // subprocess: CefSubprocess.exe — CEF renderer
    // ──────────────────────────────────────
    TCHAR exe_path[MAX_PATH];
    ::GetModuleFileName(NULL, exe_path, MAX_PATH);
    CString exe_dir = exe_path;
    exe_dir = exe_dir.Left(exe_dir.ReverseFind(_T('\\')));

    // PosUI build output — Được phục vụ qua app://pos/ scheme
    // PosUI 빌드 결과물 — app://pos/ 스킴으로 서빙됨
    CString pos_ui_out = exe_dir + _T("\\PosUI\\out");

    // CEF renderer subprocess
    CString subprocess = exe_dir + _T("\\CefSubprocess.exe");

    // Cache cho CEF (trình duyệt data, cookies...)
    // CEF용 캐시 (브라우저 데이터, 쿠키...)
    CString cache_path = exe_dir + _T("\\cache");

    // ──────────────────────────────────────
    // Bước 3: Khởi tạo CEF
    // 3단계: CEF 초기화
    //
    // CefBootstrap::InitCef() sẽ:
    //   - Đăng ký app://pos/ custom scheme
    //     app://pos/ 커스텀 스킴 등록
    //   - Bật multi-threaded message loop
    //     멀티스레드 메시지 루프 활성화
    //   - Tắt GPU (POS 안정성)
    //     GPU 비활성화 (POS 안정성)
    //   - Bật remote debugging (debug mode)
    //     원격 디버깅 활성화 (디버그 모드)
    // ──────────────────────────────────────
    CT2A subprocess_a(subprocess);
    CT2A pos_ui_out_a(pos_ui_out);
    CT2A cache_path_a(cache_path);

    if (!CefBootstrap::InitCef(
            subprocess_a.m_psz,
            pos_ui_out_a.m_psz,
            cache_path_a.m_psz))
    {
        AfxMessageBox(_T("CEF 초기화 실패 / CEF initialization failed"));
        return FALSE;
    }

    // ──────────────────────────────────────
    // Bước 4: Tạo CEF Browser Dialog
    // 4단계: CEF 브라우저 다이얼로그 생성
    //
    // Đây là cửa sổ chính duy nhất của POS.
    // 이것이 POS의 유일한 메인 윈도우.
    //
    // Code cũ: CRestaurantDlg → MFC Dialog có hàng trăm button
    // 기존: CRestaurantDlg → 버튼 수백 개가 있는 MFC Dialog
    //
    // Code mới: CefBrowserDlg → CEF Browser 1개 → Next.js
    // 신규: CefBrowserDlg → CEF 브라우저 1개 → Next.js
    // ──────────────────────────────────────
    g_BrowserDlg = new CefBrowserDlg();

    // ──────────────────────────────────────
    // Bước 5: Lắp ráp dependency
    // 5단계: 의존성 조립
    //
    // AppCompositionRoot tạo tất cả service:
    // AppCompositionRoot가 모든 서비스 생성:
    //   Infrastructure → Domain → UseCases → Presentation
    //
    // Truyền g_BrowserDlg để PosRealTimeSender có thể
    // gửi sự kiện đến UI.
    // g_BrowserDlg를 전달하여 PosRealTimeSender가
    // UI에 이벤트를 보낼 수 있게 한다.
    // ──────────────────────────────────────
    ComposeApp(g_Registry, g_BrowserDlg);

    // ──────────────────────────────────────
    // Bước 6: Tạo browser và hiển thị Next.js
    // 6단계: 브라우저 생성 및 Next.js 표시
    //
    // app://pos/index.html → PosUI/out/index.html
    // CefSchemeHandler sẽ map URL này sang file cục bộ
    // CefSchemeHandler가 이 URL을 로컬 파일로 매핑
    //
    // Giải pháp: 1024x768 cố định (thiết kế POS)
    // 해상도: 1024x768 고정 (POS 설계)
    // ──────────────────────────────────────
    g_BrowserDlg->CreateBrowser(
        m_pMainWnd ? m_pMainWnd->GetSafeHwnd() : NULL,
        "app://pos/index.html"
    );

    // Đặt dialog làm cửa sổ chính / 다이얼로그를 메인 윈도우로 설정
    m_pMainWnd = g_BrowserDlg;

    return TRUE;
}


// ══════════════════════════════════════════
// ExitInstance — Dọn dẹp khi thoát
// ExitInstance — 종료 시 정리
// ══════════════════════════════════════════

int CRestaurantApp::ExitInstance()
{
    // ──────────────────────────────────────
    // Bước 1: Đóng CEF browser
    // 1단계: CEF 브라우저 닫기
    //
    // ※ CloseBrowser() chỉ gọi ở đây (shutdown).
    //    Trong khi chạy, KHÔNG BAO GIỜ gọi CloseBrowser.
    //    CloseBrowser()는 여기(종료 시)에서만 호출.
    //    실행 중에는 절대 CloseBrowser 호출 금지.
    // ──────────────────────────────────────
    if (g_BrowserDlg) {
        g_BrowserDlg->CloseBrowser();
        delete g_BrowserDlg;
        g_BrowserDlg = nullptr;
    }

    // ──────────────────────────────────────
    // Bước 2: Tắt CEF
    // 2단계: CEF 종료
    // ──────────────────────────────────────
    CefBootstrap::ShutdownCef();

    // ──────────────────────────────────────
    // Bước 3: Dọn COM
    // 3단계: COM 정리
    // ──────────────────────────────────────
    CoUninitialize();

    return CWinApp::ExitInstance();
}
