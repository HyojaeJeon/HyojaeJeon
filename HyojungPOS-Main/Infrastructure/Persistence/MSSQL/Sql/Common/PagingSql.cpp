#include "PagingSql.h"

#include <sstream>

std::string PagingSql::AppendTop(const std::string& base_sql, int top_count) {
    std::ostringstream sql;
    sql << "SELECT TOP (" << top_count << ") * FROM (" << base_sql << ") AS BaseQuery";
    return sql.str();
}

std::string PagingSql::AppendOffsetFetch(const std::string& base_sql,
                                         int offset,
                                         int fetch_count) {
    std::ostringstream sql;
    sql << base_sql << " OFFSET " << offset << " ROWS FETCH NEXT " << fetch_count << " ROWS ONLY";
    return sql.str();
}
