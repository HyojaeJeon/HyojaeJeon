#include "WaitPaymentCrud.h"
#include "../../../Core/PersistenceCore.h"

#include <sstream>

// ======================================================================
// WaitPaymentCrud -- Trien khai cau truy van SQL
// WaitPaymentCrud -- SQL 질의문 구현
// ======================================================================

std::string WaitPaymentCrud::InsertWaitPayment() {
    // Chen ban ghi moi vao bang WAIT_PAYMENT
    // WAIT_PAYMENT 테이블에 새 레코드 삽입
    //
    // Ghi chu / 참고:
    //   Cau SQL nay su dung placeholder '?' cho gia tri bind.
    //   이 SQL문은 바인드 값에 '?' 플레이스홀더를 사용한다.
    //   Khi tich hop ADO thuc te, thay the bang SetParameter().
    //   실제 ADO 통합 시 SetParameter()로 대체한다.
    std::ostringstream sql;
    sql << "INSERT INTO " << WaitPaymentColumns::TABLE << " ("
        << WaitPaymentColumns::TRANSACTION_UUID      << ", "
        << WaitPaymentColumns::ADDL_TRANSACTION_UUID << ", "
        << WaitPaymentColumns::BILL_NO               << ", "
        << WaitPaymentColumns::DEPOSIT_AMT           << ", "
        << WaitPaymentColumns::MOTHER_ACCNT_NO       << ", "
        << WaitPaymentColumns::MOTHER_ACCNT_OWNER    << ", "
        << WaitPaymentColumns::ECOLLECTION_CD        << ", "
        << WaitPaymentColumns::SALE_DATE             << ", "
        << WaitPaymentColumns::STATUS                << ", "
        << WaitPaymentColumns::BILL_SEQ              << ", "
        << WaitPaymentColumns::CD_SHOP               << ", "
        << WaitPaymentColumns::POS_NO                << ", "
        << WaitPaymentColumns::POS_CREATE            << ", "
        << WaitPaymentColumns::MODIFILE_DATE         << ", "
        << WaitPaymentColumns::INSERT_DATE           << ", "
        << WaitPaymentColumns::STATUS_OLD            << ", "
        << WaitPaymentColumns::QR_DATA               << ", "
        << WaitPaymentColumns::SELL_SLIP             << ", "
        << WaitPaymentColumns::ORDER_SLIP            << ", "
        << WaitPaymentColumns::SEL_TABLE_ID          << ", "
        << WaitPaymentColumns::QR_SOURCE
        << ") VALUES ("
        << "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "
        << "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?"
        << ")";
    return sql.str();
}

std::string WaitPaymentCrud::UpdateStatus(const std::string& uuid,
                                          const std::string& status) {
    // Cap nhat trang thai giao dich, luu trang thai cu vao STATUS_OLD
    // 거래 상태 업데이트, 이전 상태를 STATUS_OLD에 보존
    std::ostringstream sql;
    sql << "UPDATE " << WaitPaymentColumns::TABLE
        << " SET "
        << WaitPaymentColumns::STATUS_OLD    << " = " << WaitPaymentColumns::STATUS << ", "
        << WaitPaymentColumns::STATUS        << " = '" << status << "', "
        << WaitPaymentColumns::MODIFILE_DATE << " = GETDATE()"
        << " WHERE " << WaitPaymentColumns::TRANSACTION_UUID << " = '" << uuid << "'";
    return sql.str();
}

// ======================================================================
// WaitPaymentMapper -- Chuyen doi RecordSet -> Row
// WaitPaymentMapper -- RecordSet -> Row 변환 구현
//
// Su dung RecordsetReader::ReadXxx de doc theo ten cot, khong phu thuoc thu tu
// RecordsetReader::ReadXxx로 컬럼명 기반 읽기, 컬럼 순서에 무관
// ======================================================================

WaitPaymentRecord WaitPaymentMapper::FromRecordset(CADORecordset& rs) {
    WaitPaymentRecord row;

    // -- Dinh danh giao dich / 거래 식별자 --
    row.TransactionUuid     = RecordsetReader::ReadString(rs, WaitPaymentColumns::TRANSACTION_UUID);
    row.AddlTransactionUuid = RecordsetReader::ReadString(rs, WaitPaymentColumns::ADDL_TRANSACTION_UUID);

    // -- Thong tin hoa don / 청구서 정보 --
    row.BillNo              = RecordsetReader::ReadString(rs, WaitPaymentColumns::BILL_NO);
    row.BillSeq             = RecordsetReader::ReadInt   (rs, WaitPaymentColumns::BILL_SEQ);
    row.DepositAmt          = RecordsetReader::ReadDouble(rs, WaitPaymentColumns::DEPOSIT_AMT);

    // -- Thong tin tai khoan / 계좌 정보 --
    row.MotherAccntNo       = RecordsetReader::ReadString(rs, WaitPaymentColumns::MOTHER_ACCNT_NO);
    row.MotherAccntOwner    = RecordsetReader::ReadString(rs, WaitPaymentColumns::MOTHER_ACCNT_OWNER);

    // -- Phan loai thu tien / 수금 분류 --
    row.EcollectionCd       = RecordsetReader::ReadString(rs, WaitPaymentColumns::ECOLLECTION_CD);

    // -- Ngay ban / 판매일자 --
    row.SaleDate            = RecordsetReader::ReadString(rs, WaitPaymentColumns::SALE_DATE);

    // -- Trang thai / 상태 --
    row.Status              = RecordsetReader::ReadString(rs, WaitPaymentColumns::STATUS);
    row.StatusOld           = RecordsetReader::ReadString(rs, WaitPaymentColumns::STATUS_OLD);

    // -- Thong tin cua hang va POS / 매장 및 POS 정보 --
    row.CdShop              = RecordsetReader::ReadString(rs, WaitPaymentColumns::CD_SHOP);
    row.PosNo               = RecordsetReader::ReadString(rs, WaitPaymentColumns::POS_NO);
    row.PosCreate           = RecordsetReader::ReadString(rs, WaitPaymentColumns::POS_CREATE);

    // -- Thoi gian / 시간 --
    row.ModifileDate        = RecordsetReader::ReadString(rs, WaitPaymentColumns::MODIFILE_DATE);
    row.InsertDate          = RecordsetReader::ReadString(rs, WaitPaymentColumns::INSERT_DATE);

    // -- Du lieu QR / QR 데이터 --
    row.QrData              = RecordsetReader::ReadString(rs, WaitPaymentColumns::QR_DATA);
    row.QrSource            = RecordsetReader::ReadString(rs, WaitPaymentColumns::QR_SOURCE);

    // -- Lien ket phieu / 전표 연결 --
    row.SellSlip            = RecordsetReader::ReadString(rs, WaitPaymentColumns::SELL_SLIP);
    row.OrderSlip           = RecordsetReader::ReadString(rs, WaitPaymentColumns::ORDER_SLIP);

    // -- Ban / 테이블 --
    row.SelTableId          = RecordsetReader::ReadString(rs, WaitPaymentColumns::SEL_TABLE_ID);

    return row;
}

std::vector<WaitPaymentRecord> WaitPaymentMapper::ListFromRecordset(CADORecordset& rs) {
    // Duyet tat ca cac dong trong RecordSet va chuyen doi tung dong
    // RecordSet의 모든 행을 순회하며 각 행을 변환
    std::vector<WaitPaymentRecord> rows;

    // TODO: Tich hop ADO thuc te / 실제 ADO 통합
    //       while (!rs.IsEOF()) { rows.push_back(FromRecordset(rs)); rs.MoveNext(); }
    (void)rs;

    return rows;
}
