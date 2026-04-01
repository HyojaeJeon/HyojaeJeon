#include "TableSql.h"

#include "../../Schema/Table/TableSchema.h"

#include <sstream>

std::string TableSql::SelectByTableCode(int table_code) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << mssql::schema::table_table::kTableName
        << " WHERE " << mssql::schema::table_table::kTableCode << " = " << table_code;
    return sql.str();
}

std::string TableSql::UpdateStatus(int table_code, const std::string& status) {
    std::ostringstream sql;
    sql << "UPDATE " << mssql::schema::table_table::kTableName
        << " SET " << mssql::schema::table_table::kStatus << " = '" << status << "'"
        << " WHERE " << mssql::schema::table_table::kTableCode << " = " << table_code;
    return sql.str();
}
