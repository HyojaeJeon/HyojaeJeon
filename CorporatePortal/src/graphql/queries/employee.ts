import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const EMPLOYEES_QUERY = gql`
  query Employees($corporateId: ID!, $skip: Int! = 0, $take: Int! = 20) {
    mealEmployees(corporateId: $corporateId, skip: $skip, take: $take) {
      success {
        data {
          id
          employeeCode
          fullName
          email
          phone
          departmentId
          badgeRfid
          status
          corporateId
          createdAt
          updatedAt
        }
        totalCount
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
          badgeRfid
          status
          corporateId
          createdAt
          updatedAt
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
  mutation UpdateEmployee($id: ID!, $fullName: String, $email: String, $phone: String, $departmentId: String) {
    mealEmployeeUpdate(id: $id, fullName: $fullName, email: $email, phone: $phone, departmentId: $departmentId) {
      success {
        data {
          id
          employeeCode
          fullName
          email
          phone
          departmentId
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

export const SUSPEND_EMPLOYEE_MUTATION = gql`
  mutation SuspendEmployee($id: ID!) {
    mealEmployeeSuspend(id: $id) {
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
  badgeRfid: string | null;
  status: string;
  corporateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDetail extends EmployeeRow {}

export interface EmployeesData {
  mealEmployees: {
    success: { data: EmployeeRow[]; totalCount?: number | null } | null;
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
