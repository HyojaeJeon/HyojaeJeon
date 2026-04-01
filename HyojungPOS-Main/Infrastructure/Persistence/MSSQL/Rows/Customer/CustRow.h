#pragma once

#include <string>

struct CustRow {
    std::string CustCode;
    std::string CustName;
    std::string Phone;
    std::string HandPhone;
    std::string Addr;
    std::string Birth;
    int TotalPoint = 0;
    int UsedPoint = 0;
    int RemainPoint = 0;
    int VisitCnt = 0;
    std::string Email;
    std::string BirthType;
    std::string CustType;
    std::string InDate;
    std::string BEMail;
    std::string BSms;
    std::string LastVisitDate;
    double TotalTickAmt = 0.0;
    double RemainTickAmt = 0.0;
    double RecvTickAmt = 0.0;
    double SaleAmt = 0.0;
    std::string SaveStoreName;
    std::string Jumin;
    std::string Sex;
    std::string EmpCode;
    std::string OutDate;
    std::string CardNo;
    std::string MemberType;
    std::string Memo;
    std::string DelFlag;
    double RemainKeepAmt = 0.0;
    std::string SubCol1;
    int StampCnt = 0;
};
