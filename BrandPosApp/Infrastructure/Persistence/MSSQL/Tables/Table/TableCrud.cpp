#include "TableCrud.h"
#include "../../../Core/PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// TableCrud — Triển khai CRUD helper
// TableCrud — CRUD helper 구현
//
// Tất cả câu SQL dùng hằng số từ TableColumns
// 모든 SQL은 TableColumns 상수를 사용
// ══════════════════════════════════════════

std::string TableCrud::SelectAll(int FloorId) {
    // Lấy tất cả bàn, lọc theo tầng nếu FloorId > 0
    // 전체 테이블 조회, FloorId > 0이면 층별 필터
    std::ostringstream sql;
    sql << "SELECT "
        << TableColumns::FloorNum     << ", "
        << TableColumns::LineNum      << ", "
        << TableColumns::ColNum       << ", "
        << TableColumns::TableType    << ", "
        << TableColumns::TableNo      << ", "
        << TableColumns::PageNum      << ", "
        << TableColumns::TableCode    << ", "
        << TableColumns::TableName    << ", "
        << TableColumns::EmpCode      << ", "
        << TableColumns::MatrixSize   << ", "
        << TableColumns::PosNo        << ", "
        << TableColumns::Color        << ", "
        << TableColumns::Ttop         << ", "
        << TableColumns::Tbottom      << ", "
        << TableColumns::Tleft        << ", "
        << TableColumns::Tright       << ", "
        << TableColumns::FloorName    << ", "
        << TableColumns::SubCol3      << ", "
        << TableColumns::TableMsg     << ", "
        << TableColumns::TableCardNo  << ", "
        << TableColumns::StoreIndex   << ", "
        << TableColumns::TableNorFont << ", "
        << TableColumns::TableOrFont  << ", "
        << TableColumns::RecvAmtFont  << ", "
        << TableColumns::ADUFlag      << ", "
        << TableColumns::DelFlag
        << " FROM " << TableColumns::TABLE;

    if (FloorId > 0) {
        sql << " WHERE " << TableColumns::FloorNum << " = " << FloorId;
    }

    sql << " ORDER BY " << TableColumns::FloorNum
        << ", "         << TableColumns::LineNum
        << ", "         << TableColumns::ColNum;

    return sql.str();
}

std::string TableCrud::SelectByTableCode(int TableCode) {
    // Lấy một bàn theo mã / 테이블 코드로 단건 조회
    std::ostringstream sql;
    sql << "SELECT "
        << TableColumns::FloorNum     << ", "
        << TableColumns::LineNum      << ", "
        << TableColumns::ColNum       << ", "
        << TableColumns::TableType    << ", "
        << TableColumns::TableNo      << ", "
        << TableColumns::PageNum      << ", "
        << TableColumns::TableCode    << ", "
        << TableColumns::TableName    << ", "
        << TableColumns::EmpCode      << ", "
        << TableColumns::MatrixSize   << ", "
        << TableColumns::PosNo        << ", "
        << TableColumns::Color        << ", "
        << TableColumns::Ttop         << ", "
        << TableColumns::Tbottom      << ", "
        << TableColumns::Tleft        << ", "
        << TableColumns::Tright       << ", "
        << TableColumns::FloorName    << ", "
        << TableColumns::SubCol3      << ", "
        << TableColumns::TableMsg     << ", "
        << TableColumns::TableCardNo  << ", "
        << TableColumns::StoreIndex   << ", "
        << TableColumns::TableNorFont << ", "
        << TableColumns::TableOrFont  << ", "
        << TableColumns::RecvAmtFont  << ", "
        << TableColumns::ADUFlag      << ", "
        << TableColumns::DelFlag
        << " FROM " << TableColumns::TABLE
        << " WHERE " << TableColumns::TableCode << " = " << TableCode;

    return sql.str();
}

std::string TableCrud::UpdateStatus(int TableCode, const std::string& Status) {
    // Cập nhật trạng thái bàn theo mã / 테이블 코드로 상태 업데이트
    std::ostringstream sql;
    sql << "UPDATE " << TableColumns::TABLE
        << " SET "   << TableColumns::ADUFlag << " = '" << Status << "'"
        << " WHERE " << TableColumns::TableCode << " = " << TableCode;

    return sql.str();
}

std::string TableCrud::SelectMaxFloor() {
    // Lấy số tầng lớn nhất / 최대 층 번호 조회
    std::ostringstream sql;
    sql << "SELECT MAX(" << TableColumns::FloorNum << ") AS MaxFloor"
        << " FROM " << TableColumns::TABLE;

    return sql.str();
}

// ══════════════════════════════════════════
// TableMapper — Triển khai ánh xạ RecordSet → struct
// TableMapper — RecordSet → 구조체 매핑 구현
//
// TODO: Tích hợp ADO thực tế / 실제 ADO 통합
//       Khi có AdoWraper thực, bỏ comment tham số rs
//       실제 AdoWraper가 있으면 rs 매개변수 주석 해제
// ══════════════════════════════════════════

TableRecord TableMapper::FromRecordset(CADORecordset& rs) {
    // Đọc hàng hiện tại theo tên cột / 현재 행을 컬럼명 기반으로 읽기
    TableRecord row;

    row.FloorNum     = RecordsetReader::ReadInt(rs, TableColumns::FloorNum);
    row.LineNum      = RecordsetReader::ReadInt(rs, TableColumns::LineNum);
    row.ColNum       = RecordsetReader::ReadInt(rs, TableColumns::ColNum);
    row.TableType    = RecordsetReader::ReadInt(rs, TableColumns::TableType);
    row.TableNo      = RecordsetReader::ReadInt(rs, TableColumns::TableNo);
    row.PageNum      = RecordsetReader::ReadInt(rs, TableColumns::PageNum);
    row.TableCode    = RecordsetReader::ReadInt(rs, TableColumns::TableCode);
    row.TableName    = RecordsetReader::ReadString(rs, TableColumns::TableName);
    row.EmpCode      = RecordsetReader::ReadString(rs, TableColumns::EmpCode);
    row.MatrixSize   = RecordsetReader::ReadInt(rs, TableColumns::MatrixSize);
    row.PosNo        = RecordsetReader::ReadInt(rs, TableColumns::PosNo);
    row.Color        = RecordsetReader::ReadInt(rs, TableColumns::Color);
    row.Ttop         = RecordsetReader::ReadInt(rs, TableColumns::Ttop);
    row.Tbottom      = RecordsetReader::ReadInt(rs, TableColumns::Tbottom);
    row.Tleft        = RecordsetReader::ReadInt(rs, TableColumns::Tleft);
    row.Tright       = RecordsetReader::ReadInt(rs, TableColumns::Tright);
    row.FloorName    = RecordsetReader::ReadString(rs, TableColumns::FloorName);
    row.SubCol3      = RecordsetReader::ReadString(rs, TableColumns::SubCol3);
    row.TableMsg     = RecordsetReader::ReadString(rs, TableColumns::TableMsg);
    row.TableCardNo  = RecordsetReader::ReadString(rs, TableColumns::TableCardNo);
    row.StoreIndex   = RecordsetReader::ReadInt(rs, TableColumns::StoreIndex);
    row.TableNorFont = RecordsetReader::ReadInt(rs, TableColumns::TableNorFont);
    row.TableOrFont  = RecordsetReader::ReadInt(rs, TableColumns::TableOrFont);
    row.RecvAmtFont  = RecordsetReader::ReadInt(rs, TableColumns::RecvAmtFont);
    row.ADUFlag      = RecordsetReader::ReadString(rs, TableColumns::ADUFlag);
    row.DelFlag      = RecordsetReader::ReadString(rs, TableColumns::DelFlag);

    return row;
}

std::vector<TableRecord> TableMapper::ListFromRecordset(CADORecordset& rs) {
    // Lặp qua tất cả hàng trong RecordSet / RecordSet의 전체 행 순회
    // TODO: Tích hợp ADO thực tế — gọi rs.MoveFirst(), rs.IsEOF(), rs.MoveNext()
    // TODO: 실제 ADO 통합 — rs.MoveFirst(), rs.IsEOF(), rs.MoveNext() 호출
    std::vector<TableRecord> rows;

    // --- stub: trả danh sách rỗng cho đến khi ADO sẵn sàng ---
    // --- stub: ADO 준비될 때까지 빈 목록 반환 ---
    (void)rs;

    return rows;
}
