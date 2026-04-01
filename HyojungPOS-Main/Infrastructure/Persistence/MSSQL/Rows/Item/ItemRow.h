#pragma once

#include <string>

struct ItemRow {
    std::string ItemCode;
    std::string BarCode;
    std::string ItemName;
    std::string GrpCode;
    double SaleAmt = 0.0;
    double OrgAmt = 0.0;
    int lineup = 0;
    int ProfitRate = 0;
    std::string DelFlag;
};
