#pragma once
/**
 * TableCrud.h — Struct row + column constants + mapper + CRUD helper cho bảng Table
 * TableCrud.h — Table 테이블의 행 구조체 + 컬럼 상수 + CRUD helper + 매퍼
 *
 * Vai trò / 역할:
 *   Gộp tất cả thành phần persistence cho entity Table vào một file duy nhất:
 *   Table 엔티티의 모든 영속화 구성요소를 단일 파일로 통합:
 *     - Struct hàng dữ liệu (TableRecord)
 *       데이터 행 구조체
 *     - Hằng số tên bảng và tên cột (TableColumns)
 *       테이블명 및 컬럼명 상수
 *     - Hàm tạo câu SQL (TableCrud)
 *       SQL 쿼리 생성 함수
 *     - Hàm ánh xạ RecordSet sang struct (TableMapper)
 *       RecordSet → 구조체 매핑 함수
 */

#include <string>
#include <vector>

class CADORecordset;

// ══════════════════════════════════════════
// Struct hàng dữ liệu / 데이터 행 구조체
//
// Ánh xạ 1:1 với các cột trong bảng Table trên MSSQL
// MSSQL Table 테이블의 컬럼과 1:1 매핑
// ══════════════════════════════════════════
struct TableRecord {
    int         FloorNum      = 0;    // Số tầng / 층 번호
    int         LineNum       = 0;    // Số dòng / 줄 번호
    int         ColNum        = 0;    // Số cột / 열 번호
    int         TableType     = 0;    // Loại bàn / 테이블 유형
    int         TableNo       = 0;    // Số bàn / 테이블 번호
    int         PageNum       = 0;    // Số trang / 페이지 번호
    int         TableCode     = 0;    // Mã bàn / 테이블 코드
    std::string TableName;            // Tên bàn / 테이블 이름
    std::string EmpCode;              // Mã nhân viên / 직원 코드
    int         MatrixSize    = 0;    // Kích thước ma trận / 매트릭스 크기
    int         PosNo         = 0;    // Số POS / POS 번호
    int         Color         = 0;    // Màu sắc / 색상
    int         Ttop          = 0;    // Vị trí trên / 상단 위치
    int         Tbottom       = 0;    // Vị trí dưới / 하단 위치
    int         Tleft         = 0;    // Vị trí trái / 좌측 위치
    int         Tright        = 0;    // Vị trí phải / 우측 위치
    std::string FloorName;            // Tên tầng / 층 이름
    std::string SubCol3;              // Cột phụ 3 / 서브 컬럼3
    std::string TableMsg;             // Thông báo bàn / 테이블 메시지
    std::string TableCardNo;          // Mã thẻ bàn / 테이블 카드번호
    int         StoreIndex    = 0;    // Chỉ mục cửa hàng / 매장 인덱스
    int         TableNorFont  = 0;    // Font bình thường / 일반 글꼴
    int         TableOrFont   = 0;    // Font đặt trước / 주문 글꼴
    int         RecvAmtFont   = 0;    // Font tiền nhận / 수납금액 글꼴
    std::string ADUFlag;              // Cờ ADU / ADU 플래그
    std::string DelFlag;              // Cờ xóa / 삭제 플래그
};

// ══════════════════════════════════════════
// Hằng số schema / 컬럼 상수
//
// Tên bảng và tên cột: dùng trong SQL builder, Mapper, kiểm tra schema
// 테이블명 및 컬럼명: SQL 빌더, 매퍼, 스키마 검증에 사용
// ══════════════════════════════════════════
namespace TableColumns {
    constexpr const char* TABLE        = "Table";

    constexpr const char* FloorNum     = "FloorNum";      // Số tầng / 층 번호
    constexpr const char* LineNum      = "LineNum";        // Số dòng / 줄 번호
    constexpr const char* ColNum       = "ColNum";         // Số cột / 열 번호
    constexpr const char* TableType    = "TableType";      // Loại bàn / 테이블 유형
    constexpr const char* TableNo      = "TableNo";        // Số bàn / 테이블 번호
    constexpr const char* PageNum      = "PageNum";        // Số trang / 페이지 번호
    constexpr const char* TableCode    = "TableCode";      // Mã bàn / 테이블 코드
    constexpr const char* TableName    = "TableName";      // Tên bàn / 테이블 이름
    constexpr const char* EmpCode      = "EmpCode";        // Mã nhân viên / 직원 코드
    constexpr const char* MatrixSize   = "MatrixSize";     // Kích thước ma trận / 매트릭스 크기
    constexpr const char* PosNo        = "PosNo";          // Số POS / POS 번호
    constexpr const char* Color        = "Color";          // Màu sắc / 색상
    constexpr const char* Ttop         = "Ttop";           // Vị trí trên / 상단 위치
    constexpr const char* Tbottom      = "Tbottom";        // Vị trí dưới / 하단 위치
    constexpr const char* Tleft        = "Tleft";          // Vị trí trái / 좌측 위치
    constexpr const char* Tright       = "Tright";         // Vị trí phải / 우측 위치
    constexpr const char* FloorName    = "FloorName";      // Tên tầng / 층 이름
    constexpr const char* SubCol3      = "SubCol3";        // Cột phụ 3 / 서브 컬럼3
    constexpr const char* TableMsg     = "TableMsg";       // Thông báo bàn / 테이블 메시지
    constexpr const char* TableCardNo  = "TableCardNo";    // Mã thẻ bàn / 테이블 카드번호
    constexpr const char* StoreIndex   = "StoreIndex";     // Chỉ mục cửa hàng / 매장 인덱스
    constexpr const char* TableNorFont = "TableNorFont";   // Font bình thường / 일반 글꼴
    constexpr const char* TableOrFont  = "TableOrFont";    // Font đặt trước / 주문 글꼴
    constexpr const char* RecvAmtFont  = "RecvAmtFont";    // Font tiền nhận / 수납금액 글꼴
    constexpr const char* ADUFlag      = "ADUFlag";        // Cờ ADU / ADU 플래그
    constexpr const char* DelFlag      = "DelFlag";        // Cờ xóa / 삭제 플래그
}

// ══════════════════════════════════════════
// CRUD helper / CRUD 헬퍼
//
// Tạo câu SQL từ column constants, không hard-code tên cột
// 컬럼 상수로부터 SQL 생성, 컬럼명 하드코딩 금지
// ══════════════════════════════════════════
namespace TableCrud {
    // Lấy tất cả bàn, tùy chọn lọc theo tầng / 전체 테이블 조회, 층별 필터 선택
    // FloorId == 0 → tất cả tầng / FloorId == 0 → 전체 층
    std::string SelectAll(int FloorId = 0);

    // Lấy bàn theo mã bàn / 테이블 코드로 조회
    std::string SelectByTableCode(int TableCode);

    // Cập nhật trạng thái bàn / 테이블 상태 업데이트
    std::string UpdateStatus(int TableCode, const std::string& Status);

    // Lấy số tầng lớn nhất / 최대 층 번호 조회
    std::string SelectMaxFloor();
}

// ══════════════════════════════════════════
// Mapper: RecordSet → struct / RecordSet → 구조체 매핑
//
// Dùng RecordsetReader::ReadXxx để đọc theo tên cột, không theo index
// RecordsetReader::ReadXxx로 인덱스가 아닌 컬럼명 기반 읽기
// ══════════════════════════════════════════
namespace TableMapper {
    // Đọc hàng hiện tại của RecordSet / RecordSet의 현재 행 읽기
    TableRecord FromRecordset(CADORecordset& rs);

    // Đọc tất cả hàng của RecordSet / RecordSet의 전체 행 읽기
    std::vector<TableRecord> ListFromRecordset(CADORecordset& rs);
}
