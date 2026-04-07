#pragma once
/**
 * PersistenceCore.h — Các hằng số schema chung + tiện ích mapper + SQL helper dùng chung
 * PersistenceCore.h — 공통 스키마 상수 + 매퍼 유틸리티 + 공통 SQL 헬퍼
 *
 * Vai trò / 역할:
 *   Chứa các thành phần dùng chung cho tất cả domain:
 *   모든 도메인에서 공통으로 사용하는 요소를 포함:
 *     - Hằng số cột audit (CreatedAt, UpdatedAt, RequestId, DeletedAt)
 *       감사 컬럼 상수
 *     - Hàm đọc RecordSet theo tên cột (ReadString, ReadInt, ReadDouble...)
 *       이름 기반 RecordSet 읽기 함수
 *     - SQL helper phân trang và audit trail
 *       페이징 및 감사 추적 SQL 헬퍼
 */

#include <string>
#include <cstdint>

class CADORecordset;

// ══════════════════════════════════════════
// Hằng số cột audit chung / 공통 감사 컬럼 상수
// ══════════════════════════════════════════
namespace AuditColumns {
    constexpr const char* CreatedAt  = "CreatedAt";
    constexpr const char* UpdatedAt  = "UpdatedAt";
    constexpr const char* RequestId  = "RequestId";
    constexpr const char* DeletedAt  = "DeletedAt";
}

// ══════════════════════════════════════════
// Tiện ích đọc RecordSet / RecordSet 읽기 유틸리티
//
// Tại sao cần: ADO GetFieldValue theo tên cột thay vì index
//              → Thứ tự cột thay đổi không ảnh hưởng
// 필요한 이유: ADO GetFieldValue를 index 대신 컬럼명으로
//              → 컬럼 순서 변경에 영향 없음
// ══════════════════════════════════════════
namespace RecordsetReader {
    std::string ReadString(CADORecordset& rs, const char* field_name);
    int         ReadInt(CADORecordset& rs, const char* field_name);
    int64_t     ReadInt64(CADORecordset& rs, const char* field_name);
    double      ReadDouble(CADORecordset& rs, const char* field_name);
}

// ══════════════════════════════════════════
// SQL helper phân trang / 페이징 SQL 헬퍼
//
// MSSQL chuyên dụng: TOP, OFFSET FETCH
// MSSQL 전용: TOP, OFFSET FETCH
// ══════════════════════════════════════════
namespace PagingQuery {
    std::string AppendTop(const std::string& base_sql, int top_count);
    std::string AppendOffsetFetch(const std::string& base_sql, int offset, int fetch_count);
}

// ══════════════════════════════════════════
// SQL helper audit trail / 감사 추적 SQL 헬퍼
// ══════════════════════════════════════════
namespace AuditTrailBuilder {
    std::string BuildInsertAuditTrail(const std::string& table_name,
                                      const std::string& request_id,
                                      const std::string& action);
}
