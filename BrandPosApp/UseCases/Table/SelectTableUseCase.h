#pragma once
/**
 * SelectTableUseCase — Use case chọn bàn
 * SelectTableUseCase — 테이블 선택 유스케이스
 *
 * Tầng: UseCases / 계층: UseCases
 *
 * Vai trò / 역할:
 *   Khi nhân viên chọn một bàn trên màn hình, UseCase này:
 *   직원이 화면에서 테이블을 선택할 때 이 UseCase가:
 *     1. Kiểm tra idempotency (chống nhấn đúp)
 *        멱등성 검사 (더블 클릭 방지)
 *     2. Khóa tác vụ (chống xử lý đồng thời cùng bàn)
 *        작업 단위 락 (같은 테이블 동시 처리 방지)
 *     3. Gọi TableManager để chiếm bàn (quy tắc nghiệp vụ)
 *        TableManager를 호출하여 테이블 점유 (업무 규칙)
 *     4. Ghi Ledger (theo dõi trạng thái xử lý)
 *        Ledger 기록 (처리 상태 추적)
 *     5. Commit transaction
 *        트랜잭션 커밋
 *     6. SAU commit: Gửi sự kiện UI qua PosRealTimeSender
 *        커밋 후: PosRealTimeSender로 UI 이벤트 전송
 *
 * Tương đương code cũ / 대응하는 기존 코드:
 *   TableDlg::OnLButtonDown() hoặc OnTableBtn()
 *   → g_TableManager->SetUseSysn(...)
 *   → g_TableManager->GetTableFromTableCode(...)
 *   → UpdateUI trực tiếp
 *
 *   기존에는 Dlg에서 Manager 직접 호출 + UI 직접 갱신이었으나,
 *   리팩토링 후에는 UseCase가 Manager 호출 + UI 알림을 분리하여 관리.
 *
 * Cấm ở UseCase / UseCase에서 금지:
 *   ❌ Gọi SQL trực tiếp — ủy quyền cho Manager
 *      SQL 직접 실행 — Manager에 위임
 *   ❌ Gọi Manager khác ngoài phạm vi use case này
 *      이 UseCase 범위 외의 다른 Manager 호출
 */

#include "../SharedAssets/UseCaseResult.h"
#include "../SharedAssets/RequestContext.h"

// Chuyển tiếp khai báo / 전방 선언
// Mỗi class sẽ được inject qua constructor (Bootstrap lắp ráp)
// 각 클래스는 생성자를 통해 주입됨 (Bootstrap에서 조립)
class TableManager;
class TransactionRunner;
class IdempotencyService;
class PosRealTimeSender;

class SelectTableUseCase {
public:
    // ──────────────────────────────────────────
    // Constructor — Nhận dependency từ Bootstrap
    // Constructor — Bootstrap에서 의존성을 주입받는다
    //
    // Tại sao truyền con trỏ thô? / 왜 raw 포인터로 전달하는가?
    //   Vì đời sống (lifetime) của các service được ServiceRegistry quản lý.
    //   UseCase không sở hữu chúng, chỉ mượn dùng.
    //   서비스의 수명(lifetime)은 ServiceRegistry가 관리한다.
    //   UseCase는 이들을 소유하지 않고, 빌려서 사용할 뿐이다.
    // ──────────────────────────────────────────
    SelectTableUseCase(
        TableManager*           tableMgr,
        TransactionRunner*  txRunner,
        IdempotencyService* idempotency,
        PosRealTimeSender*  realtimeSender
    );

    // ──────────────────────────────────────────
    // Execute — Điểm vào thực thi use case
    // Execute — 유스케이스 실행 진입점
    //
    // Được gọi bởi TableActions (thin router).
    // TableActions(thin router)에서 호출된다.
    //
    // @param ctx         Metadata yêu cầu / 요청 메타데이터
    // @param tableCode  Mã bàn cần chọn / 선택할 테이블 코드
    // @return UseCaseResult — Kết quả chuẩn / 표준 결과
    // ──────────────────────────────────────────
    UseCaseResult Execute(const RequestContext& ctx, int tableCode);

private:
    // ──────────────────────────────────────────
    // Dependency — Không sở hữu, chỉ mượn dùng (non-owning)
    // 의존성 — 소유하지 않음, 빌려 쓰기만 함 (non-owning)
    // ──────────────────────────────────────────
    TableManager*           tableMgr_;        // Domain: Quy tắc nghiệp vụ bàn / 테이블 업무 규칙
    TransactionRunner*  txRunner_;         // Shared: Transaction wrapper / 트랜잭션 래퍼
    IdempotencyService* idempotency_;       // Shared: Kiểm tra trùng lặp / 중복 검사
    PosRealTimeSender*  realtimeSender_;   // Presentation: UI event / UI 이벤트 전송
};
