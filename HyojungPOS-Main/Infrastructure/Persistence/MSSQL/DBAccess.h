#pragma once

#include <string>

class DBAccess {
public:
    DBAccess();
    ~DBAccess();

    bool Open(const std::string& connection_string);
    void Close();
    bool IsOpen() const;

private:
    bool is_open_ = false;
    std::string connection_string_;
};
