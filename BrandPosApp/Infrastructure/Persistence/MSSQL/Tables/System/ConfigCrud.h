#pragma once
/**
 * ConfigCrud.h — Row + Columns + Mapper + CRUD helper cho bảng Config
 * ConfigCrud.h — Config 테이블용 Row + Columns + Mapper + CRUD helper
 *
 * Vai trò / 역할:
 *   Cấu hình vận hành POS (máy in, hiển thị, chế độ đặt hàng...).
 *   POS 운영 설정 (프린터, 디스플레이, 주문 모드...).
 *     - ConfigRecord: cấu trúc dữ liệu hàng / 행 데이터 구조체
 *     - ConfigColumns: tên bảng + hằng số cột / 테이블명 + 컬럼 상수
 *     - ConfigCrud: CRUD helper / CRUD helper
 *     - ConfigMapper: chuyển đổi RecordSet → Row / RecordSet → Row 변환
 */

#include <string>

class CADORecordset;

// ══════════════════════════════════════════
// ConfigRecord — Cấu trúc hàng cấu hình vận hành / 운영 설정 행 구조체
// ══════════════════════════════════════════
struct ConfigRecord {
    std::string PosNo;          // Số POS / POS 번호
    std::string PosName;        // Tên POS / POS 이름
    std::string CalcPrn;        // Máy in hóa đơn / 계산서 프린터
    std::string KicPrnType;     // Loại máy in nhà bếp / 주방 프린터 유형
    std::string KicPrn;         // Máy in nhà bếp / 주방 프린터
    std::string PrnName;        // Tên máy in / 프린터 이름
    std::string Display;        // Hiển thị (bảng điện tử) / 디스플레이(전광판)
    std::string DisplayName;    // Tên hiển thị / 디스플레이 이름
    int         MsgTime{};      // Thời gian thông báo (giây) / 메시지 시간(초)
    std::string TableTouch;     // Chế độ chạm bàn / 테이블 터치 모드
    int64_t     CutAmt{};       // Đơn vị làm tròn / 절사 금액 단위
    std::string OrderState;     // Trạng thái đặt hàng / 주문 상태 모드
    std::string UseInternet;    // Dùng internet (Y/N) / 인터넷 사용 여부
    std::string CalcPrnName;    // Tên máy in hóa đơn / 계산서 프린터 이름
    std::string UseImgBtn;      // Dùng nút hình ảnh (Y/N) / 이미지 버튼 사용 여부
    std::string CustInfo;       // Hiển thị info khách (Y/N) / 고객 정보 표시 여부
    int         AddOrderQty{};  // Số lượng đặt thêm mặc định / 추가 주문 기본 수량
    int64_t     ExcludeKeepAmt{};// Tiền giữ không tính / 보관금 제외 금액
};

// ══════════════════════════════════════════
// ConfigColumns — Hằng số tên bảng + cột / 테이블명 + 컬럼 상수
// ══════════════════════════════════════════
namespace ConfigColumns {
    constexpr const char* TABLE          = "Config";

    constexpr const char* PosNo          = "PosNo";
    constexpr const char* PosName        = "PosName";
    constexpr const char* CalcPrn        = "CalcPrn";
    constexpr const char* KicPrnType     = "KicPrnType";
    constexpr const char* KicPrn         = "KicPrn";
    constexpr const char* PrnName        = "PrnName";
    constexpr const char* Display        = "Display";
    constexpr const char* DisplayName    = "DisplayName";
    constexpr const char* MsgTime        = "MsgTime";
    constexpr const char* TableTouch     = "TableTouch";
    constexpr const char* CutAmt         = "CutAmt";
    constexpr const char* OrderState     = "OrderState";
    constexpr const char* UseInternet    = "UseInternet";
    constexpr const char* CalcPrnName    = "CalcPrnName";
    constexpr const char* UseImgBtn      = "UseImgBtn";
    constexpr const char* CustInfo       = "CustInfo";
    constexpr const char* AddOrderQty    = "AddOrderQty";
    constexpr const char* ExcludeKeepAmt = "ExcludeKeepAmt";
}

// ══════════════════════════════════════════
// ConfigCrud — CRUD helper / CRUD 헬퍼
//
// Quy ước / 규칙:
//   Mỗi hàm trả về chuỗi SQL thuần túy.
//   각 함수는 순수 SQL 문자열을 반환한다.
//   Không thực thi DB — chỉ sinh SQL.
//   DB 실행 없음 — SQL 생성만 담당.
// ══════════════════════════════════════════
namespace ConfigCrud {
    // Tìm cấu hình theo số POS / POS 번호로 설정 조회
    std::string SelectByPosNo(const std::string& pos_no);
    // Lấy 1 hàng đầu tiên / 첫 번째 행 1건 조회
    std::string SelectTop1();
}

// ══════════════════════════════════════════
// ConfigMapper — RecordSet → ConfigRecord / RecordSet → ConfigRecord 변환
// ══════════════════════════════════════════
namespace ConfigMapper {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1건 읽기
    ConfigRecord FromRecordset(CADORecordset& rs);
}
