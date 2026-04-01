#include "PaymentSql.h"

#include "../../Schema/Payment/SellSlipSchema.h"
#include "../../Schema/Payment/WaitPaymentSchema.h"

#include <sstream>

std::string PaymentSql::SelectSellSlip(int bill_no) {
    std::ostringstream sql;
    sql << "SELECT * FROM " << mssql::schema::sell_slip::kTableName
        << " WHERE " << mssql::schema::sell_slip::kBillNo << " = " << bill_no;
    return sql.str();
}

std::string PaymentSql::InsertWaitPayment() {
    std::ostringstream sql;
    sql << "INSERT INTO " << mssql::schema::wait_payment::kTableName << " (...) VALUES (...)";
    return sql.str();
}

std::string PaymentSql::UpdateWaitPaymentStatus(const std::string& transaction_uuid,
                                                const std::string& status) {
    std::ostringstream sql;
    sql << "UPDATE " << mssql::schema::wait_payment::kTableName
        << " SET " << mssql::schema::wait_payment::kStatus << " = '" << status << "'"
        << " WHERE " << mssql::schema::wait_payment::kTransactionUuid << " = '" << transaction_uuid << "'";
    return sql.str();
}
