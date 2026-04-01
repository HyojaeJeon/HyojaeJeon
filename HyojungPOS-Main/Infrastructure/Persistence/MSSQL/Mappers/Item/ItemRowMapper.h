#pragma once

#include "../../Rows/Item/ItemRow.h"

class CADORecordset;

class ItemRowMapper {
public:
    static ItemRow FromRecordset(CADORecordset& rs);
};
