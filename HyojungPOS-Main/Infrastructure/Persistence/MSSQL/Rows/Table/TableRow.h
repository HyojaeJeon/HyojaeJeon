#pragma once

#include <string>

struct TableRow {
    int FloorNum = 0;
    int LineNum = 0;
    int ColNum = 0;
    int TableType = 0;
    int TableNo = 0;
    int PageNum = 0;
    int TableCode = 0;
    std::string TableName;
    std::string EmpCode;
    int MatrixSize = 0;
    std::string PosNo;
    std::string Color;
    int Ttop = 0;
    int Tbottom = 0;
    int Tleft = 0;
    int Tright = 0;
    std::string FloorName;
    std::string SubCol3;
    std::string TableMsg;
    std::string TableCardNo;
    int StoreIndex = 0;
    int TableNorFont = 0;
    int TableOrFont = 0;
    int RecvAmtFont = 0;
    std::string ADUFlag;
    std::string DelFlag;
};
