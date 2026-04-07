#include "ItemChangeLogCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// ItemChangeLogCrud — Triển khai CRUD / CRUD 구현
// ══════════════════════════════════════════

// Tìm lịch sử theo mã sản phẩm / 상품 코드로 변경 이력 조회
std::string ItemChangeLogCrud::SelectByItemCode(const std::string& item_code) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << ItemChangeLogColumns::TABLE
        << " WHERE " << ItemChangeLogColumns::ItemCode << " = '" << item_code << "'"
        << " ORDER BY " << ItemChangeLogColumns::ChangeDate << " DESC";
    return sql.str();
}

// Tìm lịch sử theo khoảng ngày / 날짜 범위로 변경 이력 조회
std::string ItemChangeLogCrud::SelectByDateRange(const std::string& from_date,
                                                 const std::string& to_date) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << ItemChangeLogColumns::TABLE
        << " WHERE " << ItemChangeLogColumns::ChangeDate << " >= '" << from_date << "'"
        << " AND "   << ItemChangeLogColumns::ChangeDate << " <= '" << to_date << "'"
        << " ORDER BY " << ItemChangeLogColumns::ChangeDate << " DESC";
    return sql.str();
}

// ══════════════════════════════════════════
// ItemChangeLogMapper — Triển khai Mapper / Mapper 구현
//
// Dùng RecordsetReader::ReadXxx để đọc cột theo tên
// RecordsetReader::ReadXxx로 이름 기반 컬럼 읽기
// ══════════════════════════════════════════

ItemChangeLogRecord ItemChangeLogMapper::FromRecordset(CADORecordset& rs) {
    ItemChangeLogRecord row;
    row.ChangeDate = RecordsetReader::ReadString(rs, ItemChangeLogColumns::ChangeDate);
    row.ItemCode   = RecordsetReader::ReadString(rs, ItemChangeLogColumns::ItemCode);
    row.BarCode    = RecordsetReader::ReadString(rs, ItemChangeLogColumns::BarCode);
    row.CType      = RecordsetReader::ReadString(rs, ItemChangeLogColumns::CType);
    row.perAmt     = RecordsetReader::ReadInt64 (rs, ItemChangeLogColumns::perAmt);
    row.afterAmt   = RecordsetReader::ReadInt64 (rs, ItemChangeLogColumns::afterAmt);
    row.Amt        = RecordsetReader::ReadInt64 (rs, ItemChangeLogColumns::Amt);
    row.preSup     = RecordsetReader::ReadInt64 (rs, ItemChangeLogColumns::preSup);
    row.afterSup   = RecordsetReader::ReadInt64 (rs, ItemChangeLogColumns::afterSup);
    row.Memo       = RecordsetReader::ReadString(rs, ItemChangeLogColumns::Memo);
    row.DelFlag    = RecordsetReader::ReadString(rs, ItemChangeLogColumns::DelFlag);
    return row;
}

// Đọc toàn bộ hàng — duyệt RecordSet cho đến hết
// 전체 행 읽기 — RecordSet 끝까지 순회
std::vector<ItemChangeLogRecord> ItemChangeLogMapper::ListFromRecordset(CADORecordset& rs) {
    std::vector<ItemChangeLogRecord> rows;
    // TODO: Tích hợp ADO thực tế / 실제 ADO 통합
    //       while (!rs.IsEOF()) { rows.push_back(FromRecordset(rs)); rs.MoveNext(); }
    return rows;
}
