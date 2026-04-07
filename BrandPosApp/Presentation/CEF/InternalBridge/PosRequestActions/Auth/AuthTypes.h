#pragma once
/**
 * AuthTypes — 인증 관련 타입 정의
 */

#include <string>

struct LoginRequest {
    std::string employeeId;
    std::string password;
    int depositAmount = 0;
};

struct AuthSession {
    std::string employeeId;
    std::string employeeName;
    std::string role;
    std::string storeCode;
    std::string storeName;
    std::string posNo;
    std::string adjustNo;
    std::string loginAt;

    /** JSON 직렬화 */
    std::string ToJson() const;
};
