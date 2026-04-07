#pragma once
/**
 * SellDetailCrud.h -- Cau truc chi tiet ban hang (Row) + hang so schema + CRUD helper + Mapper
 * SellDetailCrud.h -- 판매상세 Row 구조체 + 컬럼 상수 + CRUD helper + 매퍼
 *
 * Vai tro / 역할:
 *   Bang SellDetail luu tung dong chi tiet mon trong phieu ban hang.
 *   SellDetail 테이블은 판매전표의 개별 메뉴 항목(행)을 저장한다.
 *
 *   - SellDetailRecord:      struct anh xa 1:1 voi dong trong bang / 테이블 행과 1:1 매핑 구조체
 *   - SellDetailColumns:   ten bang va ten cot / 테이블명 및 컬럼명
 *   - SellDetailCrud:      cau SQL doc du lieu / 데이터 조회 SQL문
 *   - SellDetailMapper:   chuyen doi RecordSet -> Row / RecordSet -> Row 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ======================================================================
// Row -- Cau truc anh xa bang SellDetail / SellDetail 테이블 매핑 구조체
// ======================================================================
struct SellDetailRecord {
    // -- Khoa chinh ghep / 복합 기본키 --
    std::string SellDate;           // Ngay ban / 판매일자 (YYYYMMDD)
    std::string PosNo;              // So may POS / POS 번호
    int         OrderNo    = 0;     // So thu tu dat hang / 주문 순번
    int         ReceiptNo  = 0;     // So phieu thu / 영수증 번호
    int         SerNo      = 0;     // So thu tu dong / 일련번호

    // -- Thong tin mon / 메뉴 항목 정보 --
    std::string ItemCode;           // Ma mon / 상품코드
    std::string ItemName;           // Ten mon / 상품명
    std::string MenuCode;           // Ma thuc don / 메뉴코드
    std::string MasterCode;         // Ma master / 마스터코드

    // -- Nhom mon / 메뉴 그룹 --
    std::string GrpCode;            // Ma nhom / 그룹코드
    std::string GrpName;            // Ten nhom / 그룹명

    // -- So tien va so luong / 금액 및 수량 --
    double SaleAmt     = 0.0;       // Don gia ban / 판매단가
    double Qty         = 0.0;       // So luong / 수량
    double TotalAmt    = 0.0;       // Tong tien dong / 행 합계
    double DcAmt       = 0.0;       // Giam gia / 할인금액
    double ReceiveAmt  = 0.0;       // Tien phai thu / 받을금액
    double VatAmt      = 0.0;       // Thue GTGT / 부가세
    double WorkAmt     = 0.0;       // Tien lam viec / 실수금액
    double ServiceAmt  = 0.0;       // Phi dich vu / 서비스금액

    // -- Giam gia chi tiet / 할인 상세 --
    double DcEventAmt  = 0.0;       // Giam gia su kien / 이벤트할인
    double MenuDcAmt   = 0.0;       // Giam gia thuc don / 메뉴할인
    double SaleDcAmt   = 0.0;       // Giam gia ban / 판매할인
    int    InputMenuDC = 0;         // Giam gia nhap tay / 수동메뉴할인

    // -- Phan bo thanh toan / 결제수단 배분 --
    double SDCashAmt     = 0.0;     // Phan bo tien mat / 현금 배분
    double SDCardAmt     = 0.0;     // Phan bo the / 카드 배분
    double SDPointAmt    = 0.0;     // Phan bo diem / 포인트 배분
    double SDCouponAmt   = 0.0;     // Phan bo phieu / 쿠폰 배분
    double SDTickAmt     = 0.0;     // Phan bo ve / 티켓 배분
    double SDCashbagAmt  = 0.0;     // Phan bo Cashbag / 캐시백 배분
    double SDKeepAmt     = 0.0;     // Phan bo giu / 보관금 배분
    double SDEdenredAmt  = 0.0;     // Phan bo Edenred / Edenred 배분
    double SDSelfAmt     = 0.0;     // Phan bo tu thanh toan / 자체결제 배분

    // -- Trang thai va phan loai / 상태 및 분류 --
    int    SellState   = 0;         // Trang thai ban / 판매 상태
    int    SellType    = 0;         // Loai ban / 판매 유형
    int    OrderState  = 0;         // Trang thai dat hang / 주문 상태
    int    OrderType   = 0;         // Loai dat hang / 주문 유형
    int    WorkType    = 0;         // Loai cong viec / 작업 유형

    // -- Ban va ngay dat hang / 테이블 및 주문일자 --
    std::string TableCode;          // Ma ban / 테이블코드
    std::string OrderDate;          // Ngay dat hang / 주문일자

    // -- Nhan vien / 직원 --
    std::string AmtEmpCode;         // Ma nhan vien tinh tien / 금액 처리 직원코드

    // -- Ma tin nhan / 주문메시지코드 --
    std::string OrderMsgCode;       // Ma tin nhan dat hang / 주문메시지코드

    // -- Dieu chinh va ket thuc / 조정 및 종료 --
    int         AdjustNo   = 0;     // So dieu chinh / 조정번호
    std::string EndTimeDate;        // Ngay ket thuc / 종료일자
    std::string EndTime;            // Gio ket thuc / 종료시각

    // -- Kho va don vi / 재고 및 단위 --
    std::string StockUseUnit;       // Don vi su dung kho / 재고사용단위

    // -- Cua hang / 매장 --
    int         StoreIndex = 0;     // Chi so cua hang / 매장 인덱스

    // -- Co va phu / 플래그 및 부가 --
    std::string DcEventCode;        // Ma su kien giam gia / 이벤트할인코드
    std::string ADUFlag;            // Co ADU / ADU 플래그
    std::string SubCol1;            // Cot phu 1 / 부가컬럼1
    std::string SubCol2;            // Cot phu 2 / 부가컬럼2
    std::string SubCol3;            // Cot phu 3 / 부가컬럼3
    int         DelFlag    = 0;     // Co xoa / 삭제플래그
};

// ======================================================================
// Columns -- ten bang va ten cot / 테이블명 및 컬럼명 상수
// ======================================================================
namespace SellDetailColumns {
    constexpr const char* TABLE          = "SellDetail";

    // Khoa chinh ghep / 복합 기본키
    constexpr const char* SellDate       = "SellDate";
    constexpr const char* PosNo          = "PosNo";
    constexpr const char* OrderNo        = "OrderNo";
    constexpr const char* ReceiptNo      = "ReceiptNo";
    constexpr const char* SerNo          = "SerNo";

    // Thong tin mon / 메뉴 항목 정보
    constexpr const char* ItemCode       = "ItemCode";
    constexpr const char* ItemName       = "ItemName";
    constexpr const char* MenuCode       = "MenuCode";
    constexpr const char* MasterCode     = "MasterCode";

    // Nhom mon / 메뉴 그룹
    constexpr const char* GrpCode        = "GrpCode";
    constexpr const char* GrpName        = "GrpName";

    // So tien va so luong / 금액 및 수량
    constexpr const char* SaleAmt        = "SaleAmt";
    constexpr const char* Qty            = "Qty";
    constexpr const char* TotalAmt       = "TotalAmt";
    constexpr const char* DcAmt          = "DcAmt";
    constexpr const char* ReceiveAmt     = "ReceiveAmt";
    constexpr const char* VatAmt         = "VatAmt";
    constexpr const char* WorkAmt        = "WorkAmt";
    constexpr const char* ServiceAmt     = "ServiceAmt";

    // Giam gia chi tiet / 할인 상세
    constexpr const char* DcEventAmt     = "DcEventAmt";
    constexpr const char* MenuDcAmt      = "MenuDcAmt";
    constexpr const char* SaleDcAmt      = "SaleDcAmt";
    constexpr const char* InputMenuDC    = "InputMenuDC";

    // Phan bo thanh toan / 결제수단 배분
    constexpr const char* SDCashAmt      = "SDCashAmt";
    constexpr const char* SDCardAmt      = "SDCardAmt";
    constexpr const char* SDPointAmt     = "SDPointAmt";
    constexpr const char* SDCouponAmt    = "SDCouponAmt";
    constexpr const char* SDTickAmt      = "SDTickAmt";
    constexpr const char* SDCashbagAmt   = "SDCashbagAmt";
    constexpr const char* SDKeepAmt      = "SDKeepAmt";
    constexpr const char* SDEdenredAmt   = "SDEdenredAmt";
    constexpr const char* SDSelfAmt      = "SDSelfAmt";

    // Trang thai va phan loai / 상태 및 분류
    constexpr const char* SellState      = "SellState";
    constexpr const char* SellType       = "SellType";
    constexpr const char* OrderState     = "OrderState";
    constexpr const char* OrderType      = "OrderType";
    constexpr const char* WorkType       = "WorkType";

    // Ban va ngay dat hang / 테이블 및 주문일자
    constexpr const char* TableCode      = "TableCode";
    constexpr const char* OrderDate      = "OrderDate";

    // Nhan vien / 직원
    constexpr const char* AmtEmpCode     = "AmtEmpCode";

    // Ma tin nhan / 주문메시지코드
    constexpr const char* OrderMsgCode   = "OrderMsgCode";

    // Dieu chinh va ket thuc / 조정 및 종료
    constexpr const char* AdjustNo       = "AdjustNo";
    constexpr const char* EndTimeDate    = "EndTimeDate";
    constexpr const char* EndTime        = "EndTime";

    // Kho va don vi / 재고 및 단위
    constexpr const char* StockUseUnit   = "StockUseUnit";

    // Cua hang / 매장
    constexpr const char* StoreIndex     = "StoreIndex";

    // Co va phu / 플래그 및 부가
    constexpr const char* DcEventCode    = "DcEventCode";
    constexpr const char* ADUFlag        = "ADUFlag";
    constexpr const char* SubCol1        = "SubCol1";
    constexpr const char* SubCol2        = "SubCol2";
    constexpr const char* SubCol3        = "SubCol3";
    constexpr const char* DelFlag        = "DelFlag";
}

// ======================================================================
// Sql -- Cau truy van SQL / SQL 질의문
// ======================================================================
namespace SellDetailCrud {
    /**
     * Truy van theo ngay ban va so phieu thu / 판매일자 + 영수증번호 기준 조회
     * @param sell_date Ngay ban (YYYYMMDD) / 판매일자
     * @param receipt_no So phieu thu / 영수증번호
     * @return Cau SQL SELECT / SELECT SQL문
     */
    std::string SelectByReceipt(const std::string& sell_date, int receipt_no);

    /**
     * Truy van theo ngay ban / 판매일자 기준 전체 조회
     * @param sell_date Ngay ban (YYYYMMDD) / 판매일자
     * @return Cau SQL SELECT / SELECT SQL문
     */
    std::string SelectByDate(const std::string& sell_date);
}

// ======================================================================
// Mapper -- Chuyen doi RecordSet -> Row / RecordSet -> Row 변환
// ======================================================================
namespace SellDetailMapper {
    /**
     * Doc mot dong tu RecordSet / RecordSet에서 한 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return SellDetailRecord da dien du lieu / 데이터가 채워진 SellDetailRecord
     */
    SellDetailRecord FromRecordset(CADORecordset& rs);

    /**
     * Doc tat ca cac dong tu RecordSet / RecordSet에서 전체 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return Danh sach SellDetailRecord / SellDetailRecord 목록
     */
    std::vector<SellDetailRecord> ListFromRecordset(CADORecordset& rs);
}
