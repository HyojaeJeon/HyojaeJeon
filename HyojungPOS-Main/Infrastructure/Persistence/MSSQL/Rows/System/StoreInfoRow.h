#pragma once

#include <string>

struct StoreInfoRow {
    std::string Chain;
    std::string StoreName;
    std::string BizNo;
    std::string Condition;
    std::string StoreType;
    std::string President;
    std::string Tel;
    std::string HPhone;
    std::string Addr;
    std::string PosNo;
    std::string UpdateDate;
    std::string PayType;
    int StoreIndex = 0;
    int MainStore = 0;
    std::string TerminalId;
    std::string TcpAddress;
    std::string TcpPort;
    std::string VanSel;
};
