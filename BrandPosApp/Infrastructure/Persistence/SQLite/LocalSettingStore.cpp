#include "LocalSettingStore.h"

#include <windows.h>
#include "sqlite3.h"

// ──── DB 경로 (AuthSessionStore와 동일 DB 파일) ────

static std::string GetDbPath() {
    char path[MAX_PATH] = {};
    GetModuleFileNameA(NULL, path, MAX_PATH);
    std::string exePath(path);
    auto lastSlash = exePath.find_last_of("\\/");
    return exePath.substr(0, lastSlash + 1) + "pos_local.db";
}

static sqlite3* OpenDb() {
    sqlite3* db = nullptr;
    if (sqlite3_open(GetDbPath().c_str(), &db) != SQLITE_OK) {
        if (db) sqlite3_close(db);
        return nullptr;
    }

    const char* createSql = R"(
        CREATE TABLE IF NOT EXISTS LocalSetting (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    )";
    sqlite3_exec(db, createSql, nullptr, nullptr, nullptr);
    return db;
}

// ──── Get ────

std::string LocalSettingStore::Get(const std::string& key, const std::string& defaultValue) {
    sqlite3* db = OpenDb();
    if (!db) return defaultValue;

    const char* sql = "SELECT value FROM LocalSetting WHERE key = ?";
    sqlite3_stmt* stmt = nullptr;
    std::string result = defaultValue;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, key.c_str(), -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            const char* val = (const char*)sqlite3_column_text(stmt, 0);
            if (val) result = val;
        }
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
    return result;
}

// ──── Set (UPSERT) ────

void LocalSettingStore::Set(const std::string& key, const std::string& value) {
    sqlite3* db = OpenDb();
    if (!db) return;

    const char* sql = "INSERT OR REPLACE INTO LocalSetting (key, value) VALUES (?, ?)";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, key.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, value.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(stmt);
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
}

// ──── Remove ────

void LocalSettingStore::Remove(const std::string& key) {
    sqlite3* db = OpenDb();
    if (!db) return;

    const char* sql = "DELETE FROM LocalSetting WHERE key = ?";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, key.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(stmt);
        sqlite3_finalize(stmt);
    }

    sqlite3_close(db);
}
