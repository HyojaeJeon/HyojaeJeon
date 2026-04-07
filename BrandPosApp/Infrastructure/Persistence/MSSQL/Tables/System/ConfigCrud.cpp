#include "ConfigCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// ConfigCrud — Triển khai CRUD / CRUD 구현
// ══════════════════════════════════════════

// Tìm cấu hình theo số POS / POS 번호로 설정 조회
std::string ConfigCrud::SelectByPosNo(const std::string& pos_no) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << ConfigColumns::TABLE
        << " WHERE " << ConfigColumns::PosNo << " = '" << pos_no << "'";
    return sql.str();
}

// Lấy 1 hàng đầu tiên / 첫 번째 행 1건 조회
std::string ConfigCrud::SelectTop1() {
    std::ostringstream sql;
    sql << "SELECT TOP 1 * FROM " << ConfigColumns::TABLE;
    return sql.str();
}

// ══════════════════════════════════════════
// ConfigMapper — Triển khai Mapper / Mapper 구현
//
// Dùng RecordsetReader::ReadXxx để đọc cột theo tên
// RecordsetReader::ReadXxx로 이름 기반 컬럼 읽기
// ══════════════════════════════════════════
ConfigRecord ConfigMapper::FromRecordset(CADORecordset& rs) {
    ConfigRecord row;
    row.PosNo          = RecordsetReader::ReadString(rs, ConfigColumns::PosNo);
    row.PosName        = RecordsetReader::ReadString(rs, ConfigColumns::PosName);
    row.CalcPrn        = RecordsetReader::ReadString(rs, ConfigColumns::CalcPrn);
    row.KicPrnType     = RecordsetReader::ReadString(rs, ConfigColumns::KicPrnType);
    row.KicPrn         = RecordsetReader::ReadString(rs, ConfigColumns::KicPrn);
    row.PrnName        = RecordsetReader::ReadString(rs, ConfigColumns::PrnName);
    row.Display        = RecordsetReader::ReadString(rs, ConfigColumns::Display);
    row.DisplayName    = RecordsetReader::ReadString(rs, ConfigColumns::DisplayName);
    row.MsgTime        = RecordsetReader::ReadInt   (rs, ConfigColumns::MsgTime);
    row.TableTouch     = RecordsetReader::ReadString(rs, ConfigColumns::TableTouch);
    row.CutAmt         = RecordsetReader::ReadInt64 (rs, ConfigColumns::CutAmt);
    row.OrderState     = RecordsetReader::ReadString(rs, ConfigColumns::OrderState);
    row.UseInternet    = RecordsetReader::ReadString(rs, ConfigColumns::UseInternet);
    row.CalcPrnName    = RecordsetReader::ReadString(rs, ConfigColumns::CalcPrnName);
    row.UseImgBtn      = RecordsetReader::ReadString(rs, ConfigColumns::UseImgBtn);
    row.CustInfo       = RecordsetReader::ReadString(rs, ConfigColumns::CustInfo);
    row.AddOrderQty    = RecordsetReader::ReadInt   (rs, ConfigColumns::AddOrderQty);
    row.ExcludeKeepAmt = RecordsetReader::ReadInt64 (rs, ConfigColumns::ExcludeKeepAmt);
    return row;
}
