#include "RecordsetMapperUtils.h"

std::string RecordsetMapperUtils::ReadString(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return {};
}

int RecordsetMapperUtils::ReadInt(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return 0;
}

std::int64_t RecordsetMapperUtils::ReadInt64(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return 0;
}

double RecordsetMapperUtils::ReadDouble(CADORecordset& /*rs*/, const char* /*field_name*/) {
    return 0.0;
}
