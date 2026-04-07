#pragma once
/**
 * UserPaymentCrud.h -- User payment row + column constants + mapper + CRUD helper
 * UserPaymentCrud.h -- 사용자결제 Row 구조체 + 컬럼 상수 + CRUD helper + 매퍼
 *
 * Vai tro / 역할:
 *   Bang UserPayment luu thong tin cac phuong thuc thanh toan tu dinh nghia
 *   (khong phai tien mat/the chuan) cho moi phieu ban.
 *   UserPayment 테이블은 각 판매전표의 사용자 정의 결제수단
 *   (표준 현금/카드 이외) 정보를 저장한다.
 *
 *   - UserPaymentRecord:      struct anh xa 1:1 voi dong trong bang / 테이블 행과 1:1 매핑 구조체
 *   - UserPaymentColumns:   ten bang va ten cot / 테이블명 및 컬럼명
 *   - UserPaymentCrud:      cau SQL doc du lieu / 데이터 조회 SQL문
 *   - UserPaymentMapper:   chuyen doi RecordSet -> Row / RecordSet -> Row 변환
 */

#include <string>
#include <vector>

class CADORecordset;

// ======================================================================
// Row -- Cau truc anh xa bang UserPayment / UserPayment 테이블 매핑 구조체
// ======================================================================
struct UserPaymentRecord {
    // -- Khoa chinh ghep / 복합 기본키 --
    std::string SellDate;           // Ngay ban / 판매일자 (YYYYMMDD)
    std::string PosNo;              // So may POS / POS 번호
    int         ReceiptNo  = 0;     // So phieu thu / 영수증 번호
    int         SerNo      = 0;     // So thu tu dong / 일련번호

    // -- Phan loai ban / 판매 유형 --
    int         SellType   = 0;     // Loai ban / 판매 유형

    // -- Thong tin thanh toan nguoi dung / 사용자결제 정보 --
    double      UserAmt    = 0.0;   // So tien thanh toan / 결제 금액
    std::string UserPayType;        // Loai thanh toan / 결제 유형코드
    std::string UserPayName;        // Ten thanh toan / 결제 유형명

    // -- Ngay giao dich / 거래일자 --
    std::string TranDate;           // Ngay giao dich / 거래일자

    // -- Dieu chinh va ket thuc / 조정 및 종료 --
    int         AdjustNo   = 0;     // So dieu chinh / 조정번호
    std::string EndTimeDate;        // Ngay ket thuc / 종료일자
    std::string EndTime;            // Gio ket thuc / 종료시각

    // -- Co xoa / 삭제플래그 --
    int         DelFlag    = 0;     // Co xoa / 삭제플래그

    // -- Du lieu goc / 원본 데이터 --
    std::string OriginalData;       // Du lieu goc (JSON/raw) / 원본 데이터

    // -- Cot phu / 부가컬럼 --
    std::string SubCol1;            // Cot phu 1 / 부가컬럼1
    std::string SubCol2;            // Cot phu 2 / 부가컬럼2
    std::string SubCol3;            // Cot phu 3 / 부가컬럼3
};

// ======================================================================
// Columns -- ten bang va ten cot / 테이블명 및 컬럼명 상수
// ======================================================================
namespace UserPaymentColumns {
    constexpr const char* TABLE          = "UserPayment";

    // Khoa chinh ghep / 복합 기본키
    constexpr const char* SellDate       = "SellDate";
    constexpr const char* PosNo          = "PosNo";
    constexpr const char* ReceiptNo      = "ReceiptNo";
    constexpr const char* SerNo          = "SerNo";

    // Phan loai ban / 판매 유형
    constexpr const char* SellType       = "SellType";

    // Thong tin thanh toan nguoi dung / 사용자결제 정보
    constexpr const char* UserAmt        = "UserAmt";
    constexpr const char* UserPayType    = "UserPayType";
    constexpr const char* UserPayName    = "UserPayName";

    // Ngay giao dich / 거래일자
    constexpr const char* TranDate       = "TranDate";

    // Dieu chinh va ket thuc / 조정 및 종료
    constexpr const char* AdjustNo       = "AdjustNo";
    constexpr const char* EndTimeDate    = "EndTimeDate";
    constexpr const char* EndTime        = "EndTime";

    // Co xoa / 삭제플래그
    constexpr const char* DelFlag        = "DelFlag";

    // Du lieu goc / 원본 데이터
    constexpr const char* OriginalData   = "OriginalData";

    // Cot phu / 부가컬럼
    constexpr const char* SubCol1        = "SubCol1";
    constexpr const char* SubCol2        = "SubCol2";
    constexpr const char* SubCol3        = "SubCol3";
}

// ======================================================================
// Sql -- Cau truy van SQL / SQL 질의문
// ======================================================================
namespace UserPaymentCrud {
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
namespace UserPaymentMapper {
    /**
     * Doc mot dong tu RecordSet / RecordSet에서 한 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return UserPaymentRecord da dien du lieu / 데이터가 채워진 UserPaymentRecord
     */
    UserPaymentRecord FromRecordset(CADORecordset& rs);

    /**
     * Doc tat ca cac dong tu RecordSet / RecordSet에서 전체 행 읽기
     * @param rs Con tro RecordSet dang mo / 열린 RecordSet 참조
     * @return Danh sach UserPaymentRecord / UserPaymentRecord 목록
     */
    std::vector<UserPaymentRecord> ListFromRecordset(CADORecordset& rs);
}
