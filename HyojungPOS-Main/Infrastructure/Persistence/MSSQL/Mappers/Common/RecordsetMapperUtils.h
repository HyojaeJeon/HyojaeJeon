#pragma once

#include <cstdint>
#include <string>

class CADORecordset;

class RecordsetMapperUtils {
public:
    static std::string ReadString(CADORecordset& rs, const char* field_name);
    static int ReadInt(CADORecordset& rs, const char* field_name);
    static std::int64_t ReadInt64(CADORecordset& rs, const char* field_name);
    static double ReadDouble(CADORecordset& rs, const char* field_name);
};
