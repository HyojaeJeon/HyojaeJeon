#pragma once

#include <string>

class OrderSql {
public:
    static std::string SelectOrderSlip(int order_no);
    static std::string SelectOrderItems(int order_no);
};
