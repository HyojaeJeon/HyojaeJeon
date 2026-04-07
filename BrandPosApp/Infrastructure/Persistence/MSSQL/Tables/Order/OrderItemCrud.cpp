#include "OrderItemCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════════════════════════
// OrderItemCrud — Triển khai hàm tạo câu SQL
// OrderItemCrud — SQL 문 생성 함수 구현
//
// TODO: Chuyển sang parameterized query khi tích hợp ADO thực tế
// TODO: 실제 ADO 통합 시 파라미터화 쿼리로 전환
// ══════════════════════════════════════════════════════════════

std::string OrderItemCrud::SelectByOrderNo(int order_no) {
    // Truy vấn chi tiết đặt hàng theo số phiếu / 주문번호로 주문상세 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << OrderItemColumns::TABLE
        << " WHERE " << OrderItemColumns::OrderNo << " = " << order_no;
    return sql.str();
}

std::string OrderItemCrud::Insert(const OrderItemRecord& row) {
    // Chèn chi tiết đặt hàng mới / 신규 주문상세 항목 삽입
    std::ostringstream sql;
    sql << "INSERT INTO " << OrderItemColumns::TABLE << " ("
        << OrderItemColumns::SerNo           << ", "
        << OrderItemColumns::ItemName        << ", "
        << OrderItemColumns::OrderAmt        << ", "
        << OrderItemColumns::DcAmt           << ", "
        << OrderItemColumns::Qty             << ", "
        << OrderItemColumns::TotalAmt        << ", "
        << OrderItemColumns::GrpCode         << ", "
        << OrderItemColumns::GrpName         << ", "
        << OrderItemColumns::MenuCode        << ", "
        << OrderItemColumns::OrderState      << ", "
        << OrderItemColumns::ItemCode        << ", "
        << OrderItemColumns::OrderDate       << ", "
        << OrderItemColumns::OrderNo         << ", "
        << OrderItemColumns::PosNo           << ", "
        << OrderItemColumns::FirstOrderDate  << ", "
        << OrderItemColumns::OrderType       << ", "
        << OrderItemColumns::ReceiveAmt      << ", "
        << OrderItemColumns::VatAmt          << ", "
        << OrderItemColumns::WorkAmt         << ", "
        << OrderItemColumns::TableCode       << ", "
        << OrderItemColumns::AmtEmpCode      << ", "
        << OrderItemColumns::WorkType        << ", "
        << OrderItemColumns::ServiceAmt      << ", "
        << OrderItemColumns::DcEventAmt      << ", "
        << OrderItemColumns::MenuDcAmt       << ", "
        << OrderItemColumns::DcTaxAmt        << ", "
        << OrderItemColumns::OrderMsgCode    << ", "
        << OrderItemColumns::OrderPrn        << ", "
        << OrderItemColumns::OrderPrnState   << ", "
        << OrderItemColumns::OldQty          << ", "
        << OrderItemColumns::InputMenuDC     << ", "
        << OrderItemColumns::DelFlag         << ", "
        << OrderItemColumns::SubCol2         << ", "
        << OrderItemColumns::SubCol3         << ", "
        << OrderItemColumns::ADUFlag
        << ") VALUES ("
        << row.SerNo                        << ", "
        << "'" << row.ItemName              << "', "
        << row.OrderAmt                     << ", "
        << row.DcAmt                        << ", "
        << row.Qty                          << ", "
        << row.TotalAmt                     << ", "
        << "'" << row.GrpCode               << "', "
        << "'" << row.GrpName               << "', "
        << "'" << row.MenuCode              << "', "
        << "'" << row.OrderState            << "', "
        << "'" << row.ItemCode              << "', "
        << "'" << row.OrderDate             << "', "
        << row.OrderNo                      << ", "
        << row.PosNo                        << ", "
        << "'" << row.FirstOrderDate        << "', "
        << row.OrderType                    << ", "
        << row.ReceiveAmt                   << ", "
        << row.VatAmt                       << ", "
        << row.WorkAmt                      << ", "
        << row.TableCode                    << ", "
        << "'" << row.AmtEmpCode            << "', "
        << "'" << row.WorkType              << "', "
        << row.ServiceAmt                   << ", "
        << row.DcEventAmt                   << ", "
        << row.MenuDcAmt                    << ", "
        << row.DcTaxAmt                     << ", "
        << "'" << row.OrderMsgCode          << "', "
        << row.OrderPrn                     << ", "
        << "'" << row.OrderPrnState         << "', "
        << row.OldQty                       << ", "
        << "'" << row.InputMenuDC           << "', "
        << "'" << row.DelFlag               << "', "
        << "'" << row.SubCol2               << "', "
        << "'" << row.SubCol3               << "', "
        << "'" << row.ADUFlag               << "'"
        << ")";
    return sql.str();
}

// ══════════════════════════════════════════════════════════════
// OrderItemMapper — Triển khai chuyển đổi RecordSet
// OrderItemMapper — RecordSet 변환 구현
//
// TODO: Tích hợp ADO thực tế / 실제 ADO 통합
//       Khi có AdoWraper thực, RecordsetReader::ReadXxx sẽ đọc dữ liệu thật
//       실제 AdoWraper가 있으면 RecordsetReader::ReadXxx가 실제 데이터를 읽음
// ══════════════════════════════════════════════════════════════

OrderItemRecord OrderItemMapper::FromRecordset(CADORecordset& rs) {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1개 읽기
    OrderItemRecord row;
    row.SerNo          = RecordsetReader::ReadInt(rs,    OrderItemColumns::SerNo);
    row.ItemName       = RecordsetReader::ReadString(rs, OrderItemColumns::ItemName);
    row.OrderAmt       = RecordsetReader::ReadInt(rs,    OrderItemColumns::OrderAmt);
    row.DcAmt          = RecordsetReader::ReadInt(rs,    OrderItemColumns::DcAmt);
    row.Qty            = RecordsetReader::ReadInt(rs,    OrderItemColumns::Qty);
    row.TotalAmt       = RecordsetReader::ReadInt(rs,    OrderItemColumns::TotalAmt);
    row.GrpCode        = RecordsetReader::ReadString(rs, OrderItemColumns::GrpCode);
    row.GrpName        = RecordsetReader::ReadString(rs, OrderItemColumns::GrpName);
    row.MenuCode       = RecordsetReader::ReadString(rs, OrderItemColumns::MenuCode);
    row.OrderState     = RecordsetReader::ReadString(rs, OrderItemColumns::OrderState);
    row.ItemCode       = RecordsetReader::ReadString(rs, OrderItemColumns::ItemCode);
    row.OrderDate      = RecordsetReader::ReadString(rs, OrderItemColumns::OrderDate);
    row.OrderNo        = RecordsetReader::ReadInt(rs,    OrderItemColumns::OrderNo);
    row.PosNo          = RecordsetReader::ReadInt(rs,    OrderItemColumns::PosNo);
    row.FirstOrderDate = RecordsetReader::ReadString(rs, OrderItemColumns::FirstOrderDate);
    row.OrderType      = RecordsetReader::ReadInt(rs,    OrderItemColumns::OrderType);
    row.ReceiveAmt     = RecordsetReader::ReadInt(rs,    OrderItemColumns::ReceiveAmt);
    row.VatAmt         = RecordsetReader::ReadInt(rs,    OrderItemColumns::VatAmt);
    row.WorkAmt        = RecordsetReader::ReadInt(rs,    OrderItemColumns::WorkAmt);
    row.TableCode      = RecordsetReader::ReadInt(rs,    OrderItemColumns::TableCode);
    row.AmtEmpCode     = RecordsetReader::ReadString(rs, OrderItemColumns::AmtEmpCode);
    row.WorkType       = RecordsetReader::ReadString(rs, OrderItemColumns::WorkType);
    row.ServiceAmt     = RecordsetReader::ReadInt(rs,    OrderItemColumns::ServiceAmt);
    row.DcEventAmt     = RecordsetReader::ReadInt(rs,    OrderItemColumns::DcEventAmt);
    row.MenuDcAmt      = RecordsetReader::ReadInt(rs,    OrderItemColumns::MenuDcAmt);
    row.DcTaxAmt       = RecordsetReader::ReadInt(rs,    OrderItemColumns::DcTaxAmt);
    row.OrderMsgCode   = RecordsetReader::ReadString(rs, OrderItemColumns::OrderMsgCode);
    row.OrderPrn       = RecordsetReader::ReadInt(rs,    OrderItemColumns::OrderPrn);
    row.OrderPrnState  = RecordsetReader::ReadString(rs, OrderItemColumns::OrderPrnState);
    row.OldQty         = RecordsetReader::ReadInt(rs,    OrderItemColumns::OldQty);
    row.InputMenuDC    = RecordsetReader::ReadString(rs, OrderItemColumns::InputMenuDC);
    row.DelFlag        = RecordsetReader::ReadString(rs, OrderItemColumns::DelFlag);
    row.SubCol2        = RecordsetReader::ReadString(rs, OrderItemColumns::SubCol2);
    row.SubCol3        = RecordsetReader::ReadString(rs, OrderItemColumns::SubCol3);
    row.ADUFlag        = RecordsetReader::ReadString(rs, OrderItemColumns::ADUFlag);
    return row;
}

std::vector<OrderItemRecord> OrderItemMapper::ListFromRecordset(CADORecordset& rs) {
    // Đọc tất cả hàng / 전체 행 읽기
    // TODO: Lặp qua RecordSet thật: while (!rs.IsEOF()) { ... rs.MoveNext(); }
    // TODO: 실제 RecordSet 순회: while (!rs.IsEOF()) { ... rs.MoveNext(); }
    std::vector<OrderItemRecord> rows;
    rows.push_back(FromRecordset(rs));
    return rows;
}
