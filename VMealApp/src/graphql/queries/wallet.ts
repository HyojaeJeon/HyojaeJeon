import { gql } from '@apollo/client';

/**
 * [KO] 지갑 단건 조회 — ID 기반
 * [VI] Truy van vi don le theo ID
 */
export const MEAL_WALLET_QUERY = gql`
  query MealWallet($id: ID!) {
    mealWallet(id: $id) {
      data {
        id
        corporateId
        employeeId
        status
        balanceVnd
        companyAllowanceVnd
        personalTopUpVnd
        dailyLimitVnd
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * [KO] 법인별 지갑 목록 조회 (페이지네이션)
 * [VI] Danh sach vi theo phap nhan (phan trang)
 */
export const MEAL_WALLETS_BY_CORPORATE_QUERY = gql`
  query MealWalletsByCorporate($corporateId: ID!, $skip: Int, $take: Int) {
    mealWalletsByCorporate(corporateId: $corporateId, skip: $skip, take: $take) {
      data {
        id
        corporateId
        employeeId
        status
        balanceVnd
        companyAllowanceVnd
        personalTopUpVnd
        dailyLimitVnd
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

/**
 * [KO] 지갑별 입출금 원장(FundingEntry) 목록 조회 (페이지네이션)
 * [VI] Danh sach so cai nap/rut (FundingEntry) theo vi (phan trang)
 */
export const MEAL_WALLET_FUNDING_ENTRIES_QUERY = gql`
  query MealWalletFundingEntriesByWallet($walletId: ID!, $skip: Int, $take: Int) {
    mealWalletFundingEntriesByWallet(walletId: $walletId, skip: $skip, take: $take) {
      data {
        id
        walletId
        sourceType
        status
        amountVnd
        sourceBatchId
        sourceReferenceId
        note
        postedAt
        reversedAt
        createdAt
      }
      totalCount
    }
  }
`;
