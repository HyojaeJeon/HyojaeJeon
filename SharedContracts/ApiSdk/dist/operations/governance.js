export const TenantUserScreenBootstrapDocument = /* GraphQL */ `
  query TenantUserScreenBootstrap {
    distributors(skip: 0, take: 200) {
      success { code message requestId data {
        id companyName distributorCode
      } }
      error { code message requestId details }
    }
    brands(skip: 0, take: 200) {
      success { code message requestId data {
        id brandName brandCode
      } }
      error { code message requestId details }
    }
    mealCorporates(skip: 0, take: 200) {
      success { code message requestId data {
        id companyName tenantCode
      } }
      error { code message requestId details }
    }
  }
`;
export const tenantUserScreenBootstrapOperation = {
    operationName: 'TenantUserScreenBootstrap',
    document: TenantUserScreenBootstrapDocument,
};
export const TenantUserScreenRolesDocument = /* GraphQL */ `
  query TenantUserScreenRoles {
    rbacRoles {
      success { code message requestId data {
        id roleCode roleName nameKo nameEn scope hierarchyLevel
        description descriptionKo descriptionEn isSystem
      } }
      error { code message requestId details }
    }
  }
`;
export const tenantUserScreenRolesOperation = {
    operationName: 'TenantUserScreenRoles',
    document: TenantUserScreenRolesDocument,
};
export const TenantUserScreenMatrixDocument = /* GraphQL */ `
  query TenantUserScreenMatrix($scope: String!) {
    rbacRoles {
      success { code message requestId data {
        id roleCode roleName nameKo nameEn scope hierarchyLevel
        description descriptionKo descriptionEn isSystem
      } }
      error { code message requestId details }
    }
    rbacPermissions {
      success { code message requestId data {
        id permissionKey domain name nameKo nameEn
        description descriptionKo descriptionEn isSystem
      } }
      error { code message requestId details }
    }
    rbacRolePermissionsMatrix(scope: $scope) {
      success { code message requestId data {
        roleId permissionId
      } }
      error { code message requestId details }
    }
  }
`;
export const tenantUserScreenMatrixOperation = {
    operationName: 'TenantUserScreenMatrix',
    document: TenantUserScreenMatrixDocument,
};
export const TenantUserScreenUsersDocument = /* GraphQL */ `
  query TenantUserScreenUsers($userType: String, $skip: Int!, $take: Int!) {
    authAccounts(userType: $userType, skip: $skip, take: $take) {
      success { code message requestId data {
        id loginId displayName email userType status
        distributorId brandHQId corporateId
      } }
      error { code message requestId details }
    }
  }
`;
export const tenantUserScreenUsersOperation = {
    operationName: 'TenantUserScreenUsers',
    document: TenantUserScreenUsersDocument,
};
