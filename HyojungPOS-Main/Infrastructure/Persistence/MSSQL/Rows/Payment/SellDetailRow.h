#pragma once

#include <string>

struct SellDetailRow {
    std::string SellDate;
    std::string PosNo;
    int OrderNo = 0;
    int ReceiptNo = 0;
    int SerNo = 0;
    std::string ItemCode;
    std::string ItemName;
    double SaleAmt = 0.0;
    int Qty = 0;
    double TotalAmt = 0.0;
    double DcAmt = 0.0;
    double ReceiveAmt = 0.0;
    double VatAmt = 0.0;
    double WorkAmt = 0.0;
    std::string SellState;
    std::string SellType;
    std::string GrpCode;
    std::string GrpName;
    std::string MenuCode;
    int TableCode = 0;
    std::string OrderState;
    std::string OrderDate;
    std::string OrderType;
    std::string AmtEmpCode;
    int WorkType = 0;
    double ServiceAmt = 0.0;
    double DcEventAmt = 0.0;
    double MenuDcAmt = 0.0;
    std::string OrderMsgCode;
    std::string AdjustNo;
    std::string EndTimeDate;
    int EndTime = 0;
    int StockUseUnit = 0;
    int InputMenuDC = 0;
    double SaleDcAmt = 0.0;
    double SDCashAmt = 0.0;
    double SDCardAmt = 0.0;
    double SDPointAmt = 0.0;
    double SDCouponAmt = 0.0;
    double SDTickAmt = 0.0;
    int StoreIndex = 0;
    double SDCashbagAmt = 0.0;
    double SDKeepAmt = 0.0;
    std::string MasterCode;
    double SDEdenredAmt = 0.0;
    double SDSelfAmt = 0.0;
    std::string SubCol1;
    std::string SubCol2;
    std::string SubCol3;
    std::string DelFlag;
    std::string DcEventCode;
    std::string ADUFlag;
};
