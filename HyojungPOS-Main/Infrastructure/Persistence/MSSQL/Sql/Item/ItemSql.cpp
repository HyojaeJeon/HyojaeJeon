#include "ItemSql.h"

#include "../../Schema/Item/ItemSchema.h"

#include <sstream>

std::string ItemSql::SelectActiveItems() {
    std::ostringstream sql;
    sql << "SELECT * FROM " << mssql::schema::item::kTableName
        << " WHERE " << mssql::schema::item::kUseYn << " = 'Y'";
    return sql.str();
}
