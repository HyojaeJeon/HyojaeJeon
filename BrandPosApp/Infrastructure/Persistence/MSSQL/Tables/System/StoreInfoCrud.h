#pragma once
/**
 * StoreInfoCrud.h — Row + Columns + Mapper + CRUD helper cho bảng StoreInfo
 * StoreInfoCrud.h — StoreInfo 테이블용 Row + Columns + Mapper + CRUD helper
 *
 * Vai trò / 역할:
 *   Thông tin cửa hàng (tên, mã số kinh doanh, VAN, cổng...).
 *   매장 정보 (상호, 사업자번호, VAN, 포트...).
 *     - StoreInfoRecord: cấu trúc dữ liệu hàng / 행 데이터 구조체
 *     - StoreInfoColumns: tên bảng + hằng số cột / 테이블명 + 컬럼 상수
 *     - StoreInfoCrud: CRUD helper / CRUD helper
 *     - StoreInfoMapper: chuyển đổi RecordSet → Row / RecordSet → Row 변환
 */

#include <string>

class CADORecordset;

// ══════════════════════════════════════════
// StoreInfoRecord — Cấu trúc hàng thông tin cửa hàng / 매장 정보 행 구조체
// ══════════════════════════════════════════
struct StoreInfoRecord {
    std::string Chain;       // Mã chuỗi / 체인 코드
    std::string StoreName;   // Tên cửa hàng / 매장명
    std::string BizNo;       // Mã số kinh doanh / 사업자번호
    std::string Condition;   // Nghề nghiệp / 업태
    std::string StoreType;   // Loại cửa hàng / 업종
    std::string President;   // Tên đại diện / 대표자명
    std::string Tel;         // Số điện thoại / 전화번호
    std::string HPhone;      // Số di động đại diện / 대표 휴대폰
    std::string Addr;        // Địa chỉ / 주소
    std::string PosNo;       // Số POS / POS 번호
    std::string UpdateDate;  // Ngày cập nhật / 갱신일
    std::string PayType;     // Loại thanh toán / 결제 유형
    std::string StoreIndex;  // Chỉ số cửa hàng / 매장 인덱스
    std::string MainStore;   // Cửa hàng chính (Y/N) / 본점 여부
    std::string TerminalId;  // Mã thiết bị đầu cuối / 단말기 ID
    std::string TcpAddress;  // Địa chỉ TCP / TCP 주소
    int         TcpPort{};   // Cổng TCP / TCP 포트
    std::string VanSel;      // VAN đã chọn / VAN 선택
};

// ══════════════════════════════════════════
// StoreInfoColumns — Hằng số tên bảng + cột / 테이블명 + 컬럼 상수
// ══════════════════════════════════════════
namespace StoreInfoColumns {
    constexpr const char* TABLE      = "StoreInfo";

    constexpr const char* Chain      = "Chain";
    constexpr const char* StoreName  = "StoreName";
    constexpr const char* BizNo      = "BizNo";
    constexpr const char* Condition  = "Condition";
    constexpr const char* StoreType  = "StoreType";
    constexpr const char* President  = "President";
    constexpr const char* Tel        = "Tel";
    constexpr const char* HPhone     = "HPhone";
    constexpr const char* Addr       = "Addr";
    constexpr const char* PosNo      = "PosNo";
    constexpr const char* UpdateDate = "UpdateDate";
    constexpr const char* PayType    = "PayType";
    constexpr const char* StoreIndex = "StoreIndex";
    constexpr const char* MainStore  = "MainStore";
    constexpr const char* TerminalId = "TerminalId";
    constexpr const char* TcpAddress = "TcpAddress";
    constexpr const char* TcpPort    = "TcpPort";
    constexpr const char* VanSel     = "VanSel";
}

// ══════════════════════════════════════════
// StoreInfoCrud — CRUD helper / CRUD 헬퍼
//
// Quy ước / 규칙:
//   Mỗi hàm trả về chuỗi SQL thuần túy.
//   각 함수는 순수 SQL 문자열을 반환한다.
//   Không thực thi DB — chỉ sinh SQL.
//   DB 실행 없음 — SQL 생성만 담당.
// ══════════════════════════════════════════
namespace StoreInfoCrud {
    // Tìm thông tin theo số POS / POS 번호로 매장 정보 조회
    std::string SelectByPosNo(const std::string& pos_no);
    // Lấy 1 hàng đầu tiên / 첫 번째 행 1건 조회
    std::string SelectTop1();
}

// ══════════════════════════════════════════
// StoreInfoMapper — RecordSet → StoreInfoRecord / RecordSet → StoreInfoRecord 변환
// ══════════════════════════════════════════
namespace StoreInfoMapper {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1건 읽기
    StoreInfoRecord FromRecordset(CADORecordset& rs);
}
