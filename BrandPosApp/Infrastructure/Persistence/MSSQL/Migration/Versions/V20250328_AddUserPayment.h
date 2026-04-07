#pragma once

#include <string>
#include <vector>

class V20250328_AddUserPayment {
public:
    static const char* VersionTag();
    static std::vector<std::string> BuildSqlStatements();
};
