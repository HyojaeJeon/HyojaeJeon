#include "SystemSql.h"

#include "../../Schema/System/ClientConfigSchema.h"

#include <sstream>

std::string SystemSql::SelectClientConfig() {
    std::ostringstream sql;
    sql << "SELECT TOP 1 * FROM " << mssql::schema::client_config::kTableName;
    return sql.str();
}
