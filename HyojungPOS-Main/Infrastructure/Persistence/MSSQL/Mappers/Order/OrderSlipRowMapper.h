#pragma once

#include "../../Rows/Order/OrderSlipRow.h"

class CADORecordset;

class OrderSlipRowMapper {
public:
    static OrderSlipRow FromRecordset(CADORecordset& rs);
};
