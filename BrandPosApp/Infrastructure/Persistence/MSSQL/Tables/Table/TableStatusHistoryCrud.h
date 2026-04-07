#pragma once
/**
 * TableStatusHistoryCrud.h — Struct row + column constants + mapper + CRUD helper
 *                         cho bảng TableStatusHistory
 * TableStatusHistoryCrud.h — TableStatusHistory 테이블의 행 구조체 + 컬럼 상수
 *                         + CRUD helper + 매퍼
 *
 * Vai trò / 역할:
 *   Ghi lại lịch sử thay đổi trạng thái bàn.
 *   테이블 상태 변경 이력을 기록한다.
 *   Mỗi lần trạng thái bàn đổi, một bản ghi mới được chèn vào.
 *   테이블 상태가 변경될 때마다 새 레코드가 삽입된다.
 *
 *   Gộp tất cả thành phần persistence cho entity này vào một file duy nhất:
 *   이 엔티티의 모든 영속화 구성요소를 단일 파일로 통합:
 *     - Struct hàng dữ liệu (TableStatusHistoryRecord)
 *       데이터 행 구조체
 *     - Hằng số tên bảng và tên cột (TableStatusHistoryColumns)
 *       테이블명 및 컬럼명 상수
 *     - Hàm tạo câu SQL (TableStatusHistoryCrud)
 *       SQL 쿼리 생성 함수
 *     - Hàm ánh xạ RecordSet sang struct (TableStatusHistoryMapper)
 *       RecordSet → 구조체 매핑 함수
 */

#include <string>
#include <cstdint>

class CADORecordset;

// ══════════════════════════════════════════
// Struct hàng dữ liệu / 데이터 행 구조체
//
// Ánh xạ 1:1 với các cột trong bảng TableStatusHistory trên MSSQL
// MSSQL TableStatusHistory 테이블의 컬럼과 1:1 매핑
// ══════════════════════════════════════════
struct TableStatusHistoryRecord {
    int64_t     Id          = 0;    // Khóa chính tự tăng / 자동증가 기본키
    int         TableCode   = 0;    // Mã bàn / 테이블 코드
    std::string PrevStatus;         // Trạng thái trước / 이전 상태
    std::string NextStatus;         // Trạng thái sau / 다음 상태
    std::string ChangedAt;          // Thời điểm thay đổi / 변경 시각
};

// ══════════════════════════════════════════
// Hằng số schema / 컬럼 상수
//
// Tên bảng và tên cột: dùng trong SQL builder, Mapper, kiểm tra schema
// 테이블명 및 컬럼명: SQL 빌더, 매퍼, 스키마 검증에 사용
// ══════════════════════════════════════════
namespace TableStatusHistoryColumns {
    constexpr const char* TABLE      = "TableStatusHistory";

    constexpr const char* Id         = "Id";            // Khóa chính / 기본키
    constexpr const char* TableCode  = "TableCode";     // Mã bàn / 테이블 코드
    constexpr const char* PrevStatus = "PrevStatus";    // Trạng thái trước / 이전 상태
    constexpr const char* NextStatus = "NextStatus";    // Trạng thái sau / 다음 상태
    constexpr const char* ChangedAt  = "ChangedAt";     // Thời điểm thay đổi / 변경 시각
}

// ══════════════════════════════════════════
// CRUD helper / CRUD 헬퍼
//
// Tạo câu SQL từ column constants, không hard-code tên cột
// 컬럼 상수로부터 SQL 생성, 컬럼명 하드코딩 금지
// ══════════════════════════════════════════
namespace TableStatusHistoryCrud {
    // Chèn bản ghi thay đổi trạng thái / 상태 변경 레코드 삽입
    std::string InsertStatusChange(int TableCode,
                                   const std::string& PrevStatus,
                                   const std::string& NextStatus);
}

// ══════════════════════════════════════════
// Mapper: RecordSet → struct / RecordSet → 구조체 매핑
//
// Dùng RecordsetReader::ReadXxx để đọc theo tên cột, không theo index
// RecordsetReader::ReadXxx로 인덱스가 아닌 컬럼명 기반 읽기
// ══════════════════════════════════════════
namespace TableStatusHistoryMapper {
    // Đọc hàng hiện tại của RecordSet / RecordSet의 현재 행 읽기
    TableStatusHistoryRecord FromRecordset(CADORecordset& rs);
}

/*
 * Bảng MSSQL dự kiến / 예상 MSSQL 테이블:
 *
 * CREATE TABLE TableStatusHistory (
 *     Id          BIGINT IDENTITY(1,1) PRIMARY KEY,  -- Khóa chính tự tăng / 자동증가 기본키
 *     TableCode   INT          NOT NULL,             -- Mã bàn / 테이블 코드
 *     PrevStatus  NVARCHAR(32) NOT NULL,             -- Trạng thái trước / 이전 상태
 *     NextStatus  NVARCHAR(32) NOT NULL,             -- Trạng thái sau / 다음 상태
 *     ChangedAt   DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME()  -- Thời điểm thay đổi / 변경 시각
 * );
 *
 * CREATE INDEX IX_TableStatusHistory_TableCode ON TableStatusHistory (TableCode);
 */
