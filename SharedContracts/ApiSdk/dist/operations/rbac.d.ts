/**
 * RBAC GraphQL operations.
 *
 * Super Admin Portal UI 가 동적 권한 관리를 호출하는 단일 계약 면.
 * Role/Permission/Assignment CRUD 와 effective permissions 조회를 모두 노출한다.
 */
import type { GraphQLOperation } from '../types.js';
export declare const RbacListPermissionsDocument = "\n  query RbacListPermissions {\n    rbacPermissions {\n      success { code message requestId data {\n        id\n      permissionKey\n      domain\n      description\n      isSystem\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacListPermissions: GraphQLOperation<unknown, Record<string, never>>;
export declare const RbacListRolesDocument = "\n  query RbacListRoles {\n    rbacRoles {\n      success { code message requestId data {\n        id\n      roleCode\n      roleName\n      scope\n      hierarchyLevel\n      isSystem\n      description\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacListRoles: GraphQLOperation<unknown, Record<string, never>>;
export declare const RbacRolePermissionsDocument = "\n  query RbacRolePermissions($roleId: ID!) {\n    rbacRolePermissions(roleId: $roleId) {\n      success { code message requestId data {\n        id\n      permissionKey\n      domain\n      description\n      } }\n      error { code message requestId details }\n    }\n  }\n";
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
export declare const RbacCreateRoleDocument = "\n  mutation RbacCreateRole(\n    $roleCode: String!\n    $roleName: String!\n    $scope: String!\n    $hierarchyLevel: Int\n    $description: String\n  ) {\n    rbacCreateRole(\n      roleCode: $roleCode\n      roleName: $roleName\n      scope: $scope\n      hierarchyLevel: $hierarchyLevel\n      description: $description\n    ) {\n      success { code message requestId data {\n        id\n      roleCode\n      roleName\n      scope\n      hierarchyLevel\n      isSystem\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacCreateRole: GraphQLOperation<unknown, {
    roleCode: string;
    roleName: string;
    scope: string;
    hierarchyLevel?: number | null;
    description?: string | null;
}>;
export declare const RbacUpdateRoleDocument = "\n  mutation RbacUpdateRole(\n    $id: ID!\n    $roleName: String\n    $scope: String\n    $hierarchyLevel: Int\n    $description: String\n  ) {\n    rbacUpdateRole(\n      id: $id\n      roleName: $roleName\n      scope: $scope\n      hierarchyLevel: $hierarchyLevel\n      description: $description\n    ) {\n      success { code message requestId data {\n        id\n      roleCode\n      roleName\n      scope\n      hierarchyLevel\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacUpdateRole: GraphQLOperation<unknown, {
    id: string;
    roleName?: string | null;
    scope?: string | null;
    hierarchyLevel?: number | null;
    description?: string | null;
}>;
export declare const RbacDeleteRoleDocument = "\n  mutation RbacDeleteRole($id: ID!) {\n    rbacDeleteRole(id: $id) {\n      success { code message requestId data }\n      error { code message requestId details }\n    }\n  }\n";
export declare const RbacDeleteRole: GraphQLOperation<unknown, {
    id: string;
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
