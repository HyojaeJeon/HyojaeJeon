#pragma once
/**
 * ItemChangeLogCrud.h — Row + Columns + Mapper + CRUD helper cho bảng ItemChangeLog
 * ItemChangeLogCrud.h — ItemChangeLog 테이블용 Row + Columns + Mapper + CRUD helper
 *
 * Vai trò / 역할:
 *   Ghi lại lịch sử thay đổi giá/thông tin sản phẩm.
 *   상품 가격/정보 변경 이력을 기록한다.
 *     - ItemChangeLogRecord: cấu trúc dữ liệu hàng / 행 데이터 구조체
 *     - ItemChangeLogColumns: tên bảng + hằng số cột / 테이블명 + 컬럼 상수
 *     - ItemChangeLogCrud: CRUD helper / CRUD helper
 *     - ItemChangeLogMapper: chuyển đổi RecordSet → Row / RecordSet → Row 변환
 */

#include <string>
#include <vector>
#include <cstdint>

class CADORecordset;

// ══════════════════════════════════════════
// ItemChangeLogRecord — Cấu trúc hàng lịch sử thay đổi / 변경 이력 행 구조체
// ══════════════════════════════════════════
struct ItemChangeLogRecord {
    std::string ChangeDate;  // Ngày thay đổi / 변경일
    std::string ItemCode;    // Mã sản phẩm / 상품 코드
    std::string BarCode;     // Mã vạch / 바코드
    std::string CType;       // Loại thay đổi / 변경 유형
    int64_t     perAmt{};    // Giá trước thay đổi / 변경 전 금액
    int64_t     afterAmt{};  // Giá sau thay đổi / 변경 후 금액
    int64_t     Amt{};       // Chênh lệch / 차액
    int64_t     preSup{};    // Giá cung cấp trước / 변경 전 공급가
    int64_t     afterSup{};  // Giá cung cấp sau / 변경 후 공급가
    std::string Memo;        // Ghi chú / 메모
    std::string DelFlag;     // Cờ xóa / 삭제 플래그
};

// ══════════════════════════════════════════
// ItemChangeLogColumns — Hằng số tên bảng + cột / 테이블명 + 컬럼 상수
// ══════════════════════════════════════════
namespace ItemChangeLogColumns {
    constexpr const char* TABLE      = "ItemChangeLog";

    constexpr const char* ChangeDate = "ChangeDate";
    constexpr const char* ItemCode   = "ItemCode";
    constexpr const char* BarCode    = "BarCode";
    constexpr const char* CType      = "CType";
    constexpr const char* perAmt     = "perAmt";
    constexpr const char* afterAmt   = "afterAmt";
    constexpr const char* Amt        = "Amt";
    constexpr const char* preSup     = "preSup";
    constexpr const char* afterSup   = "afterSup";
    constexpr const char* Memo       = "Memo";
    constexpr const char* DelFlag    = "DelFlag";
}

// ══════════════════════════════════════════
// ItemChangeLogCrud — CRUD helper / CRUD 헬퍼
//
// Quy ước / 규칙:
//   Mỗi hàm trả về chuỗi SQL thuần túy.
//   각 함수는 순수 SQL 문자열을 반환한다.
//   Không thực thi DB — chỉ sinh SQL.
//   DB 실행 없음 — SQL 생성만 담당.
// ══════════════════════════════════════════
namespace ItemChangeLogCrud {
    // Tìm lịch sử theo mã sản phẩm / 상품 코드로 변경 이력 조회
    std::string SelectByItemCode(const std::string& item_code);
    // Tìm lịch sử theo khoảng ngày / 날짜 범위로 변경 이력 조회
    std::string SelectByDateRange(const std::string& from_date, const std::string& to_date);
}

// ══════════════════════════════════════════
// ItemChangeLogMapper — RecordSet → ItemChangeLogRecord 변환
// ══════════════════════════════════════════
namespace ItemChangeLogMapper {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1건 읽기
    ItemChangeLogRecord FromRecordset(CADORecordset& rs);
    // Đọc tất cả hàng từ RecordSet / RecordSet 전체 행 읽기
    std::vector<ItemChangeLogRecord> ListFromRecordset(CADORecordset& rs);
}
