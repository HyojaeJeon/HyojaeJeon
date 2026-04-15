import { gql } from '@apollo/client';

/**
 * 가맹점 일별 메뉴 구독 — 아침/점심/저녁 알림 설정과 함께 구독한다.
 */
export const MEAL_MERCHANT_SUBSCRIBE = gql`
  mutation MealMerchantSubscribe(
    $employeeId: ID!
    $branchId: ID!
    $notifyBreakfast: Boolean
    $notifyLunch: Boolean
    $notifyDinner: Boolean
  ) {
    mealMerchantSubscribe(
      employeeId: $employeeId
      branchId: $branchId
      notifyBreakfast: $notifyBreakfast
      notifyLunch: $notifyLunch
      notifyDinner: $notifyDinner
    ) {
      success {
        code
        data {
          id
          employeeId
          branchId
          isActive
          notifyBreakfast
          notifyLunch
          notifyDinner
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
 * 가맹점 일별 메뉴 구독 해제.
 */
export const MEAL_MERCHANT_UNSUBSCRIBE = gql`
  mutation MealMerchantUnsubscribe($employeeId: ID!, $branchId: ID!) {
    mealMerchantUnsubscribe(employeeId: $employeeId, branchId: $branchId) {
      success {
        code
        data {
          id
          employeeId
          branchId
          isActive
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
