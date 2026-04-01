#pragma once

#include <string>

struct OrderSlipRow {
    int OrderNo = 0;
    int CustNum = 0;
    double OrderAmt = 0.0;
    double DcAmt = 0.0;
    double TotalAmt = 0.0;
    std::string OrderType;
    std::string OrderMsgCode1;
    std::string OrderMsgCode2;
    std::string OrderMsgCode3;
    std::string OrderPrn;
    std::string FirstOrderDate;
    std::string PosNo;
    std::string OrderState;
    std::string SaleDcListCode;
    std::string CustCode;
    int TableCode = 0;
    double ReceiveAmt = 0.0;
    std::string EmpCode;
    std::string TableEmpCode;
    double VatAmt = 0.0;
    double WorkAmt = 0.0;
    double ServiceAmt = 0.0;
    double DcEventAmt = 0.0;
    double MenuDcAmt = 0.0;
    std::string SaleDcCode;
    int SavePoint = 0;
    std::string GroupSet;
    std::string NewOrderPrn;
    std::string TableMsgCode;
    std::string TableMsg;
    double SaleDcAmt = 0.0;
    double TaxFree = 0.0;
    std::string Age;
    int Man = 0;
    int Woman = 0;
    std::string Etc;
    std::string paytype;
    std::string SubCol2;
    std::string SubCol3;
    std::string SubCol1;
};
