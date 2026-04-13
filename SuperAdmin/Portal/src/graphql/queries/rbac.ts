import { gql } from '@apollo/client';

export const RBAC_ROLES_QUERY = gql`
  query SettingsRbacRoles {
    rbacRoles {
      success {
        data {
          id roleCode roleName roleNameKo roleNameEn scope isSystem
          permissions permissionVersion
          description descriptionKo descriptionEn
        }
      }
      error { code message }
    }
  }
`;

export const RBAC_PERMISSION_CATALOG_QUERY = gql`
  query SettingsPermissionCatalog {
    permissionCatalog {
      success {
        data {
          categories {
            category
            label { ko en vi }
            permissions {
              key
              label { ko en vi }
            }
          }
          menuStructure {
            id
            labelKey
            icon
            categories
            children {
              id
              labelKey
              icon
              categories
              children {
                id
                labelKey
                icon
                categories
              }
            }
          }
        }
      }
      error { code message }
    }
  }
`;

export const RBAC_UPDATE_ROLE_PERMISSIONS_MUTATION = gql`
  mutation UpdateRolePermissions($roleId: ID!, $permissions: [String!]!) {
    updateRolePermissions(roleId: $roleId, permissions: $permissions) {
      success { data { id permissions permissionVersion } }
      error { code message }
    }
  }
`;

export const RBAC_CREATE_ROLE_MUTATION = gql`
  mutation RbacCreateRole($input: CreateRoleInput!) {
    rbacCreateRole(input: $input) {
      success { data { id roleCode roleName permissions permissionVersion } }
      error { code message }
    }
  }
`;

export const RBAC_DELETE_ROLE_MUTATION = gql`
  mutation RbacDeleteRole($roleId: ID!) {
    rbacDeleteRole(roleId: $roleId) {
      success { data }
      error { code message }
    }
  }
`;

export interface RbacRoleRow {
  id: string;
  roleCode: string;
  roleName: string;
  roleNameKo?: string | null;
  roleNameEn?: string | null;
  scope: string;
  isSystem: boolean;
  permissions: string[];
  permissionVersion: number;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export interface RbacRolesData {
  rbacRoles: {
    success: { data: RbacRoleRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface PermissionDef {
  key: string;
  label: { ko: string; en: string; vi: string };
}

export interface PermissionCategoryDef {
  category: string;
  label: { ko: string; en: string; vi: string };
  permissions: PermissionDef[];
}

export interface MenuPermissionNodeDef {
  id: string;
  labelKey: string;
  icon?: string;
  categories?: string[];
  children?: MenuPermissionNodeDef[];
}

export interface PermissionCatalogData {
  categories: PermissionCategoryDef[];
  menuStructure: MenuPermissionNodeDef[];
}

export interface PermissionCatalogQueryData {
  permissionCatalog: {
    success: { data: PermissionCatalogData } | null;
    error: { code: string; message: string } | null;
  };
}

/* ── Role CRUD ── */

export const RBAC_UPDATE_ROLE_MUTATION = gql`
  mutation RbacUpdateRole($input: UpdateRoleInput!) {
    rbacUpdateRole(input: $input) {
      success { data { id roleCode roleName permissions permissionVersion } }
      error { code message }
    }
  }
`;

export interface RbacCreateRoleData {
  rbacCreateRole: {
    success: { data: RbacRoleRow } | null;
    error: { code: string; message: string } | null;
  };
}

export interface RbacUpdateRoleData {
  rbacUpdateRole: {
    success: { data: RbacRoleRow } | null;
    error: { code: string; message: string } | null;
  };
}

export interface RbacDeleteRoleData {
  rbacDeleteRole: {
    success: { data: boolean } | null;
    error: { code: string; message: string } | null;
  };
}

/* ── User Assignments ── */

export const RBAC_USER_ASSIGNMENTS_QUERY = gql`
  query RbacUserAssignments($userType: String!, $userId: ID!) {
    rbacUserAssignments(userType: $userType, userId: $userId) {
      success {
        data {
          id
          userType
          userId
          roleId
          status
          grantedAt
          expiresAt
          scopeBrandHqId
          scopeCorporateId
          scopeBranchId
          grantedBy
        }
      }
      error { code message }
    }
  }
`;

export const RBAC_SUPERADMIN_USERS_QUERY = gql`
  query RbacSuperAdminUsers($userType: String) {
    authAccounts(userType: $userType) {
      success {
        data {
          id
          loginId
          displayName
          email
          status
        }
      }
      error { code message }
    }
  }
`;

export const RBAC_ASSIGN_ROLE_MUTATION = gql`
  mutation RbacAssignRole($userType: String!, $userId: ID!, $roleCode: String!) {
    rbacAssignRole(userType: $userType, userId: $userId, roleCode: $roleCode) {
      success { data { id userId roleId status } }
      error { code message }
    }
  }
`;

export const RBAC_UNASSIGN_ROLE_MUTATION = gql`
  mutation RbacUnassignRole($assignmentId: ID!, $reason: String!) {
    rbacRevokeRoleAssignment(assignmentId: $assignmentId, reason: $reason) {
      success { data { id status } }
      error { code message }
    }
  }
`;

export interface UserAssignmentRow {
  id: string;
  userType: string;
  userId: string;
  roleId: string;
  status: string;
  grantedAt: string;
  expiresAt: string | null;
  role: { id: string; roleCode: string; roleName: string };
}

export interface UserAssignmentsData {
  rbacUserAssignments: {
    success: { data: UserAssignmentRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface SuperAdminUserRow {
  id: string;
  loginId: string;
  displayName: string;
  email: string | null;
  status: string;
}

export interface SuperAdminUsersData {
  authAccounts: {
    success: { data: SuperAdminUserRow[] } | null;
    error: { code: string; message: string } | null;
  };
}
