/**
 * RBAC GraphQL operations.
 *
 * Super Admin Portal UI 가 동적 권한 관리를 호출하는 단일 계약 면.
 * Role/Permission/Assignment CRUD 와 effective permissions 조회를 모두 노출한다.
 */
import type { GraphQLOperation } from '../types.js';
export declare const RbacListPermissionsDocument = "\n  query RbacListPermissions {\n    rbacPermissions {\n      success { code message requestId data {\n        id\n      permissionKey\n      domain\n      name\n      nameKo\n      nameEn\n      description\n      descriptionKo\n      descriptionEn\n      isSystem\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacListPermissions: GraphQLOperation<unknown, Record<string, never>>;
export declare const RbacListRolesDocument = "\n  query RbacListRoles {\n    rbacRoles {\n      success { code message requestId data {\n        id\n      roleCode\n      roleName\n      nameKo\n      nameEn\n      scope\n      hierarchyLevel\n      isSystem\n      description\n      descriptionKo\n      descriptionEn\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacListRoles: GraphQLOperation<unknown, Record<string, never>>;
export declare const RbacRolePermissionsDocument = "\n  query RbacRolePermissions($roleId: ID!) {\n    rbacRolePermissions(roleId: $roleId) {\n      success { code message requestId data {\n        id\n      permissionKey\n      domain\n      name\n      nameKo\n      nameEn\n      description\n      descriptionKo\n      descriptionEn\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacRolePermissions: GraphQLOperation<unknown, {
    roleId: string;
}>;
export declare const RbacEffectivePermissionsDocument = "\n  query RbacEffectivePermissions(\n    $userType: String!\n    $userId: ID!\n    $brandHqId: ID\n    $branchId: ID\n    $corporateId: ID\n  ) {\n    rbacEffectivePermissions(\n      userType: $userType\n      userId: $userId\n      brandHqId: $brandHqId\n      branchId: $branchId\n      corporateId: $corporateId\n    ) {\n      success { code message requestId data }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacEffectivePermissions: GraphQLOperation<unknown, {
    userType: string;
    userId: string;
    brandHqId?: string | null;
    branchId?: string | null;
    corporateId?: string | null;
}>;
export declare const RbacUserAssignmentsDocument = "\n  query RbacUserAssignments($userType: String!, $userId: ID!) {\n    rbacUserAssignments(userType: $userType, userId: $userId) {\n      success { code message requestId data {\n        id\n      userType\n      userId\n      roleId\n      status\n      scopeBrandHqId\n      scopeCorporateId\n      scopeBranchId\n      grantedAt\n      grantedBy\n      expiresAt\n      revokedAt\n      revokeReason\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacUserAssignments: GraphQLOperation<unknown, {
    userType: string;
    userId: string;
}>;
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
export declare const RbacCreateRoleDocument = "\n  mutation RbacCreateRole($input: CreateRoleInput!) {\n    rbacCreateRole(input: $input) {\n      success { code message requestId data {\n        \n  id\n  roleCode\n  roleName\n  nameKo\n  nameEn\n  scope\n  hierarchyLevel\n  isSystem\n  description\n  descriptionKo\n  descriptionEn\n\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacCreateRole: GraphQLOperation<unknown, {
    input: RbacCreateRoleInput;
}>;
export declare const RbacUpdateRoleDocument = "\n  mutation RbacUpdateRole($input: UpdateRoleInput!) {\n    rbacUpdateRole(input: $input) {\n      success { code message requestId data {\n        \n  id\n  roleCode\n  roleName\n  nameKo\n  nameEn\n  scope\n  hierarchyLevel\n  isSystem\n  description\n  descriptionKo\n  descriptionEn\n\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacUpdateRole: GraphQLOperation<unknown, {
    input: RbacUpdateRoleInput;
}>;
export declare const RbacDeleteRoleDocument = "\n  mutation RbacDeleteRole($roleId: ID!) {\n    rbacDeleteRole(roleId: $roleId) {\n      success { code message requestId data }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacDeleteRole: GraphQLOperation<unknown, {
    roleId: string;
}>;
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
export declare const RbacCreatePermissionDocument = "\n  mutation RbacCreatePermission($input: CreatePermissionInput!) {\n    rbacCreatePermission(input: $input) {\n      success { code message requestId data {\n        \n  id\n  permissionKey\n  domain\n  name\n  nameKo\n  nameEn\n  description\n  descriptionKo\n  descriptionEn\n  isSystem\n\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacCreatePermission: GraphQLOperation<unknown, {
    input: RbacCreatePermissionInput;
}>;
export declare const RbacUpdatePermissionDocument = "\n  mutation RbacUpdatePermission($input: UpdatePermissionInput!) {\n    rbacUpdatePermission(input: $input) {\n      success { code message requestId data {\n        \n  id\n  permissionKey\n  domain\n  name\n  nameKo\n  nameEn\n  description\n  descriptionKo\n  descriptionEn\n  isSystem\n\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacUpdatePermission: GraphQLOperation<unknown, {
    input: RbacUpdatePermissionInput;
}>;
export declare const RbacDeletePermissionDocument = "\n  mutation RbacDeletePermission($permissionId: ID!) {\n    rbacDeletePermission(permissionId: $permissionId) {\n      success { code message requestId data }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacDeletePermission: GraphQLOperation<unknown, {
    permissionId: string;
}>;
export declare const RbacAddPermissionToRoleDocument = "\n  mutation RbacAddPermissionToRole($roleId: ID!, $permissionKey: String!) {\n    rbacAddPermissionToRole(roleId: $roleId, permissionKey: $permissionKey) {\n      success { code message requestId data }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacAddPermissionToRole: GraphQLOperation<unknown, {
    roleId: string;
    permissionKey: string;
}>;
export declare const RbacRemovePermissionFromRoleDocument = "\n  mutation RbacRemovePermissionFromRole($roleId: ID!, $permissionKey: String!) {\n    rbacRemovePermissionFromRole(roleId: $roleId, permissionKey: $permissionKey) {\n      success { code message requestId data }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacRemovePermissionFromRole: GraphQLOperation<unknown, {
    roleId: string;
    permissionKey: string;
}>;
export declare const RbacAssignRoleDocument = "\n  mutation RbacAssignRole(\n    $userType: String!\n    $userId: ID!\n    $roleCode: String!\n    $scopeBrandHqId: ID\n    $scopeCorporateId: ID\n    $scopeBranchId: ID\n    $expiresAt: DateTime\n  ) {\n    rbacAssignRole(\n      userType: $userType\n      userId: $userId\n      roleCode: $roleCode\n      scopeBrandHqId: $scopeBrandHqId\n      scopeCorporateId: $scopeCorporateId\n      scopeBranchId: $scopeBranchId\n      expiresAt: $expiresAt\n    ) {\n      success { code message requestId data {\n        id\n      userType\n      userId\n      roleId\n      status\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacAssignRole: GraphQLOperation<unknown, {
    userType: string;
    userId: string;
    roleCode: string;
    scopeBrandHqId?: string | null;
    scopeCorporateId?: string | null;
    scopeBranchId?: string | null;
    expiresAt?: string | null;
}>;
export declare const RbacRevokeRoleAssignmentDocument = "\n  mutation RbacRevokeRoleAssignment($assignmentId: ID!, $reason: String!) {\n    rbacRevokeRoleAssignment(assignmentId: $assignmentId, reason: $reason) {\n      success { code message requestId data {\n        id\n      status\n      revokedAt\n      revokeReason\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacRevokeRoleAssignment: GraphQLOperation<unknown, {
    assignmentId: string;
    reason: string;
}>;
