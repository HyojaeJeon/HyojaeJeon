// ─────────── Queries
export const RbacListPermissionsDocument = /* GraphQL */ `
  query RbacListPermissions {
    rbacPermissions {
      success { code message requestId data {
        id
      permissionKey
      domain
      description
      isSystem
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacListPermissions = {
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
      scope
      hierarchyLevel
      isSystem
      description
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacListRoles = {
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
      description
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacRolePermissions = {
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
export const RbacEffectivePermissions = {
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
export const RbacUserAssignments = {
    operationName: 'RbacUserAssignments',
    document: RbacUserAssignmentsDocument,
};
// ─────────── Mutations — Role CRUD
export const RbacCreateRoleDocument = /* GraphQL */ `
  mutation RbacCreateRole(
    $roleCode: String!
    $roleName: String!
    $scope: String!
    $hierarchyLevel: Int
    $description: String
  ) {
    rbacCreateRole(
      roleCode: $roleCode
      roleName: $roleName
      scope: $scope
      hierarchyLevel: $hierarchyLevel
      description: $description
    ) {
      success { code message requestId data {
        id
      roleCode
      roleName
      scope
      hierarchyLevel
      isSystem
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacCreateRole = { operationName: 'RbacCreateRole', document: RbacCreateRoleDocument };
export const RbacUpdateRoleDocument = /* GraphQL */ `
  mutation RbacUpdateRole(
    $id: ID!
    $roleName: String
    $scope: String
    $hierarchyLevel: Int
    $description: String
  ) {
    rbacUpdateRole(
      id: $id
      roleName: $roleName
      scope: $scope
      hierarchyLevel: $hierarchyLevel
      description: $description
    ) {
      success { code message requestId data {
        id
      roleCode
      roleName
      scope
      hierarchyLevel
      } }
      error { code message requestId details }
    }
  }
`;
export const RbacUpdateRole = { operationName: 'RbacUpdateRole', document: RbacUpdateRoleDocument };
export const RbacDeleteRoleDocument = /* GraphQL */ `
  mutation RbacDeleteRole($id: ID!) {
    rbacDeleteRole(id: $id) {
      success { code message requestId data }
      error { code message requestId details }
    }
  }
`;
export const RbacDeleteRole = {
    operationName: 'RbacDeleteRole',
    document: RbacDeleteRoleDocument,
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
export const RbacAddPermissionToRole = {
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
export const RbacRemovePermissionFromRole = {
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
export const RbacAssignRole = { operationName: 'RbacAssignRole', document: RbacAssignRoleDocument };
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
export const RbacRevokeRoleAssignment = {
    operationName: 'RbacRevokeRoleAssignment',
    document: RbacRevokeRoleAssignmentDocument,
};
