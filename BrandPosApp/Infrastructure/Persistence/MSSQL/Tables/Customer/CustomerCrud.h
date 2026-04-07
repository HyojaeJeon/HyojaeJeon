#pragma once
/**
 * CustomerCrud.h — Row + Columns + Mapper + CRUD helper cho bảng Customer
 * CustomerCrud.h — Customer 테이블용 Row + Columns + Mapper + CRUD helper
 *
 * Vai trò / 역할:
 *   Quản lý thông tin hội viên (khách hàng).
 *   회원(고객) 정보를 관리한다.
 *     - CustomerRecord: cấu trúc dữ liệu hàng / 행 데이터 구조체
 *     - CustomerColumns: tên bảng + hằng số cột / 테이블명 + 컬럼 상수
 *     - CustomerCrud: CRUD helper / CRUD helper
 *     - CustomerMapper: chuyển đổi RecordSet → Row / RecordSet → Row 변환
 */

#include <string>
#include <cstdint>

class CADORecordset;

// ══════════════════════════════════════════
// CustomerRecord — Cấu trúc hàng hội viên / 회원 행 구조체
// ══════════════════════════════════════════
struct CustomerRecord {
    std::string CustCode;       // Mã hội viên / 회원 코드
    std::string CustName;       // Tên hội viên / 회원명
    std::string Phone;          // Số điện thoại cố định / 유선 전화번호
    std::string HandPhone;      // Số điện thoại di động / 휴대폰 번호
    std::string Addr;           // Địa chỉ / 주소
    std::string Birth;          // Ngày sinh / 생년월일
    int64_t     TotalPoint{};   // Tổng điểm tích lũy / 총 적립 포인트
    int64_t     UsedPoint{};    // Điểm đã dùng / 사용 포인트
    int64_t     RemainPoint{};  // Điểm còn lại / 잔여 포인트
    int         VisitCnt{};     // Số lần ghé thăm / 방문 횟수
    std::string Email;          // Email / 이메일
    std::string BirthType;      // Loại ngày sinh (dương/âm) / 생일 유형(양/음력)
    std::string CustType;       // Loại hội viên / 회원 유형
    std::string InDate;         // Ngày đăng ký / 가입일
    std::string BEMail;         // Đồng ý nhận email (Y/N) / 이메일 수신 동의
    std::string BSms;           // Đồng ý nhận SMS (Y/N) / SMS 수신 동의
    std::string LastVisitDate;  // Ngày ghé thăm gần nhất / 최근 방문일
    int64_t     TotalTickAmt{}; // Tổng tiền phiếu giảm giá / 총 상품권 금액
    int64_t     RemainTickAmt{};// Tiền phiếu còn lại / 잔여 상품권 금액
    int64_t     RecvTickAmt{};  // Tiền phiếu đã nhận / 수령 상품권 금액
    int64_t     SaleAmt{};      // Tổng tiền mua / 총 매출 금액
    std::string SaveStoreName;  // Tên cửa hàng đăng ký / 등록 매장명
    std::string Jumin;          // Số CMND/CCCD / 주민등록번호
    std::string Sex;            // Giới tính / 성별
    std::string EmpCode;        // Mã nhân viên phụ trách / 담당 직원 코드
    std::string OutDate;        // Ngày rời/thôi hội viên / 탈퇴일
    std::string CardNo;         // Số thẻ hội viên / 회원 카드번호
    std::string MemberType;     // Phân loại thành viên / 멤버 분류
    std::string Memo;           // Ghi chú / 메모
    std::string DelFlag;        // Cờ xóa / 삭제 플래그
    int64_t     RemainKeepAmt{};// Tiền giữ còn lại / 잔여 보관 금액
    std::string SubCol1;        // Cột phụ 1 / 보조 컬럼 1
    int         StampCnt{};     // Số tem tích lũy / 스탬프 횟수
};

// ══════════════════════════════════════════
// CustomerColumns — Hằng số tên bảng + cột / 테이블명 + 컬럼 상수
// ══════════════════════════════════════════
namespace CustomerColumns {
    constexpr const char* TABLE         = "Customer";

    constexpr const char* CustCode      = "CustCode";
    constexpr const char* CustName      = "CustName";
    constexpr const char* Phone         = "Phone";
    constexpr const char* HandPhone     = "HandPhone";
    constexpr const char* Addr          = "Addr";
    constexpr const char* Birth         = "Birth";
    constexpr const char* TotalPoint    = "TotalPoint";
    constexpr const char* UsedPoint     = "UsedPoint";
    constexpr const char* RemainPoint   = "RemainPoint";
    constexpr const char* VisitCnt      = "VisitCnt";
    constexpr const char* Email         = "Email";
    constexpr const char* BirthType     = "BirthType";
    constexpr const char* CustType      = "CustType";
    constexpr const char* InDate        = "InDate";
    constexpr const char* BEMail        = "BEMail";
    constexpr const char* BSms          = "BSms";
    constexpr const char* LastVisitDate = "LastVisitDate";
    constexpr const char* TotalTickAmt  = "TotalTickAmt";
    constexpr const char* RemainTickAmt = "RemainTickAmt";
    constexpr const char* RecvTickAmt   = "RecvTickAmt";
    constexpr const char* SaleAmt       = "SaleAmt";
    constexpr const char* SaveStoreName = "SaveStoreName";
    constexpr const char* Jumin         = "Jumin";
    constexpr const char* Sex           = "Sex";
    constexpr const char* EmpCode       = "EmpCode";
    constexpr const char* OutDate       = "OutDate";
    constexpr const char* CardNo        = "CardNo";
    constexpr const char* MemberType    = "MemberType";
    constexpr const char* Memo          = "Memo";
    constexpr const char* DelFlag       = "DelFlag";
    constexpr const char* RemainKeepAmt = "RemainKeepAmt";
    constexpr const char* SubCol1       = "SubCol1";
    constexpr const char* StampCnt      = "StampCnt";
}

// ══════════════════════════════════════════
// CustomerCrud — CRUD helper / CRUD 헬퍼
//
// Quy ước / 규칙:
//   Mỗi hàm trả về chuỗi SQL thuần túy.
//   각 함수는 순수 SQL 문자열을 반환한다.
//   Không thực thi DB — chỉ sinh SQL.
//   DB 실행 없음 — SQL 생성만 담당.
// ══════════════════════════════════════════
namespace CustomerCrud {
    // Tìm hội viên theo số điện thoại / 전화번호로 회원 조회
    std::string SelectByPhone(const std::string& phone);
    // Tìm hội viên theo mã / 코드로 회원 조회
    std::string SelectByCode(const std::string& cust_code);
}

// ══════════════════════════════════════════
// CustomerMapper — RecordSet → CustomerRecord / RecordSet → CustomerRecord 변환
// ══════════════════════════════════════════
namespace CustomerMapper {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1건 읽기
    CustomerRecord FromRecordset(CADORecordset& rs);
}
