#pragma once

#include <cstdint>
#include <string>

struct TableStatusHistoryRow {
    std::int64_t Id = 0;
    int TableCode = 0;
    std::string PrevStatus;
    std::string NextStatus;
    std::string ChangedAt;
};
