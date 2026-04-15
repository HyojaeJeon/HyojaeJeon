import { gql } from '@apollo/client';

/**
 * 사전 주문 생성 — 일별 메뉴(dailyMenu)에서 항목을 선택하고 픽업 슬롯을 지정.
 * idempotencyKey 로 중복 주문을 방지한다.
 */
export const MEAL_PRE_ORDER_CREATE = gql`
  mutation MealPreOrderCreate($input: CreateMealPreOrderInput!) {
    mealPreOrderCreate(input: $input) {
      success {
        code
        data {
          id
          status
          mealType
          pickupSlot
          totalAmountVnd
          companyShareVnd
          employeeShareVnd
          branchId
          dailyMenuId
          walletId
          items {
            id
            dailyMenuItemId
            quantity
          }
          createdAt
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
 * 사전 주문 취소 — 취소 정책 평가 후 잔액 환불.
 */
export const MEAL_PRE_ORDER_CANCEL = gql`
  mutation MealPreOrderCancel($id: ID!) {
    mealPreOrderCancel(id: $id) {
      success {
        code
        data {
          id
          status
          totalAmountVnd
          companyShareVnd
          employeeShareVnd
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
