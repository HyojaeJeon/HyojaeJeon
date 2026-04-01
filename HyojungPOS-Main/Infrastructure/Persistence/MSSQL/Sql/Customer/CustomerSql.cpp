#include "CustomerSql.h"

#include "../../Schema/Customer/CustSchema.h"

#include <sstream>

std::string CustomerSql::SelectByPhone(const std::string& phone) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << mssql::schema::cust::kTableName
        << " WHERE " << mssql::schema::cust::kPhone << " = '" << phone << "'";
    return sql.str();
}
