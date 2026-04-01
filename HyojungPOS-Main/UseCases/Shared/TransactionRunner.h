#pragma once
/**
 * TransactionRunner — DB 트랜잭션 실행 래퍼
 *
 * 하나의 UseCase 트랜잭션 안에서 업무 데이터 + Ledger + Outbox를 함께 기록한다.
 * 커밋 후에만 UI 이벤트, sync ACK, 인쇄를 실행한다.
 *
 * 사용법:
 *   TransactionRunner tx(db_connection);
 *   auto result = tx.Run([&]() {
 *       // DB 작업 + Ledger + Outbox
 *       return UseCaseResult::Success(data);
 *   });
 */

#include "UseCaseResult.h"

#include <functional>
#include <string>

// 전방 선언 (Infrastructure/Persistence 계층)
// TODO: 실제 DB 연결 클래스로 교체
class IDbConnection;

class TransactionRunner {
public:
    explicit TransactionRunner(IDbConnection* db);

    /**
     * 트랜잭션 내에서 작업을 실행한다.
     * - 성공(ok=true): COMMIT
     * - 실패(ok=false): ROLLBACK
     *
     * @param work  트랜잭션 내에서 실행할 작업 함수
     * @return UseCaseResult
     */
    UseCaseResult Run(std::function<UseCaseResult()> work);

private:
    IDbConnection* db_;  // non-owning
};
