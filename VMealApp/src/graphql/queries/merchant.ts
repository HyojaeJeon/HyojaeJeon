import { gql } from '@apollo/client';

/**
 * [KO] 전체 가맹점 등록 목록 조회 (페이지네이션)
 * [VI] Danh sach enrollment merchant (phan trang)
 */
export const MEAL_MERCHANT_ENROLLMENTS_QUERY = gql`
  query MealMerchantEnrollments($skip: Int, $take: Int) {
    mealMerchantEnrollments(skip: $skip, take: $take) {
      data {
        id
        brandHqId
        brandName
        isActive
        loopType
        enrolledAt
        contractEndsAt
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

/**
 * [KO] 특정 BrandHQ의 가맹점 등록 정보 단건 조회
 * [VI] Truy van enrollment cua BrandHQ cu the
 */
export const MEAL_MERCHANT_ENROLLMENT_QUERY = gql`
  query MealMerchantEnrollment($brandHqId: ID!) {
    mealMerchantEnrollment(brandHqId: $brandHqId) {
      data {
        id
        brandHqId
        brandName
        isActive
        loopType
        enrolledAt
        contractEndsAt
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * [KO] 직원의 활성 가맹점 구독 목록 조회
 * [VI] Danh sach dang ky dang hoat dong cua nhan vien
 */
export const MEAL_MERCHANT_SUBSCRIPTIONS_QUERY = gql`
  query MealMerchantSubscriptions($employeeId: ID!) {
    mealMerchantSubscriptions(employeeId: $employeeId) {
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
      totalCount
    }
  }
`;
