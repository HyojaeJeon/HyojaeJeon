/**
 * CentralApi PermissionService 의 corporate 스코프 키와 1:1 매칭한다.
 * 실제 검증은 서버 PermissionGuard 가 수행하며, Portal 은 UI hide/disable 용으로만 사용한다.
 */
export const PERMISSIONS = {
  PROFILE_READ: 'corporate.profile.read',
  PROFILE_WRITE: 'corporate.profile.write',
  DEPARTMENT_READ: 'corporate.department.read',
  DEPARTMENT_WRITE: 'corporate.department.write',
  EMPLOYEE_READ: 'corporate.employee.read',
  EMPLOYEE_WRITE: 'corporate.employee.write',
  WALLET_READ: 'corporate.wallet.read',
  WALLET_WRITE: 'corporate.wallet.write',
  WALLET_FUND: 'corporate.wallet.fund',
  WALLET_TOPUP: 'corporate.wallet.topup',
  POLICY_READ: 'corporate.policy.read',
  POLICY_WRITE: 'corporate.policy.write',
  TRANSACTION_READ: 'corporate.transaction.read',
  TRANSACTION_REVERSE: 'corporate.transaction.reverse',
  SETTLEMENT_READ: 'corporate.settlement.read',
  SETTLEMENT_RUN: 'corporate.settlement.run',
  MERCHANT_READ: 'corporate.merchant.read',
  MERCHANT_ALLOW_WRITE: 'corporate.merchant.allow.write',
  INVOICE_READ: 'corporate.invoice.read',
  INVOICE_REQUEST: 'corporate.invoice.request',
  INVOICE_DISPUTE: 'corporate.invoice.dispute',
  REPORT_READ: 'corporate.report.read',
  AUDIT_READ: 'corporate.audit.read',
  ADMIN_MANAGE: 'corporate.admin.manage',
  FUNDING_READ_LIMIT: 'corporate.funding.read.limit',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
