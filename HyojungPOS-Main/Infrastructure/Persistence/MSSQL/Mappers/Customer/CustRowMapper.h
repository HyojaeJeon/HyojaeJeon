#pragma once

#include "../../Rows/Customer/CustRow.h"

class CADORecordset;

class CustRowMapper {
public:
    static CustRow FromRecordset(CADORecordset& rs);
};
