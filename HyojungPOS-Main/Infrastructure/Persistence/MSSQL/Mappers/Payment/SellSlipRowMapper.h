#pragma once

#include "../../Rows/Payment/SellSlipRow.h"

class CADORecordset;

class SellSlipRowMapper {
public:
    static SellSlipRow FromRecordset(CADORecordset& rs);
};
