#include "ItemCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// ItemCrud — Triển khai CRUD / CRUD 구현
// ══════════════════════════════════════════

// Lấy tất cả sản phẩm đang hoạt động / 활성 상품 전체 조회
std::string ItemCrud::SelectActiveItems() {
    std::ostringstream sql;
    sql << "SELECT * FROM " << ItemColumns::TABLE
        << " WHERE " << ItemColumns::DelFlag << " != 'Y'"
        << " ORDER BY " << ItemColumns::lineup;
    return sql.str();
}

// Tìm sản phẩm theo mã / 코드로 상품 조회
std::string ItemCrud::SelectByCode(const std::string& item_code) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << ItemColumns::TABLE
        << " WHERE " << ItemColumns::ItemCode << " = '" << item_code << "'";
    return sql.str();
}

// ══════════════════════════════════════════
// ItemMapper — Triển khai Mapper / Mapper 구현
//
// Dùng RecordsetReader::ReadXxx để đọc cột theo tên
// RecordsetReader::ReadXxx로 이름 기반 컬럼 읽기
// ══════════════════════════════════════════

ItemRecord ItemMapper::FromRecordset(CADORecordset& rs) {
    ItemRecord row;
    row.ItemCode   = RecordsetReader::ReadString(rs, ItemColumns::ItemCode);
    row.BarCode    = RecordsetReader::ReadString(rs, ItemColumns::BarCode);
    row.ItemName   = RecordsetReader::ReadString(rs, ItemColumns::ItemName);
    row.GrpCode    = RecordsetReader::ReadString(rs, ItemColumns::GrpCode);
    row.SaleAmt    = RecordsetReader::ReadInt64 (rs, ItemColumns::SaleAmt);
    row.OrgAmt     = RecordsetReader::ReadInt64 (rs, ItemColumns::OrgAmt);
    row.lineup     = RecordsetReader::ReadInt   (rs, ItemColumns::lineup);
    row.ProfitRate = RecordsetReader::ReadDouble(rs, ItemColumns::ProfitRate);
    row.DelFlag    = RecordsetReader::ReadString(rs, ItemColumns::DelFlag);
    return row;
}

// Đọc toàn bộ hàng — duyệt RecordSet cho đến hết
// 전체 행 읽기 — RecordSet 끝까지 순회
std::vector<ItemRecord> ItemMapper::ListFromRecordset(CADORecordset& rs) {
    std::vector<ItemRecord> rows;
    // TODO: Tích hợp ADO thực tế / 실제 ADO 통합
    //       while (!rs.IsEOF()) { rows.push_back(FromRecordset(rs)); rs.MoveNext(); }
    return rows;
}
