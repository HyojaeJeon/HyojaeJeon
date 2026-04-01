#pragma once

#include <string>

struct ItemChangeLogRow {
    std::string ChangeDate;
    std::string ItemCode;
    std::string BarCode;
    std::string CType;
    double perAmt = 0.0;
    double afterAmt = 0.0;
    double Amt = 0.0;
    std::string preSup;
    std::string afterSup;
    std::string Memo;
    std::string DelFlag;
};
