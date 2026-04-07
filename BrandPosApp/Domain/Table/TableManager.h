#pragma once
/**
 * TableManager — Quy tắc nghiệp vụ bàn / Quản lý trạng thái bàn
 * TableManager — 테이블 업무 규칙 / 상태 변경 관리
 *
 * Tầng: Domain / 계층: Domain
 *
 * Vai trò / 역할:
 *   - Quản lý danh sách bàn, trạng thái bàn (trống/đang dùng/khóa)
 *     테이블 목록 관리, 테이블 상태 관리 (빈/사용중/잠금)
 *   - Tính toán quy tắc nghiệp vụ bàn (di chuyển, gộp, tách)
 *     테이블 업무 규칙 계산 (이동, 합석, 분리)
 *   - Đọc/ghi DB (SQL bên trong Manager — không tách Repository)
 *     DB 읽기/쓰기 (SQL은 Manager 내부 — Repository 분리하지 않음)
 *
 * Refactoring từ / 리팩토링 원본:
 *   HJ-POS-TEST/DB/TableManager.h — CTableManager : public CMgr
 *   Chức năng từ CTableManager được chuyển về đây,
 *   nhưng loại bỏ phần UI (pBtn, pImgBtn, pTableDlg) và
 *   phần trách nhiệm của UseCase (transaction, UI notification).
 *   기존 CTableManager의 기능을 가져오되,
 *   UI(pBtn, pImgBtn, pTableDlg)와
 *   UseCase 책임(트랜잭션, UI 알림)은 제거한다.
 *
 * Cấm / 금지:
 *   ❌ Gọi PosRealTimeSender (UI event) — chỉ UseCase có quyền
 *      PosRealTimeSender 호출 — UseCase만 권한 있음
 *   ❌ Gọi Manager khác (OrderMgr, SaleMgr...)
 *      다른 Manager 호출 (OrderMgr, SaleMgr...)
 *   ❌ Quản lý transaction — UseCase quản lý
 *      트랜잭션 관리 — UseCase가 관리
 */

#include <string>
#include <vector>
#include <optional>

// Tham chiếu row struct từ tầng Infrastructure
// Infrastructure 계층의 row 구조체 참조
#include "../../Infrastructure/Persistence/MSSQL/Tables/Table/TableCrud.h"

// ──────────────────────────────────────────────
// TableStatus — Hằng số trạng thái bàn
// TableStatus — 테이블 상태 상수
//
// Tương đương với tTable.TableType trong code cũ
// 기존 코드의 tTable.TableType에 대응
// ──────────────────────────────────────────────
namespace TableStatus {
    constexpr const char* EMPTY    = "E";  // Bàn trống / 빈 테이블
    constexpr const char* OCCUPIED = "U";  // Đang sử dụng / 사용중
    constexpr const char* LOCKED   = "L";  // Bị khóa / 잠금
}

// ──────────────────────────────────────────────
// TableResult — Kết quả trả về từ Manager cho UseCase
// TableResult — Manager가 UseCase에 돌려주는 결과
//
// Manager không trả về UseCaseResult, chỉ trả kết quả nghiệp vụ.
// UseCase sẽ chuyển thành UseCaseResult.
// Manager는 UseCaseResult를 반환하지 않고, 업무 결과만 반환한다.
// UseCase가 UseCaseResult로 변환한다.
// ──────────────────────────────────────────────
struct TableResult {
    bool success = false;
    int table_code = 0;
    std::string status;
    std::string error_code;
    std::string error_detail;
};

class TableManager {
public:
    TableManager();
    ~TableManager();

    // ══════════════════════════════════════════
    // Truy vấn bàn / 테이블 조회
    // ══════════════════════════════════════════

    // ──────────────────────────────────────────
    // GetAllTables — Lấy danh sách tất cả các bàn
    // GetAllTables — 전체 테이블 목록 조회
    //
    // Tương đương: CTableManager::InitTable() phần SELECT
    // 대응: CTableManager::InitTable()의 SELECT 부분
    //
    // @param floor_id  Lọc theo tầng (0 = tất cả) / 층별 필터 (0 = 전체)
    // @return Danh sách TableRecord / TableRecord 목록
    // ──────────────────────────────────────────
    std::vector<TableRecord> GetAllTables(int floor_id = 0);

    // ──────────────────────────────────────────
    // GetTableByCode — Lấy thông tin 1 bàn theo mã
    // GetTableByCode — 테이블 코드로 1개 테이블 조회
    //
    // Tương đương: CTableManager::GetTableFromTableCode(int)
    // 대응: CTableManager::GetTableFromTableCode(int)
    //
    // @param table_code  Mã bàn / 테이블 코드
    // @return TableRecord hoặc nullopt nếu không tìm thấy
    //         TableRecord 또는 찾지 못하면 nullopt
    // ──────────────────────────────────────────
    std::optional<TableRecord> GetTableByCode(int table_code);

    // ──────────────────────────────────────────
    // GetMaxFloor — Lấy số tầng lớn nhất
    // GetMaxFloor — 최대 층 번호 조회
    //
    // Tương đương: CTableManager::m_nMaxFloor
    // 대응: CTableManager::m_nMaxFloor
    // ──────────────────────────────────────────
    int GetMaxFloor();

    // ══════════════════════════════════════════
    // Thay đổi trạng thái bàn / 테이블 상태 변경
    // ══════════════════════════════════════════

    // ──────────────────────────────────────────
    // OccupyTable — Chuyển bàn sang trạng thái "đang sử dụng"
    // OccupyTable — 테이블을 "사용중" 상태로 변경
    //
    // Quy tắc nghiệp vụ / 업무 규칙:
    //   - Bàn đã đang dùng → thất bại (ALREADY_OCCUPIED)
    //     이미 사용중인 테이블 → 실패 (ALREADY_OCCUPIED)
    //   - Bàn bị khóa → thất bại (TABLE_LOCKED)
    //     잠긴 테이블 → 실패 (TABLE_LOCKED)
    //
    // Tương đương: CTableManager::SetUseSysn(UseSysn, TRUE, TableCode) phần logic
    // 대응: CTableManager::SetUseSysn(UseSysn, TRUE, TableCode) 중 로직 부분
    //
    // @param table_code  Mã bàn / 테이블 코드
    // @return TableResult
    // ──────────────────────────────────────────
    TableResult OccupyTable(int table_code);

    // ──────────────────────────────────────────
    // ReleaseTable — Giải phóng bàn (chuyển sang trống)
    // ReleaseTable — 테이블 해제 (빈 상태로 변경)
    //
    // Quy tắc nghiệp vụ / 업무 규칙:
    //   - Bàn đã trống → thất bại (ALREADY_EMPTY)
    //     이미 빈 테이블 → 실패 (ALREADY_EMPTY)
    //
    // Tương đương: Một phần của AccountDlg::OnBtnPayment() sau khi thanh toán xong
    // 대응: AccountDlg::OnBtnPayment()에서 결제 완료 후 테이블 해제 부분
    //
    // @param table_code  Mã bàn / 테이블 코드
    // @return TableResult
    // ──────────────────────────────────────────
    TableResult ReleaseTable(int table_code);

    // ──────────────────────────────────────────
    // ChangeTable — Di chuyển đơn hàng từ bàn cũ sang bàn mới
    // ChangeTable — 기존 테이블에서 새 테이블로 주문 이동
    //
    // Quy tắc nghiệp vụ / 업무 규칙:
    //   - Bàn nguồn phải đang sử dụng / 원본 테이블이 사용중이어야 함
    //   - Bàn đích phải trống / 대상 테이블이 비어있어야 함
    //   - UPDATE trạng thái 2 bàn / 두 테이블 상태 UPDATE
    //
    // Tương đương: CTableManager::ChangeTable(tTable*, tTable*)
    // 대응: CTableManager::ChangeTable(tTable*, tTable*)
    //
    // @param from_table_code  Mã bàn nguồn / 원본 테이블 코드
    // @param to_table_code    Mã bàn đích / 대상 테이블 코드
    // @return TableResult
    // ──────────────────────────────────────────
    TableResult ChangeTable(int from_table_code, int to_table_code);

    // ══════════════════════════════════════════
    // Kiểm tra trạng thái / 상태 확인
    // ══════════════════════════════════════════

    // ──────────────────────────────────────────
    // IsOccupied — Kiểm tra bàn có đang sử dụng không
    // IsOccupied — 테이블이 사용중인지 확인
    //
    // Tương đương: CTableManager::UseSysnCheck()
    // 대응: CTableManager::UseSysnCheck()
    // ──────────────────────────────────────────
    bool IsOccupied(int table_code);

    // ──────────────────────────────────────────
    // IsLocked — Kiểm tra bàn có bị khóa không
    // IsLocked — 테이블이 잠겨있는지 확인
    // ──────────────────────────────────────────
    bool IsLocked(int table_code);
};
