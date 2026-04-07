#pragma once
/**
 * OrderSlipCrud.h — Row + Columns + Mapper + CRUD helper cho bảng OrderSlip
 * OrderSlipCrud.h — OrderSlip 테이블용 Row 구조체 + Columns 상수 + CRUD helper + Mapper
 *
 * Vai trò / 역할:
 *   Tập trung toàn bộ logic truy cập dữ liệu cho bảng OrderSlip (phiếu đặt hàng):
 *   OrderSlip(주문전표) 테이블의 데이터 접근 로직을 하나로 통합:
 *     - OrderSlipRecord: struct ánh xạ 1:1 với hàng trong DB
 *       DB 행과 1:1 매핑되는 struct
 *     - OrderSlipColumns: tên bảng + tên cột dưới dạng hằng số
 *       테이블명 + 컬럼명 상수
 *     - OrderSlipCrud: hàm tạo câu SQL (SELECT, INSERT, UPDATE)
 *       SQL 문 생성 함수 (SELECT, INSERT, UPDATE)
 *     - OrderSlipMapper: chuyển đổi ADO RecordSet -> OrderSlipRecord
 *       ADO RecordSet -> OrderSlipRecord 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ══════════════════════════════════════════════════════════════
// OrderSlipRecord — Struct ánh xạ 1 hàng bảng OrderSlip
// OrderSlipRecord — OrderSlip 테이블 1행 매핑 구조체
// ══════════════════════════════════════════════════════════════
struct OrderSlipRecord {
    int         OrderNo         = 0;    // Số phiếu đặt hàng / 주문번호
    int         CustNum         = 0;    // Số lượng khách / 고객 인원수
    int         OrderAmt        = 0;    // Tổng tiền đặt hàng / 주문금액
    int         DcAmt           = 0;    // Số tiền giảm giá / 할인금액
    int         TotalAmt        = 0;    // Tổng tiền sau giảm / 합계금액
    int         OrderType       = 0;    // Loại đặt hàng / 주문유형
    std::string OrderMsgCode1;          // Mã tin nhắn đặt hàng 1 / 주문메시지코드1
    std::string OrderMsgCode2;          // Mã tin nhắn đặt hàng 2 / 주문메시지코드2
    std::string OrderMsgCode3;          // Mã tin nhắn đặt hàng 3 / 주문메시지코드3
    int         OrderPrn        = 0;    // Số lần in phiếu / 주문출력횟수
    std::string FirstOrderDate;         // Ngày đặt hàng đầu tiên / 최초주문일시
    int         PosNo           = 0;    // Số máy POS / POS번호
    std::string OrderState;             // Trạng thái đặt hàng / 주문상태
    std::string SaleDcListCode;         // Mã danh sách giảm giá bán / 판매할인목록코드
    std::string CustCode;               // Mã khách hàng / 고객코드
    int         TableCode       = 0;    // Mã bàn / 테이블코드
    int         ReceiveAmt      = 0;    // Số tiền đã nhận / 수납금액
    std::string EmpCode;                // Mã nhân viên / 직원코드
    std::string TableEmpCode;           // Mã nhân viên phụ trách bàn / 테이블직원코드
    int         VatAmt          = 0;    // Thuế VAT / 부가세금액
    int         WorkAmt         = 0;    // Số tiền công việc / 봉사금액
    int         ServiceAmt      = 0;    // Phí dịch vụ / 서비스금액
    int         DcEventAmt      = 0;    // Số tiền giảm sự kiện / 이벤트할인금액
    int         MenuDcAmt       = 0;    // Số tiền giảm menu / 메뉴할인금액
    std::string SaleDcCode;             // Mã giảm giá bán / 판매할인코드
    int         SavePoint       = 0;    // Điểm tích lũy / 적립포인트
    std::string GroupSet;               // Nhóm đặt hàng / 그룹설정
    int         NewOrderPrn     = 0;    // Số lần in phiếu mới / 신규주문출력횟수
    std::string TableMsgCode;           // Mã tin nhắn bàn / 테이블메시지코드
    std::string TableMsg;               // Tin nhắn bàn / 테이블메시지
    int         SaleDcAmt       = 0;    // Số tiền giảm giá bán / 판매할인금액
    int         TaxFree         = 0;    // Miễn thuế / 면세금액
    int         Age             = 0;    // Nhóm tuổi / 연령대
    int         Man             = 0;    // Số nam / 남성수
    int         Woman           = 0;    // Số nữ / 여성수
    int         Etc             = 0;    // Khác / 기타인원수
    std::string paytype;                // Loại thanh toán / 결제유형
    std::string SubCol1;                // Cột phụ 1 / 보조컬럼1
    std::string SubCol2;                // Cột phụ 2 / 보조컬럼2
    std::string SubCol3;                // Cột phụ 3 / 보조컬럼3
};

// ══════════════════════════════════════════════════════════════
// OrderSlipColumns — Hằng số tên bảng và tên cột
// OrderSlipColumns — 테이블명 및 컬럼명 상수
//
// Tại sao dùng hằng số: tránh lỗi chính tả khi viết SQL thủ công
// 상수를 사용하는 이유: 수동 SQL 작성 시 오타 방지
// ══════════════════════════════════════════════════════════════
namespace OrderSlipColumns {
    constexpr const char* TABLE           = "OrderSlip";

    constexpr const char* OrderNo         = "OrderNo";
    constexpr const char* CustNum         = "CustNum";
    constexpr const char* OrderAmt        = "OrderAmt";
    constexpr const char* DcAmt           = "DcAmt";
    constexpr const char* TotalAmt        = "TotalAmt";
    constexpr const char* OrderType       = "OrderType";
    constexpr const char* OrderMsgCode1   = "OrderMsgCode1";
    constexpr const char* OrderMsgCode2   = "OrderMsgCode2";
    constexpr const char* OrderMsgCode3   = "OrderMsgCode3";
    constexpr const char* OrderPrn        = "OrderPrn";
    constexpr const char* FirstOrderDate  = "FirstOrderDate";
    constexpr const char* PosNo           = "PosNo";
    constexpr const char* OrderState      = "OrderState";
    constexpr const char* SaleDcListCode  = "SaleDcListCode";
    constexpr const char* CustCode        = "CustCode";
    constexpr const char* TableCode       = "TableCode";
    constexpr const char* ReceiveAmt      = "ReceiveAmt";
    constexpr const char* EmpCode         = "EmpCode";
    constexpr const char* TableEmpCode    = "TableEmpCode";
    constexpr const char* VatAmt          = "VatAmt";
    constexpr const char* WorkAmt         = "WorkAmt";
    constexpr const char* ServiceAmt      = "ServiceAmt";
    constexpr const char* DcEventAmt      = "DcEventAmt";
    constexpr const char* MenuDcAmt       = "MenuDcAmt";
    constexpr const char* SaleDcCode      = "SaleDcCode";
    constexpr const char* SavePoint       = "SavePoint";
    constexpr const char* GroupSet        = "GroupSet";
    constexpr const char* NewOrderPrn     = "NewOrderPrn";
    constexpr const char* TableMsgCode    = "TableMsgCode";
    constexpr const char* TableMsg        = "TableMsg";
    constexpr const char* SaleDcAmt       = "SaleDcAmt";
    constexpr const char* TaxFree         = "TaxFree";
    constexpr const char* Age             = "Age";
    constexpr const char* Man             = "Man";
    constexpr const char* Woman           = "Woman";
    constexpr const char* Etc             = "Etc";
    constexpr const char* paytype         = "paytype";
    constexpr const char* SubCol1         = "SubCol1";
    constexpr const char* SubCol2         = "SubCol2";
    constexpr const char* SubCol3         = "SubCol3";
}

// ══════════════════════════════════════════════════════════════
// OrderSlipCrud — Hàm tạo câu SQL cho bảng OrderSlip
// OrderSlipCrud — OrderSlip 테이블 SQL 문 생성 함수
//
// Tại sao tách riêng: UseCase/Manager gọi hàm → nhận chuỗi SQL
//                     không tự viết SQL inline
// 분리하는 이유: UseCase/Manager가 함수 호출 -> SQL 문자열 수신
//               인라인 SQL 직접 작성 금지
// ══════════════════════════════════════════════════════════════
namespace OrderSlipCrud {
    // Truy vấn theo số phiếu đặt hàng / 주문번호로 조회
    std::string SelectByOrderNo(int order_no);

    // Truy vấn theo mã bàn / 테이블코드로 조회
    std::string SelectByTableCode(int table_code);

    // Thêm phiếu đặt hàng mới / 주문전표 신규 삽입
    std::string Insert(const OrderSlipRecord& row);

    // Cập nhật trạng thái đặt hàng / 주문상태 갱신
    std::string UpdateState(int order_no, const std::string& state);
}

// ══════════════════════════════════════════════════════════════
// OrderSlipMapper — Chuyển đổi RecordSet sang OrderSlipRecord
// OrderSlipMapper — RecordSet에서 OrderSlipRecord로 변환
//
// Sử dụng RecordsetReader::ReadXxx để đọc theo tên cột
// RecordsetReader::ReadXxx로 컬럼명 기반 읽기
// ══════════════════════════════════════════════════════════════
namespace OrderSlipMapper {
    // Đọc 1 hàng từ RecordSet hiện tại / 현재 RecordSet에서 1행 읽기
    OrderSlipRecord FromRecordset(CADORecordset& rs);

    // Đọc tất cả hàng từ RecordSet / RecordSet에서 전체 행 읽기
    std::vector<OrderSlipRecord> ListFromRecordset(CADORecordset& rs);
}
