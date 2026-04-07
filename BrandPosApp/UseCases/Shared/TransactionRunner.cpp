#include "TransactionRunner.h"
// TODO: #include "Infrastructure/Persistence/MSSQL/DBAccess.h"

TransactionRunner::TransactionRunner(IDbConnection* db)
    : db_(db)
{
}

UseCaseResult TransactionRunner::Run(std::function<UseCaseResult()> work)
{
    // TODO: 실제 MSSQL 트랜잭션으로 교체
    // db_->BeginTransaction();

    try {
        UseCaseResult result = work();

        if (result.ok) {
            // db_->Commit();
        } else {
            // db_->Rollback();
        }

        return result;
    }
    catch (const std::exception& e) {
        // db_->Rollback();
        return UseCaseResult::Fail("TX_ERROR", e.what());
    }
    catch (...) {
        // db_->Rollback();
        return UseCaseResult::Fail("TX_ERROR", "Unknown transaction error");
    }
}
