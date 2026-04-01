#pragma once

#include <string>

class AuditSql {
public:
    static std::string BuildInsertAuditTrail(const std::string& table_name,
                                             const std::string& request_id,
                                             const std::string& action);
};
