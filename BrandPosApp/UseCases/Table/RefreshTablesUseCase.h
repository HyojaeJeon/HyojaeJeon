#pragma once
/**
 * RefreshTablesUseCase — Use case làm mới danh sách bàn
 * RefreshTablesUseCase — 테이블 목록 갱신 유스케이스
 *
 * Tầng: UseCases / 계층: UseCases
 *
 * Vai trò / 역할:
 *   Trả về danh sách tất cả bàn cho UI hiển thị.
 *   UI 표시를 위해 전체 테이블 목록을 반환한다.
 *
 *   Đây là UseCase CHỈ ĐỌC (read-only) nên:
 *   이것은 읽기 전용(read-only) UseCase이므로:
 *     - Không cần Transaction / 트랜잭션 불필요
 *     - Không cần Idempotency / 멱등성 불필요
 *     - Không cần Lock / 락 불필요
 *     - Không cần Ledger/Outbox / Ledger/Outbox 불필요
 *
 * Tương đương code cũ / 대응하는 기존 코드:
 *   TableDlg::OnInitDialog() hoặc TableDlg::TableRefresh()
 *   → g_TableManager->InitTable() + g_TableManager->m_TableLst duyệt
 */

#include "../SharedAssets/UseCaseResult.h"
#include "../SharedAssets/RequestContext.h"

class TableManager;

class RefreshTablesUseCase {
public:
    // ──────────────────────────────────────────
    // Constructor — Chỉ cần TableManager (read-only UseCase)
    // Constructor — TableManager만 필요 (읽기 전용 UseCase)
    //
    // ※ Không nhận TransactionRunner, IdempotencyService, LockService
    //    vì UseCase này chỉ đọc, không ghi.
    //    TransactionRunner, IdempotencyService, LockService를 받지 않음
    //    이 UseCase는 읽기만 하고 쓰기를 하지 않기 때문.
    // ──────────────────────────────────────────
    explicit RefreshTablesUseCase(TableManager* tableMgr);

    // ──────────────────────────────────────────
    // Execute — Lấy danh sách bàn
    // Execute — 테이블 목록 조회
    //
    // @param ctx       Metadata yêu cầu / 요청 메타데이터
    // @param floorId  Lọc theo tầng (0 = tất cả) / 층별 필터 (0 = 전체)
    // @return UseCaseResult chứa JSON danh sách bàn
    //         테이블 목록 JSON이 포함된 UseCaseResult
    // ──────────────────────────────────────────
    UseCaseResult Execute(const RequestContext& ctx, int floorId = 0);

private:
    TableManager* tableMgr_;  // non-owning
};
