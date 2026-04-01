#pragma once
/**
 * RequestLedgerStore — 멱등성 Ledger 저장소
 *
 * MSSQL IdempotencyLedger 테이블에 대한 CRUD를 담당한다.
 * 하나의 UseCase 트랜잭션 안에서 업무 데이터와 함께 기록된다.
 *
 * Ledger 상태: RECEIVED, PROCESSING, SUCCEEDED, FAILED, COMPENSATED
 */

#include <string>
#include <optional>
#include <vector>

struct LedgerEntry {
    std::string idempotency_key;
    std::string request_id;
    std::string status;        // RECEIVED | PROCESSING | SUCCEEDED | FAILED | COMPENSATED
    std::string result_json;   // 성공 시 응답 데이터
    std::string created_at;
    std::string updated_at;
};

class RequestLedgerStore {
public:
    RequestLedgerStore();
    ~RequestLedgerStore();

    /**
     * idempotencyKey로 기존 엔트리 조회
     */
    std::optional<LedgerEntry> Find(const std::string& idempotency_key);

    /**
     * 신규 엔트리 삽입 또는 기존 엔트리 갱신
     */
    void Upsert(const std::string& idempotency_key,
                const std::string& request_id,
                const std::string& status,
                const std::string& result_json);

    /**
     * 상태 갱신
     */
    void UpdateStatus(const std::string& idempotency_key,
                      const std::string& new_status,
                      const std::string& result_json = "");

    /**
     * PROCESSING 상태로 남아있는 레코드 조회 (프로세스 재시작 복구용)
     */
    std::vector<LedgerEntry> FindStaleProcessing(int timeout_seconds = 300);
};

/*
 * 예상 MSSQL 테이블:
 *
 * CREATE TABLE IdempotencyLedger (
 *     IdempotencyKey  NVARCHAR(256) PRIMARY KEY,
 *     RequestId       NVARCHAR(128) NOT NULL,
 *     Status          NVARCHAR(32)  NOT NULL,  -- RECEIVED|PROCESSING|SUCCEEDED|FAILED|COMPENSATED
 *     ResultJson      NVARCHAR(MAX) NULL,
 *     CreatedAt       DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
 *     UpdatedAt       DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
 * );
 */
