#pragma once
/**
 * SellSlipCrud.h -- Cau truc hang ban (Row) + hang so schema + CRUD helper + Mapper
 * SellSlipCrud.h -- 판매전표 Row 구조체 + 컬럼 상수 + CRUD helper + 매퍼
 *
 * Vai tro / 역할:
 *   Bang SellSlip luu thong tin tong hop cua mot phieu thanh toan (receipt).
 *   SellSlip 테이블은 하나의 영수증(receipt)에 대한 집계 정보를 저장한다.
 *
 *   - SellSlipRecord:      struct anh xa 1:1 voi dong trong bang / 테이블 행과 1:1 매핑 구조체
 *   - SellSlipColumns:   ten bang va ten cot / 테이블명 및 컬럼명
 *   - SellSlipCrud:      cau SQL doc du lieu / 데이터 조회 SQL문
 *   - SellSlipMapper:   chuyen doi RecordSet -> Row / RecordSet -> Row 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ======================================================================
// Row -- Cau truc anh xa bang SellSlip / SellSlip 테이블 매핑 구조체
// ======================================================================
struct SellSlipRecord {
    // -- Khoa chinh ghep / 복합 기본키 --
    std::string SellDate;           // Ngay ban / 판매일자 (YYYYMMDD)
    int         OrderNo    = 0;     // So thu tu dat hang / 주문 순번
    int         ReceiptNo  = 0;     // So phieu thu / 영수증 번호

    // -- Thong tin nhan vien va khach hang / 직원 및 고객 정보 --
    std::string EmpCode;            // Ma nhan vien thu ngan / 계산 직원코드
    int         CustNum    = 0;     // So luong khach / 고객 수
    std::string CustCode;           // Ma khach hang / 고객코드
    std::string OrderEmpCode;       // Ma nhan vien dat hang / 주문 직원코드
    std::string TableEmpCode;       // Ma nhan vien ban / 테이블 담당 직원코드

    // -- So tien tong hop / 집계 금액 --
    double OrderAmt    = 0.0;       // Tong tien dat hang / 주문 금액
    double DcAmt       = 0.0;       // Tong giam gia / 할인 금액
    double WorkAmt     = 0.0;       // Tien lam viec (thuc thu) / 실수 금액
    double ReceiveAmt  = 0.0;       // Tien phai thu / 받을 금액
    double ReceivedAmt = 0.0;       // Tien da thu / 받은 금액
    double ChangeAmt   = 0.0;       // Tien thua / 거스름돈
    double TotalAmt    = 0.0;       // Tong cong / 총액

    // -- Chi tiet phuong thuc thanh toan / 결제수단별 금액 --
    double CashAmt     = 0.0;       // Tien mat / 현금
    double CardAmt     = 0.0;       // The / 카드
    double PointAmt    = 0.0;       // Diem / 포인트
    double CouponAmt   = 0.0;       // Phieu giam gia / 쿠폰
    double EtcAmt      = 0.0;       // Khac / 기타
    double TickAmt     = 0.0;       // Ve / 티켓
    double CashbagAmt  = 0.0;       // Cashbag
    double KeepAmt     = 0.0;       // Tien giu / 보관금
    double EdenredAmt  = 0.0;       // Edenred
    double SelfAmt     = 0.0;       // Tu thanh toan / 자체결제

    // -- Thue va tip / 세금 및 팁 --
    double VatAmt      = 0.0;       // Thue GTGT / 부가세
    double TipAmt      = 0.0;       // Tien tip / 팁
    double ServiceAmt  = 0.0;       // Phi dich vu / 서비스금액
    double TaxFree     = 0.0;       // Mien thue / 면세

    // -- Giam gia chi tiet / 할인 상세 --
    double DcEventAmt  = 0.0;       // Giam gia su kien / 이벤트 할인
    double MenuDcAmt   = 0.0;       // Giam gia mon an / 메뉴 할인
    double SaleDcAmt   = 0.0;       // Giam gia ban / 판매 할인

    // -- Phan loai / 분류 --
    int    OrderType   = 0;         // Loai dat hang / 주문 유형
    int    SellType    = 0;         // Loai ban / 판매 유형

    // -- Vi tri va thiet bi / 위치 및 장비 --
    std::string PosNo;              // So may POS / POS 번호
    std::string TableCode;          // Ma ban / 테이블코드
    std::string OrderPosNo;         // POS noi dat hang / 주문 POS 번호

    // -- Ma giam gia / 할인코드 --
    std::string SaleDCListCode;     // Ma danh sach giam gia / 할인목록코드
    std::string SaleDcCode;         // Ma giam gia ban / 판매할인코드

    // -- Diem thuong / 적립포인트 --
    double SavePoint   = 0.0;       // Diem tich luy / 적립포인트

    // -- Dieu chinh / 조정 --
    int    AdjustNo    = 0;         // So dieu chinh / 조정번호

    // -- Bien nhan tien mat / 현금영수증 --
    std::string BCashReceipt;       // Bien nhan tien mat / 현금영수증

    // -- Nhom / 그룹 --
    std::string GroupSet;           // Nhom cai dat / 그룹설정

    // -- Thoi gian ket thuc / 종료시간 --
    std::string EndTimeDate;        // Ngay ket thuc / 종료일자
    std::string EndTime;            // Gio ket thuc / 종료시각

    // -- Thong tin dat hang goc / 최초 주문 정보 --
    std::string FirstOrderDate;     // Ngay dat hang dau tien / 최초주문일자

    // -- Tien nhan bo sung / 추가 수금액 --
    double FReceivedAmt1 = 0.0;     // So tien nhan bo sung 1 / 추가수금액1
    double FReceivedAmt2 = 0.0;     // So tien nhan bo sung 2 / 추가수금액2
    double FReceivedAmt3 = 0.0;     // So tien nhan bo sung 3 / 추가수금액3
    int    ReceivedCount = 0;       // So lan nhan / 수금횟수

    // -- Thong tin khach hang / 고객 정보 --
    int    Age         = 0;         // Tuoi / 연령
    int    Man         = 0;         // Nam / 남성
    int    Woman       = 0;         // Nu / 여성

    // -- Ma tin nhan dat hang / 주문메시지코드 --
    std::string OrderMsgCode1;      // Ma tin nhan 1 / 주문메시지1
    std::string OrderMsgCode2;      // Ma tin nhan 2 / 주문메시지2
    std::string OrderMsgCode3;      // Ma tin nhan 3 / 주문메시지3

    // -- Mang di / 포장주문 --
    std::string TakeOrderNo;        // So dat hang mang di / 포장주문번호

    // -- Co va phu / 플래그 및 부가 --
    std::string AduFlag_CpQty;      // Co ADU + so luong coupon / ADU플래그_쿠폰수량
    std::string SubCol1;            // Cot phu 1 / 부가컬럼1
    std::string SubCol2;            // Cot phu 2 / 부가컬럼2
    std::string SubCol3;            // Cot phu 3 / 부가컬럼3
    int         StoreIndex = 0;     // Chi so cua hang / 매장 인덱스
    int         DelFlag    = 0;     // Co xoa / 삭제플래그
};

// ======================================================================
// Columns -- ten bang va ten cot / 테이블명 및 컬럼명 상수
// ======================================================================
namespace SellSlipColumns {
    constexpr const char* TABLE          = "SellSlip";

    // Khoa chinh ghep / 복합 기본키
    constexpr const char* SellDate       = "SellDate";
    constexpr const char* OrderNo        = "OrderNo";
    constexpr const char* ReceiptNo      = "ReceiptNo";

    // Nhan vien va khach hang / 직원 및 고객
    constexpr const char* EmpCode        = "EmpCode";
    constexpr const char* CustNum        = "CustNum";
    constexpr const char* CustCode       = "CustCode";
    constexpr const char* OrderEmpCode   = "OrderEmpCode";
    constexpr const char* TableEmpCode   = "TableEmpCode";

    // So tien tong hop / 집계 금액
    constexpr const char* OrderAmt       = "OrderAmt";
    constexpr const char* DcAmt          = "DcAmt";
    constexpr const char* WorkAmt        = "WorkAmt";
    constexpr const char* ReceiveAmt     = "ReceiveAmt";
    constexpr const char* ReceivedAmt    = "ReceivedAmt";
    constexpr const char* ChangeAmt      = "ChangeAmt";
    constexpr const char* TotalAmt       = "TotalAmt";

    // Chi tiet phuong thuc thanh toan / 결제수단별 금액
    constexpr const char* CashAmt        = "CashAmt";
    constexpr const char* CardAmt        = "CardAmt";
    constexpr const char* PointAmt       = "PointAmt";
    constexpr const char* CouponAmt      = "CouponAmt";
    constexpr const char* EtcAmt         = "EtcAmt";
    constexpr const char* TickAmt        = "TickAmt";
    constexpr const char* CashbagAmt     = "CashbagAmt";
    constexpr const char* KeepAmt        = "KeepAmt";
    constexpr const char* EdenredAmt     = "EdenredAmt";
    constexpr const char* SelfAmt        = "SelfAmt";

    // Thue va tip / 세금 및 팁
    constexpr const char* VatAmt         = "VatAmt";
    constexpr const char* TipAmt         = "TipAmt";
    constexpr const char* ServiceAmt     = "ServiceAmt";
    constexpr const char* TaxFree        = "TaxFree";

    // Giam gia chi tiet / 할인 상세
    constexpr const char* DcEventAmt     = "DcEventAmt";
    constexpr const char* MenuDcAmt      = "MenuDcAmt";
    constexpr const char* SaleDcAmt      = "SaleDcAmt";

    // Phan loai / 분류
    constexpr const char* OrderType      = "OrderType";
    constexpr const char* SellType       = "SellType";

    // Vi tri va thiet bi / 위치 및 장비
    constexpr const char* PosNo          = "PosNo";
    constexpr const char* TableCode      = "TableCode";
    constexpr const char* OrderPosNo     = "OrderPosNo";

    // Ma giam gia / 할인코드
    constexpr const char* SaleDCListCode = "SaleDCListCode";
    constexpr const char* SaleDcCode     = "SaleDcCode";

    // Diem thuong / 적립포인트
    constexpr const char* SavePoint      = "SavePoint";

    // Dieu chinh / 조정
    constexpr const char* AdjustNo       = "AdjustNo";

    // Bien nhan tien mat / 현금영수증
    constexpr const char* BCashReceipt   = "BCashReceipt";

    // Nhom / 그룹
    constexpr const char* GroupSet       = "GroupSet";

    // Thoi gian ket thuc / 종료시간
    constexpr const char* EndTimeDate    = "EndTimeDate";
    constexpr const char* EndTime        = "EndTime";

    // Thong tin dat hang goc / 최초 주문 정보
    constexpr const char* FirstOrderDate = "FirstOrderDate";

    // Tien nhan bo sung / 추가 수금액
    constexpr const char* FReceivedAmt1  = "FReceivedAmt1";
    constexpr const char* FReceivedAmt2  = "FReceivedAmt2";
    constexpr const char* FReceivedAmt3  = "FReceivedAmt3";
    constexpr const char* ReceivedCount  = "ReceivedCount";

    // Thong tin khach hang / 고객 정보
    constexpr const char* Age            = "Age";
    constexpr const char* Man            = "Man";
    constexpr const char* Woman          = "Woman";

    // Ma tin nhan / 주문메시지코드
    constexpr const char* OrderMsgCode1  = "OrderMsgCode1";
    constexpr const char* OrderMsgCode2  = "OrderMsgCode2";
    constexpr const char* OrderMsgCode3  = "OrderMsgCode3";

    // Mang di / 포장주문
    constexpr const char* TakeOrderNo    = "TakeOrderNo";

    // Co va phu / 플래그 및 부가
    constexpr const char* AduFlag_CpQty  = "AduFlag_CpQty";
    constexpr const char* SubCol1        = "SubCol1";
    constexpr const char* SubCol2        = "SubCol2";
    constexpr const char* SubCol3        = "SubCol3";
    constexpr const char* StoreIndex     = "StoreIndex";
    constexpr const char* DelFlag        = "DelFlag";
}

// ======================================================================
// Sql -- Cau truy van SQL / SQL 질의문
// ======================================================================
namespace SellSlipCrud {
    /**
     * Truy van theo ngay ban / 판매일자 기준 조회
     * @param sell_date Ngay ban (YYYYMMDD) / 판매일자
     * @return Cau SQL SELECT / SELECT SQL문
     */
    std::string SelectByDate(const std::string& sell_date);

    /**
     * Truy van theo so phieu thu / 영수증번호 기준 조회
     * @param receipt_no So phieu thu / 영수증번호
     * @return Cau SQL SELECT / SELECT SQL문
     */
    std::string SelectByReceiptNo(int receipt_no);
}

// ======================================================================
// Mapper -- Chuyen doi RecordSet -> Row / RecordSet -> Row 변환
// ======================================================================
namespace SellSlipMapper {
    /**
     * Doc mot dong tu RecordSet / RecordSet에서 한 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return SellSlipRecord da dien du lieu / 데이터가 채워진 SellSlipRecord
     */
    SellSlipRecord FromRecordset(CADORecordset& rs);

    /**
     * Doc tat ca cac dong tu RecordSet / RecordSet에서 전체 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return Danh sach SellSlipRecord / SellSlipRecord 목록
     */
    std::vector<SellSlipRecord> ListFromRecordset(CADORecordset& rs);
}
