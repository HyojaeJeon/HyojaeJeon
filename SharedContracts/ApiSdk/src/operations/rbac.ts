/**
 * RBAC GraphQL operations.
 *
 * Super Admin Portal UI 가 동적 권한 관리를 호출하는 단일 계약 면.
 * Role/Permission/Assignment CRUD 와 effective permissions 조회를 모두 노출한다.
 */
import type { GraphQLOperation } from '../types.js';

// ─────────── Queries

export const RbacListPermissionsDocument = /* GraphQL */ `
  query RbacListPermissions {
    rbacPermissions {
      success { code message requestId data {
        id
      permissionKey
      domain
      name
      nameKo
      nameEn
      description
      descriptionKo
      descriptionEn
      isSystem
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacListPermissions: GraphQLOperation<unknown, Record<string, never>> = {
  operationName: 'RbacListPermissions',
  document: RbacListPermissionsDocument,
};

export const RbacListRolesDocument = /* GraphQL */ `
  query RbacListRoles {
    rbacRoles {
      success { code message requestId data {
        id
      roleCode
      roleName
      nameKo
      nameEn
      scope
      hierarchyLevel
      isSystem
      description
      descriptionKo
      descriptionEn
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacListRoles: GraphQLOperation<unknown, Record<string, never>> = {
  operationName: 'RbacListRoles',
  document: RbacListRolesDocument,
};

export const RbacRolePermissionsDocument = /* GraphQL */ `
  query RbacRolePermissions($roleId: ID!) {
    rbacRolePermissions(roleId: $roleId) {
      success { code message requestId data {
        id
      permissionKey
      domain
      name
      nameKo
      nameEn
      description
      descriptionKo
      descriptionEn
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacRolePermissions: GraphQLOperation<unknown, { roleId: string }> = {
  operationName: 'RbacRolePermissions',
  document: RbacRolePermissionsDocument,
};

export const RbacEffectivePermissionsDocument = /* GraphQL */ `
  query RbacEffectivePermissions(
    $userType: String!
    $userId: ID!
    $brandHqId: ID
    $branchId: ID
    $corporateId: ID
  ) {
    rbacEffectivePermissions(
      userType: $userType
      userId: $userId
      brandHqId: $brandHqId
      branchId: $branchId
      corporateId: $corporateId
    ) {
      success { code message requestId data }
      error { code message requestId details }
    }
  }
`;
export const RbacEffectivePermissions: GraphQLOperation<
  unknown,
  {
    userType: string;
    userId: string;
    brandHqId?: string | null;
    branchId?: string | null;
    corporateId?: string | null;
  }
> = {
  operationName: 'RbacEffectivePermissions',
  document: RbacEffectivePermissionsDocument,
};

export const RbacUserAssignmentsDocument = /* GraphQL */ `
  query RbacUserAssignments($userType: String!, $userId: ID!) {
    rbacUserAssignments(userType: $userType, userId: $userId) {
      success { code message requestId data {
        id
      userType
      userId
      roleId
      status
      scopeBrandHqId
      scopeCorporateId
      scopeBranchId
      grantedAt
      grantedBy
      expiresAt
      revokedAt
      revokeReason
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacUserAssignments: GraphQLOperation<
  unknown,
  { userType: string; userId: string }
> = {
  operationName: 'RbacUserAssignments',
  document: RbacUserAssignmentsDocument,
};

// ─────────── Mutations — Role CRUD

const ROLE_SELECTION = /* GraphQL */ `
  id
  roleCode
  roleName
  nameKo
  nameEn
  scope
  hierarchyLevel
  isSystem
  description
  descriptionKo
  descriptionEn
`;

export interface RbacRoleInputShared {
  roleCode?: string;
  roleName?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  scope?: string | null;
  hierarchyLevel?: number | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export interface RbacCreateRoleInput {
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

export interface RbacUpdateRoleInput {
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

export const RbacCreateRoleDocument = /* GraphQL */ `
  mutation RbacCreateRole($input: CreateRoleInput!) {
    rbacCreateRole(input: $input) {
      success { code message requestId data {
        ${ROLE_SELECTION}
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacCreateRole: GraphQLOperation<unknown, { input: RbacCreateRoleInput }> = {
  operationName: 'RbacCreateRole',
  document: RbacCreateRoleDocument,
};

export const RbacUpdateRoleDocument = /* GraphQL */ `
  mutation RbacUpdateRole($input: UpdateRoleInput!) {
    rbacUpdateRole(input: $input) {
      success { code message requestId data {
        ${ROLE_SELECTION}
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacUpdateRole: GraphQLOperation<unknown, { input: RbacUpdateRoleInput }> = {
  operationName: 'RbacUpdateRole',
  document: RbacUpdateRoleDocument,
};

export const RbacDeleteRoleDocument = /* GraphQL */ `
  mutation RbacDeleteRole($roleId: ID!) {
    rbacDeleteRole(roleId: $roleId) {
      success { code message requestId data }
      error { code message requestId details }
    }
  }
`;
export const RbacDeleteRole: GraphQLOperation<unknown, { roleId: string }> = {
  operationName: 'RbacDeleteRole',
  document: RbacDeleteRoleDocument,
};

// ─────────── Mutations — Permission CRUD

const PERMISSION_SELECTION = /* GraphQL */ `
  id
  permissionKey
  domain
  name
  nameKo
  nameEn
  description
  descriptionKo
  descriptionEn
  isSystem
`;

export interface RbacCreatePermissionInput {
  permissionKey: string;
  domain: string;
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export interface RbacUpdatePermissionInput {
  permissionId: string;
  domain?: string | null;
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export const RbacCreatePermissionDocument = /* GraphQL */ `
  mutation RbacCreatePermission($input: CreatePermissionInput!) {
    rbacCreatePermission(input: $input) {
      success { code message requestId data {
        ${PERMISSION_SELECTION}
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacCreatePermission: GraphQLOperation<unknown, { input: RbacCreatePermissionInput }> = {
  operationName: 'RbacCreatePermission',
  document: RbacCreatePermissionDocument,
};

export const RbacUpdatePermissionDocument = /* GraphQL */ `
  mutation RbacUpdatePermission($input: UpdatePermissionInput!) {
    rbacUpdatePermission(input: $input) {
      success { code message requestId data {
        ${PERMISSION_SELECTION}
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacUpdatePermission: GraphQLOperation<unknown, { input: RbacUpdatePermissionInput }> = {
  operationName: 'RbacUpdatePermission',
  document: RbacUpdatePermissionDocument,
};

export const RbacDeletePermissionDocument = /* GraphQL */ `
  mutation RbacDeletePermission($permissionId: ID!) {
    rbacDeletePermission(permissionId: $permissionId) {
      success { code message requestId data }
      error { code message requestId details }
    }
  }
`;
export const RbacDeletePermission: GraphQLOperation<unknown, { permissionId: string }> = {
  operationName: 'RbacDeletePermission',
  document: RbacDeletePermissionDocument,
};

// ─────────── Mutations — Role ↔ Permission

export const RbacAddPermissionToRoleDocument = /* GraphQL */ `
  mutation RbacAddPermissionToRole($roleId: ID!, $permissionKey: String!) {
    rbacAddPermissionToRole(roleId: $roleId, permissionKey: $permissionKey) {
      success { code message requestId data }
      error { code message requestId details }
    }
  }
`;
export const RbacAddPermissionToRole: GraphQLOperation<
  unknown,
  { roleId: string; permissionKey: string }
> = {
  operationName: 'RbacAddPermissionToRole',
  document: RbacAddPermissionToRoleDocument,
};

export const RbacRemovePermissionFromRoleDocument = /* GraphQL */ `
  mutation RbacRemovePermissionFromRole($roleId: ID!, $permissionKey: String!) {
    rbacRemovePermissionFromRole(roleId: $roleId, permissionKey: $permissionKey) {
      success { code message requestId data }
      error { code message requestId details }
    }
  }
`;
export const RbacRemovePermissionFromRole: GraphQLOperation<
  unknown,
  { roleId: string; permissionKey: string }
> = {
  operationName: 'RbacRemovePermissionFromRole',
  document: RbacRemovePermissionFromRoleDocument,
};

// ─────────── Mutations — UserRoleAssignment

export const RbacAssignRoleDocument = /* GraphQL */ `
  mutation RbacAssignRole(
    $userType: String!
    $userId: ID!
    $roleCode: String!
    $scopeBrandHqId: ID
    $scopeCorporateId: ID
    $scopeBranchId: ID
    $expiresAt: DateTime
  ) {
    rbacAssignRole(
      userType: $userType
      userId: $userId
      roleCode: $roleCode
      scopeBrandHqId: $scopeBrandHqId
      scopeCorporateId: $scopeCorporateId
      scopeBranchId: $scopeBranchId
      expiresAt: $expiresAt
    ) {
      success { code message requestId data {
        id
      userType
      userId
      roleId
      status
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacAssignRole: GraphQLOperation<
  unknown,
  {
    userType: string;
    userId: string;
    roleCode: string;
    scopeBrandHqId?: string | null;
    scopeCorporateId?: string | null;
    scopeBranchId?: string | null;
    expiresAt?: string | null;
  }
> = { operationName: 'RbacAssignRole', document: RbacAssignRoleDocument };

export const RbacRevokeRoleAssignmentDocument = /* GraphQL */ `
  mutation RbacRevokeRoleAssignment($assignmentId: ID!, $reason: String!) {
    rbacRevokeRoleAssignment(assignmentId: $assignmentId, reason: $reason) {
      success { code message requestId data {
        id
      status
      revokedAt
      revokeReason
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacRevokeRoleAssignment: GraphQLOperation<
  unknown,
  { assignmentId: string; reason: string }
> = {
  operationName: 'RbacRevokeRoleAssignment',
  document: RbacRevokeRoleAssignmentDocument,
};
