#pragma once

#include <string>

class PaymentSql {
public:
    static std::string SelectSellSlip(int bill_no);
    static std::string InsertWaitPayment();
    static std::string UpdateWaitPaymentStatus(const std::string& transaction_uuid,
                                               const std::string& status);
};
