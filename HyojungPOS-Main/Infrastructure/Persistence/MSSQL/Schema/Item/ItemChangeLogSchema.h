#pragma once

namespace mssql {
namespace schema {
namespace item_change_log {

inline constexpr const char kTableName[] = "ItemChangeLog";
inline constexpr const char kChangeDate[] = "ChangeDate";
inline constexpr const char kItemCode[] = "ItemCode";
inline constexpr const char kBarCode[] = "BarCode";
inline constexpr const char kCType[] = "CType";
inline constexpr const char kPerAmt[] = "perAmt";
inline constexpr const char kAfterAmt[] = "afterAmt";
inline constexpr const char kAmt[] = "Amt";
inline constexpr const char kPreSup[] = "preSup";
inline constexpr const char kAfterSup[] = "afterSup";
inline constexpr const char kMemo[] = "Memo";
inline constexpr const char kDelFlag[] = "DelFlag";

}  // namespace item_change_log
}  // namespace schema
}  // namespace mssql
