import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const FUNDING_ACCOUNT_QUERY = gql`
  query FundingAccount($corporateId: ID!) {
    mealFundingAccount(corporateId: $corporateId) {
      success {
        data {
          id
          corporateId
          fundingModel
          depositBalanceVnd
          creditLimitVnd
          creditOutstandingVnd
          monthlyBudgetVnd
          monthlySpentVnd
          lastDepositAt
          lastDepositAmountVnd
          status
          createdAt
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const BUDGET_SUMMARY_QUERY = gql`
  query BudgetSummary($corporateId: ID!, $periodStart: String!, $periodEnd: String!) {
    mealBudgetSummary(corporateId: $corporateId, periodStart: $periodStart, periodEnd: $periodEnd) {
      success {
        data {
          corporateId
          periodStart
          periodEnd
          totalBudgetVnd
          totalAllocatedVnd
          totalSpentVnd
          totalRemainingVnd
          employeeCount
          departmentBreakdown {
            departmentId
            departmentName
            allocatedVnd
            spentVnd
            remainingVnd
            employeeCount
          }
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const ALLOWANCE_LOAD_BATCHES_QUERY = gql`
  query AllowanceLoadBatches($corporateId: ID!, $skip: Int!, $take: Int!) {
    mealAllowanceLoadBatches(corporateId: $corporateId, skip: $skip, take: $take) {
      success {
        data {
          id
          corporateId
          batchCode
          totalAmountVnd
          employeeCount
          sourceType
          memo
          status
          processedAt
          createdAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Mutations ─────────────────────────── */

export const COMPANY_ALLOWANCE_LOAD_MUTATION = gql`
  mutation CompanyAllowanceLoad($input: CompanyAllowanceLoadInput!) {
    mealCompanyAllowanceLoad(input: $input) {
      success {
        data {
          id
          batchCode
          totalAmountVnd
          employeeCount
          status
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface FundingAccount {
  id: string;
  corporateId: string;
  fundingModel: string;
  depositBalanceVnd: string | null;
  creditLimitVnd: string | null;
  creditOutstandingVnd: string | null;
  monthlyBudgetVnd: string | null;
  monthlySpentVnd: string | null;
  lastDepositAt: string | null;
  lastDepositAmountVnd: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentBudgetBreakdown {
  departmentId: string;
  departmentName: string;
  allocatedVnd: string;
  spentVnd: string;
  remainingVnd: string;
  employeeCount: number;
}

export interface BudgetSummary {
  corporateId: string;
  periodStart: string;
  periodEnd: string;
  totalBudgetVnd: string;
  totalAllocatedVnd: string;
  totalSpentVnd: string;
  totalRemainingVnd: string;
  employeeCount: number;
  departmentBreakdown: DepartmentBudgetBreakdown[];
}

export interface AllowanceLoadBatch {
  id: string;
  corporateId: string;
  batchCode: string;
  totalAmountVnd: string;
  employeeCount: number;
  sourceType: string;
  memo: string | null;
  status: string;
  processedAt: string | null;
  createdAt: string;
}

export interface FundingAccountData {
  mealFundingAccount: {
    success: { data: FundingAccount } | null;
    error: { code: string; message: string } | null;
  };
}

export interface BudgetSummaryData {
  mealBudgetSummary: {
    success: { data: BudgetSummary } | null;
    error: { code: string; message: string } | null;
  };
}

export interface AllowanceLoadBatchesData {
  mealAllowanceLoadBatches: {
    success: { data: AllowanceLoadBatch[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface CompanyAllowanceLoadData {
  mealCompanyAllowanceLoad: {
    success: {
      data: {
        id: string;
        batchCode: string;
        totalAmountVnd: string;
        employeeCount: number;
        status: string;
      };
    } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}
