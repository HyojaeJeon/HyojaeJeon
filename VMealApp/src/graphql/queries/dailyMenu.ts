import { gql } from '@apollo/client';

/**
 * [KO] 지점별 일일 메뉴 목록 조회 (날짜 + 식사유형 필터)
 * [VI] Danh sach thuc don hang ngay theo chi nhanh (loc ngay + loai bua an)
 */
export const MEAL_DAILY_MENUS_QUERY = gql`
  query MealDailyMenus($branchId: ID!, $date: DateTime, $mealType: String) {
    mealDailyMenus(branchId: $branchId, date: $date, mealType: $mealType) {
      data {
        id
        branchId
        date
        mealType
        status
        items {
          id
          dailyMenuId
          name
          priceVnd
          imageUrl
          calories
          sortOrder
          createdAt
        }
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

/**
 * [KO] 일일 메뉴 단건 조회 — ID 기반 (항목 포함)
 * [VI] Truy van mot thuc don hang ngay theo ID (bao gom cac muc)
 */
export const MEAL_DAILY_MENU_QUERY = gql`
  query MealDailyMenu($id: ID!) {
    mealDailyMenu(id: $id) {
      data {
        id
        branchId
        date
        mealType
        status
        items {
          id
          dailyMenuId
          name
          priceVnd
          imageUrl
          calories
          sortOrder
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * [KO] 직원이 구독한 가맹점의 일일 메뉴 조회
 * [VI] Truy van thuc don hang ngay cua cac cua hang nhan vien da dang ky
 */
export const MEAL_DAILY_MENUS_FOR_SUBSCRIBED_QUERY = gql`
  query MealDailyMenusForSubscribed($employeeId: ID!, $date: DateTime) {
    mealDailyMenusForSubscribed(employeeId: $employeeId, date: $date) {
      data {
        id
        branchId
        date
        mealType
        status
        items {
          id
          dailyMenuId
          name
          priceVnd
          imageUrl
          calories
          sortOrder
          createdAt
        }
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

/**
 * [KO] 지갑별 사전 주문 목록 조회 (페이지네이션)
 * [VI] Danh sach don dat truoc theo vi (phan trang)
 */
export const MEAL_PRE_ORDERS_BY_WALLET_QUERY = gql`
  query MealPreOrdersByWallet($walletId: ID!, $skip: Int, $take: Int) {
    mealPreOrdersByWallet(walletId: $walletId, skip: $skip, take: $take) {
      data {
        id
        walletId
        corporateId
        branchId
        dailyMenuId
        mealType
        pickupSlot
        status
        totalAmountVnd
        companyShareVnd
        employeeShareVnd
        idempotencyKey
        items {
          id
          preOrderId
          dailyMenuItemId
          quantity
          createdAt
        }
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;
