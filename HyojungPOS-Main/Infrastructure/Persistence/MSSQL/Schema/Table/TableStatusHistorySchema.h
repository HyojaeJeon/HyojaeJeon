#pragma once

namespace mssql {
namespace schema {
namespace table_status_history {

inline constexpr const char kTableName[] = "TableStatusHistory";
inline constexpr const char kId[] = "Id";
inline constexpr const char kTableCode[] = "TableCode";
inline constexpr const char kPrevStatus[] = "PrevStatus";
inline constexpr const char kNextStatus[] = "NextStatus";
inline constexpr const char kChangedAt[] = "ChangedAt";

}  // namespace table_status_history
}  // namespace schema
}  // namespace mssql
