import { gql } from '@apollo/client';

/**
 * [KO] 임직원 단건 조회 — ID 기반
 * [VI] Truy van chi tiet nhan vien theo ID
 */
export const MEAL_EMPLOYEE_QUERY = gql`
  query MealEmployee($id: ID!) {
    mealEmployee(id: $id) {
      data {
        id
        corporateId
        departmentId
        employeeCode
        fullName
        email
        phone
        badgeRfid
        status
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * [KO] 기업별 임직원 목록 조회 (페이지네이션)
 * [VI] Danh sach nhan vien theo doanh nghiep (phan trang)
 */
export const MEAL_EMPLOYEES_QUERY = gql`
  query MealEmployees($corporateId: ID!, $skip: Int, $take: Int) {
    mealEmployees(corporateId: $corporateId, skip: $skip, take: $take) {
      data {
        id
        corporateId
        departmentId
        employeeCode
        fullName
        email
        phone
        badgeRfid
        status
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;
