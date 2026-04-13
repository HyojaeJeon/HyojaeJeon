import { gql } from '@apollo/client';

/* ── 1P1Q: 정산 대시보드 단일 쿼리 ── */

export const SETTLEMENT_DASHBOARD_QUERY = gql`
  query SettlementDashboard(
    $periodStart: String!
    $periodEnd: String!
    $batchSkip: Int
    $batchTake: Int
    $batchStatus: String
  ) {
    mealSettlementDashboard(
      periodStart: $periodStart
      periodEnd: $periodEnd
      batchSkip: $batchSkip
      batchTake: $batchTake
      batchStatus: $batchStatus
    ) {
      success {
        data {
          revenue {
            totalTransactionVnd
            totalCommissionVnd
            settledCommissionVnd
            estimatedCommissionVnd
            pendingSettlementVnd
            unsettledTransactionVnd
            unsettledTransactionCount
            overdueCreditVnd
            totalTransactionCount
            pendingBatchCount
          }
          batches {
            id
            brandHqId
            brandName
            periodStart
            periodEnd
            status
            grossAmountVnd
            commissionAmountVnd
            netPayableVnd
            threeWayMismatchCount
            approvedBy
            approvedAt
            approvalMemo
            payoutStatus
            payoutRequestedAt
            payoutCompletedAt
            createdAt
            updatedAt
          }
          batchTotalCount
          unsettledBrands {
            brandHqId
            brandName
            totalVnd
            count
            oldestTransactionDate
          }
        }
      }
      error { code message }
    }
  }
`;

/** 정산 실행 모달용 — 브랜드별 미정산 거래 목록 조회 (사용자 액션이므로 1P1Q 별도) */
export const UNSETTLED_TRANSACTIONS_QUERY = gql`
  query UnsettledTransactions($brandHqId: ID!, $skip: Int!, $take: Int!, $status: String, $periodStart: String, $periodEnd: String) {
    mealTransactionsByBrand(brandHqId: $brandHqId, skip: $skip, take: $take, status: $status, periodStart: $periodStart, periodEnd: $periodEnd) {
      success {
        data {
          id
          walletId
          corporateId
          loopType
          authMethod
          requestedAmountVnd
          approvedAmountVnd
          companyShareVnd
          employeeShareVnd
          status
          createdAt
        }
        totalCount
      }
      error { code message }
    }
  }
`;

export interface TransactionRow {
  id: string;
  walletId: string;
  corporateId: string;
  loopType: string;
  authMethod: string;
  requestedAmountVnd: number;
  approvedAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  status: string;
  createdAt: string;
}

export interface UnsettledTransactionsData {
  mealTransactionsByBrand: {
    success: { data: TransactionRow[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

/* ── Mutations ── */

export const SETTLEMENT_RUN_BATCH_MUTATION = gql`
  mutation MealSettlementRunBatch($input: RunMealSettlementBatchInput!) {
    mealSettlementRunBatch(input: $input) {
      success { data { id status grossAmountVnd commissionAmountVnd netPayableVnd threeWayMismatchCount } }
      error { code message }
    }
  }
`;

export const SETTLEMENT_APPROVE_MUTATION = gql`
  mutation MealSettlementApprove($id: ID!, $memo: String) {
    mealSettlementApprove(id: $id, memo: $memo) {
      success { data { id status memo updatedAt } }
      error { code message }
    }
  }
`;

export const SETTLEMENT_REQUEST_PAYOUT_MUTATION = gql`
  mutation MealSettlementRequestPayout($id: ID!) {
    mealSettlementRequestPayout(id: $id) {
      success { data { id status updatedAt } }
      error { code message }
    }
  }
`;

export const SETTLEMENT_RESOLVE_EXCEPTION_MUTATION = gql`
  mutation MealSettlementResolveException($id: ID!, $memo: String!) {
    mealSettlementResolveException(id: $id, memo: $memo) {
      success { data { id status memo updatedAt } }
      error { code message }
    }
  }
`;

export const SETTLEMENT_MARK_PAID_MUTATION = gql`
  mutation MealSettlementMarkPaid($id: ID!) {
    mealSettlementMarkPaid(id: $id) {
      success { data { id status updatedAt } }
      error { code message }
    }
  }
`;

/* ── Types ── */

export interface RevenueSummary {
  totalTransactionVnd: number;
  totalCommissionVnd: number;
  settledCommissionVnd: number;
  estimatedCommissionVnd: number;
  pendingSettlementVnd: number;
  unsettledTransactionVnd: number;
  unsettledTransactionCount: number;
  overdueCreditVnd: number;
  totalTransactionCount: number;
  pendingBatchCount: number;
}

export type SettlementBatchStatus =
  | 'OPEN'
  | 'MATCHING'
  | 'MATCHED'
  | 'EXCEPTION'
  | 'APPROVED'
  | 'PAYOUT_REQUESTED'
  | 'PAID';

export interface SettlementBatchRow {
  id: string;
  brandHqId: string;
  brandName: string | null;
  periodStart: string;
  periodEnd: string;
  status: SettlementBatchStatus;
  grossAmountVnd: number;
  commissionAmountVnd: number;
  netPayableVnd: number;
  threeWayMismatchCount: number;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalMemo: string | null;
  payoutStatus: string | null;
  payoutRequestedAt: string | null;
  payoutCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnsettledBrandRow {
  brandHqId: string;
  brandName: string | null;
  totalVnd: number;
  count: number;
  oldestTransactionDate: string | null;
}

export interface SettlementDashboardData {
  mealSettlementDashboard: {
    success: {
      data: {
        revenue: RevenueSummary;
        batches: SettlementBatchRow[];
        batchTotalCount: number;
        unsettledBrands: UnsettledBrandRow[];
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

export interface SettlementMutationResult {
  success: { data: { id: string; status: string; memo?: string | null; updatedAt: string } } | null;
  error: { code: string; message: string } | null;
}

export interface SettlementApproveData {
  mealSettlementApprove: SettlementMutationResult;
}

export interface SettlementRequestPayoutData {
  mealSettlementRequestPayout: SettlementMutationResult;
}

export interface SettlementResolveExceptionData {
  mealSettlementResolveException: SettlementMutationResult;
}

export interface SettlementMarkPaidData {
  mealSettlementMarkPaid: SettlementMutationResult;
}
