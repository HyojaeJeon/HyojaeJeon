#include "PersistenceCore.h"
#include <sstream>

// ══════════════════════════════════════════
// RecordsetReader — RecordSet 읽기 유틸리티 구현
// RecordsetReader — Triển khai tiện ích đọc RecordSet
//
// TODO: Tích hợp ADO thực tế / 실제 ADO 통합
//       Khi có AdoWraper thực, gọi rs.GetFieldValue(field_name, ...)
//       실제 AdoWraper가 있으면 rs.GetFieldValue(field_name, ...) 호출
// ══════════════════════════════════════════

std::string RecordsetReader::ReadString(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return {};
}

int RecordsetReader::ReadInt(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return 0;
}

int64_t RecordsetReader::ReadInt64(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return 0;
}

double RecordsetReader::ReadDouble(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return 0.0;
}

// ══════════════════════════════════════════
// PagingQuery — 페이징 SQL 헬퍼 구현
// ══════════════════════════════════════════

std::string PagingQuery::AppendTop(const std::string& base_sql, int top_count) {
    std::ostringstream sql;
    sql << "SELECT TOP (" << top_count << ") * FROM (" << base_sql << ") AS BaseQuery";
    return sql.str();
}

std::string PagingQuery::AppendOffsetFetch(const std::string& base_sql, int offset, int fetch_count) {
    std::ostringstream sql;
    sql << base_sql << " OFFSET " << offset << " ROWS FETCH NEXT " << fetch_count << " ROWS ONLY";
    return sql.str();
}

// ══════════════════════════════════════════
// AuditTrailBuilder — 감사 추적 SQL 헬퍼 구현
// ══════════════════════════════════════════

std::string AuditTrailBuilder::BuildInsertAuditTrail(const std::string& table_name,
                                             const std::string& request_id,
                                             const std::string& action) {
    std::ostringstream sql;
    sql << "INSERT INTO AuditTrail (TableName, RequestId, Action) VALUES ('"
        << table_name << "', '" << request_id << "', '" << action << "')";
    return sql.str();
}
