#pragma once
/**
 * OutboxRepository — 중앙 서버 동기화 Outbox 저장소
 *
 * Outbox는 중앙 온라인 서버로 송출 가능한 동기화 데이터만 적재한다.
 * 카드 승인/QR 결제/배달앱 실시간 호출은 Outbox 대상이 아니다.
 *
 * Outbox 상태: PENDING, DISPATCHING, ACKED, FAILED_RETRYABLE, FAILED_TERMINAL
 */

#include <string>
#include <vector>
#include <optional>

struct OutboxEntry {
    int64_t id = 0;
    std::string channel;        // "SALES_UPLOAD", "ORDER_SYNC", "CHANGE_LOG"
    std::string payload_json;
    std::string status;         // PENDING | DISPATCHING | ACKED | FAILED_RETRYABLE | FAILED_TERMINAL
    int retry_count = 0;
    std::string last_error;
    std::string created_at;
    std::string updated_at;
};

class OutboxRepository {
public:
    OutboxRepository();
    ~OutboxRepository();

    /**
     * 새 Outbox 레코드 적재 (트랜잭션 내에서 호출)
     */
    int64_t Insert(const std::string& channel, const std::string& payload_json);

    /**
     * PENDING 상태 레코드 조회 (SyncWorker/OutboxDispatcher 용)
     * @param limit 최대 조회 건수
     */
    std::vector<OutboxEntry> FindPending(int limit = 50);

    /**
     * 상태 갱신
     */
    void UpdateStatus(int64_t id,
                      const std::string& new_status,
                      const std::string& error = "");

    /**
     * backlog 건수 조회
     */
    int GetBacklogCount();
};

/*
 * 예상 MSSQL 테이블:
 *
 * CREATE TABLE SyncOutbox (
 *     Id            BIGINT IDENTITY(1,1) PRIMARY KEY,
 *     Channel       NVARCHAR(64)  NOT NULL,  -- SALES_UPLOAD|ORDER_SYNC|CHANGE_LOG
 *     PayloadJson   NVARCHAR(MAX) NOT NULL,
 *     Status        NVARCHAR(32)  NOT NULL DEFAULT 'PENDING',
 *     RetryCount    INT           NOT NULL DEFAULT 0,
 *     LastError     NVARCHAR(512) NULL,
 *     CreatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
 *     UpdatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
 * );
 *
 * CREATE INDEX IX_SyncOutbox_Status ON SyncOutbox(Status) WHERE Status IN ('PENDING','FAILED_RETRYABLE');
 */
