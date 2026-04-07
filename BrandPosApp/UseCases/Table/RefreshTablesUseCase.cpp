#include "RefreshTablesUseCase.h"
#include "../../Domain/Table/TableManager.h"

#include <sstream>

// ══════════════════════════════════════════
// Constructor
// ══════════════════════════════════════════

RefreshTablesUseCase::RefreshTablesUseCase(TableManager* tableMgr)
    : tableMgr_(tableMgr)
{
}

// ══════════════════════════════════════════
// Execute — Lấy danh sách bàn và trả về JSON
// Execute — 테이블 목록을 조회하여 JSON으로 반환
// ══════════════════════════════════════════

UseCaseResult RefreshTablesUseCase::Execute(const RequestContext& ctx, int floorId) {

    // ──────────────────────────────────────────
    // Read-only UseCase nên KHÔNG có:
    // 읽기 전용 UseCase이므로 아래 항목 없음:
    //   ❌ Idempotency check / 멱등성 검사
    //   ❌ Lock / 락
    //   ❌ Transaction / 트랜잭션
    //   ❌ Ledger / Outbox 기록
    //   ❌ PosRealTimeSender / UI 이벤트 전송
    //
    // Chỉ gọi Manager để lấy dữ liệu và trả về
    // Manager를 호출하여 데이터를 가져오고 반환할 뿐
    // ──────────────────────────────────────────

    // ① Gọi Manager để lấy danh sách bàn
    // ① Manager를 호출하여 테이블 목록 조회
    auto tables = tableMgr_->GetAllTables(floorId);

    // ② Chuyển đổi thành JSON
    // ② JSON으로 변환
    //
    // Tương đương code cũ / 대응하는 기존 코드:
    //   Code cũ: Dlg duyệt m_TableLst (CPtrList) rồi vẽ button
    //   기존: Dlg가 m_TableLst(CPtrList)를 순회하여 버튼을 그림
    //
    //   Sau refactoring: UseCase trả JSON → UI (Next.js) tự render
    //   리팩토링 후: UseCase가 JSON 반환 → UI(Next.js)가 자체 렌더링
    //
    // ※ Dùng ostringstream vì không có thư viện JSON ngoài
    //    외부 JSON 라이브러리가 없으므로 ostringstream 사용
    std::ostringstream json;
    json << "{\"tables\":[";

    for (size_t i = 0; i < tables.size(); ++i) {
        const auto& t = tables[i];

        if (i > 0) json << ",";

        json << "{"
             << "\"tableCode\":" << t.table_code
             << ",\"floorId\":" << t.floorId
             << ",\"tableName\":\"" << t.table_name << "\""
             << ",\"status\":\"" << t.status << "\""
             << ",\"orderNo\":" << t.order_no
             << "}";
    }

    json << "],\"maxFloor\":" << tableMgr_->GetMaxFloor() << "}";

    return UseCaseResult::Success(json.str());
}
