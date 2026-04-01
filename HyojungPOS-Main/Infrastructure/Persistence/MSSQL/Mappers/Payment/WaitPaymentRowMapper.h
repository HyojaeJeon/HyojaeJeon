#pragma once

#include "../../Rows/Payment/WaitPaymentRow.h"

class CADORecordset;

class WaitPaymentRowMapper {
public:
    static WaitPaymentRow FromRecordset(CADORecordset& rs);
};
