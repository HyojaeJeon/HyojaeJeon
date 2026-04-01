#pragma once

#include <string>

class PagingSql {
public:
    static std::string AppendTop(const std::string& base_sql, int top_count);
    static std::string AppendOffsetFetch(const std::string& base_sql,
                                         int offset,
                                         int fetch_count);
};
