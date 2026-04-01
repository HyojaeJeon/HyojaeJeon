#pragma once

#include <string>

struct ClientConfigRow {
    std::string PosNo;
    std::string DBVersion;
    std::string CtVersion;
    std::string LastExcute;
    std::string LkStart;
    int LimiteEnd = 0;
    int SinceDays = 0;
    int LimiteType = 0;
};
