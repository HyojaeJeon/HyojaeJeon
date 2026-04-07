#include "AuthSessionStore.h"

#include <windows.h>
#include <sstream>
#include <vector>
#include <bcrypt.h>
#pragma comment(lib, "bcrypt.lib")

// SQLite3 — 단일 헤더/소스 임베디드 DB
#include "sqlite3.h"

// ──── DB 경로 ────

static std::string GetDbPath() {
    // 실행 파일과 같은 디렉토리에 pos_local.db
    char path[MAX_PATH] = {};
    GetModuleFileNameA(NULL, path, MAX_PATH);
    std::string exePath(path);
    auto lastSlash = exePath.find_last_of("\\/");
    return exePath.substr(0, lastSlash + 1) + "pos_local.db";
}

// ──── DB 열기 + 테이블 자동 생성 ────

static sqlite3* OpenDb() {
    sqlite3* db = nullptr;
    std::string dbPath = GetDbPath();

    if (sqlite3_open(dbPath.c_str(), &db) != SQLITE_OK) {
        if (db) sqlite3_close(db);
        return nullptr;
    }

    // 테이블 자동 생성 (없으면)
    const char* createSql = R"(
        CREATE TABLE IF NOT EXISTS AuthSession (
            employeeId   TEXT PRIMARY KEY,
            employeeName TEXT NOT NULL,
            role         TEXT NOT NULL,
            storeCode    TEXT NOT NULL,
            storeName    TEXT NOT NULL,
            posNo        TEXT NOT NULL,
            adjustNo     TEXT NOT NULL,
            loginAt      TEXT NOT NULL,
            passwordHash TEXT DEFAULT ''
        );
    )";

    sqlite3_exec(db, createSql, nullptr, nullptr, nullptr);
    return db;
}

// ──── SHA-256 해시 (Windows BCrypt) ────

static std::string Sha256(const std::string& input) {
    BCRYPT_ALG_HANDLE hAlg = nullptr;
    BCRYPT_HASH_HANDLE hHash = nullptr;
    std::string result;

    if (BCryptOpenAlgorithmProvider(&hAlg, BCRYPT_SHA256_ALGORITHM, NULL, 0) != 0)
        return "";

    DWORD hashLen = 0, dummy = 0;
    BCryptGetProperty(hAlg, BCRYPT_HASH_LENGTH, (PUCHAR)&hashLen, sizeof(hashLen), &dummy, 0);

    std::vector<UCHAR> hashBytes(hashLen);

    if (BCryptCreateHash(hAlg, &hHash, NULL, 0, NULL, 0, 0) != 0) {
        BCryptCloseAlgorithmProvider(hAlg, 0);
        return "";
    }

    BCryptHashData(hHash, (PUCHAR)input.data(), (ULONG)input.size(), 0);
    BCryptFinishHash(hHash, hashBytes.data(), hashLen, 0);

    BCryptDestroyHash(hHash);
    BCryptCloseAlgorithmProvider(hAlg, 0);

    // hex 문자열로 변환
    std::ostringstream ss;
    for (DWORD i = 0; i < hashLen; ++i) {
        ss << std::hex << std::setfill('0') << std::setw(2) << (int)hashBytes[i];
    }
    return ss.str();
}

// ──── AuthTypes ToJson 구현 ────

std::string AuthSession::ToJson() const {
    std::ostringstream ss;
    ss << R"({"employeeId":")" << employeeId
       << R"(","employeeName":")" << employeeName
       << R"(","role":")" << role
       << R"(","storeCode":")" << storeCode
       << R"(","storeName":")" << storeName
       << R"(","posNo":")" << posNo
       << R"(","adjustNo":")" << adjustNo
       << R"(","loginAt":")" << loginAt << R"("})";
    return ss.str();
}

// ──── 세션 저장 (UPSERT) ────

void AuthSessionStore::SaveSession(const AuthSession& session) {
    sqlite3* db = OpenDb();
    if (!db) return;

    const char* sql = R"(
        INSERT OR REPLACE INTO AuthSession
            (employeeId, employeeName, role, storeCode, storeName, posNo, adjustNo, loginAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    )";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, session.employeeId.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, session.employeeName.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 3, session.role.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 4, session.storeCode.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 5, session.storeName.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 6, session.posNo.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 7, session.adjustNo.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 8, session.loginAt.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(stmt);
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
}

// ──── 마지막 세션 로드 (POS 재시작 시) ────

bool AuthSessionStore::LoadLastSession(AuthSession& outSession) {
    sqlite3* db = OpenDb();
    if (!db) return false;

    const char* sql = R"(
        SELECT employeeId, employeeName, role, storeCode, storeName, posNo, adjustNo, loginAt
        FROM AuthSession
        ORDER BY loginAt DESC
        LIMIT 1
    )";

    sqlite3_stmt* stmt = nullptr;
    bool found = false;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            outSession.employeeId   = (const char*)sqlite3_column_text(stmt, 0);
            outSession.employeeName = (const char*)sqlite3_column_text(stmt, 1);
            outSession.role         = (const char*)sqlite3_column_text(stmt, 2);
            outSession.storeCode    = (const char*)sqlite3_column_text(stmt, 3);
            outSession.storeName    = (const char*)sqlite3_column_text(stmt, 4);
            outSession.posNo        = (const char*)sqlite3_column_text(stmt, 5);
            outSession.adjustNo     = (const char*)sqlite3_column_text(stmt, 6);
            outSession.loginAt      = (const char*)sqlite3_column_text(stmt, 7);
            found = true;
        }
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
    return found;
}

// ──── 세션 삭제 (로그아웃) ────

void AuthSessionStore::ClearSession() {
    sqlite3* db = OpenDb();
    if (!db) return;

    sqlite3_exec(db, "DELETE FROM AuthSession", nullptr, nullptr, nullptr);
    sqlite3_close(db);
}

// ──── 오프라인 인증: 비밀번호 해시 비교 ────

bool AuthSessionStore::VerifyCredentials(
    const std::string& employeeId,
    const std::string& password,
    AuthSession& outSession)
{
    sqlite3* db = OpenDb();
    if (!db) return false;

    std::string hash = Sha256(password);

    const char* sql = R"(
        SELECT employeeId, employeeName, role, storeCode, storeName, posNo, adjustNo, loginAt
        FROM AuthSession
        WHERE employeeId = ? AND passwordHash = ?
    )";

    sqlite3_stmt* stmt = nullptr;
    bool found = false;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, employeeId.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, hash.c_str(), -1, SQLITE_TRANSIENT);

        if (sqlite3_step(stmt) == SQLITE_ROW) {
            outSession.employeeId   = (const char*)sqlite3_column_text(stmt, 0);
            outSession.employeeName = (const char*)sqlite3_column_text(stmt, 1);
            outSession.role         = (const char*)sqlite3_column_text(stmt, 2);
            outSession.storeCode    = (const char*)sqlite3_column_text(stmt, 3);
            outSession.storeName    = (const char*)sqlite3_column_text(stmt, 4);
            outSession.posNo        = (const char*)sqlite3_column_text(stmt, 5);
            outSession.adjustNo     = (const char*)sqlite3_column_text(stmt, 6);
            outSession.loginAt      = (const char*)sqlite3_column_text(stmt, 7);
            found = true;
        }
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
    return found;
}

// ──── 비밀번호 해시 저장 (온라인 인증 성공 시) ────

void AuthSessionStore::SavePasswordHash(
    const std::string& employeeId,
    const std::string& password)
{
    sqlite3* db = OpenDb();
    if (!db) return;

    std::string hash = Sha256(password);

    const char* sql = "UPDATE AuthSession SET passwordHash = ? WHERE employeeId = ?";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, hash.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, employeeId.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(stmt);
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
}
