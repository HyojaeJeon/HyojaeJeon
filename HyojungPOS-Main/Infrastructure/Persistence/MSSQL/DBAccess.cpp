#include "DBAccess.h"

DBAccess::DBAccess() {}
DBAccess::~DBAccess() {}

bool DBAccess::Open(const std::string& connection_string) {
    connection_string_ = connection_string;
    is_open_ = !connection_string.empty();
    return is_open_;
}

void DBAccess::Close() {
    connection_string_.clear();
    is_open_ = false;
}

bool DBAccess::IsOpen() const {
    return is_open_;
}
