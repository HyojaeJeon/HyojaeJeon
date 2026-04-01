/**
 * AppCompositionRoot.cpp — Gốc tổ hợp dependency
 * AppCompositionRoot.cpp — 의존성 조합 루트
 *
 * TODO: Khi tích hợp MSSQL và UseCases, bật lại các phần đã tắt
 *       MSSQL과 UseCases 통합 시 비활성화된 부분 다시 활성화
 */

#include "AppCompositionRoot.h"

void ComposeApp(ServiceRegistry& /*registry*/, CefBrowserDlg* /*browser_dlg*/)
{
    // Giai đoạn P0: Chỉ hiển thị CEF + Next.js
    // P0 단계: CEF + Next.js 표시만 수행
    //
    // Các tầng Infrastructure/Domain/UseCases sẽ được lắp ráp
    // khi tích hợp MSSQL thực tế.
    // Infrastructure/Domain/UseCases 계층은 실제 MSSQL 통합 시 조립 예정
}
