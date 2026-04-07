#include "SellDetailCrud.h"
#include "../../../Core/PersistenceCore.h"

#include <sstream>

// ======================================================================
// SellDetailCrud -- Trien khai cau truy van SQL
// SellDetailCrud -- SQL 질의문 구현
// ======================================================================

std::string SellDetailCrud::SelectByReceipt(const std::string& sell_date, int receipt_no) {
    // Truy van chi tiet mon theo ngay ban va so phieu thu
    // 판매일자 + 영수증번호로 해당 전표의 상세 항목 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << SellDetailColumns::TABLE
        << " WHERE " << SellDetailColumns::SellDate  << " = '" << sell_date << "'"
        << " AND "   << SellDetailColumns::ReceiptNo << " = " << receipt_no
        << " AND "   << SellDetailColumns::DelFlag   << " = 0"
        << " ORDER BY " << SellDetailColumns::SerNo  << " ASC";
    return sql.str();
}

std::string SellDetailCrud::SelectByDate(const std::string& sell_date) {
    // Truy van tat ca chi tiet mon trong ngay
    // 해당 일자의 전체 판매상세 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << SellDetailColumns::TABLE
        << " WHERE " << SellDetailColumns::SellDate << " = '" << sell_date << "'"
        << " AND "   << SellDetailColumns::DelFlag  << " = 0"
        << " ORDER BY " << SellDetailColumns::ReceiptNo << " ASC, "
                        << SellDetailColumns::SerNo     << " ASC";
    return sql.str();
}

// ======================================================================
// SellDetailMapper -- Chuyen doi RecordSet -> Row
// SellDetailMapper -- RecordSet -> Row 변환 구현
//
// Su dung RecordsetReader::ReadXxx de doc theo ten cot, khong phu thuoc thu tu
// RecordsetReader::ReadXxx로 컬럼명 기반 읽기, 컬럼 순서에 무관
// ======================================================================

SellDetailRecord SellDetailMapper::FromRecordset(CADORecordset& rs) {
    SellDetailRecord row;

    // -- Khoa chinh ghep / 복합 기본키 --
    row.SellDate       = RecordsetReader::ReadString(rs, SellDetailColumns::SellDate);
    row.PosNo          = RecordsetReader::ReadString(rs, SellDetailColumns::PosNo);
    row.OrderNo        = RecordsetReader::ReadInt   (rs, SellDetailColumns::OrderNo);
    row.ReceiptNo      = RecordsetReader::ReadInt   (rs, SellDetailColumns::ReceiptNo);
    row.SerNo          = RecordsetReader::ReadInt   (rs, SellDetailColumns::SerNo);

    // -- Thong tin mon / 메뉴 항목 정보 --
    row.ItemCode       = RecordsetReader::ReadString(rs, SellDetailColumns::ItemCode);
    row.ItemName       = RecordsetReader::ReadString(rs, SellDetailColumns::ItemName);
    row.MenuCode       = RecordsetReader::ReadString(rs, SellDetailColumns::MenuCode);
    row.MasterCode     = RecordsetReader::ReadString(rs, SellDetailColumns::MasterCode);

    // -- Nhom mon / 메뉴 그룹 --
    row.GrpCode        = RecordsetReader::ReadString(rs, SellDetailColumns::GrpCode);
    row.GrpName        = RecordsetReader::ReadString(rs, SellDetailColumns::GrpName);

    // -- So tien va so luong / 금액 및 수량 --
    row.SaleAmt        = RecordsetReader::ReadDouble(rs, SellDetailColumns::SaleAmt);
    row.Qty            = RecordsetReader::ReadDouble(rs, SellDetailColumns::Qty);
    row.TotalAmt       = RecordsetReader::ReadDouble(rs, SellDetailColumns::TotalAmt);
    row.DcAmt          = RecordsetReader::ReadDouble(rs, SellDetailColumns::DcAmt);
    row.ReceiveAmt     = RecordsetReader::ReadDouble(rs, SellDetailColumns::ReceiveAmt);
    row.VatAmt         = RecordsetReader::ReadDouble(rs, SellDetailColumns::VatAmt);
    row.WorkAmt        = RecordsetReader::ReadDouble(rs, SellDetailColumns::WorkAmt);
    row.ServiceAmt     = RecordsetReader::ReadDouble(rs, SellDetailColumns::ServiceAmt);

    // -- Giam gia chi tiet / 할인 상세 --
    row.DcEventAmt     = RecordsetReader::ReadDouble(rs, SellDetailColumns::DcEventAmt);
    row.MenuDcAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::MenuDcAmt);
    row.SaleDcAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::SaleDcAmt);
    row.InputMenuDC    = RecordsetReader::ReadInt   (rs, SellDetailColumns::InputMenuDC);

    // -- Phan bo thanh toan / 결제수단 배분 --
    row.SDCashAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDCashAmt);
    row.SDCardAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDCardAmt);
    row.SDPointAmt     = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDPointAmt);
    row.SDCouponAmt    = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDCouponAmt);
    row.SDTickAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDTickAmt);
    row.SDCashbagAmt   = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDCashbagAmt);
    row.SDKeepAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDKeepAmt);
    row.SDEdenredAmt   = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDEdenredAmt);
    row.SDSelfAmt      = RecordsetReader::ReadDouble(rs, SellDetailColumns::SDSelfAmt);

    // -- Trang thai va phan loai / 상태 및 분류 --
    row.SellState      = RecordsetReader::ReadInt   (rs, SellDetailColumns::SellState);
    row.SellType       = RecordsetReader::ReadInt   (rs, SellDetailColumns::SellType);
    row.OrderState     = RecordsetReader::ReadInt   (rs, SellDetailColumns::OrderState);
    row.OrderType      = RecordsetReader::ReadInt   (rs, SellDetailColumns::OrderType);
    row.WorkType       = RecordsetReader::ReadInt   (rs, SellDetailColumns::WorkType);

    // -- Ban va ngay dat hang / 테이블 및 주문일자 --
    row.TableCode      = RecordsetReader::ReadString(rs, SellDetailColumns::TableCode);
    row.OrderDate      = RecordsetReader::ReadString(rs, SellDetailColumns::OrderDate);

    // -- Nhan vien / 직원 --
    row.AmtEmpCode     = RecordsetReader::ReadString(rs, SellDetailColumns::AmtEmpCode);

    // -- Ma tin nhan / 주문메시지코드 --
    row.OrderMsgCode   = RecordsetReader::ReadString(rs, SellDetailColumns::OrderMsgCode);

    // -- Dieu chinh va ket thuc / 조정 및 종료 --
    row.AdjustNo       = RecordsetReader::ReadInt   (rs, SellDetailColumns::AdjustNo);
    row.EndTimeDate    = RecordsetReader::ReadString(rs, SellDetailColumns::EndTimeDate);
    row.EndTime        = RecordsetReader::ReadString(rs, SellDetailColumns::EndTime);

    // -- Kho va don vi / 재고 및 단위 --
    row.StockUseUnit   = RecordsetReader::ReadString(rs, SellDetailColumns::StockUseUnit);

    // -- Cua hang / 매장 --
    row.StoreIndex     = RecordsetReader::ReadInt   (rs, SellDetailColumns::StoreIndex);

    // -- Co va phu / 플래그 및 부가 --
    row.DcEventCode    = RecordsetReader::ReadString(rs, SellDetailColumns::DcEventCode);
    row.ADUFlag        = RecordsetReader::ReadString(rs, SellDetailColumns::ADUFlag);
    row.SubCol1        = RecordsetReader::ReadString(rs, SellDetailColumns::SubCol1);
    row.SubCol2        = RecordsetReader::ReadString(rs, SellDetailColumns::SubCol2);
    row.SubCol3        = RecordsetReader::ReadString(rs, SellDetailColumns::SubCol3);
    row.DelFlag        = RecordsetReader::ReadInt   (rs, SellDetailColumns::DelFlag);

    return row;
}

std::vector<SellDetailRecord> SellDetailMapper::ListFromRecordset(CADORecordset& rs) {
    // Duyet tat ca cac dong trong RecordSet va chuyen doi tung dong
    // RecordSet의 모든 행을 순회하며 각 행을 변환
    std::vector<SellDetailRecord> rows;

    // TODO: Tich hop ADO thuc te / 실제 ADO 통합
    //       while (!rs.IsEOF()) { rows.push_back(FromRecordset(rs)); rs.MoveNext(); }
    (void)rs;

    return rows;
}
