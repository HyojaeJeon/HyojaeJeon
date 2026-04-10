import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const ADMINS_QUERY = gql`
  query CorporateAdmins($corporateId: ID!) {
    corporateAdmins(corporateId: $corporateId) {
      success {
        data {
          id
          loginId
          displayName
          email
          phone
          userType
          roleCode
          status
          lastLoginAt
          createdAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const ROLE_PERMISSION_MATRIX_QUERY = gql`
  query RolePermissionMatrix($scope: String!) {
    rbacRoles {
      success {
        data {
          id
          roleCode
          roleName
          description
          scope
        }
      }
      error {
        code
        message
      }
    }
    rbacRolePermissionsMatrix(scope: $scope) {
      success {
        data {
          roleId
          permissionId
        }
      }
      error {
        code
        message
      }
    }
    rbacPermissions {
      success {
        data {
          id
          permissionKey
          description
          scope
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

export const ADMIN_INVITE_MUTATION = gql`
  mutation InviteCorporateAdmin($input: InviteCorporateAdminInput!) {
    corporateAdminInvite(input: $input) {
      success {
        data {
          id
          loginId
          displayName
          email
          roleCode
          status
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

export const ADMIN_GRANT_ROLE_MUTATION = gql`
  mutation GrantAdminRole($adminId: ID!, $roleCode: String!, $corporateId: ID!) {
    corporateAdminGrantRole(adminId: $adminId, roleCode: $roleCode, corporateId: $corporateId) {
      success {
        data {
          id
          roleCode
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const ADMIN_SUSPEND_MUTATION = gql`
  mutation SuspendCorporateAdmin($adminId: ID!) {
    corporateAdminSuspend(adminId: $adminId) {
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

export const ADMIN_RESUME_MUTATION = gql`
  mutation ResumeCorporateAdmin($adminId: ID!) {
    corporateAdminResume(adminId: $adminId) {
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

export interface AdminRow {
  id: string;
  loginId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  userType: string;
  roleCode: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface RoleInfo {
  id: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  scope: string;
}

export interface PermissionInfo {
  id: string;
  permissionKey: string;
  description: string | null;
  scope: string;
}

export interface RolePermissionPair {
  roleId: string;
  permissionId: string;
}

export interface RolePermissionMatrix {
  roles: RoleInfo[];
  permissions: PermissionInfo[];
  assignments: RolePermissionPair[];
}

export interface AdminsData {
  corporateAdmins: {
    success: { data: AdminRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface RolePermissionMatrixData {
  rbacRoles: {
    success: { data: RoleInfo[] } | null;
    error: { code: string; message: string } | null;
  };
  rbacRolePermissionsMatrix: {
    success: { data: RolePermissionPair[] } | null;
    error: { code: string; message: string } | null;
  };
  rbacPermissions: {
    success: { data: PermissionInfo[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface AdminInviteData {
  corporateAdminInvite: {
    success: {
      data: {
        id: string;
        loginId: string;
        displayName: string;
        email: string | null;
        roleCode: string | null;
        status: string;
      };
    } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface AdminGrantRoleData {
  corporateAdminGrantRole: {
    success: { data: { id: string; roleCode: string } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface AdminSuspendData {
  corporateAdminSuspend: {
    success: { data: { id: string; status: string } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface AdminResumeData {
  corporateAdminResume: {
    success: { data: { id: string; status: string } } | null;
    error: { code: string; message: string } | null;
  };
}
