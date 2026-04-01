#include "V20251013_AddWaitPayment.h"

const char* V20251013_AddWaitPayment::VersionTag() {
    return "20251013_AddWaitPayment";
}

std::vector<std::string> V20251013_AddWaitPayment::BuildSqlStatements() {
    return {
        "CREATE TABLE WAIT_PAYMENT (...)"
    };
}
