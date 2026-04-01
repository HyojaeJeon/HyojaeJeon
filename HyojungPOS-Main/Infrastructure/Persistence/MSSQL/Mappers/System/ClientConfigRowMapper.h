#pragma once

#include "../../Rows/System/ClientConfigRow.h"

class CADORecordset;

class ClientConfigRowMapper {
public:
    static ClientConfigRow FromRecordset(CADORecordset& rs);
};
