#include "AuditSql.h"

#include <sstream>

std::string AuditSql::BuildInsertAuditTrail(const std::string& table_name,
                                            const std::string& request_id,
                                            const std::string& action) {
    std::ostringstream sql;
    sql << "INSERT INTO AuditTrail (TableName, RequestId, Action) VALUES ('"
        << table_name << "', '" << request_id << "', '" << action << "')";
    return sql.str();
}
