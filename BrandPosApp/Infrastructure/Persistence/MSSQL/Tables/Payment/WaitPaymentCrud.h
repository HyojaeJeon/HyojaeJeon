#pragma once
/**
 * WaitPaymentCrud.h -- Payment row + column constants + mapper + CRUD helper
 * WaitPaymentCrud.h -- 대기결제 Row 구조체 + 컬럼 상수 + CRUD helper + 매퍼
 *
 * Vai tro / 역할:
 *   Bang WAIT_PAYMENT luu thong tin giao dich thanh toan dang cho xu ly
 *   (vi du: QR, chuyen khoan, e-collection).
 *   WAIT_PAYMENT 테이블은 처리 대기 중인 결제 거래 정보
 *   (예: QR, 계좌이체, e-collection)를 저장한다.
 *
 *   - WaitPaymentRecord:      struct anh xa 1:1 voi dong trong bang / 테이블 행과 1:1 매핑 구조체
 *   - WaitPaymentColumns:   ten bang va ten cot (UPPER_CASE) / 테이블명 및 컬럼명 (UPPER_CASE)
 *   - WaitPaymentCrud:      cau SQL chen va cap nhat / INSERT 및 UPDATE SQL문
 *   - WaitPaymentMapper:   chuyen doi RecordSet -> Row / RecordSet -> Row 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ======================================================================
// Row -- Cau truc anh xa bang WAIT_PAYMENT / WAIT_PAYMENT 테이블 매핑 구조체
// ======================================================================
struct WaitPaymentRecord {
    // -- Dinh danh giao dich / 거래 식별자 --
    std::string TransactionUuid;        // UUID giao dich chinh / 주 거래 UUID
    std::string AddlTransactionUuid;    // UUID giao dich bo sung / 부가 거래 UUID

    // -- Thong tin hoa don / 청구서 정보 --
    std::string BillNo;                 // So hoa don / 청구서 번호
    int         BillSeq     = 0;        // Thu tu hoa don / 청구서 순번
    double      DepositAmt  = 0.0;      // So tien dat coc / 입금액

    // -- Thong tin tai khoan / 계좌 정보 --
    std::string MotherAccntNo;          // So tai khoan me / 모계좌번호
    std::string MotherAccntOwner;       // Chu tai khoan me / 모계좌 소유자

    // -- Phan loai thu tien / 수금 분류 --
    std::string EcollectionCd;          // Ma loai thu tien dien tu / 전자수금 유형코드

    // -- Ngay ban / 판매일자 --
    std::string SaleDate;               // Ngay ban hang / 판매일자

    // -- Trang thai / 상태 --
    std::string Status;                 // Trang thai hien tai / 현재 상태
    std::string StatusOld;              // Trang thai truoc do / 이전 상태

    // -- Thong tin cua hang va POS / 매장 및 POS 정보 --
    std::string CdShop;                 // Ma cua hang / 매장코드
    std::string PosNo;                  // So may POS / POS 번호
    std::string PosCreate;              // POS tao giao dich / 거래생성 POS

    // -- Thoi gian / 시간 --
    std::string ModifileDate;           // Ngay sua doi / 수정일시
    std::string InsertDate;             // Ngay tao / 생성일시

    // -- Du lieu QR / QR 데이터 --
    std::string QrData;                 // Du lieu QR goc / QR 원본 데이터
    std::string QrSource;               // Nguon QR / QR 출처

    // -- Lien ket phieu / 전표 연결 --
    std::string SellSlip;               // Ma phieu ban / 판매전표 참조
    std::string OrderSlip;              // Ma phieu dat hang / 주문전표 참조

    // -- Ban / 테이블 --
    std::string SelTableId;             // Ma ban duoc chon / 선택된 테이블 ID
};

// ======================================================================
// Columns -- ten bang va ten cot (UPPER_CASE) / 테이블명 및 컬럼명 상수
//
// Bang nay dung quy uoc UPPER_CASE khac voi cac bang SellSlip/SellDetail
// 이 테이블은 SellSlip/SellDetail과 달리 UPPER_CASE 명명규칙 사용
// ======================================================================
namespace WaitPaymentColumns {
    constexpr const char* TABLE                  = "WAIT_PAYMENT";

    // Dinh danh giao dich / 거래 식별자
    constexpr const char* TRANSACTION_UUID       = "TRANSACTION_UUID";
    constexpr const char* ADDL_TRANSACTION_UUID  = "ADDL_TRANSACTION_UUID";

    // Thong tin hoa don / 청구서 정보
    constexpr const char* BILL_NO                = "BILL_NO";
    constexpr const char* BILL_SEQ               = "BILL_SEQ";
    constexpr const char* DEPOSIT_AMT            = "DEPOSIT_AMT";

    // Thong tin tai khoan / 계좌 정보
    constexpr const char* MOTHER_ACCNT_NO        = "MOTHER_ACCNT_NO";
    constexpr const char* MOTHER_ACCNT_OWNER     = "MOTHER_ACCNT_OWNER";

    // Phan loai thu tien / 수금 분류
    constexpr const char* ECOLLECTION_CD         = "ECOLLECTION_CD";

    // Ngay ban / 판매일자
    constexpr const char* SALE_DATE              = "SALE_DATE";

    // Trang thai / 상태
    constexpr const char* STATUS                 = "STATUS";
    constexpr const char* STATUS_OLD             = "STATUS_OLD";

    // Thong tin cua hang va POS / 매장 및 POS 정보
    constexpr const char* CD_SHOP                = "CD_SHOP";
    constexpr const char* POS_NO                 = "POS_NO";
    constexpr const char* POS_CREATE             = "POS_CREATE";

    // Thoi gian / 시간
    constexpr const char* MODIFILE_DATE          = "MODIFILE_DATE";
    constexpr const char* INSERT_DATE            = "INSERT_DATE";

    // Du lieu QR / QR 데이터
    constexpr const char* QR_DATA                = "QR_DATA";
    constexpr const char* QR_SOURCE              = "QR_SOURCE";

    // Lien ket phieu / 전표 연결
    constexpr const char* SELL_SLIP              = "SELL_SLIP";
    constexpr const char* ORDER_SLIP             = "ORDER_SLIP";

    // Ban / 테이블
    constexpr const char* SEL_TABLE_ID           = "SEL_TABLE_ID";
}

// ======================================================================
// Sql -- Cau truy van SQL / SQL 질의문
// ======================================================================
namespace WaitPaymentCrud {
    /**
     * Chen mot ban ghi thanh toan cho moi / 새 대기결제 레코드 삽입
     * @return Cau SQL INSERT / INSERT SQL문
     *
     * Ghi chu / 참고:
     *   Gia tri cac cot duoc truyen qua tham so bind (?) khi tich hop ADO thuc te.
     *   실제 ADO 통합 시 바인드 파라미터(?)로 컬럼 값을 전달한다.
     */
    std::string InsertWaitPayment();

    /**
     * Cap nhat trang thai theo UUID / UUID 기준 상태 업데이트
     * @param uuid UUID giao dich chinh / 주 거래 UUID
     * @param status Trang thai moi / 새 상태값
     * @return Cau SQL UPDATE / UPDATE SQL문
     */
    std::string UpdateStatus(const std::string& uuid, const std::string& status);
}

// ======================================================================
// Mapper -- Chuyen doi RecordSet -> Row / RecordSet -> Row 변환
// ======================================================================
namespace WaitPaymentMapper {
    /**
     * Doc mot dong tu RecordSet / RecordSet에서 한 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return WaitPaymentRecord da dien du lieu / 데이터가 채워진 WaitPaymentRecord
     */
    WaitPaymentRecord FromRecordset(CADORecordset& rs);

    /**
     * Doc tat ca cac dong tu RecordSet / RecordSet에서 전체 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return Danh sach WaitPaymentRecord / WaitPaymentRecord 목록
     */
    std::vector<WaitPaymentRecord> ListFromRecordset(CADORecordset& rs);
}
