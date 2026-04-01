#pragma once

#include <string>

class AdoWraper {
public:
    AdoWraper();
    ~AdoWraper();

    bool ExecuteNonQuery(const std::string& sql);
    bool ExecuteQuery(const std::string& sql);

    const std::string& GetLastSql() const;

private:
    std::string last_sql_;
};
