#include "SellSlipCrud.h"
#include "../../../Core/PersistenceCore.h"

#include <sstream>

// ======================================================================
// SellSlipCrud -- Trien khai cau truy van SQL
// SellSlipCrud -- SQL 질의문 구현
// ======================================================================

std::string SellSlipCrud::SelectByDate(const std::string& sell_date) {
    // Truy van tat ca phieu theo ngay, sap xep theo so phieu thu giam dan
    // 해당 일자의 모든 전표를 영수증번호 내림차순으로 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << SellSlipColumns::TABLE
        << " WHERE " << SellSlipColumns::SellDate << " = '" << sell_date << "'"
        << " AND "   << SellSlipColumns::DelFlag  << " = 0"
        << " ORDER BY " << SellSlipColumns::ReceiptNo << " DESC";
    return sql.str();
}

std::string SellSlipCrud::SelectByReceiptNo(int receipt_no) {
    // Truy van mot phieu cu the theo so phieu thu
    // 특정 영수증번호로 단건 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << SellSlipColumns::TABLE
        << " WHERE " << SellSlipColumns::ReceiptNo << " = " << receipt_no
        << " AND "   << SellSlipColumns::DelFlag   << " = 0";
    return sql.str();
}

// ======================================================================
// SellSlipMapper -- Chuyen doi RecordSet -> Row
// SellSlipMapper -- RecordSet -> Row 변환 구현
//
// Su dung RecordsetReader::ReadXxx de doc theo ten cot, khong phu thuoc thu tu
// RecordsetReader::ReadXxx로 컬럼명 기반 읽기, 컬럼 순서에 무관
// ======================================================================

SellSlipRecord SellSlipMapper::FromRecordset(CADORecordset& rs) {
    SellSlipRecord row;

    // -- Khoa chinh ghep / 복합 기본키 --
    row.SellDate       = RecordsetReader::ReadString(rs, SellSlipColumns::SellDate);
    row.OrderNo        = RecordsetReader::ReadInt   (rs, SellSlipColumns::OrderNo);
    row.ReceiptNo      = RecordsetReader::ReadInt   (rs, SellSlipColumns::ReceiptNo);

    // -- Nhan vien va khach hang / 직원 및 고객 --
    row.EmpCode        = RecordsetReader::ReadString(rs, SellSlipColumns::EmpCode);
    row.CustNum        = RecordsetReader::ReadInt   (rs, SellSlipColumns::CustNum);
    row.CustCode       = RecordsetReader::ReadString(rs, SellSlipColumns::CustCode);
    row.OrderEmpCode   = RecordsetReader::ReadString(rs, SellSlipColumns::OrderEmpCode);
    row.TableEmpCode   = RecordsetReader::ReadString(rs, SellSlipColumns::TableEmpCode);

    // -- So tien tong hop / 집계 금액 --
    row.OrderAmt       = RecordsetReader::ReadDouble(rs, SellSlipColumns::OrderAmt);
    row.DcAmt          = RecordsetReader::ReadDouble(rs, SellSlipColumns::DcAmt);
    row.WorkAmt        = RecordsetReader::ReadDouble(rs, SellSlipColumns::WorkAmt);
    row.ReceiveAmt     = RecordsetReader::ReadDouble(rs, SellSlipColumns::ReceiveAmt);
    row.ReceivedAmt    = RecordsetReader::ReadDouble(rs, SellSlipColumns::ReceivedAmt);
    row.ChangeAmt      = RecordsetReader::ReadDouble(rs, SellSlipColumns::ChangeAmt);
    row.TotalAmt       = RecordsetReader::ReadDouble(rs, SellSlipColumns::TotalAmt);

    // -- Chi tiet phuong thuc thanh toan / 결제수단별 금액 --
    row.CashAmt        = RecordsetReader::ReadDouble(rs, SellSlipColumns::CashAmt);
    row.CardAmt        = RecordsetReader::ReadDouble(rs, SellSlipColumns::CardAmt);
    row.PointAmt       = RecordsetReader::ReadDouble(rs, SellSlipColumns::PointAmt);
    row.CouponAmt      = RecordsetReader::ReadDouble(rs, SellSlipColumns::CouponAmt);
    row.EtcAmt         = RecordsetReader::ReadDouble(rs, SellSlipColumns::EtcAmt);
    row.TickAmt        = RecordsetReader::ReadDouble(rs, SellSlipColumns::TickAmt);
    row.CashbagAmt     = RecordsetReader::ReadDouble(rs, SellSlipColumns::CashbagAmt);
    row.KeepAmt        = RecordsetReader::ReadDouble(rs, SellSlipColumns::KeepAmt);
    row.EdenredAmt     = RecordsetReader::ReadDouble(rs, SellSlipColumns::EdenredAmt);
    row.SelfAmt        = RecordsetReader::ReadDouble(rs, SellSlipColumns::SelfAmt);

    // -- Thue va tip / 세금 및 팁 --
    row.VatAmt         = RecordsetReader::ReadDouble(rs, SellSlipColumns::VatAmt);
    row.TipAmt         = RecordsetReader::ReadDouble(rs, SellSlipColumns::TipAmt);
    row.ServiceAmt     = RecordsetReader::ReadDouble(rs, SellSlipColumns::ServiceAmt);
    row.TaxFree        = RecordsetReader::ReadDouble(rs, SellSlipColumns::TaxFree);

    // -- Giam gia chi tiet / 할인 상세 --
    row.DcEventAmt     = RecordsetReader::ReadDouble(rs, SellSlipColumns::DcEventAmt);
    row.MenuDcAmt      = RecordsetReader::ReadDouble(rs, SellSlipColumns::MenuDcAmt);
    row.SaleDcAmt      = RecordsetReader::ReadDouble(rs, SellSlipColumns::SaleDcAmt);

    // -- Phan loai / 분류 --
    row.OrderType      = RecordsetReader::ReadInt   (rs, SellSlipColumns::OrderType);
    row.SellType       = RecordsetReader::ReadInt   (rs, SellSlipColumns::SellType);

    // -- Vi tri va thiet bi / 위치 및 장비 --
    row.PosNo          = RecordsetReader::ReadString(rs, SellSlipColumns::PosNo);
    row.TableCode      = RecordsetReader::ReadString(rs, SellSlipColumns::TableCode);
    row.OrderPosNo     = RecordsetReader::ReadString(rs, SellSlipColumns::OrderPosNo);

    // -- Ma giam gia / 할인코드 --
    row.SaleDCListCode = RecordsetReader::ReadString(rs, SellSlipColumns::SaleDCListCode);
    row.SaleDcCode     = RecordsetReader::ReadString(rs, SellSlipColumns::SaleDcCode);

    // -- Diem thuong / 적립포인트 --
    row.SavePoint      = RecordsetReader::ReadDouble(rs, SellSlipColumns::SavePoint);

    // -- Dieu chinh / 조정 --
    row.AdjustNo       = RecordsetReader::ReadInt   (rs, SellSlipColumns::AdjustNo);

    // -- Bien nhan tien mat / 현금영수증 --
    row.BCashReceipt   = RecordsetReader::ReadString(rs, SellSlipColumns::BCashReceipt);

    // -- Nhom / 그룹 --
    row.GroupSet       = RecordsetReader::ReadString(rs, SellSlipColumns::GroupSet);

    // -- Thoi gian ket thuc / 종료시간 --
    row.EndTimeDate    = RecordsetReader::ReadString(rs, SellSlipColumns::EndTimeDate);
    row.EndTime        = RecordsetReader::ReadString(rs, SellSlipColumns::EndTime);

    // -- Thong tin dat hang goc / 최초 주문 정보 --
    row.FirstOrderDate = RecordsetReader::ReadString(rs, SellSlipColumns::FirstOrderDate);

    // -- Tien nhan bo sung / 추가 수금액 --
    row.FReceivedAmt1  = RecordsetReader::ReadDouble(rs, SellSlipColumns::FReceivedAmt1);
    row.FReceivedAmt2  = RecordsetReader::ReadDouble(rs, SellSlipColumns::FReceivedAmt2);
    row.FReceivedAmt3  = RecordsetReader::ReadDouble(rs, SellSlipColumns::FReceivedAmt3);
    row.ReceivedCount  = RecordsetReader::ReadInt   (rs, SellSlipColumns::ReceivedCount);

    // -- Thong tin khach hang / 고객 정보 --
    row.Age            = RecordsetReader::ReadInt   (rs, SellSlipColumns::Age);
    row.Man            = RecordsetReader::ReadInt   (rs, SellSlipColumns::Man);
    row.Woman          = RecordsetReader::ReadInt   (rs, SellSlipColumns::Woman);

    // -- Ma tin nhan / 주문메시지코드 --
    row.OrderMsgCode1  = RecordsetReader::ReadString(rs, SellSlipColumns::OrderMsgCode1);
    row.OrderMsgCode2  = RecordsetReader::ReadString(rs, SellSlipColumns::OrderMsgCode2);
    row.OrderMsgCode3  = RecordsetReader::ReadString(rs, SellSlipColumns::OrderMsgCode3);

    // -- Mang di / 포장주문 --
    row.TakeOrderNo    = RecordsetReader::ReadString(rs, SellSlipColumns::TakeOrderNo);

    // -- Co va phu / 플래그 및 부가 --
    row.AduFlag_CpQty  = RecordsetReader::ReadString(rs, SellSlipColumns::AduFlag_CpQty);
    row.SubCol1        = RecordsetReader::ReadString(rs, SellSlipColumns::SubCol1);
    row.SubCol2        = RecordsetReader::ReadString(rs, SellSlipColumns::SubCol2);
    row.SubCol3        = RecordsetReader::ReadString(rs, SellSlipColumns::SubCol3);
    row.StoreIndex     = RecordsetReader::ReadInt   (rs, SellSlipColumns::StoreIndex);
    row.DelFlag        = RecordsetReader::ReadInt   (rs, SellSlipColumns::DelFlag);

    return row;
}

std::vector<SellSlipRecord> SellSlipMapper::ListFromRecordset(CADORecordset& rs) {
    // Duyet tat ca cac dong trong RecordSet va chuyen doi tung dong
    // RecordSet의 모든 행을 순회하며 각 행을 변환
    std::vector<SellSlipRecord> rows;

    // TODO: Tich hop ADO thuc te / 실제 ADO 통합
    //       while (!rs.IsEOF()) { rows.push_back(FromRecordset(rs)); rs.MoveNext(); }
    (void)rs;

    return rows;
}
