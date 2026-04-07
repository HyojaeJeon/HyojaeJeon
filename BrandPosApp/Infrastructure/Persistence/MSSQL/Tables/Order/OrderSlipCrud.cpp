#include "OrderSlipCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════════════════════════
// OrderSlipCrud — Triển khai hàm tạo câu SQL
// OrderSlipCrud — SQL 문 생성 함수 구현
//
// TODO: Chuyển sang parameterized query khi tích hợp ADO thực tế
// TODO: 실제 ADO 통합 시 파라미터화 쿼리로 전환
// ══════════════════════════════════════════════════════════════

std::string OrderSlipCrud::SelectByOrderNo(int order_no) {
    // Truy vấn phiếu đặt hàng theo số phiếu / 주문번호로 주문전표 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << OrderSlipColumns::TABLE
        << " WHERE " << OrderSlipColumns::OrderNo << " = " << order_no;
    return sql.str();
}

std::string OrderSlipCrud::SelectByTableCode(int table_code) {
    // Truy vấn phiếu đặt hàng theo mã bàn / 테이블코드로 주문전표 조회
    std::ostringstream sql;
    sql << "SELECT * FROM " << OrderSlipColumns::TABLE
        << " WHERE " << OrderSlipColumns::TableCode << " = " << table_code;
    return sql.str();
}

std::string OrderSlipCrud::Insert(const OrderSlipRecord& row) {
    // Chèn phiếu đặt hàng mới / 신규 주문전표 삽입
    std::ostringstream sql;
    sql << "INSERT INTO " << OrderSlipColumns::TABLE << " ("
        << OrderSlipColumns::OrderNo         << ", "
        << OrderSlipColumns::CustNum         << ", "
        << OrderSlipColumns::OrderAmt        << ", "
        << OrderSlipColumns::DcAmt           << ", "
        << OrderSlipColumns::TotalAmt        << ", "
        << OrderSlipColumns::OrderType       << ", "
        << OrderSlipColumns::OrderMsgCode1   << ", "
        << OrderSlipColumns::OrderMsgCode2   << ", "
        << OrderSlipColumns::OrderMsgCode3   << ", "
        << OrderSlipColumns::OrderPrn        << ", "
        << OrderSlipColumns::FirstOrderDate  << ", "
        << OrderSlipColumns::PosNo           << ", "
        << OrderSlipColumns::OrderState      << ", "
        << OrderSlipColumns::SaleDcListCode  << ", "
        << OrderSlipColumns::CustCode        << ", "
        << OrderSlipColumns::TableCode       << ", "
        << OrderSlipColumns::ReceiveAmt      << ", "
        << OrderSlipColumns::EmpCode         << ", "
        << OrderSlipColumns::TableEmpCode    << ", "
        << OrderSlipColumns::VatAmt          << ", "
        << OrderSlipColumns::WorkAmt         << ", "
        << OrderSlipColumns::ServiceAmt      << ", "
        << OrderSlipColumns::DcEventAmt      << ", "
        << OrderSlipColumns::MenuDcAmt       << ", "
        << OrderSlipColumns::SaleDcCode      << ", "
        << OrderSlipColumns::SavePoint       << ", "
        << OrderSlipColumns::GroupSet        << ", "
        << OrderSlipColumns::NewOrderPrn     << ", "
        << OrderSlipColumns::TableMsgCode    << ", "
        << OrderSlipColumns::TableMsg        << ", "
        << OrderSlipColumns::SaleDcAmt       << ", "
        << OrderSlipColumns::TaxFree         << ", "
        << OrderSlipColumns::Age             << ", "
        << OrderSlipColumns::Man             << ", "
        << OrderSlipColumns::Woman           << ", "
        << OrderSlipColumns::Etc             << ", "
        << OrderSlipColumns::paytype         << ", "
        << OrderSlipColumns::SubCol1         << ", "
        << OrderSlipColumns::SubCol2         << ", "
        << OrderSlipColumns::SubCol3
        << ") VALUES ("
        << row.OrderNo                      << ", "
        << row.CustNum                      << ", "
        << row.OrderAmt                     << ", "
        << row.DcAmt                        << ", "
        << row.TotalAmt                     << ", "
        << row.OrderType                    << ", "
        << "'" << row.OrderMsgCode1         << "', "
        << "'" << row.OrderMsgCode2         << "', "
        << "'" << row.OrderMsgCode3         << "', "
        << row.OrderPrn                     << ", "
        << "'" << row.FirstOrderDate        << "', "
        << row.PosNo                        << ", "
        << "'" << row.OrderState            << "', "
        << "'" << row.SaleDcListCode        << "', "
        << "'" << row.CustCode              << "', "
        << row.TableCode                    << ", "
        << row.ReceiveAmt                   << ", "
        << "'" << row.EmpCode               << "', "
        << "'" << row.TableEmpCode          << "', "
        << row.VatAmt                       << ", "
        << row.WorkAmt                      << ", "
        << row.ServiceAmt                   << ", "
        << row.DcEventAmt                   << ", "
        << row.MenuDcAmt                    << ", "
        << "'" << row.SaleDcCode            << "', "
        << row.SavePoint                    << ", "
        << "'" << row.GroupSet              << "', "
        << row.NewOrderPrn                  << ", "
        << "'" << row.TableMsgCode          << "', "
        << "'" << row.TableMsg              << "', "
        << row.SaleDcAmt                    << ", "
        << row.TaxFree                      << ", "
        << row.Age                          << ", "
        << row.Man                          << ", "
        << row.Woman                        << ", "
        << row.Etc                          << ", "
        << "'" << row.paytype               << "', "
        << "'" << row.SubCol1               << "', "
        << "'" << row.SubCol2               << "', "
        << "'" << row.SubCol3               << "'"
        << ")";
    return sql.str();
}

std::string OrderSlipCrud::UpdateState(int order_no, const std::string& state) {
    // Cập nhật trạng thái đặt hàng / 주문상태 갱신
    std::ostringstream sql;
    sql << "UPDATE " << OrderSlipColumns::TABLE
        << " SET " << OrderSlipColumns::OrderState << " = '" << state << "'"
        << " WHERE " << OrderSlipColumns::OrderNo << " = " << order_no;
    return sql.str();
}

// ══════════════════════════════════════════════════════════════
// OrderSlipMapper — Triển khai chuyển đổi RecordSet
// OrderSlipMapper — RecordSet 변환 구현
//
// TODO: Tích hợp ADO thực tế / 실제 ADO 통합
//       Khi có AdoWraper thực, RecordsetReader::ReadXxx sẽ đọc dữ liệu thật
//       실제 AdoWraper가 있으면 RecordsetReader::ReadXxx가 실제 데이터를 읽음
// ══════════════════════════════════════════════════════════════

OrderSlipRecord OrderSlipMapper::FromRecordset(CADORecordset& rs) {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1개 읽기
    OrderSlipRecord row;
    row.OrderNo        = RecordsetReader::ReadInt(rs,    OrderSlipColumns::OrderNo);
    row.CustNum        = RecordsetReader::ReadInt(rs,    OrderSlipColumns::CustNum);
    row.OrderAmt       = RecordsetReader::ReadInt(rs,    OrderSlipColumns::OrderAmt);
    row.DcAmt          = RecordsetReader::ReadInt(rs,    OrderSlipColumns::DcAmt);
    row.TotalAmt       = RecordsetReader::ReadInt(rs,    OrderSlipColumns::TotalAmt);
    row.OrderType      = RecordsetReader::ReadInt(rs,    OrderSlipColumns::OrderType);
    row.OrderMsgCode1  = RecordsetReader::ReadString(rs, OrderSlipColumns::OrderMsgCode1);
    row.OrderMsgCode2  = RecordsetReader::ReadString(rs, OrderSlipColumns::OrderMsgCode2);
    row.OrderMsgCode3  = RecordsetReader::ReadString(rs, OrderSlipColumns::OrderMsgCode3);
    row.OrderPrn       = RecordsetReader::ReadInt(rs,    OrderSlipColumns::OrderPrn);
    row.FirstOrderDate = RecordsetReader::ReadString(rs, OrderSlipColumns::FirstOrderDate);
    row.PosNo          = RecordsetReader::ReadInt(rs,    OrderSlipColumns::PosNo);
    row.OrderState     = RecordsetReader::ReadString(rs, OrderSlipColumns::OrderState);
    row.SaleDcListCode = RecordsetReader::ReadString(rs, OrderSlipColumns::SaleDcListCode);
    row.CustCode       = RecordsetReader::ReadString(rs, OrderSlipColumns::CustCode);
    row.TableCode      = RecordsetReader::ReadInt(rs,    OrderSlipColumns::TableCode);
    row.ReceiveAmt     = RecordsetReader::ReadInt(rs,    OrderSlipColumns::ReceiveAmt);
    row.EmpCode        = RecordsetReader::ReadString(rs, OrderSlipColumns::EmpCode);
    row.TableEmpCode   = RecordsetReader::ReadString(rs, OrderSlipColumns::TableEmpCode);
    row.VatAmt         = RecordsetReader::ReadInt(rs,    OrderSlipColumns::VatAmt);
    row.WorkAmt        = RecordsetReader::ReadInt(rs,    OrderSlipColumns::WorkAmt);
    row.ServiceAmt     = RecordsetReader::ReadInt(rs,    OrderSlipColumns::ServiceAmt);
    row.DcEventAmt     = RecordsetReader::ReadInt(rs,    OrderSlipColumns::DcEventAmt);
    row.MenuDcAmt      = RecordsetReader::ReadInt(rs,    OrderSlipColumns::MenuDcAmt);
    row.SaleDcCode     = RecordsetReader::ReadString(rs, OrderSlipColumns::SaleDcCode);
    row.SavePoint      = RecordsetReader::ReadInt(rs,    OrderSlipColumns::SavePoint);
    row.GroupSet       = RecordsetReader::ReadString(rs, OrderSlipColumns::GroupSet);
    row.NewOrderPrn    = RecordsetReader::ReadInt(rs,    OrderSlipColumns::NewOrderPrn);
    row.TableMsgCode   = RecordsetReader::ReadString(rs, OrderSlipColumns::TableMsgCode);
    row.TableMsg       = RecordsetReader::ReadString(rs, OrderSlipColumns::TableMsg);
    row.SaleDcAmt      = RecordsetReader::ReadInt(rs,    OrderSlipColumns::SaleDcAmt);
    row.TaxFree        = RecordsetReader::ReadInt(rs,    OrderSlipColumns::TaxFree);
    row.Age            = RecordsetReader::ReadInt(rs,    OrderSlipColumns::Age);
    row.Man            = RecordsetReader::ReadInt(rs,    OrderSlipColumns::Man);
    row.Woman          = RecordsetReader::ReadInt(rs,    OrderSlipColumns::Woman);
    row.Etc            = RecordsetReader::ReadInt(rs,    OrderSlipColumns::Etc);
    row.paytype        = RecordsetReader::ReadString(rs, OrderSlipColumns::paytype);
    row.SubCol1        = RecordsetReader::ReadString(rs, OrderSlipColumns::SubCol1);
    row.SubCol2        = RecordsetReader::ReadString(rs, OrderSlipColumns::SubCol2);
    row.SubCol3        = RecordsetReader::ReadString(rs, OrderSlipColumns::SubCol3);
    return row;
}

std::vector<OrderSlipRecord> OrderSlipMapper::ListFromRecordset(CADORecordset& rs) {
    // Đọc tất cả hàng / 전체 행 읽기
    // TODO: Lặp qua RecordSet thật: while (!rs.IsEOF()) { ... rs.MoveNext(); }
    // TODO: 실제 RecordSet 순회: while (!rs.IsEOF()) { ... rs.MoveNext(); }
    std::vector<OrderSlipRecord> rows;
    rows.push_back(FromRecordset(rs));
    return rows;
}
