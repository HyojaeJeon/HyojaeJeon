import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success {
        data {
          accessToken
          user {
            id
            loginId
            displayName
            userType
            corporateId
          }
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const MEAL_EMPLOYEE_LOGIN = gql`
  mutation MealEmployeeLogin($phone: String!, $corporateId: ID!) {
    mealEmployeeLogin(phone: $phone, corporateId: $corporateId) {
      success {
        data {
          accessToken
          employee {
            id
            employeeCode
            fullName
            phone
            corporateId
          }
          wallet {
            id
            balanceVnd
            companyAllowanceVnd
            personalTopUpVnd
            dailyLimitVnd
            status
          }
        }
      }
      error {
        code
        message
      }
    }
  }
`;
