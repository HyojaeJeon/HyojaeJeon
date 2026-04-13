import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const DEPARTMENTS_QUERY = gql`
  query Departments($corporateId: ID!) {
    mealDepartments(corporateId: $corporateId) {
      success {
        data {
          id
          corporateId
          departmentCode
          departmentName
          parentDepartmentId
          parentDepartmentName
          employeeCount
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

export const DEPARTMENT_DETAIL_QUERY = gql`
  query DepartmentDetail($id: ID!) {
    mealDepartment(id: $id) {
      success {
        data {
          id
          corporateId
          departmentCode
          departmentName
          parentDepartmentId
          parentDepartmentName
          employeeCount
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

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: CreateMealDepartmentInput!) {
    mealDepartmentCreate(input: $input) {
      success {
        data {
          id
          departmentCode
          departmentName
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

export const UPDATE_DEPARTMENT_MUTATION = gql`
  mutation UpdateDepartment($id: ID!, $input: UpdateMealDepartmentInput!) {
    mealDepartmentUpdate(id: $id, input: $input) {
      success {
        data {
          id
          departmentCode
          departmentName
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

export const DEACTIVATE_DEPARTMENT_MUTATION = gql`
  mutation DeactivateDepartment($id: ID!) {
    mealDepartmentDeactivate(id: $id) {
      success {
        data {
          id
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

export interface DepartmentRow {
  id: string;
  corporateId: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId: string | null;
  parentDepartmentName: string | null;
  employeeCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsData {
  mealDepartments: {
    success: { data: DepartmentRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface DepartmentDetailData {
  mealDepartment: {
    success: { data: DepartmentRow } | null;
    error: { code: string; message: string } | null;
  };
}

export interface CreateDepartmentData {
  mealDepartmentCreate: {
    success: { data: { id: string; departmentCode: string; departmentName: string } } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface UpdateDepartmentData {
  mealDepartmentUpdate: {
    success: { data: { id: string; departmentCode: string; departmentName: string } } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface DeactivateDepartmentData {
  mealDepartmentDeactivate: {
    success: { data: { id: string } } | null;
    error: { code: string; message: string } | null;
  };
}
