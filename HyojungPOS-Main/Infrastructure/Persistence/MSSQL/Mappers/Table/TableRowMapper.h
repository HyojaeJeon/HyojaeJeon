#pragma once

#include "../../Rows/Table/TableRow.h"

class CADORecordset;

class TableRowMapper {
public:
    static TableRow FromRecordset(CADORecordset& rs);
};
