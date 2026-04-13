/**
 * 권한 키의 진실의 원천(Source of Truth):
 *   CentralApi `core/rbac/permissionDefinitions.ts`
 *
 * 이 파일은 화면에서 빌드 타임에 참조하는 별칭만 유지.
 * 새 키 추가 시 CentralApi permissionDefinitions.ts 만 수정.
 */
export const PERMISSIONS = {
  // Platform
  PLATFORM_AUDIT_READ: 'audit:read',
  PLATFORM_USER_READ: 'users:list',
  PLATFORM_USER_WRITE: 'users:update',
  PLATFORM_RBAC_READ: 'roles:list',
  PLATFORM_RBAC_WRITE: 'roles:update',

  // Distributor
  DISTRIBUTOR_PROFILE_READ: 'distributors:read',
  DISTRIBUTOR_PROFILE_WRITE: 'distributors:update',

  // Brand
  BRAND_PROFILE_READ: 'brands:read',
  BRAND_CATALOG_READ: 'catalog:read',

  // Corporate
  CORPORATE_PROFILE_READ: 'corporates:read',
  CORPORATE_PROFILE_WRITE: 'corporates:update',
  CORPORATE_DEPARTMENT_READ: 'departments:read',
  CORPORATE_DEPARTMENT_WRITE: 'departments:update',
  CORPORATE_EMPLOYEE_READ: 'employees:read',
  CORPORATE_EMPLOYEE_WRITE: 'employees:update',
  CORPORATE_WALLET_READ: 'wallets:read',
  CORPORATE_WALLET_WRITE: 'wallets:update',
  CORPORATE_WALLET_FUND: 'wallets:fund',
  CORPORATE_WALLET_TOPUP: 'wallets:topup',
  CORPORATE_POLICY_READ: 'corp_policies:read',
  CORPORATE_POLICY_WRITE: 'corp_policies:update',
  CORPORATE_MERCHANT_READ: 'merchants:read',
  CORPORATE_MERCHANT_WRITE: 'merchants:update',
  CORPORATE_INVOICE_READ: 'einvoices:read',
  CORPORATE_INVOICE_WRITE: 'einvoices:submit',
  CORPORATE_INVOICE_REQUEST: 'einvoices:request',
  CORPORATE_INVOICE_DISPUTE: 'einvoices:read',

  // Contracts
  CONTRACT_READ: 'contracts:read',
  CONTRACT_CREATE: 'contracts:create',
  CONTRACT_UPDATE: 'contracts:update',
} as const;

export type PermissionKey = string;
