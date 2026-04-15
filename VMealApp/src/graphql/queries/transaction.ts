import { gql } from '@apollo/client';

/**
 * [KO] 기업(Corporate) 기준 거래 목록 조회 (페이지네이션)
 * [VI] Danh sach giao dich theo Corporate (phan trang)
 */
export const MEAL_TRANSACTIONS_BY_CORPORATE_QUERY = gql`
  query MealTransactionsByCorporate($corporateId: ID!, $skip: Int, $take: Int) {
    mealTransactionsByCorporate(corporateId: $corporateId, skip: $skip, take: $take) {
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
        employeeName
        departmentName
      }
      totalCount
    }
  }
`;

/**
 * [KO] 거래 단건 조회 — ID 기반
 * [VI] Truy van mot giao dich theo ID
 */
export const MEAL_TRANSACTION_QUERY = gql`
  query MealTransaction($id: ID!) {
    mealTransaction(id: $id) {
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
        employeeName
        departmentName
      }
    }
  }
`;
