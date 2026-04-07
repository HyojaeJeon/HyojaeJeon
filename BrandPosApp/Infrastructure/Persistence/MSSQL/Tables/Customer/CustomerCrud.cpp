#include "CustomerCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// CustomerCrud — Triển khai CRUD / CRUD 구현
// ══════════════════════════════════════════

// Tìm hội viên theo số điện thoại / 전화번호로 회원 조회
std::string CustomerCrud::SelectByPhone(const std::string& phone) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << CustomerColumns::TABLE
        << " WHERE " << CustomerColumns::HandPhone << " = '" << phone << "'"
        << " OR "    << CustomerColumns::Phone     << " = '" << phone << "'";
    return sql.str();
}

// Tìm hội viên theo mã / 코드로 회원 조회
std::string CustomerCrud::SelectByCode(const std::string& cust_code) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << CustomerColumns::TABLE
        << " WHERE " << CustomerColumns::CustCode << " = '" << cust_code << "'";
    return sql.str();
}

// ══════════════════════════════════════════
// CustomerMapper — Triển khai Mapper / Mapper 구현
//
// Dùng RecordsetReader::ReadXxx để đọc cột theo tên
// RecordsetReader::ReadXxx로 이름 기반 컬럼 읽기
// ══════════════════════════════════════════
CustomerRecord CustomerMapper::FromRecordset(CADORecordset& rs) {
    CustomerRecord row;
    row.CustCode      = RecordsetReader::ReadString(rs, CustomerColumns::CustCode);
    row.CustName      = RecordsetReader::ReadString(rs, CustomerColumns::CustName);
    row.Phone         = RecordsetReader::ReadString(rs, CustomerColumns::Phone);
    row.HandPhone     = RecordsetReader::ReadString(rs, CustomerColumns::HandPhone);
    row.Addr          = RecordsetReader::ReadString(rs, CustomerColumns::Addr);
    row.Birth         = RecordsetReader::ReadString(rs, CustomerColumns::Birth);
    row.TotalPoint    = RecordsetReader::ReadInt64 (rs, CustomerColumns::TotalPoint);
    row.UsedPoint     = RecordsetReader::ReadInt64 (rs, CustomerColumns::UsedPoint);
    row.RemainPoint   = RecordsetReader::ReadInt64 (rs, CustomerColumns::RemainPoint);
    row.VisitCnt      = RecordsetReader::ReadInt   (rs, CustomerColumns::VisitCnt);
    row.Email         = RecordsetReader::ReadString(rs, CustomerColumns::Email);
    row.BirthType     = RecordsetReader::ReadString(rs, CustomerColumns::BirthType);
    row.CustType      = RecordsetReader::ReadString(rs, CustomerColumns::CustType);
    row.InDate        = RecordsetReader::ReadString(rs, CustomerColumns::InDate);
    row.BEMail        = RecordsetReader::ReadString(rs, CustomerColumns::BEMail);
    row.BSms          = RecordsetReader::ReadString(rs, CustomerColumns::BSms);
    row.LastVisitDate = RecordsetReader::ReadString(rs, CustomerColumns::LastVisitDate);
    row.TotalTickAmt  = RecordsetReader::ReadInt64 (rs, CustomerColumns::TotalTickAmt);
    row.RemainTickAmt = RecordsetReader::ReadInt64 (rs, CustomerColumns::RemainTickAmt);
    row.RecvTickAmt   = RecordsetReader::ReadInt64 (rs, CustomerColumns::RecvTickAmt);
    row.SaleAmt       = RecordsetReader::ReadInt64 (rs, CustomerColumns::SaleAmt);
    row.SaveStoreName = RecordsetReader::ReadString(rs, CustomerColumns::SaveStoreName);
    row.Jumin         = RecordsetReader::ReadString(rs, CustomerColumns::Jumin);
    row.Sex           = RecordsetReader::ReadString(rs, CustomerColumns::Sex);
    row.EmpCode       = RecordsetReader::ReadString(rs, CustomerColumns::EmpCode);
    row.OutDate       = RecordsetReader::ReadString(rs, CustomerColumns::OutDate);
    row.CardNo        = RecordsetReader::ReadString(rs, CustomerColumns::CardNo);
    row.MemberType    = RecordsetReader::ReadString(rs, CustomerColumns::MemberType);
    row.Memo          = RecordsetReader::ReadString(rs, CustomerColumns::Memo);
    row.DelFlag       = RecordsetReader::ReadString(rs, CustomerColumns::DelFlag);
    row.RemainKeepAmt = RecordsetReader::ReadInt64 (rs, CustomerColumns::RemainKeepAmt);
    row.SubCol1       = RecordsetReader::ReadString(rs, CustomerColumns::SubCol1);
    row.StampCnt      = RecordsetReader::ReadInt   (rs, CustomerColumns::StampCnt);
    return row;
}
