/**
 * Governance GraphQL operations (SA-TENANT-USER-001/002).
 *
 * 한국어: 1P1Q 탭 규칙에 따라 TenantUserScreen 은 탭 단위 operation 을 사용한다.
 *   - TenantUserScreenBootstrap: 페이지 진입 시 1회, platform/scope 선택기 옵션.
 *   - TenantUserScreenRoles / Matrix / Users: 활성 탭 1 개만 초기 호출, 나머지는 lazy.
 */
import type { GraphQLOperation } from '../types.js';
export interface TenantUserScreenBootstrapVariables {
    [key: string]: never;
}
export declare const TenantUserScreenBootstrapDocument = "\n  query TenantUserScreenBootstrap {\n    distributors(skip: 0, take: 200) {\n      success { code message requestId data {\n        id companyName distributorCode\n      } }\n      error { code message requestId details }\n    }\n    brands(skip: 0, take: 200) {\n      success { code message requestId data {\n        id brandName brandCode\n      } }\n      error { code message requestId details }\n    }\n    mealCorporates(skip: 0, take: 200) {\n      success { code message requestId data {\n        id companyName tenantCode\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const tenantUserScreenBootstrapOperation: GraphQLOperation<unknown, TenantUserScreenBootstrapVariables>;
export interface TenantUserScreenRolesVariables {
    [key: string]: never;
}
export declare const TenantUserScreenRolesDocument = "\n  query TenantUserScreenRoles {\n    rbacRoles {\n      success { code message requestId data {\n        id roleCode roleName nameKo nameEn scope hierarchyLevel\n        description descriptionKo descriptionEn isSystem\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const tenantUserScreenRolesOperation: GraphQLOperation<unknown, TenantUserScreenRolesVariables>;
export interface TenantUserScreenMatrixVariables {
    scope: string;
}
export declare const TenantUserScreenMatrixDocument = "\n  query TenantUserScreenMatrix($scope: String!) {\n    rbacRoles {\n      success { code message requestId data {\n        id roleCode roleName nameKo nameEn scope hierarchyLevel\n        description descriptionKo descriptionEn isSystem\n      } }\n      error { code message requestId details }\n    }\n    rbacPermissions {\n      success { code message requestId data {\n        id permissionKey domain name nameKo nameEn\n        description descriptionKo descriptionEn isSystem\n      } }\n      error { code message requestId details }\n    }\n    rbacRolePermissionsMatrix(scope: $scope) {\n      success { code message requestId data {\n        roleId permissionId\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const tenantUserScreenMatrixOperation: GraphQLOperation<unknown, TenantUserScreenMatrixVariables>;
export interface TenantUserScreenUsersVariables {
    userType?: string | null;
    skip: number;
    take: number;
}
export declare const TenantUserScreenUsersDocument = "\n  query TenantUserScreenUsers($userType: String, $skip: Int!, $take: Int!) {\n    authAccounts(userType: $userType, skip: $skip, take: $take) {\n      success { code message requestId data {\n        id loginId displayName email userType status\n        distributorId brandHQId corporateId\n      } }\n      error { code message requestId details }\n    }\n  }\n";
export declare const tenantUserScreenUsersOperation: GraphQLOperation<unknown, TenantUserScreenUsersVariables>;
