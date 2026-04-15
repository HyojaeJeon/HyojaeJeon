import { gql } from '@apollo/client';

/**
 * [KO] 기업별 정책 목록 조회
 * [VI] Danh sach chinh sach theo doanh nghiep
 */
export const MEAL_POLICIES_BY_CORPORATE_QUERY = gql`
  query MealPoliciesByCorporate($corporateId: ID!) {
    mealPoliciesByCorporate(corporateId: $corporateId) {
      data {
        id
        corporateId
        policyCode
        policyName
        appliesToDepartmentIds
        appliesToRoleCodes
        maxPerTransactionVnd
        dailyLimitVnd
        allowSplitPayment
        status
        effectiveFrom
        effectiveTo
        allowedDayOfWeek
        allowedTimeStart
        allowedTimeEnd
        allowedMealTypes
        merchantCategoryRestrictions
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

/**
 * [KO] 정책 단건 조회 — ID 기반
 * [VI] Truy van mot chinh sach theo ID
 */
export const MEAL_POLICY_QUERY = gql`
  query MealPolicy($id: ID!) {
    mealPolicy(id: $id) {
      data {
        id
        corporateId
        policyCode
        policyName
        appliesToDepartmentIds
        appliesToRoleCodes
        maxPerTransactionVnd
        dailyLimitVnd
        allowSplitPayment
        status
        effectiveFrom
        effectiveTo
        allowedDayOfWeek
        allowedTimeStart
        allowedTimeEnd
        allowedMealTypes
        merchantCategoryRestrictions
        createdAt
        updatedAt
      }
    }
  }
`;
