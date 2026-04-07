#include "TableStatusHistoryCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// TableStatusHistoryCrud — Triển khai CRUD helper
// TableStatusHistoryCrud — CRUD helper 구현
//
// Tất cả câu SQL dùng hằng số từ TableStatusHistoryColumns
// 모든 SQL은 TableStatusHistoryColumns 상수를 사용
// ══════════════════════════════════════════

std::string TableStatusHistoryCrud::InsertStatusChange(int TableCode,
                                                       const std::string& PrevStatus,
                                                       const std::string& NextStatus) {
    // Chèn bản ghi thay đổi trạng thái, ChangedAt tự gán bởi MSSQL DEFAULT
    // 상태 변경 레코드 삽입, ChangedAt은 MSSQL DEFAULT로 자동 할당
    std::ostringstream sql;
    sql << "INSERT INTO " << TableStatusHistoryColumns::TABLE
        << " ("
        << TableStatusHistoryColumns::TableCode  << ", "
        << TableStatusHistoryColumns::PrevStatus << ", "
        << TableStatusHistoryColumns::NextStatus
        << ") VALUES ("
        << TableCode                             << ", "
        << "'" << PrevStatus << "'"             << ", "
        << "'" << NextStatus << "'"
        << ")";

    return sql.str();
}

// ══════════════════════════════════════════
// TableStatusHistoryMapper — Triển khai ánh xạ RecordSet → struct
// TableStatusHistoryMapper — RecordSet → 구조체 매핑 구현
//
// TODO: Tích hợp ADO thực tế / 실제 ADO 통합
//       Khi có AdoWraper thực, bỏ comment tham số rs
//       실제 AdoWraper가 있으면 rs 매개변수 주석 해제
// ══════════════════════════════════════════

TableStatusHistoryRecord TableStatusHistoryMapper::FromRecordset(CADORecordset& rs) {
    // Đọc hàng hiện tại theo tên cột / 현재 행을 컬럼명 기반으로 읽기
    TableStatusHistoryRecord row;

    row.Id         = RecordsetReader::ReadInt64(rs, TableStatusHistoryColumns::Id);
    row.TableCode  = RecordsetReader::ReadInt(rs, TableStatusHistoryColumns::TableCode);
    row.PrevStatus = RecordsetReader::ReadString(rs, TableStatusHistoryColumns::PrevStatus);
    row.NextStatus = RecordsetReader::ReadString(rs, TableStatusHistoryColumns::NextStatus);
    row.ChangedAt  = RecordsetReader::ReadString(rs, TableStatusHistoryColumns::ChangedAt);

    return row;
}
