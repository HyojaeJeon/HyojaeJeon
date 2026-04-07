#pragma once
/**
 * AuthSessionStore — SQLite 인증 세션 영속화
 *
 * 로그인 성공 시 세션 데이터를 SQLite에 저장한다.
 * POS 재시작 시 이 데이터로 자동 로그인을 수행한다.
 *
 * 테이블: AuthSession
 *   - employeeId TEXT PRIMARY KEY
 *   - employeeName TEXT
 *   - role TEXT
 *   - storeCode TEXT
 *   - storeName TEXT
 *   - posNo TEXT
 *   - adjustNo TEXT
 *   - loginAt TEXT
 *   - passwordHash TEXT  (오프라인 인증용)
 */

#include "Presentation/CEF/InternalBridge/PosRequestActions/Auth/AuthTypes.h"
#include <string>

class AuthSessionStore {
public:
    /** 세션 저장 (UPSERT) */
    static void SaveSession(const AuthSession& session);

    /** 마지막 세션 로드 (POS 재시작 시) */
    static bool LoadLastSession(AuthSession& outSession);

    /** 세션 삭제 (로그아웃) */
    static void ClearSession();

    /** 오프라인 인증: 저장된 비밀번호 해시와 비교 */
    static bool VerifyCredentials(
        const std::string& employeeId,
        const std::string& password,
        AuthSession& outSession);

    /** 비밀번호 해시 저장 (온라인 인증 성공 시) */
    static void SavePasswordHash(
        const std::string& employeeId,
        const std::string& password);
};
