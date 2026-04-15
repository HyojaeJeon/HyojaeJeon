import { gql } from '@apollo/client';

/**
 * 앱 기반 식사 주문 생성 — 10단계 프로세스 (정책 평가, split payment, GPS 검증 포함).
 * idempotencyKey 로 중복 주문을 방지한다.
 */
export const MEAL_ORDER_CREATE = gql`
  mutation MealOrderCreate($input: CreateMealOrderInput!) {
    mealOrderCreate(input: $input) {
      success {
        code
        data {
          id
          orderNo
          status
          orderType
          diningType
          totalAmountVnd
          companyShareVnd
          employeeShareVnd
          branchId
          brandHqId
          tableNo
          scheduledAt
          expiresAt
          items {
            id
            menuItemName
            quantity
            unitPriceVnd
            optionsJson
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
 * 주문 취소 — 취소 정책 평가 후 잔액 환불.
 * reason 은 선택(nullable)이며 사용자가 입력한 자유 텍스트.
 */
export const MEAL_ORDER_CANCEL = gql`
  mutation MealOrderCancel($id: ID!, $reason: String) {
    mealOrderCancel(id: $id, reason: $reason) {
      success {
        code
        data {
          id
          orderNo
          status
          cancelReason
          cancelledAt
          totalAmountVnd
          companyShareVnd
          employeeShareVnd
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
 * QR 테이블 체크인 — checkedInAt 시각 기록.
 * DINE_IN 주문에서 테이블 QR 스캔 후 호출한다.
 */
export const MEAL_ORDER_CHECKIN = gql`
  mutation MealOrderCheckin($id: ID!) {
    mealOrderCheckin(id: $id) {
      success {
        code
        data {
          id
          orderNo
          status
          checkedInAt
          tableNo
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
