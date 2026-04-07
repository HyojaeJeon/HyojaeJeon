#include "ClientConfigCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// ClientConfigCrud — Triển khai CRUD / CRUD 구현
// ══════════════════════════════════════════

// Tìm cấu hình theo số POS / POS 번호로 설정 조회
std::string ClientConfigCrud::SelectByPosNo(const std::string& pos_no) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << ClientConfigColumns::TABLE
        << " WHERE " << ClientConfigColumns::PosNo << " = '" << pos_no << "'";
    return sql.str();
}

// Lấy 1 hàng đầu tiên / 첫 번째 행 1건 조회
std::string ClientConfigCrud::SelectTop1() {
    std::ostringstream sql;
    sql << "SELECT TOP 1 * FROM " << ClientConfigColumns::TABLE;
    return sql.str();
}

// ══════════════════════════════════════════
// ClientConfigMapper — Triển khai Mapper / Mapper 구현
//
// Dùng RecordsetReader::ReadXxx để đọc cột theo tên
// RecordsetReader::ReadXxx로 이름 기반 컬럼 읽기
// ══════════════════════════════════════════
ClientConfigRecord ClientConfigMapper::FromRecordset(CADORecordset& rs) {
    ClientConfigRecord row;
    row.PosNo      = RecordsetReader::ReadString(rs, ClientConfigColumns::PosNo);
    row.DBVersion  = RecordsetReader::ReadString(rs, ClientConfigColumns::DBVersion);
    row.CtVersion  = RecordsetReader::ReadString(rs, ClientConfigColumns::CtVersion);
    row.LastExcute = RecordsetReader::ReadString(rs, ClientConfigColumns::LastExcute);
    row.LkStart    = RecordsetReader::ReadString(rs, ClientConfigColumns::LkStart);
    row.LimiteEnd  = RecordsetReader::ReadString(rs, ClientConfigColumns::LimiteEnd);
    row.SinceDays  = RecordsetReader::ReadInt   (rs, ClientConfigColumns::SinceDays);
    row.LimiteType = RecordsetReader::ReadString(rs, ClientConfigColumns::LimiteType);
    return row;
}
