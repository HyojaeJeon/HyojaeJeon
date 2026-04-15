import { gql } from '@apollo/client';

/**
 * 개인 충전 (직원 본인) — 결제 완료 후 paymentReferenceId 로 연결.
 */
export const MEAL_WALLET_TOP_UP = gql`
  mutation MealWalletTopUp($input: TopUpMealWalletInput!) {
    mealWalletTopUp(input: $input) {
      success {
        code
        data {
          id
          balanceVnd
          personalTopUpVnd
          companyAllowanceVnd
          dailyLimitVnd
          status
          updatedAt
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

/**
 * 회사 지원금 충전 (관리자) — sourceBatchId 로 일괄 충전 배치와 연결.
 */
export const MEAL_WALLET_FUND = gql`
  mutation MealWalletFund($input: FundMealWalletInput!) {
    mealWalletFund(input: $input) {
      success {
        code
        data {
          id
          balanceVnd
          personalTopUpVnd
          companyAllowanceVnd
          dailyLimitVnd
          status
          updatedAt
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
