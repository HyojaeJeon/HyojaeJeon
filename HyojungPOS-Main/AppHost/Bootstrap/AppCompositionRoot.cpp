#include "AppCompositionRoot.h"

// ══════════════════════════════════════════════════════
// Include theo thứ tự tầng: Infrastructure → Domain → UseCases → Presentation
// 계층 순서대로 Include: Infrastructure → Domain → UseCases → Presentation
//
// Thứ tự này phản ánh hướng dependency:
// 이 순서는 의존성 방향을 반영한다:
//   Infrastructure (không phụ thuộc ai / 누구에게도 의존하지 않음)
//   → Domain (phụ thuộc Infrastructure / Infrastructure에 의존)
//   → UseCases (phụ thuộc Domain + Infrastructure / Domain + Infrastructure에 의존)
//   → Presentation (phụ thuộc UseCases / UseCases에 의존)
// ══════════════════════════════════════════════════════

// ── Tầng 1: Infrastructure — Nền tảng / 기반 ──────────
// DB kết nối, Store, không phụ thuộc tầng nào khác
// DB 연결, Store, 다른 계층에 의존하지 않음
#include "../../Infrastructure/Persistence/MSSQL/DBAccess.h"
#include "../../Infrastructure/Persistence/MSSQL/Stores/RequestLedgerStore.h"
#include "../../Infrastructure/Persistence/MSSQL/Stores/OutboxStore.h"

// ── Tầng 2: Domain/Manager — Quy tắc nghiệp vụ / 업무 규칙 ──
// Phụ thuộc Infrastructure (DBAccess để chạy SQL)
// Infrastructure에 의존 (SQL 실행을 위한 DBAccess)
#include "../../Domain/Table/TableMgr.h"
// TODO: Thêm khi triển khai / 구현 시 추가
// #include "../../Domain/Order/OrderMgr.h"
// #include "../../Domain/Payment/SaleMgr.h"

// ── Tầng 3: UseCases — Điều phối / 오케스트레이션 ──────
// Phụ thuộc Manager + Infrastructure + Presentation
// Manager + Infrastructure + Presentation에 의존
#include "../../UseCases/Shared/TransactionRunner.h"
#include "../../UseCases/Shared/IdempotencyService.h"
#include "../../UseCases/Shared/OperationLockService.h"
#include "../../UseCases/Table/SelectTableUseCase.h"
#include "../../UseCases/Table/RefreshTablesUseCase.h"
// TODO: Thêm khi triển khai / 구현 시 추가
// #include "../../UseCases/Order/CreateOrderUseCase.h"
// #include "../../UseCases/Payment/ExecutePaymentUseCase.h"

// ── Tầng 4: Presentation — UI kênh giao tiếp / UI 통신 채널 ──
#include "../../Presentation/CEF/InternalBridge/PosRealTimeSender.h"
// TODO: Thêm khi tích hợp Actions với UseCase / Actions와 UseCase 연결 시 추가
// #include "../../Presentation/CEF/InternalBridge/PosRequestActions/Table/TableActions.h"


// ══════════════════════════════════════════════════════
// ComposeApp — Điểm lắp ráp DUY NHẤT của ứng dụng
// ComposeApp — 앱의 유일한 조립 지점
//
// Mô hình: Đọc từ dưới lên, tạo từ trên xuống
// 모델: 아래서 위로 읽고, 위에서 아래로 생성
//
// 1단계  Infrastructure  (nền tảng / 기반)
//   ↓
// 2단계  Domain/Manager  (nghiệp vụ / 업무)
//   ↓
// 3단계  UseCases Shared (dịch vụ chung / 공통 서비스)
//   ↓
// 4단계  Presentation    (kênh UI / UI 채널)
//   ↓
// 5단계  UseCases cụ thể (use case thực / 실제 유스케이스)
//   ↓
// 6단계  Đăng ký vào Registry (등록)
// ══════════════════════════════════════════════════════

void ComposeApp(ServiceRegistry& registry, CefBrowserDlg* browser_dlg) {

    // ══════════════════════════════════════════
    // 1단계: Infrastructure — Nền tảng
    // 1단계: Infrastructure — 기반
    //
    // Tầng thấp nhất. Không phụ thuộc ai.
    // 가장 낮은 계층. 누구에게도 의존하지 않는다.
    // ══════════════════════════════════════════

    // DB kết nối / DB 연결
    // Tương đương code cũ: g_DbAccess (biến toàn cục)
    // 대응하는 기존 코드: g_DbAccess (전역 변수)
    auto db_access = std::make_shared<DBAccess>();
    // TODO: Mở kết nối DB thực tế / 실제 DB 연결 열기
    // db_access->Open("Server=localhost;Database=POS;Trusted_Connection=yes;");

    // Ledger Store — Lưu trạng thái idempotency
    // Ledger Store — 멱등성 상태 저장
    auto ledger_store = std::make_shared<RequestLedgerStore>();

    // Outbox Store — Hàng đợi đồng bộ đến server trung tâm
    // Outbox Store — 중앙 서버 동기화 큐
    auto outbox_store = std::make_shared<OutboxStore>();


    // ══════════════════════════════════════════
    // 2단계: Domain/Manager — Quy tắc nghiệp vụ
    // 2단계: Domain/Manager — 업무 규칙
    //
    // Manager biết DBAccess (SQL bên trong).
    // Manager는 DBAccess를 알고 있음 (내부에 SQL 포함).
    //
    // ※ Manager KHÔNG nhận PosRealTimeSender
    //    → Đây là cách enforce quy tắc "Manager không gửi UI event"
    //    Manager는 PosRealTimeSender를 받지 않음
    //    → "Manager는 UI 이벤트를 보내지 않는다" 규칙을 코드로 강제
    // ══════════════════════════════════════════

    auto table_mgr = std::make_shared<TableMgr>();
    // TODO: Thêm khi triển khai / 구현 시 추가
    // auto order_mgr = std::make_shared<OrderMgr>();
    // auto sale_mgr  = std::make_shared<SaleMgr>();


    // ══════════════════════════════════════════
    // 3단계: UseCases Shared — Dịch vụ dùng chung
    // 3단계: UseCases Shared — 공통 서비스
    // ══════════════════════════════════════════

    // Transaction runner — Bọc DB transaction
    // Transaction runner — DB 트랜잭션 래퍼
    // TODO: Truyền IDbConnection thực tế khi tích hợp ADO
    // TODO: ADO 통합 시 실제 IDbConnection 전달
    auto tx_runner = std::make_shared<TransactionRunner>(nullptr);

    // Idempotency service — Kiểm tra trùng lặp bằng Ledger
    // Idempotency service — Ledger를 사용한 중복 검사
    auto idempotency_svc = std::make_shared<IdempotencyService>(ledger_store.get());

    // OperationLockService là singleton — không cần tạo ở đây
    // OperationLockService는 싱글턴 — 여기서 생성할 필요 없음
    // UseCase truy cập qua OperationLockService::Get()
    // UseCase는 OperationLockService::Get()으로 접근


    // ══════════════════════════════════════════
    // 4단계: Presentation — Kênh gửi sự kiện UI
    // 4단계: Presentation — UI 이벤트 전송 채널
    //
    // ※ Chỉ UseCase nhận PosRealTimeSender
    //    Manager và ExternalBridge KHÔNG nhận
    //    UseCase만 PosRealTimeSender를 받음
    //    Manager와 ExternalBridge는 받지 않음
    // ══════════════════════════════════════════

    auto realtime_sender = std::make_shared<PosRealTimeSender>(browser_dlg);


    // ══════════════════════════════════════════
    // 5단계: UseCases cụ thể — Lắp ráp use case
    // 5단계: 구체적 UseCase — 유스케이스 조립
    //
    // Đây là bước QUAN TRỌNG NHẤT:
    // 이것이 가장 중요한 단계:
    //   "Ai nhận gì" được quyết định ở đây
    //   "누가 무엇을 받는지"가 여기서 결정된다
    // ══════════════════════════════════════════

    // SelectTableUseCase — Chọn bàn
    // SelectTableUseCase — 테이블 선택
    //   Nhận: TableMgr + TransactionRunner + IdempotencyService + RealTimeSender
    //   받는 것: TableMgr + TransactionRunner + IdempotencyService + RealTimeSender
    auto select_table_uc = std::make_shared<SelectTableUseCase>(
        table_mgr.get(),            // Domain: Quy tắc bàn / 테이블 규칙
        tx_runner.get(),            // Shared: Transaction / 트랜잭션
        idempotency_svc.get(),      // Shared: Chống trùng lặp / 중복 방지
        realtime_sender.get()       // Presentation: UI event / UI 이벤트
    );

    // RefreshTablesUseCase — Lấy danh sách bàn (read-only)
    // RefreshTablesUseCase — 테이블 목록 조회 (읽기 전용)
    //   Chỉ nhận TableMgr (không cần transaction, lock, idempotency)
    //   TableMgr만 받음 (트랜잭션, 락, 멱등성 불필요)
    auto refresh_tables_uc = std::make_shared<RefreshTablesUseCase>(
        table_mgr.get()             // Domain: Quy tắc bàn / 테이블 규칙
    );

    // TODO: Thêm khi triển khai / 구현 시 추가
    //
    // auto create_order_uc = std::make_shared<CreateOrderUseCase>(
    //     order_mgr.get(),
    //     table_mgr.get(),
    //     tx_runner.get(),
    //     idempotency_svc.get(),
    //     ledger_store.get(),
    //     outbox_store.get(),
    //     realtime_sender.get()
    // );
    //
    // auto execute_payment_uc = std::make_shared<ExecutePaymentUseCase>(
    //     sale_mgr.get(),
    //     order_mgr.get(),
    //     table_mgr.get(),
    //     tx_runner.get(),
    //     idempotency_svc.get(),
    //     ledger_store.get(),
    //     outbox_store.get(),
    //     realtime_sender.get()
    // );


    // ══════════════════════════════════════════
    // 6단계: Đăng ký vào ServiceRegistry
    // 6단계: ServiceRegistry에 등록
    //
    // PosRequestResponder sẽ Resolve<>() để lấy UseCase cần thiết
    // PosRequestResponder가 Resolve<>()로 필요한 UseCase를 꺼냄
    //
    // ※ Manager KHÔNG đăng ký vào registry
    //    (chỉ UseCase mới được Actions truy cập)
    //    Manager는 registry에 등록하지 않음
    //    (Actions는 UseCase만 접근 가능)
    // ══════════════════════════════════════════

    registry.Register<SelectTableUseCase>(select_table_uc);
    registry.Register<RefreshTablesUseCase>(refresh_tables_uc);
    // TODO: Thêm khi triển khai / 구현 시 추가
    // registry.Register<CreateOrderUseCase>(create_order_uc);
    // registry.Register<ExecutePaymentUseCase>(execute_payment_uc);

    // Đăng ký RealTimeSender (PosRequestResponder có thể cần)
    // RealTimeSender 등록 (PosRequestResponder가 필요할 수 있음)
    registry.Register<PosRealTimeSender>(realtime_sender);
}
