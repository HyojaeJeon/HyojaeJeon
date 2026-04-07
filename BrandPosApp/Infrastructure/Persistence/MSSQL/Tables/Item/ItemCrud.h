#pragma once
/**
 * ItemCrud.h — Row + Columns + Mapper + CRUD helper cho bảng Item
 * ItemCrud.h — Item 테이블용 Row + Columns + Mapper + CRUD helper
 *
 * Vai trò / 역할:
 *   Quản lý thông tin sản phẩm/menu.
 *   상품/메뉴 정보를 관리한다.
 *     - ItemRecord: cấu trúc dữ liệu hàng / 행 데이터 구조체
 *     - ItemColumns: tên bảng + hằng số cột / 테이블명 + 컬럼 상수
 *     - ItemCrud: CRUD helper / CRUD helper
 *     - ItemMapper: chuyển đổi RecordSet → Row / RecordSet → Row 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ══════════════════════════════════════════
// ItemRecord — Cấu trúc hàng sản phẩm / 상품 행 구조체
// ══════════════════════════════════════════
struct ItemRecord {
    std::string ItemCode;     // Mã sản phẩm / 상품 코드
    std::string BarCode;      // Mã vạch / 바코드
    std::string ItemName;     // Tên sản phẩm / 상품명
    std::string GrpCode;      // Mã nhóm / 그룹 코드
    int64_t     SaleAmt{};    // Giá bán / 판매 금액
    int64_t     OrgAmt{};     // Giá gốc / 원가 금액
    int         lineup{};     // Thứ tự hiển thị / 정렬 순서
    double      ProfitRate{}; // Tỷ lệ lợi nhuận / 이익률
    std::string DelFlag;      // Cờ xóa / 삭제 플래그
};

// ══════════════════════════════════════════
// ItemColumns — Hằng số tên bảng + cột / 테이블명 + 컬럼 상수
// ══════════════════════════════════════════
namespace ItemColumns {
    constexpr const char* TABLE      = "Item";

    constexpr const char* ItemCode   = "ItemCode";
    constexpr const char* BarCode    = "BarCode";
    constexpr const char* ItemName   = "ItemName";
    constexpr const char* GrpCode    = "GrpCode";
    constexpr const char* SaleAmt    = "SaleAmt";
    constexpr const char* OrgAmt     = "OrgAmt";
    constexpr const char* lineup     = "lineup";
    constexpr const char* ProfitRate = "ProfitRate";
    constexpr const char* DelFlag    = "DelFlag";
}

// ══════════════════════════════════════════
// ItemCrud — CRUD helper / CRUD 헬퍼
//
// Quy ước / 규칙:
//   Mỗi hàm trả về chuỗi SQL thuần túy.
//   각 함수는 순수 SQL 문자열을 반환한다.
//   Không thực thi DB — chỉ sinh SQL.
//   DB 실행 없음 — SQL 생성만 담당.
// ══════════════════════════════════════════
namespace ItemCrud {
    // Lấy tất cả sản phẩm đang hoạt động (DelFlag != 'Y')
    // 활성 상품 전체 조회 (DelFlag != 'Y')
    std::string SelectActiveItems();
    // Tìm sản phẩm theo mã / 코드로 상품 조회
    std::string SelectByCode(const std::string& item_code);
}

// ══════════════════════════════════════════
// ItemMapper — RecordSet → ItemRecord / RecordSet → ItemRecord 변환
// ══════════════════════════════════════════
namespace ItemMapper {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1건 읽기
    ItemRecord FromRecordset(CADORecordset& rs);
    // Đọc tất cả hàng từ RecordSet / RecordSet 전체 행 읽기
    std::vector<ItemRecord> ListFromRecordset(CADORecordset& rs);
}
