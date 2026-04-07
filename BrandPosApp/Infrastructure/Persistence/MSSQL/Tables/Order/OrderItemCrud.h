#pragma once
/**
 * OrderItemCrud.h — Row + Columns + Mapper + CRUD helper cho bảng OrderDetail
 * OrderItemCrud.h — OrderDetail 테이블용 Row 구조체 + Columns 상수 + CRUD helper + Mapper
 *
 * Vai trò / 역할:
 *   Tập trung toàn bộ logic truy cập dữ liệu cho bảng OrderDetail (chi tiết đặt hàng):
 *   OrderDetail(주문상세) 테이블의 데이터 접근 로직을 하나로 통합:
 *     - OrderItemRecord: struct ánh xạ 1:1 với hàng trong DB
 *       DB 행과 1:1 매핑되는 struct
 *     - OrderItemColumns: tên bảng + tên cột dưới dạng hằng số
 *       테이블명 + 컬럼명 상수
 *     - OrderItemCrud: hàm tạo câu SQL (SELECT, INSERT)
 *       SQL 문 생성 함수 (SELECT, INSERT)
 *     - OrderItemMapper: chuyển đổi ADO RecordSet -> OrderItemRecord
 *       ADO RecordSet -> OrderItemRecord 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ══════════════════════════════════════════════════════════════
// OrderItemRecord — Struct ánh xạ 1 hàng bảng OrderDetail
// OrderItemRecord — OrderDetail 테이블 1행 매핑 구조체
// ══════════════════════════════════════════════════════════════
struct OrderItemRecord {
    int         SerNo           = 0;    // Số thứ tự / 일련번호
    std::string ItemName;               // Tên món / 상품명
    int         OrderAmt        = 0;    // Số tiền đặt hàng / 주문금액
    int         DcAmt           = 0;    // Số tiền giảm giá / 할인금액
    int         Qty             = 0;    // Số lượng / 수량
    int         TotalAmt        = 0;    // Tổng tiền / 합계금액
    std::string GrpCode;                // Mã nhóm / 그룹코드
    std::string GrpName;                // Tên nhóm / 그룹명
    std::string MenuCode;               // Mã menu / 메뉴코드
    std::string OrderState;             // Trạng thái đặt hàng / 주문상태
    std::string ItemCode;               // Mã sản phẩm / 상품코드
    std::string OrderDate;              // Ngày đặt hàng / 주문일시
    int         OrderNo         = 0;    // Số phiếu đặt hàng / 주문번호
    int         PosNo           = 0;    // Số máy POS / POS번호
    std::string FirstOrderDate;         // Ngày đặt hàng đầu tiên / 최초주문일시
    int         OrderType       = 0;    // Loại đặt hàng / 주문유형
    int         ReceiveAmt      = 0;    // Số tiền đã nhận / 수납금액
    int         VatAmt          = 0;    // Thuế VAT / 부가세금액
    int         WorkAmt         = 0;    // Số tiền công việc / 봉사금액
    int         TableCode       = 0;    // Mã bàn / 테이블코드
    std::string AmtEmpCode;             // Mã nhân viên tính tiền / 금액직원코드
    std::string WorkType;               // Loại công việc / 작업유형
    int         ServiceAmt      = 0;    // Phí dịch vụ / 서비스금액
    int         DcEventAmt      = 0;    // Số tiền giảm sự kiện / 이벤트할인금액
    int         MenuDcAmt       = 0;    // Số tiền giảm menu / 메뉴할인금액
    int         DcTaxAmt        = 0;    // Số tiền thuế giảm giá / 할인세금액
    std::string OrderMsgCode;           // Mã tin nhắn đặt hàng / 주문메시지코드
    int         OrderPrn        = 0;    // Số lần in phiếu / 주문출력횟수
    std::string OrderPrnState;          // Trạng thái in phiếu / 주문출력상태
    int         OldQty          = 0;    // Số lượng cũ / 이전수량
    std::string InputMenuDC;            // Giảm giá menu nhập / 입력메뉴할인
    std::string DelFlag;                // Cờ xóa / 삭제플래그
    std::string SubCol2;                // Cột phụ 2 / 보조컬럼2
    std::string SubCol3;                // Cột phụ 3 / 보조컬럼3
    std::string ADUFlag;                // Cờ ADU (Add/Delete/Update) / ADU플래그
};

// ══════════════════════════════════════════════════════════════
// OrderItemColumns — Hằng số tên bảng và tên cột
// OrderItemColumns — 테이블명 및 컬럼명 상수
//
// Lưu ý: tên bảng thực tế là "OrderDetail" trong MSSQL
// 참고: MSSQL 실제 테이블명은 "OrderDetail"
// ══════════════════════════════════════════════════════════════
namespace OrderItemColumns {
    constexpr const char* TABLE           = "OrderDetail";

    constexpr const char* SerNo           = "SerNo";
    constexpr const char* ItemName        = "ItemName";
    constexpr const char* OrderAmt        = "OrderAmt";
    constexpr const char* DcAmt           = "DcAmt";
    constexpr const char* Qty             = "Qty";
    constexpr const char* TotalAmt        = "TotalAmt";
    constexpr const char* GrpCode         = "GrpCode";
    constexpr const char* GrpName         = "GrpName";
    constexpr const char* MenuCode        = "MenuCode";
    constexpr const char* OrderState      = "OrderState";
    constexpr const char* ItemCode        = "ItemCode";
    constexpr const char* OrderDate       = "OrderDate";
    constexpr const char* OrderNo         = "OrderNo";
    constexpr const char* PosNo           = "PosNo";
    constexpr const char* FirstOrderDate  = "FirstOrderDate";
    constexpr const char* OrderType       = "OrderType";
    constexpr const char* ReceiveAmt      = "ReceiveAmt";
    constexpr const char* VatAmt          = "VatAmt";
    constexpr const char* WorkAmt         = "WorkAmt";
    constexpr const char* TableCode       = "TableCode";
    constexpr const char* AmtEmpCode      = "AmtEmpCode";
    constexpr const char* WorkType        = "WorkType";
    constexpr const char* ServiceAmt      = "ServiceAmt";
    constexpr const char* DcEventAmt      = "DcEventAmt";
    constexpr const char* MenuDcAmt       = "MenuDcAmt";
    constexpr const char* DcTaxAmt        = "DcTaxAmt";
    constexpr const char* OrderMsgCode    = "OrderMsgCode";
    constexpr const char* OrderPrn        = "OrderPrn";
    constexpr const char* OrderPrnState   = "OrderPrnState";
    constexpr const char* OldQty          = "OldQty";
    constexpr const char* InputMenuDC     = "InputMenuDC";
    constexpr const char* DelFlag         = "DelFlag";
    constexpr const char* SubCol2         = "SubCol2";
    constexpr const char* SubCol3         = "SubCol3";
    constexpr const char* ADUFlag         = "ADUFlag";
}

// ══════════════════════════════════════════════════════════════
// OrderItemCrud — Hàm tạo câu SQL cho bảng OrderDetail
// OrderItemCrud — OrderDetail 테이블 SQL 문 생성 함수
//
// Tại sao tách riêng: UseCase/Manager gọi hàm → nhận chuỗi SQL
//                     không tự viết SQL inline
// 분리하는 이유: UseCase/Manager가 함수 호출 -> SQL 문자열 수신
//               인라인 SQL 직접 작성 금지
// ══════════════════════════════════════════════════════════════
namespace OrderItemCrud {
    // Truy vấn chi tiết theo số phiếu đặt hàng / 주문번호로 주문상세 조회
    std::string SelectByOrderNo(int order_no);

    // Thêm chi tiết đặt hàng mới / 주문상세 항목 신규 삽입
    std::string Insert(const OrderItemRecord& row);
}

// ══════════════════════════════════════════════════════════════
// OrderItemMapper — Chuyển đổi RecordSet sang OrderItemRecord
// OrderItemMapper — RecordSet에서 OrderItemRecord로 변환
//
// Sử dụng RecordsetReader::ReadXxx để đọc theo tên cột
// RecordsetReader::ReadXxx로 컬럼명 기반 읽기
// ══════════════════════════════════════════════════════════════
namespace OrderItemMapper {
    // Đọc 1 hàng từ RecordSet hiện tại / 현재 RecordSet에서 1행 읽기
    OrderItemRecord FromRecordset(CADORecordset& rs);

    // Đọc tất cả hàng từ RecordSet / RecordSet에서 전체 행 읽기
    std::vector<OrderItemRecord> ListFromRecordset(CADORecordset& rs);
}
