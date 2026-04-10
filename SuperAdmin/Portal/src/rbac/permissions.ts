/**
 * CentralApi PermissionService 의 39 개 키와 1:1 매칭한다.
 * 실제 검증은 서버 PermissionGuard 가 수행하며, Portal 은 UI hide/disable 용으로만 사용한다.
 */
export const PERMISSIONS = {
  // Platform
  PLATFORM_AUDIT_READ: 'platform.audit.read',
  PLATFORM_USER_READ: 'platform.user.read',
  PLATFORM_USER_WRITE: 'platform.user.write',
  PLATFORM_RBAC_READ: 'platform.rbac.read',
  PLATFORM_RBAC_WRITE: 'platform.rbac.write',
  PLATFORM_POLICY_READ: 'platform.policy.read',
  PLATFORM_POLICY_WRITE: 'platform.policy.write',

  // Distributor
  DISTRIBUTOR_PROFILE_READ: 'distributor.profile.read',
  DISTRIBUTOR_PROFILE_WRITE: 'distributor.profile.write',

  // Brand
  BRAND_PROFILE_READ: 'brand.profile.read',
  BRAND_PROFILE_WRITE: 'brand.profile.write',
  BRAND_BRANCH_READ: 'brand.branch.read',
  BRAND_BRANCH_WRITE: 'brand.branch.write',
  BRAND_CATALOG_READ: 'brand.catalog.read',
  BRAND_CATALOG_WRITE: 'brand.catalog.write',

  // EdgePos
  EDGEPOS_TERMINAL_READ: 'edgepos.terminal.read',
  EDGEPOS_TERMINAL_WRITE: 'edgepos.terminal.write',

  // Corporate (식권)
  CORPORATE_PROFILE_READ: 'corporate.profile.read',
  CORPORATE_PROFILE_WRITE: 'corporate.profile.write',
  CORPORATE_DEPARTMENT_READ: 'corporate.department.read',
  CORPORATE_DEPARTMENT_WRITE: 'corporate.department.write',
  CORPORATE_EMPLOYEE_READ: 'corporate.employee.read',
  CORPORATE_EMPLOYEE_WRITE: 'corporate.employee.write',
  CORPORATE_WALLET_READ: 'corporate.wallet.read',
  CORPORATE_WALLET_WRITE: 'corporate.wallet.write',
  CORPORATE_WALLET_FUND: 'corporate.wallet.fund',
  CORPORATE_WALLET_TOPUP: 'corporate.wallet.topup',
  CORPORATE_POLICY_READ: 'corporate.policy.read',
  CORPORATE_POLICY_WRITE: 'corporate.policy.write',
  CORPORATE_TRANSACTION_READ: 'corporate.transaction.read',
  CORPORATE_TRANSACTION_REVERSE: 'corporate.transaction.reverse',
  CORPORATE_SETTLEMENT_READ: 'corporate.settlement.read',
  CORPORATE_SETTLEMENT_RUN: 'corporate.settlement.run',
  CORPORATE_MERCHANT_READ: 'corporate.merchant.read',
  CORPORATE_MERCHANT_WRITE: 'corporate.merchant.write',
  CORPORATE_INVOICE_READ: 'corporate.invoice.read',
  CORPORATE_INVOICE_WRITE: 'corporate.invoice.write',
  CORPORATE_INVOICE_REQUEST: 'corporate.invoice.request',
  CORPORATE_INVOICE_DISPUTE: 'corporate.invoice.dispute',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * SuperAdmin 4 sub-role (CentralApi seed 와 대응)
 */
export const SUPER_ADMIN_SUB_ROLES = {
  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
  PLATFORM_OPS: 'PLATFORM_OPS',
  PLATFORM_BILLING: 'PLATFORM_BILLING',
  PLATFORM_SUPPORT: 'PLATFORM_SUPPORT',
} as const;
