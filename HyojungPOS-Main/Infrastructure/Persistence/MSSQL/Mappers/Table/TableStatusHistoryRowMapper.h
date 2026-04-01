#pragma once

#include "../../Rows/Table/TableStatusHistoryRow.h"

class CADORecordset;

class TableStatusHistoryRowMapper {
public:
    static TableStatusHistoryRow FromRecordset(CADORecordset& rs);
};
