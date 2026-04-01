#pragma once
/**
 * Restaurant.h — Ứng dụng POS chính (khai báo)
 * Restaurant.h — POS 메인 앱 (선언)
 *
 * Tương đương code cũ / 대응하는 기존 코드:
 *   HJ-POS-TEST/Restaurant.h — CRestaurantApp : public CWinApp
 *
 * Thay đổi chính / 주요 변경:
 *   - Code cũ: MFC CWinApp → tạo CDialog (TableDlg, OrderDlg...)
 *     기존: MFC CWinApp → CDialog 생성 (TableDlg, OrderDlg...)
 *   - Code mới: MFC CWinApp → CEF Browser → Next.js UI
 *     신규: MFC CWinApp → CEF Browser → Next.js UI
 *   - MFC vẫn cần cho message loop + CEF hosting
 *     MFC는 메시지 루프 + CEF 호스팅에 여전히 필요
 */

#ifndef __AFXWIN_H__
#error "include 'afxwin.h' before including this file"
#endif

#include "resource.h"

// ──────────────────────────────────────────
// CRestaurantApp — Lớp ứng dụng chính MFC
// CRestaurantApp — MFC 메인 앱 클래스
//
// Vai trò mới (sau refactoring) / 새 역할 (리팩토링 후):
//   1. Khởi tạo CEF (CefBootstrap::InitCef)
//      CEF 초기화
//   2. Lắp ráp dependency (ComposeApp)
//      의존성 조립
//   3. Tạo CEF browser window hiển thị Next.js
//      Next.js를 표시하는 CEF 브라우저 윈도우 생성
//   4. Chạy MFC message loop
//      MFC 메시지 루프 실행
//   5. Dọn dẹp khi thoát (CefBootstrap::ShutdownCef)
//      종료 시 정리
// ──────────────────────────────────────────
class CRestaurantApp : public CWinApp
{
public:
    CRestaurantApp();

    virtual BOOL InitInstance() override;
    virtual int  ExitInstance() override;

    DECLARE_MESSAGE_MAP()
};
