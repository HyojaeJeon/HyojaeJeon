#include "OrderSql.h"

#include "../../Schema/Order/OrderItemSchema.h"
#include "../../Schema/Order/OrderSlipSchema.h"

#include <sstream>

std::string OrderSql::SelectOrderSlip(int order_no) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << mssql::schema::order_slip::kTableName
        << " WHERE " << mssql::schema::order_slip::kOrderNo << " = " << order_no;
    return sql.str();
}

std::string OrderSql::SelectOrderItems(int order_no) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << mssql::schema::order_item::kTableName
        << " WHERE " << mssql::schema::order_item::kOrderNo << " = " << order_no
        << " ORDER BY " << mssql::schema::order_item::kLineNo;
    return sql.str();
}
