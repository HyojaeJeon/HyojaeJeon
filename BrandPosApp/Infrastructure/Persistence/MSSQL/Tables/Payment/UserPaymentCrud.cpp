#include "UserPaymentCrud.h"
#include "../../../Core/PersistenceCore.h"

#include <sstream>

// ======================================================================
// UserPaymentCrud -- Trien khai cau truy van SQL
// UserPaymentCrud -- SQL 질의문 구현
// ======================================================================

std::string UserPaymentCrud::SelectByReceipt(const std::string& sell_date, int receipt_no) {
    // Truy van tat ca phuong thuc thanh toan nguoi dung cua mot phieu
    // 특정 영수증의 사용자결제 수단 전체 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << UserPaymentColumns::TABLE
        << " WHERE " << UserPaymentColumns::SellDate  << " = '" << sell_date << "'"
        << " AND "   << UserPaymentColumns::ReceiptNo << " = " << receipt_no
        << " AND "   << UserPaymentColumns::DelFlag   << " = 0"
        << " ORDER BY " << UserPaymentColumns::SerNo  << " ASC";
    return sql.str();
}

std::string UserPaymentCrud::SelectByDate(const std::string& sell_date) {
    // Truy van tat ca phuong thuc thanh toan nguoi dung trong ngay
    // 해당 일자의 전체 사용자결제 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << UserPaymentColumns::TABLE
        << " WHERE " << UserPaymentColumns::SellDate << " = '" << sell_date << "'"
        << " AND "   << UserPaymentColumns::DelFlag  << " = 0"
        << " ORDER BY " << UserPaymentColumns::ReceiptNo << " ASC, "
                        << UserPaymentColumns::SerNo     << " ASC";
    return sql.str();
}

// ======================================================================
// UserPaymentMapper -- Chuyen doi RecordSet -> Row
// UserPaymentMapper -- RecordSet -> Row 변환 구현
//
// Su dung RecordsetReader::ReadXxx de doc theo ten cot, khong phu thuoc thu tu
// RecordsetReader::ReadXxx로 컬럼명 기반 읽기, 컬럼 순서에 무관
// ======================================================================

UserPaymentRecord UserPaymentMapper::FromRecordset(CADORecordset& rs) {
    UserPaymentRecord row;

    // -- Khoa chinh ghep / 복합 기본키 --
    row.SellDate       = RecordsetReader::ReadString(rs, UserPaymentColumns::SellDate);
    row.PosNo          = RecordsetReader::ReadString(rs, UserPaymentColumns::PosNo);
    row.ReceiptNo      = RecordsetReader::ReadInt   (rs, UserPaymentColumns::ReceiptNo);
    row.SerNo          = RecordsetReader::ReadInt   (rs, UserPaymentColumns::SerNo);

    // -- Phan loai ban / 판매 유형 --
    row.SellType       = RecordsetReader::ReadInt   (rs, UserPaymentColumns::SellType);

    // -- Thong tin thanh toan nguoi dung / 사용자결제 정보 --
    row.UserAmt        = RecordsetReader::ReadDouble(rs, UserPaymentColumns::UserAmt);
    row.UserPayType    = RecordsetReader::ReadString(rs, UserPaymentColumns::UserPayType);
    row.UserPayName    = RecordsetReader::ReadString(rs, UserPaymentColumns::UserPayName);

    // -- Ngay giao dich / 거래일자 --
    row.TranDate       = RecordsetReader::ReadString(rs, UserPaymentColumns::TranDate);

    // -- Dieu chinh va ket thuc / 조정 및 종료 --
    row.AdjustNo       = RecordsetReader::ReadInt   (rs, UserPaymentColumns::AdjustNo);
    row.EndTimeDate    = RecordsetReader::ReadString(rs, UserPaymentColumns::EndTimeDate);
    row.EndTime        = RecordsetReader::ReadString(rs, UserPaymentColumns::EndTime);

    // -- Co xoa / 삭제플래그 --
    row.DelFlag        = RecordsetReader::ReadInt   (rs, UserPaymentColumns::DelFlag);

    // -- Du lieu goc / 원본 데이터 --
    row.OriginalData   = RecordsetReader::ReadString(rs, UserPaymentColumns::OriginalData);

    // -- Cot phu / 부가컬럼 --
    row.SubCol1        = RecordsetReader::ReadString(rs, UserPaymentColumns::SubCol1);
    row.SubCol2        = RecordsetReader::ReadString(rs, UserPaymentColumns::SubCol2);
    row.SubCol3        = RecordsetReader::ReadString(rs, UserPaymentColumns::SubCol3);

    return row;
}

std::vector<UserPaymentRecord> UserPaymentMapper::ListFromRecordset(CADORecordset& rs) {
    // Duyet tat ca cac dong trong RecordSet va chuyen doi tung dong
    // RecordSet의 모든 행을 순회하며 각 행을 변환
    std::vector<UserPaymentRecord> rows;

    // TODO: Tich hop ADO thuc te / 실제 ADO 통합
    //       while (!rs.IsEOF()) { rows.push_back(FromRecordset(rs)); rs.MoveNext(); }
    (void)rs;

    return rows;
}
