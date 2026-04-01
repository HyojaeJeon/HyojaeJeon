#pragma once

#include "../../Rows/Payment/SellDetailRow.h"

class CADORecordset;

class SellDetailRowMapper {
public:
    static SellDetailRow FromRecordset(CADORecordset& rs);
};
