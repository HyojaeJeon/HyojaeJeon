#pragma once
/**
 * SystemActions — 시스템 요청 라우팅 (thin router)
 */

#include <string>

class SystemActions {
public:
    static std::string Handle(
        const std::string& cmd,
        const std::string& params_json,
        const std::string& request_id,
        const std::string& idempotency_key);

private:
    static std::string HandleBootstrap(const std::string& request_id);
    static std::string HandleSetTheme(const std::string& params_json, const std::string& request_id);
};
