import { gql } from '@apollo/client';

/* ─────────────────────────── Licenses ─────────────────────────── */

export const LICENSE_LIST_QUERY = gql`
  query LicenseList($skip: Int!, $take: Int!) {
    licenses(skip: $skip, take: $take) {
      success {
        data {
          id
          licenseCode
          licenseType
          status
          scopeType
          scopeId
          effectiveFrom
          effectiveTo
        }
      }
      error { code message }
    }
  }
`;

export interface LicenseListRow {
  id: string;
  licenseCode: string;
  licenseType: string;
  status: string;
  scopeType: string;
  scopeId: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface LicenseListData {
  licenses: { success: { data: LicenseListRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── Platform Policies ─────────────────────────── */

export const PLATFORM_POLICY_LIST_QUERY = gql`
  query PlatformPolicyList($scopeType: String!, $scopeId: ID, $skip: Int!, $take: Int!) {
    policies(scopeType: $scopeType, scopeId: $scopeId, skip: $skip, take: $take) {
      success {
        data {
          id
          policyKey
          scopeType
          scopeId
          isActive
          version
          updatedAt
        }
      }
      error { code message }
    }
  }
`;

export interface PlatformPolicyRow {
  id: string;
  policyKey: string;
  scopeType: string;
  scopeId: string | null;
  isActive: boolean;
  version: number;
  updatedAt: string;
}

export interface PlatformPolicyListData {
  policies: { success: { data: PlatformPolicyRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── License Detail ─────────────────────────── */

export const LICENSE_DETAIL_QUERY = gql`
  query LicenseDetail($id: ID!) {
    license(id: $id) {
      success {
        data {
          id
          licenseCode
          licenseType
          status
          scopeType
          scopeId
          effectiveFrom
          effectiveTo
          allowedCountryCode
          licensePayloadJson
          createdAt
          updatedAt
        }
      }
      error { code message }
    }
  }
`;

export interface LicenseDetailRow {
  id: string;
  licenseCode: string;
  licenseType: string;
  status: string;
  scopeType: string;
  scopeId: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  allowedCountryCode: string | null;
  licensePayloadJson: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseDetailData {
  license: { success: { data: LicenseDetailRow } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── Sync Monitor ─────────────────────────── */

export const SYNC_EVENTS_QUERY = gql`
  query SyncEvents($first: Int!, $after: String) {
    syncEventConnection(first: $first, after: $after) {
      success {
        data {
          edges {
            cursor
            node {
              id
              eventType
              edgePosId
              createdAt
              requestId
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
      error { code message }
    }
  }
`;

export interface SyncEventRow {
  id: string;
  eventType: string;
  edgePosId: string | null;
  createdAt: string;
  requestId: string | null;
}

export interface SyncEventsData {
  syncEventConnection: {
    success: {
      data: {
        edges: Array<{ cursor: string; node: SyncEventRow }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

/* ─────────────────────────── RBAC Roles ─────────────────────────── */

export const RBAC_ROLES_QUERY = gql`
  query RbacRoles {
    rbacRoles {
      success {
        data {
          id
          roleCode
          roleName
          scope
          hierarchyLevel
          description
        }
      }
      error { code message }
    }
  }
`;

export interface RoleRow {
  id: string;
  roleCode: string;
  roleName: string;
  nameKo?: string | null;
  nameEn?: string | null;
  scope: string;
  hierarchyLevel: number;
  description: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
  isSystem?: boolean;
}

export interface RbacRolesData {
  rbacRoles: { success: { data: RoleRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── RBAC Permissions ─────────────────────────── */

export const RBAC_PERMISSIONS_QUERY = gql`
  query RbacPermissions {
    rbacPermissions {
      success {
        data {
          id
          permissionKey
          description
          domain
          isSystem
        }
      }
      error { code message }
    }
  }
`;

export interface PermissionRow {
  id: string;
  permissionKey: string;
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  description: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
  domain: string | null;
  isSystem: boolean;
}

export interface RbacPermissionsData {
  rbacPermissions: { success: { data: PermissionRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── Role Detail (1P1Q) ─────────────────────────── */

export const ROLE_DETAIL_QUERY = gql`
  query RoleDetail($roleId: ID!) {
    rbacRoles {
      success {
        data { id roleCode roleName scope hierarchyLevel description }
      }
    }
    rbacPermissions {
      success {
        data { id permissionKey description domain isSystem }
      }
    }
    rbacRolePermissions(roleId: $roleId) {
      success {
        data { id permissionKey description domain }
      }
    }
  }
`;

export interface RoleDetailData {
  rbacRoles: { success: { data: RoleRow[] } | null };
  rbacPermissions: { success: { data: PermissionRow[] } | null };
  rbacRolePermissions: { success: { data: PermissionRow[] } | null };
}

export const RBAC_ADD_PERMISSION_MUTATION = gql`
  mutation RbacAddPermissionToRole($roleId: ID!, $permissionKey: String!) {
    rbacAddPermissionToRole(roleId: $roleId, permissionKey: $permissionKey) {
      success { data }
      error { code message }
    }
  }
`;

export const RBAC_REMOVE_PERMISSION_MUTATION = gql`
  mutation RbacRemovePermissionFromRole($roleId: ID!, $permissionKey: String!) {
    rbacRemovePermissionFromRole(roleId: $roleId, permissionKey: $permissionKey) {
      success { data }
      error { code message }
    }
  }
`;

/* ─────────── Role / Permission CRUD (Slice B input 시그니처 기반) ─────────── */

export const RBAC_CREATE_ROLE_MUTATION = gql`
  mutation RbacCreateRole($input: CreateRoleInput!) {
    rbacCreateRole(input: $input) {
      success { data { id roleCode roleName nameKo nameEn scope hierarchyLevel description descriptionKo descriptionEn isSystem } }
      error { code message }
    }
  }
`;

export const RBAC_UPDATE_ROLE_MUTATION = gql`
  mutation RbacUpdateRole($input: UpdateRoleInput!) {
    rbacUpdateRole(input: $input) {
      success { data { id roleCode roleName nameKo nameEn scope hierarchyLevel description descriptionKo descriptionEn isSystem } }
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

export const RBAC_CREATE_PERMISSION_MUTATION = gql`
  mutation RbacCreatePermission($input: CreatePermissionInput!) {
    rbacCreatePermission(input: $input) {
      success { data { id permissionKey domain name nameKo nameEn description descriptionKo descriptionEn isSystem } }
      error { code message }
    }
  }
`;

export const RBAC_UPDATE_PERMISSION_MUTATION = gql`
  mutation RbacUpdatePermission($input: UpdatePermissionInput!) {
    rbacUpdatePermission(input: $input) {
      success { data { id permissionKey domain name nameKo nameEn description descriptionKo descriptionEn isSystem } }
      error { code message }
    }
  }
`;

export const RBAC_DELETE_PERMISSION_MUTATION = gql`
  mutation RbacDeletePermission($permissionId: ID!) {
    rbacDeletePermission(permissionId: $permissionId) {
      success { data }
      error { code message }
    }
  }
`;

export interface CreateRoleInput {
  roleCode: string;
  roleName: string;
  scope: string;
  nameKo?: string | null;
  nameEn?: string | null;
  hierarchyLevel?: number | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export interface UpdateRoleInput {
  roleId: string;
  roleName?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  scope?: string | null;
  hierarchyLevel?: number | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export interface CreatePermissionInput {
  permissionKey: string;
  domain: string;
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export interface UpdatePermissionInput {
  permissionId: string;
  domain?: string | null;
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

/* ─────────────────────────── RBAC Assignments (1P1Q) ─────────────────────────── */

export const RBAC_ASSIGNMENTS_QUERY = gql`
  query RbacAssignments($userType: String, $userId: ID, $hasSelection: Boolean!) {
    authAccounts(skip: 0, take: 50) {
      success {
        data { id loginId displayName userType status }
      }
    }
    rbacRoles {
      success {
        data { id roleCode roleName scope hierarchyLevel description }
      }
    }
    rbacUserAssignments(userType: $userType, userId: $userId) @include(if: $hasSelection) {
      success {
        data {
          id
          roleCode
          scopeDistributorId
          scopeBrandHqId
          scopeBranchId
          scopeCorporateId
          expiresAt
          createdAt
        }
      }
      error { code message }
    }
  }
`;

export interface RbacAssignmentsBootstrapData {
  authAccounts: { success: { data: AuthAccountRow[] } | null };
  rbacRoles: { success: { data: RoleRow[] } | null };
  rbacUserAssignments?: {
    success: { data: AssignmentRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface AssignmentRow {
  id: string;
  roleCode: string;
  scopeDistributorId: string | null;
  scopeBrandHqId: string | null;
  scopeBranchId: string | null;
  scopeCorporateId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface RbacUserAssignmentsData {
  rbacUserAssignments: {
    success: { data: AssignmentRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export const RBAC_ASSIGN_ROLE_MUTATION = gql`
  mutation RbacAssignRole(
    $userType: String!
    $userId: ID!
    $roleCode: String!
    $scopeDistributorId: ID
    $scopeBrandHqId: ID
    $scopeBranchId: ID
    $scopeCorporateId: ID
    $expiresAt: DateTime
  ) {
    rbacAssignRole(
      userType: $userType
      userId: $userId
      roleCode: $roleCode
      scopeDistributorId: $scopeDistributorId
      scopeBrandHqId: $scopeBrandHqId
      scopeBranchId: $scopeBranchId
      scopeCorporateId: $scopeCorporateId
      expiresAt: $expiresAt
    ) {
      success { data { id } }
      error { code message }
    }
  }
`;

export const RBAC_REVOKE_ROLE_MUTATION = gql`
  mutation RbacRevokeRoleAssignment($assignmentId: ID!, $reason: String!) {
    rbacRevokeRoleAssignment(assignmentId: $assignmentId, reason: $reason) {
      success { data }
      error { code message }
    }
  }
`;

/* ─────────────────────────── Auth Accounts ─────────────────────────── */

export const AUTH_ACCOUNTS_QUERY = gql`
  query AuthAccounts($skip: Int!, $take: Int!) {
    authAccounts(skip: $skip, take: $take) {
      success {
        data {
          id
          loginId
          displayName
          userType
          status
        }
      }
      error { code message }
    }
  }
`;

export interface AuthAccountRow {
  id: string;
  loginId: string;
  displayName: string;
  userType: string;
  status: string;
}

export interface AuthAccountsData {
  authAccounts: { success: { data: AuthAccountRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── Tenant User Management (SA-TENANT-USER-001) ─────────────────────────── */

/**
 * 한국어: 1P1Q 탭 규칙 — TenantUserScreen 은 탭이 있으므로 탭 단위 operation 을 쓴다.
 *   - TenantUserScreenBootstrap: 페이지 진입 시 1회. platform/scope 선택기 공유 옵션.
 *   - TenantUserScreenRoles: Roles 탭 (rbacRoles only)
 *   - TenantUserScreenMatrix: Matrix 탭 (rbacRoles + rbacPermissions + rbacRolePermissionsMatrix)
 *   - TenantUserScreenUsers: Users 탭 (authAccounts only)
 * Tiếng Việt: Quy tắc 1P1Q theo tab — mỗi tab một operation.
 */

/* ─── Bootstrap (페이지 진입 시 1회: platform/scope 선택기 옵션) ─── */
export const TENANT_USER_SCREEN_BOOTSTRAP_QUERY = gql`
  query TenantUserScreenBootstrap {
    distributors(skip: 0, take: 200) {
      success { data { id companyName distributorCode } }
      error { code message }
    }
    brands(skip: 0, take: 200) {
      success { data { id brandName brandCode } }
      error { code message }
    }
    mealCorporates(skip: 0, take: 200) {
      success { data { id companyName tenantCode } }
      error { code message }
    }
  }
`;

export interface TenantUserScreenBootstrapData {
  distributors: { success: { data: Array<{ id: string; companyName: string; distributorCode: string }> } | null; error: { code: string; message: string } | null };
  brands: { success: { data: Array<{ id: string; brandName: string; brandCode: string }> } | null; error: { code: string; message: string } | null };
  mealCorporates: { success: { data: Array<{ id: string; companyName: string; tenantCode: string }> } | null; error: { code: string; message: string } | null };
}

/* ─── Roles 탭 ─── */
export const TENANT_USER_SCREEN_ROLES_QUERY = gql`
  query TenantUserScreenRoles {
    rbacRoles {
      success { data { id roleCode roleName nameKo nameEn scope hierarchyLevel description descriptionKo descriptionEn isSystem } }
      error { code message }
    }
  }
`;

export interface TenantUserScreenRolesData {
  rbacRoles: { success: { data: RoleRow[] } | null; error: { code: string; message: string } | null };
}

/* ─── Matrix 탭 ─── */
export const TENANT_USER_SCREEN_MATRIX_QUERY = gql`
  query TenantUserScreenMatrix($scope: String!) {
    rbacRoles {
      success { data { id roleCode roleName nameKo nameEn scope hierarchyLevel description descriptionKo descriptionEn isSystem } }
      error { code message }
    }
    rbacPermissions {
      success { data { id permissionKey domain name nameKo nameEn description descriptionKo descriptionEn isSystem } }
      error { code message }
    }
    rbacRolePermissionsMatrix(scope: $scope) {
      success { data { roleId permissionId } }
      error { code message }
    }
  }
`;

export interface TenantUserScreenMatrixData {
  rbacRoles: { success: { data: RoleRow[] } | null; error: { code: string; message: string } | null };
  rbacPermissions: { success: { data: PermissionRow[] } | null; error: { code: string; message: string } | null };
  rbacRolePermissionsMatrix: { success: { data: RolePermissionPair[] } | null; error: { code: string; message: string } | null };
}

/* ─── Users 탭 ─── */
export const TENANT_USER_SCREEN_USERS_QUERY = gql`
  query TenantUserScreenUsers($userType: String, $skip: Int!, $take: Int!) {
    authAccounts(userType: $userType, skip: $skip, take: $take) {
      success {
        data {
          id
          loginId
          displayName
          email
          userType
          status
          distributorId
          brandHQId
          corporateId
        }
      }
      error { code message }
    }
  }
`;

export interface TenantUserAccountRow {
  id: string;
  loginId: string;
  displayName: string;
  email?: string | null;
  userType: string;
  status: string;
  distributorId: string | null;
  brandHQId: string | null;
  corporateId: string | null;
}

export interface TenantUserScreenUsersData {
  authAccounts: {
    success: { data: TenantUserAccountRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export const SUSPEND_AUTH_ACCOUNT_MUTATION = gql`
  mutation SuspendAuthAccount($userType: String!, $id: ID!, $nextStatus: String!, $reason: String) {
    suspendAuthAccount(userType: $userType, id: $id, nextStatus: $nextStatus, reason: $reason) {
      success { data { id status } }
      error { code message }
    }
  }
`;

export const RESET_AUTH_ACCOUNT_PASSWORD_MUTATION = gql`
  mutation ResetAuthAccountPassword($userType: String!, $id: ID!, $newPassword: String!) {
    resetAuthAccountPassword(userType: $userType, id: $id, newPassword: $newPassword) {
      success { data }
      error { code message }
    }
  }
`;

export const CREATE_AUTH_ACCOUNT_MUTATION = gql`
  mutation CreateAuthAccount($input: CreateAuthAccountInput!) {
    createAuthAccount(input: $input) {
      success { data { id loginId displayName userType status } }
      error { code message }
    }
  }
`;

export const DELETE_AUTH_ACCOUNT_MUTATION = gql`
  mutation DeleteAuthAccount($userType: String!, $id: ID!) {
    deleteAuthAccount(userType: $userType, id: $id) {
      success { data }
      error { code message }
    }
  }
`;

export const UPDATE_AUTH_ACCOUNT_MUTATION = gql`
  mutation UpdateAuthAccount($userType: String!, $id: ID!, $input: UpdateAuthAccountInput!) {
    updateAuthAccount(userType: $userType, id: $id, input: $input) {
      success { data { id loginId displayName status } }
      error { code message }
    }
  }
`;

export interface RolePermissionPair {
  roleId: string;
  permissionId: string;
}

/* ─────────── RBAC user assignments lazy (detail modal 진입 시) ─────────── */

export const RBAC_USER_ASSIGNMENTS_LAZY_QUERY = gql`
  query RbacUserAssignmentsLazy($userType: String!, $userId: ID!) {
    rbacUserAssignments(userType: $userType, userId: $userId) {
      success {
        data {
          id
          roleCode
          scopeDistributorId
          scopeBrandHqId
          scopeBranchId
          scopeCorporateId
          expiresAt
          createdAt
        }
      }
      error { code message }
    }
  }
`;
