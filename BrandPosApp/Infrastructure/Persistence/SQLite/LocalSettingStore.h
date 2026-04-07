#pragma once
/**
 * LocalSettingStore — SQLite 로컬 설정 영속화
 *
 * 테이블: LocalSetting
 *   - key   TEXT PRIMARY KEY
 *   - value TEXT NOT NULL
 *
 * POS 기기별 설정 (테마, 언어, 프린터 포트 등)을 저장한다.
 */

#include <string>

class LocalSettingStore {
public:
    /** 설정 값 조회. 없으면 defaultValue 반환 */
    static std::string Get(const std::string& key, const std::string& defaultValue = "");

    /** 설정 값 저장 (UPSERT) */
    static void Set(const std::string& key, const std::string& value);

    /** 설정 삭제 */
    static void Remove(const std::string& key);
};
