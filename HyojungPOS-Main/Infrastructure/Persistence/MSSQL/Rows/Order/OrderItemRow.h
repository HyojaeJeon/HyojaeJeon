#pragma once

#include <string>

struct OrderItemRow {
    int SerNo = 0;
    std::string ItemName;
    double OrderAmt = 0.0;
    double DcAmt = 0.0;
    int Qty = 0;
    double TotalAmt = 0.0;
    std::string GrpCode;
    std::string GrpName;
    std::string MenuCode;
    std::string OrderState;
    std::string ItemCode;
    std::string OrderDate;
    int OrderNo = 0;
    std::string PosNo;
    std::string FirstOrderDate;
    std::string OrderType;
    double ReceiveAmt = 0.0;
    double VatAmt = 0.0;
    double WorkAmt = 0.0;
    int TableCode = 0;
    std::string AmtEmpCode;
    int WorkType = 0;
    double ServiceAmt = 0.0;
    double DcEventAmt = 0.0;
    double MenuDcAmt = 0.0;
    double DcTaxAmt = 0.0;
    std::string OrderMsgCode;
    int OrderPrn = 0;
    std::string OrderPrnState;
    int OldQty = 0;
    int InputMenuDC = 0;
    std::string DelFlag;
    std::string SubCol2;
    std::string SubCol3;
    std::string ADUFlag;
};
