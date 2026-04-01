#pragma once

namespace mssql {
namespace schema {
namespace wait_payment {

inline constexpr const char kTableName[] = "WAIT_PAYMENT";
inline constexpr const char kTransactionUuid[] = "TRANSACTION_UUID";
inline constexpr const char kAddlTransactionUuid[] = "ADDL_TRANSACTION_UUID";
inline constexpr const char kBillNo[] = "BILL_NO";
inline constexpr const char kDepositAmt[] = "DEPOSIT_AMT";
inline constexpr const char kMotherAccntNo[] = "MOTHER_ACCNT_NO";
inline constexpr const char kMotherAccntOwner[] = "MOTHER_ACCNT_OWNER";
inline constexpr const char kEcollectionCd[] = "ECOLLECTION_CD";
inline constexpr const char kSaleDate[] = "SALE_DATE";
inline constexpr const char kStatus[] = "STATUS";
inline constexpr const char kBillSeq[] = "BILL_SEQ";
inline constexpr const char kCdShop[] = "CD_SHOP";
inline constexpr const char kPosNo[] = "POS_NO";
inline constexpr const char kPosCreate[] = "POS_CREATE";
inline constexpr const char kModifileDate[] = "MODIFILE_DATE";
inline constexpr const char kInsertDate[] = "INSERT_DATE";
inline constexpr const char kStatusOld[] = "STATUS_OLD";
inline constexpr const char kQrData[] = "QR_DATA";
inline constexpr const char kSellSlip[] = "SELLSLIP";
inline constexpr const char kOrderSlip[] = "ORDERSLIP";
inline constexpr const char kSelTableId[] = "SELTABLEID";
inline constexpr const char kQrSource[] = "QR_SOURCE";

}  // namespace wait_payment
}  // namespace schema
}  // namespace mssql
