#pragma once

#include <string>

class TableSql {
public:
    static std::string SelectByTableCode(int table_code);
    static std::string UpdateStatus(int table_code, const std::string& status);
};
