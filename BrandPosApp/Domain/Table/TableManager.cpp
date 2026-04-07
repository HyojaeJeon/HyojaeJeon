#include "TableManager.h"

// Tham chiếu SQL helper và Mapper từ tầng Infrastructure
// Infrastructure 계층의 SQL helper와 Mapper 참조
// Record, Columns, Crud, Mapper가 모두 TableCrud.h에 통합됨
// Record, Columns, Crud, Mapper đều được tích hợp trong TableCrud.h
// (Domain/TableManager.h에서 include됨 / đã include trong Domain/TableManager.h)

// TODO: Khi tích hợp ADO thực tế, thay thế bằng #include thực
// TODO: 실제 ADO 통합 시 실제 #include로 교체
// #include "../../Infrastructure/Persistence/MSSQL/AdoWraper.h"

// ══════════════════════════════════════════
// Constructor / Destructor
// ══════════════════════════════════════════

TableManager::TableManager() {
    // Trong code cũ (CTableManager::CTableManager):
    //   m_nMaxFloor=1, m_pTableDlg=NULL, m_pMaxPage=NULL
    //   Khởi tạo các biến liên quan đến UI button
    //
    // 기존 코드 (CTableManager::CTableManager):
    //   m_nMaxFloor=1, m_pTableDlg=NULL, m_pMaxPage=NULL
    //   UI 버튼 관련 변수 초기화
    //
    // Sau refactoring: UI button (pBtn, pImgBtn) đã loại bỏ
    // Manager chỉ quản lý dữ liệu nghiệp vụ
    // 리팩토링 후: UI 버튼(pBtn, pImgBtn)은 제거됨
    // Manager는 업무 데이터만 관리
}

TableManager::~TableManager() {
    // Trong code cũ: ClearTableAll(), ClearImgTable(), delete[] m_pMaxPage
    // Xóa bộ nhớ CPtrList, button, hình ảnh
    //
    // 기존 코드: ClearTableAll(), ClearImgTable(), delete[] m_pMaxPage
    // CPtrList, 버튼, 이미지 메모리 해제
    //
    // Sau refactoring: Dùng std::vector<TableRecord> nên không cần xóa thủ công
    // 리팩토링 후: std::vector<TableRecord>을 사용하므로 수동 해제 불필요
}

// ══════════════════════════════════════════
// Truy vấn bàn / 테이블 조회
// ══════════════════════════════════════════

std::vector<TableRecord> TableManager::GetAllTables(int floor_id) {
    // ──────────────────────────────────────────
    // Tương đương code cũ: CTableManager::InitTable()
    // 대응하는 기존 코드: CTableManager::InitTable()
    //
    // Code cũ:
    //   sql.Format(_T("Select FloorNum,LineNum,ColNum,TableType,...
    //     From TableManager WHERE DelFlag is NULL Order by FloorNum,PageNum"));
    //   m_pRecordSet->OpenQuery(sql);
    //   while(!m_pRecordSet->IsEOF()) {
    //     tTable *pTb = new tTable;
    //     m_pRecordSet->GetFieldValue(index++, pTb->FloorNum);
    //     ... (25 dòng GetFieldValue)
    //     m_TableLst.AddTail(pTb);
    //   }
    //
    // Sau refactoring:
    //   - SQL được tạo bởi TableCrud (Infrastructure tầng)
    //     SQL은 TableCrud(Infrastructure 계층)이 생성
    //   - Mapping được xử lý bởi TableMapper
    //     매핑은 TableMapper가 처리
    //   - Trả về std::vector thay vì CPtrList (không rò rỉ bộ nhớ)
    //     CPtrList 대신 std::vector 반환 (메모리 누수 없음)
    // ──────────────────────────────────────────

    std::vector<TableRecord> result;

    // TODO: Tích hợp ADO thực tế
    // TODO: 실제 ADO 통합
    //
    // Khi tích hợp thực tế, code sẽ như sau:
    // 실제 통합 시 코드는 아래와 같다:
    //
    // std::string sql = TableCrud::SelectAll(floor_id);
    // CADORecordset rs(g_DbAccess->GetDatabase());
    // if (!rs.OpenQuery(sql.c_str())) return result;
    // while (!rs.IsEOF()) {
    //     result.push_back(TableMapper::FromRecordset(rs));
    //     rs.MoveNext();
    // }

    return result;
}

std::optional<TableRecord> TableManager::GetTableByCode(int table_code) {
    // ──────────────────────────────────────────
    // Tương đương code cũ: CTableManager::GetTableFromTableCode(int)
    // 대응하는 기존 코드: CTableManager::GetTableFromTableCode(int)
    //
    // Code cũ: Duyệt m_TableLst (CPtrList) để tìm bàn có mã phù hợp
    // 기존 코드: m_TableLst(CPtrList)를 순회하여 일치하는 테이블 찾기
    //
    // Sau refactoring: Truy vấn trực tiếp DB bằng SQL
    // 리팩토링 후: SQL로 DB 직접 조회
    // ──────────────────────────────────────────

    // TODO: Tích hợp ADO thực tế
    // TODO: 실제 ADO 통합
    //
    // std::string sql = TableCrud::SelectByTableCode(table_code);
    // CADORecordset rs(g_DbAccess->GetDatabase());
    // if (!rs.OpenQuery(sql.c_str()) || rs.IsEOF()) return std::nullopt;
    // return TableMapper::FromRecordset(rs);

    return std::nullopt;
}

int TableManager::GetMaxFloor() {
    // ──────────────────────────────────────────
    // Tương đương code cũ: CTableManager::m_nMaxFloor
    // 대응하는 기존 코드: CTableManager::m_nMaxFloor
    //
    // Code cũ: Được tính trong InitTable() khi duyệt bảng
    // 기존 코드: InitTable()에서 테이블 순회 시 계산됨
    //
    // Sau refactoring: Truy vấn trực tiếp SQL MAX(FloorNum)
    // 리팩토링 후: SQL MAX(FloorNum) 직접 조회
    // ──────────────────────────────────────────

    // TODO: Tích hợp ADO thực tế
    // TODO: 실제 ADO 통합
    //
    // std::string sql = "SELECT ISNULL(MAX(FloorNum), 1) FROM TableManager WHERE DelFlag IS NULL";
    // CADORecordset rs(g_DbAccess->GetDatabase());
    // if (!rs.OpenQuery(sql.c_str()) || rs.IsEOF()) return 1;
    // int max_floor = 1;
    // rs.GetFieldValue(0, max_floor);
    // return max_floor;

    return 1;
}

// ══════════════════════════════════════════
// Thay đổi trạng thái bàn / 테이블 상태 변경
// ══════════════════════════════════════════

TableResult TableManager::OccupyTable(int table_code) {
    // ──────────────────────────────────────────
    // Chiếm bàn (chuyển sang "đang dùng")
    // 테이블 점유 ("사용중"으로 변경)
    //
    // Tương đương code cũ:
    //   CTableManager::SetUseSysn(UseSysn, TRUE, TableCode)
    //   + Logic kiểm tra trong TableDlg khi chọn bàn
    //
    // 대응하는 기존 코드:
    //   CTableManager::SetUseSysn(UseSysn, TRUE, TableCode)
    //   + TableDlg에서 테이블 선택 시 검증 로직
    //
    // ※ Code cũ: Logic kiểm tra nằm rải rác trong Dlg
    //    기존: 검증 로직이 Dlg에 흩어져 있었음
    // ※ Sau refactoring: Tập trung vào Manager
    //    리팩토링 후: Manager에 집중
    // ──────────────────────────────────────────

    TableResult result;
    result.table_code = table_code;

    // Bước 1: Lấy thông tin bàn hiện tại
    // 1단계: 현재 테이블 정보 조회
    auto table = GetTableByCode(table_code);
    if (!table.has_value()) {
        result.success = false;
        result.error_code = "TABLE_NOT_FOUND";
        result.error_detail = "TableManager code " + std::to_string(table_code) + " not found";
        return result;
    }

    // Bước 2: Kiểm tra quy tắc nghiệp vụ — bàn đã đang dùng?
    // 2단계: 업무 규칙 확인 — 이미 사용중인가?
    if (table->status == TableStatus::OCCUPIED) {
        result.success = false;
        result.error_code = "ALREADY_OCCUPIED";
        result.error_detail = "TableManager " + std::to_string(table_code) + " is already occupied";
        return result;
    }

    // Bước 3: Kiểm tra quy tắc nghiệp vụ — bàn bị khóa?
    // 3단계: 업무 규칙 확인 — 잠긴 테이블인가?
    if (table->status == TableStatus::LOCKED) {
        result.success = false;
        result.error_code = "TABLE_LOCKED";
        result.error_detail = "TableManager " + std::to_string(table_code) + " is locked";
        return result;
    }

    // Bước 4: Cập nhật trạng thái trong DB
    // 4단계: DB에 상태 업데이트
    //
    // ※ Transaction KHÔNG bắt đầu ở đây — UseCase quản lý
    //    트랜잭션은 여기서 시작하지 않음 — UseCase가 관리
    //
    // TODO: Tích hợp ADO thực tế
    // TODO: 실제 ADO 통합
    //
    // std::string sql = TableCrud::UpdateStatus(table_code, TableStatus::OCCUPIED);
    // if (!g_DbAccess->ExecuteQuery(sql.c_str())) {
    //     result.success = false;
    //     result.error_code = "DB_ERROR";
    //     return result;
    // }

    result.success = true;
    result.status = TableStatus::OCCUPIED;
    return result;
}

TableResult TableManager::ReleaseTable(int table_code) {
    // ──────────────────────────────────────────
    // Giải phóng bàn (chuyển sang "trống")
    // 테이블 해제 ("빈" 상태로 변경)
    //
    // Tương đương code cũ:
    //   Phần cuối AccountDlg::OnBtnPayment() — sau khi thanh toán xong,
    //   Dlg tự gọi g_TableManager để đổi trạng thái bàn.
    //
    // 대응하는 기존 코드:
    //   AccountDlg::OnBtnPayment() 끝 부분 — 결제 완료 후
    //   Dlg가 직접 g_TableManager를 호출하여 테이블 상태를 변경했었음.
    //
    // ※ Sau refactoring: ExecutePaymentUseCase gọi hàm này
    //    리팩토링 후: ExecutePaymentUseCase가 이 함수를 호출
    // ──────────────────────────────────────────

    TableResult result;
    result.table_code = table_code;

    // Bước 1: Kiểm tra — bàn có đang dùng không?
    // 1단계: 확인 — 테이블이 사용중인가?
    auto table = GetTableByCode(table_code);
    if (!table.has_value()) {
        result.success = false;
        result.error_code = "TABLE_NOT_FOUND";
        return result;
    }

    if (table->status == TableStatus::EMPTY) {
        result.success = false;
        result.error_code = "ALREADY_EMPTY";
        result.error_detail = "TableManager " + std::to_string(table_code) + " is already empty";
        return result;
    }

    // Bước 2: UPDATE trạng thái sang EMPTY
    // 2단계: EMPTY 상태로 UPDATE
    //
    // TODO: Tích hợp ADO thực tế
    // TODO: 실제 ADO 통합
    //
    // std::string sql = TableCrud::UpdateStatus(table_code, TableStatus::EMPTY);
    // g_DbAccess->ExecuteQuery(sql.c_str());

    result.success = true;
    result.status = TableStatus::EMPTY;
    return result;
}

TableResult TableManager::ChangeTable(int from_table_code, int to_table_code) {
    // ──────────────────────────────────────────
    // Di chuyển đơn hàng từ bàn cũ sang bàn mới
    // 기존 테이블에서 새 테이블로 주문 이동
    //
    // Tương đương code cũ: CTableManager::ChangeTable(tTable*, tTable*)
    // 대응하는 기존 코드: CTableManager::ChangeTable(tTable*, tTable*)
    //
    // Quy tắc nghiệp vụ / 업무 규칙:
    //   1. Bàn nguồn phải OCCUPIED / 원본 테이블이 OCCUPIED여야 함
    //   2. Bàn đích phải EMPTY / 대상 테이블이 EMPTY여야 함
    //   3. UPDATE 2 bàn: nguồn → EMPTY, đích → OCCUPIED
    //      2개 테이블 UPDATE: 원본 → EMPTY, 대상 → OCCUPIED
    // ──────────────────────────────────────────

    TableResult result;
    result.table_code = to_table_code;

    // Bước 1: Kiểm tra bàn nguồn
    // 1단계: 원본 테이블 확인
    auto from_table = GetTableByCode(from_table_code);
    if (!from_table.has_value()) {
        result.success = false;
        result.error_code = "SOURCE_TABLE_NOT_FOUND";
        return result;
    }
    if (from_table->status != TableStatus::OCCUPIED) {
        result.success = false;
        result.error_code = "SOURCE_NOT_OCCUPIED";
        result.error_detail = "Source table " + std::to_string(from_table_code) + " is not occupied";
        return result;
    }

    // Bước 2: Kiểm tra bàn đích
    // 2단계: 대상 테이블 확인
    auto to_table = GetTableByCode(to_table_code);
    if (!to_table.has_value()) {
        result.success = false;
        result.error_code = "TARGET_TABLE_NOT_FOUND";
        return result;
    }
    if (to_table->status != TableStatus::EMPTY) {
        result.success = false;
        result.error_code = "TARGET_NOT_EMPTY";
        result.error_detail = "Target table " + std::to_string(to_table_code) + " is not empty";
        return result;
    }

    // Bước 3: UPDATE trạng thái 2 bàn
    // 3단계: 2개 테이블 상태 UPDATE
    //
    // ※ Transaction do UseCase quản lý — 2 UPDATE này nằm trong cùng 1 transaction
    //    트랜잭션은 UseCase가 관리 — 이 2개 UPDATE는 같은 트랜잭션에 포함됨
    //
    // TODO: Tích hợp ADO thực tế
    // TODO: 실제 ADO 통합
    //
    // std::string sql1 = TableCrud::UpdateStatus(from_table_code, TableStatus::EMPTY);
    // std::string sql2 = TableCrud::UpdateStatus(to_table_code, TableStatus::OCCUPIED);
    // g_DbAccess->ExecuteQuery(sql1.c_str());
    // g_DbAccess->ExecuteQuery(sql2.c_str());

    result.success = true;
    result.status = TableStatus::OCCUPIED;
    return result;
}

// ══════════════════════════════════════════
// Kiểm tra trạng thái / 상태 확인
// ══════════════════════════════════════════

bool TableManager::IsOccupied(int table_code) {
    // Tương đương code cũ: CTableManager::UseSysnCheck()
    // 대응하는 기존 코드: CTableManager::UseSysnCheck()
    auto table = GetTableByCode(table_code);
    return table.has_value() && table->status == TableStatus::OCCUPIED;
}

bool TableManager::IsLocked(int table_code) {
    auto table = GetTableByCode(table_code);
    return table.has_value() && table->status == TableStatus::LOCKED;
}
