#pragma once

#include <string>

struct UserPaymentRow {
    std::string SellDate;
    std::string PosNo;
    int ReceiptNo = 0;
    int SerNo = 0;
    std::string SellType;
    double UserAmt = 0.0;
    int UserPayType = 0;
    std::string UserPayName;
    std::string TranDate;
    std::string AdjustNo;
    std::string EndTimeDate;
    int EndTime = 0;
    std::string DelFlag;
    std::string OriginalData;
    std::string SubCol1;
    std::string SubCol2;
    std::string SubCol3;
};
