import { gql } from '@apollo/client';

/**
 * [KO] 지갑별 주문 목록 조회 (페이지네이션 + 상태 필터)
 * [VI] Danh sach don hang theo vi (phan trang + loc trang thai)
 */
export const MEAL_ORDERS_BY_WALLET_QUERY = gql`
  query MealOrdersByWallet($walletId: ID!, $skip: Int, $take: Int, $status: String) {
    mealOrdersByWallet(walletId: $walletId, skip: $skip, take: $take, status: $status) {
      data {
        id
        walletId
        corporateId
        brandHqId
        branchId
        orderNo
        orderType
        diningType
        status
        totalAmountVnd
        companyShareVnd
        employeeShareVnd
        scheduledAt
        tableNo
        checkedInAt
        userLatitude
        userLongitude
        idempotencyKey
        acceptedAt
        completedAt
        cancelledAt
        cancelReason
        expiresAt
        createdAt
        updatedAt
        items {
          id
          orderId
          menuItemName
          quantity
          unitPriceVnd
          optionsJson
          createdAt
        }
      }
      totalCount
    }
  }
`;

/**
 * [KO] 주문 단건 조회 — ID 기반 (항목 포함)
 * [VI] Truy van mot don hang theo ID (bao gom cac muc)
 */
export const MEAL_ORDER_QUERY = gql`
  query MealOrder($id: ID!) {
    mealOrder(id: $id) {
      data {
        id
        walletId
        corporateId
        brandHqId
        branchId
        orderNo
        orderType
        diningType
        status
        totalAmountVnd
        companyShareVnd
        employeeShareVnd
        scheduledAt
        tableNo
        checkedInAt
        userLatitude
        userLongitude
        idempotencyKey
        acceptedAt
        completedAt
        cancelledAt
        cancelReason
        expiresAt
        createdAt
        updatedAt
        items {
          id
          orderId
          menuItemName
          quantity
          unitPriceVnd
          optionsJson
          createdAt
        }
      }
    }
  }
`;

/**
 * [KO] 지점별 주문 목록 조회 — 가맹점 측 주문 관리용
 * [VI] Danh sach don hang theo chi nhanh — quan ly don hang phia cua hang
 */
export const MEAL_ORDERS_BY_BRANCH_QUERY = gql`
  query MealOrdersByBranch($branchId: ID!, $skip: Int, $take: Int, $status: String) {
    mealOrdersByBranch(branchId: $branchId, skip: $skip, take: $take, status: $status) {
      data {
        id
        walletId
        corporateId
        brandHqId
        branchId
        orderNo
        orderType
        diningType
        status
        totalAmountVnd
        companyShareVnd
        employeeShareVnd
        scheduledAt
        tableNo
        checkedInAt
        userLatitude
        userLongitude
        idempotencyKey
        acceptedAt
        completedAt
        cancelledAt
        cancelReason
        expiresAt
        createdAt
        updatedAt
        items {
          id
          orderId
          menuItemName
          quantity
          unitPriceVnd
          optionsJson
          createdAt
        }
      }
      totalCount
    }
  }
`;
