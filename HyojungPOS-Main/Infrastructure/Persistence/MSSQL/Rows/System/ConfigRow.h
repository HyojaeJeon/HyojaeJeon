#pragma once

#include <string>

struct ConfigRow {
    std::string PosNo;
    std::string PosName;
    std::string CalcPrn;
    std::string KicPrnType;
    std::string KicPrn;
    std::string PrnName;
    std::string Display;
    std::string DisplayName;
    int MsgTime = 0;
    int TableTouch = 0;
    int CutAmt = 0;
    int OrderState = 0;
    int UseInternet = 0;
    std::string CalcPrnName;
    int UseImgBtn = 0;
    int CustInfo = 0;
    int AddOrderQty = 0;
    int ExcludeKeepAmt = 0;
};
