import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const WALLETS_QUERY = gql`
  query Wallets($corporateId: ID!, $skip: Int!, $take: Int!) {
    mealWalletsByCorporate(corporateId: $corporateId, skip: $skip, take: $take) {
      success {
        data {
          id
          employeeId
          corporateId
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
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

export const WALLET_DETAIL_QUERY = gql`
  query WalletDetail($id: ID!) {
    mealWallet(id: $id) {
      success {
        data {
          id
          employeeId
          corporateId
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
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

export const WALLET_FUNDING_ENTRIES_QUERY = gql`
  query WalletFundingEntries($walletId: ID!, $skip: Int!, $take: Int!) {
    mealWalletFundingEntriesByWallet(walletId: $walletId, skip: $skip, take: $take) {
      success {
        data {
          id
          sourceType
          sourceReferenceId
          sourceBatchId
          amountVnd
          status
          note
          postedAt
          reversedAt
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

export const TRANSACTIONS_QUERY = gql`
  query Transactions($corporateId: ID!, $skip: Int!, $take: Int!) {
    mealTransactionsByCorporate(corporateId: $corporateId, skip: $skip, take: $take) {
      success {
        data {
          id
          walletId
          corporateId
          brandHqId
          branchId
          terminalId
          loopType
          authMethod
          requestedAmountVnd
          approvedAmountVnd
          companyShareVnd
          employeeShareVnd
          status
          declineReason
          idempotencyKey
          authorizedAt
          settledAt
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

export const TRANSACTIONS_FILTERED_QUERY = gql`
  query TransactionsFiltered(
    $corporateId: ID!
    $skip: Int!
    $take: Int!
    $dateFrom: String
    $dateTo: String
    $merchantId: String
    $employeeId: String
    $statuses: [String!]
  ) {
    mealTransactionsByCorporate(
      corporateId: $corporateId
      skip: $skip
      take: $take
      dateFrom: $dateFrom
      dateTo: $dateTo
      merchantId: $merchantId
      employeeId: $employeeId
      statuses: $statuses
    ) {
      success {
        data {
          id
          walletId
          corporateId
          brandHqId
          branchId
          terminalId
          loopType
          authMethod
          requestedAmountVnd
          approvedAmountVnd
          companyShareVnd
          employeeShareVnd
          status
          declineReason
          idempotencyKey
          authorizedAt
          settledAt
          createdAt
        }
        totalCount
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface WalletRow {
  id: string;
  employeeId: string;
  corporateId: string;
  balanceVnd: string;
  companyAllowanceVnd: string;
  personalTopUpVnd: string;
  dailyLimitVnd: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletFundingEntry {
  id: string;
  sourceType: string;
  sourceReferenceId: string | null;
  sourceBatchId: string | null;
  amountVnd: string;
  status: string;
  note: string | null;
  postedAt: string | null;
  reversedAt: string | null;
  createdAt: string;
}

export interface TransactionRow {
  id: string;
  walletId: string;
  corporateId: string;
  brandHqId: string | null;
  branchId: string | null;
  terminalId: string | null;
  loopType: string;
  authMethod: string;
  requestedAmountVnd: string;
  approvedAmountVnd: string;
  companyShareVnd: string;
  employeeShareVnd: string;
  status: string;
  declineReason: string | null;
  idempotencyKey: string;
  authorizedAt: string | null;
  settledAt: string | null;
  createdAt: string;
}

export interface WalletsData {
  mealWalletsByCorporate: {
    success: { data: WalletRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface WalletDetailData {
  mealWallet: {
    success: { data: WalletRow } | null;
    error: { code: string; message: string } | null;
  };
}

export interface WalletFundingEntriesData {
  mealWalletFundingEntriesByWallet: {
    success: { data: WalletFundingEntry[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface TransactionsData {
  mealTransactionsByCorporate: {
    success: { data: TransactionRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface TransactionsFilteredData {
  mealTransactionsByCorporate: {
    success: { data: TransactionRow[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}
