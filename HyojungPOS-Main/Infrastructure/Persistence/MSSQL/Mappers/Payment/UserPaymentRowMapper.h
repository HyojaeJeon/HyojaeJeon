#pragma once

#include "../../Rows/Payment/UserPaymentRow.h"

class CADORecordset;

class UserPaymentRowMapper {
public:
    static UserPaymentRow FromRecordset(CADORecordset& rs);
};
