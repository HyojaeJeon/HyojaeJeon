#include "StoreInfoCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// StoreInfoCrud — Triển khai CRUD / CRUD 구현
// ══════════════════════════════════════════

// Tìm thông tin theo số POS / POS 번호로 매장 정보 조회
std::string StoreInfoCrud::SelectByPosNo(const std::string& pos_no) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << StoreInfoColumns::TABLE
        << " WHERE " << StoreInfoColumns::PosNo << " = '" << pos_no << "'";
    return sql.str();
}

// Lấy 1 hàng đầu tiên / 첫 번째 행 1건 조회
std::string StoreInfoCrud::SelectTop1() {
    std::ostringstream sql;
    sql << "SELECT TOP 1 * FROM " << StoreInfoColumns::TABLE;
    return sql.str();
}

// ══════════════════════════════════════════
// StoreInfoMapper — Triển khai Mapper / Mapper 구현
//
// Dùng RecordsetReader::ReadXxx để đọc cột theo tên
// RecordsetReader::ReadXxx로 이름 기반 컬럼 읽기
// ══════════════════════════════════════════
StoreInfoRecord StoreInfoMapper::FromRecordset(CADORecordset& rs) {
    StoreInfoRecord row;
    row.Chain      = RecordsetReader::ReadString(rs, StoreInfoColumns::Chain);
    row.StoreName  = RecordsetReader::ReadString(rs, StoreInfoColumns::StoreName);
    row.BizNo      = RecordsetReader::ReadString(rs, StoreInfoColumns::BizNo);
    row.Condition  = RecordsetReader::ReadString(rs, StoreInfoColumns::Condition);
    row.StoreType  = RecordsetReader::ReadString(rs, StoreInfoColumns::StoreType);
    row.President  = RecordsetReader::ReadString(rs, StoreInfoColumns::President);
    row.Tel        = RecordsetReader::ReadString(rs, StoreInfoColumns::Tel);
    row.HPhone     = RecordsetReader::ReadString(rs, StoreInfoColumns::HPhone);
    row.Addr       = RecordsetReader::ReadString(rs, StoreInfoColumns::Addr);
    row.PosNo      = RecordsetReader::ReadString(rs, StoreInfoColumns::PosNo);
    row.UpdateDate = RecordsetReader::ReadString(rs, StoreInfoColumns::UpdateDate);
    row.PayType    = RecordsetReader::ReadString(rs, StoreInfoColumns::PayType);
    row.StoreIndex = RecordsetReader::ReadString(rs, StoreInfoColumns::StoreIndex);
    row.MainStore  = RecordsetReader::ReadString(rs, StoreInfoColumns::MainStore);
    row.TerminalId = RecordsetReader::ReadString(rs, StoreInfoColumns::TerminalId);
    row.TcpAddress = RecordsetReader::ReadString(rs, StoreInfoColumns::TcpAddress);
    row.TcpPort    = RecordsetReader::ReadInt   (rs, StoreInfoColumns::TcpPort);
    row.VanSel     = RecordsetReader::ReadString(rs, StoreInfoColumns::VanSel);
    return row;
}
