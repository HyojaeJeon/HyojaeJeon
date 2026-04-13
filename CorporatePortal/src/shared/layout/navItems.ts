import type { PermissionKey } from '@rbac/permissions';
import { PERMISSIONS } from '@rbac/permissions';

export interface NavItem {
  key: string;
  labelKey: string;
  href: string;
  icon: string;
  permissions?: PermissionKey[];
  permissionMode?: 'all' | 'any';
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    key: 'departments',
    labelKey: 'nav.departments',
    href: '/departments',
    icon: 'Network',
    permissions: [PERMISSIONS.DEPARTMENT_READ],
  },
  {
    key: 'employees',
    labelKey: 'nav.employees',
    href: '/employees',
    icon: 'Users',
    permissions: [PERMISSIONS.EMPLOYEE_READ],
  },
  {
    key: 'policies',
    labelKey: 'nav.policies',
    href: '/policies',
    icon: 'SlidersHorizontal',
    permissions: [PERMISSIONS.POLICY_READ],
  },
  {
    key: 'budget',
    labelKey: 'nav.budget',
    href: '/budget',
    icon: 'Wallet',
    permissions: [PERMISSIONS.WALLET_READ],
  },
  {
    key: 'transactions',
    labelKey: 'nav.transactions',
    href: '/transactions',
    icon: 'ArrowLeftRight',
    permissions: [PERMISSIONS.TRANSACTION_READ],
  },
  {
    key: 'merchants',
    labelKey: 'nav.merchants',
    href: '/merchants',
    icon: 'Store',
    permissions: [PERMISSIONS.MERCHANT_READ],
  },
  {
    key: 'invoices',
    labelKey: 'nav.invoices',
    href: '/invoices',
    icon: 'FileText',
    permissions: [PERMISSIONS.INVOICE_READ],
  },
  {
    key: 'integrations',
    labelKey: 'nav.integrations',
    href: '/integrations',
    icon: 'Plug',
  },
  {
    key: 'settings',
    labelKey: 'nav.settings',
    href: '/settings',
    icon: 'Settings',
    children: [
      {
        key: 'settings.company',
        labelKey: 'nav.settings.company',
        href: '/settings/company',
        icon: 'Building2',
        permissions: [PERMISSIONS.PROFILE_READ],
      },
      {
        key: 'settings.admins',
        labelKey: 'nav.settings.admins',
        href: '/settings/admins',
        icon: 'ShieldCheck',
        permissions: [PERMISSIONS.ADMIN_MANAGE],
      },
      {
        key: 'settings.session',
        labelKey: 'nav.settings.session',
        href: '/settings/session',
        icon: 'User',
      },
    ],
  },
];
