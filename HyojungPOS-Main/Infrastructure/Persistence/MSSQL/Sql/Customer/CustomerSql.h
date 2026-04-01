#pragma once

#include <string>

class CustomerSql {
public:
    static std::string SelectByPhone(const std::string& phone);
};
