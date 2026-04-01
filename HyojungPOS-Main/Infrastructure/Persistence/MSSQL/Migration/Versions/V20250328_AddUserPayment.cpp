#include "V20250328_AddUserPayment.h"

const char* V20250328_AddUserPayment::VersionTag() {
    return "20250328_AddUserPayment";
}

std::vector<std::string> V20250328_AddUserPayment::BuildSqlStatements() {
    return {
        "CREATE TABLE UserPayment (...)"
    };
}
