#include "AdoWraper.h"

AdoWraper::AdoWraper() {}
AdoWraper::~AdoWraper() {}

bool AdoWraper::ExecuteNonQuery(const std::string& sql) {
    last_sql_ = sql;
    return !sql.empty();
}

bool AdoWraper::ExecuteQuery(const std::string& sql) {
    last_sql_ = sql;
    return !sql.empty();
}

const std::string& AdoWraper::GetLastSql() const {
    return last_sql_;
}
