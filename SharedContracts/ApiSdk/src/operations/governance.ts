/**
 * Governance GraphQL operations (SA-TENANT-USER-001/002).
 *
 * 한국어: 1P1Q 탭 규칙에 따라 TenantUserScreen 은 탭 단위 operation 을 사용한다.
 *   - TenantUserScreenBootstrap: 페이지 진입 시 1회, platform/scope 선택기 옵션.
 *   - TenantUserScreenRoles / Matrix / Users: 활성 탭 1 개만 초기 호출, 나머지는 lazy.
 */
import type { GraphQLOperation } from '../types.js';

/* ─────────── TenantUserScreenBootstrap (shared scope options, 페이지 진입 1회) ─────────── */

export interface TenantUserScreenBootstrapVariables {
  [key: string]: never;
}

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

export const tenantUserScreenBootstrapOperation: GraphQLOperation<
  unknown,
  TenantUserScreenBootstrapVariables
> = {
  operationName: 'TenantUserScreenBootstrap',
  document: TenantUserScreenBootstrapDocument,
};

/* ─────────── TenantUserScreenRoles (Roles 탭) ─────────── */

export interface TenantUserScreenRolesVariables {
  [key: string]: never;
}

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

export const tenantUserScreenRolesOperation: GraphQLOperation<
  unknown,
  TenantUserScreenRolesVariables
> = {
  operationName: 'TenantUserScreenRoles',
  document: TenantUserScreenRolesDocument,
};

/* ─────────── TenantUserScreenMatrix (Matrix 탭) ─────────── */

export interface TenantUserScreenMatrixVariables {
  scope: string;
}

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

export const tenantUserScreenMatrixOperation: GraphQLOperation<
  unknown,
  TenantUserScreenMatrixVariables
> = {
  operationName: 'TenantUserScreenMatrix',
  document: TenantUserScreenMatrixDocument,
};

/* ─────────── TenantUserScreenUsers (Users 탭) ─────────── */

export interface TenantUserScreenUsersVariables {
  userType?: string | null;
  skip: number;
  take: number;
}

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

export const tenantUserScreenUsersOperation: GraphQLOperation<
  unknown,
  TenantUserScreenUsersVariables
> = {
  operationName: 'TenantUserScreenUsers',
  document: TenantUserScreenUsersDocument,
};
