#pragma once

#include "../../Rows/Order/OrderItemRow.h"

class CADORecordset;

class OrderItemRowMapper {
public:
    static OrderItemRow FromRecordset(CADORecordset& rs);
};
