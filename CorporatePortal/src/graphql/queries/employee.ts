import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const EMPLOYEES_QUERY = gql`
  query Employees($corporateId: ID!, $skip: Int!, $take: Int!, $filter: MealEmployeeFilter) {
    mealEmployees(corporateId: $corporateId, skip: $skip, take: $take, filter: $filter) {
      success {
        data {
          id
          employeeCode
          fullName
          email
          phone
          departmentId
          departmentName
          employmentType
          walletStatus
          badgeRfid
          isExternalSync
          status
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const EMPLOYEE_DETAIL_QUERY = gql`
  query EmployeeDetail($id: ID!) {
    mealEmployee(id: $id) {
      success {
        data {
          id
          employeeCode
          fullName
          email
          phone
          departmentId
          departmentName
          employmentType
          walletStatus
          badgeRfid
          isExternalSync
          status
          createdAt
          updatedAt
          wallet {
            id
            balanceVnd
            companyAllowanceVnd
            personalTopUpVnd
            dailyLimitVnd
            status
          }
          fundingEntries {
            id
            amountVnd
            sourceType
            memo
            createdAt
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

/* ─────────────────────────── Mutations ─────────────────────────── */

export const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($input: CreateMealEmployeeInput!) {
    mealEmployeeCreate(input: $input) {
      success {
        data {
          id
          employeeCode
          fullName
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

export const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($id: ID!, $input: UpdateMealEmployeeInput!) {
    mealEmployeeUpdate(id: $id, input: $input) {
      success {
        data {
          id
          employeeCode
          fullName
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

export const ASSIGN_BADGE_MUTATION = gql`
  mutation AssignBadge($employeeId: ID!, $badgeRfid: String!) {
    mealEmployeeAssignBadge(employeeId: $employeeId, badgeRfid: $badgeRfid) {
      success {
        data {
          id
          badgeRfid
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const TERMINATE_EMPLOYEE_MUTATION = gql`
  mutation TerminateEmployee($id: ID!) {
    mealEmployeeTerminate(id: $id) {
      success {
        data {
          id
          status
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface EmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  departmentId: string | null;
  departmentName: string | null;
  employmentType: string | null;
  walletStatus: string | null;
  badgeRfid: string | null;
  isExternalSync: boolean;
  status: string;
}

export interface EmployeeWallet {
  id: string;
  balanceVnd: string;
  companyAllowanceVnd: string;
  personalTopUpVnd: string;
  dailyLimitVnd: string | null;
  status: string;
}

export interface EmployeeFundingEntry {
  id: string;
  amountVnd: string;
  sourceType: string;
  memo: string | null;
  createdAt: string;
}

export interface EmployeeDetail extends EmployeeRow {
  createdAt: string;
  updatedAt: string;
  wallet: EmployeeWallet | null;
  fundingEntries: EmployeeFundingEntry[];
}

export interface EmployeesData {
  mealEmployees: {
    success: { data: EmployeeRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface EmployeeDetailData {
  mealEmployee: {
    success: { data: EmployeeDetail } | null;
    error: { code: string; message: string } | null;
  };
}

export interface CreateEmployeeData {
  mealEmployeeCreate: {
    success: { data: { id: string; employeeCode: string; fullName: string } } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface UpdateEmployeeData {
  mealEmployeeUpdate: {
    success: { data: { id: string; employeeCode: string; fullName: string } } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface AssignBadgeData {
  mealEmployeeAssignBadge: {
    success: { data: { id: string; badgeRfid: string } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface TerminateEmployeeData {
  mealEmployeeTerminate: {
    success: { data: { id: string; status: string } } | null;
    error: { code: string; message: string } | null;
  };
}
