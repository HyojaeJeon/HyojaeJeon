#pragma once

#include <string>

struct WaitPaymentRow {
    std::string TransactionUuid;
    std::string AddlTransactionUuid;
    int BillNo = 0;
    double DepositAmt = 0.0;
    std::string MotherAccntNo;
    std::string MotherAccntOwner;
    std::string EcollectionCd;
    std::string SaleDate;
    std::string Status;
    int BillSeq = 0;
    std::string CdShop;
    std::string PosNo;
    int PosCreate = 0;
    std::string ModifileDate;
    std::string InsertDate;
    std::string StatusOld;
    std::string QrData;
    std::string SellSlip;
    std::string OrderSlip;
    int SelTableId = 0;
    std::string QrSource;
};
