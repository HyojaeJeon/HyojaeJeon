#pragma once
/**
 * SystemTypes — 시스템 요청/응답 DTO
 */

#include <string>

namespace SystemTypes {

struct BootstrapData {
    std::string pos_id;
    std::string store_name;
    std::string operator_id;
    bool db_connected;
    bool internet_connected;
    bool mqtt_connected;
    bool payment_gateway_connected;
    bool printer_connected;
    int sync_backlog_count;
};

}  // namespace SystemTypes
