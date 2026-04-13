import type { PermissionKey } from '@rbac/permissions';
import { PERMISSIONS } from '@rbac/permissions';

export interface NavItem {
  key: string;
  labelKey: string;
  href: string;
  icon: string; // lucide-react icon name
  permissions?: PermissionKey[];
  permissionMode?: 'all' | 'any';
  children?: NavItem[];
}

/**
 * NavigationRail 구성. 권한 없는 항목은 자동 hide.
 * permissions 는 '해당 영역 진입에 필요한 최소 권한' 을 뜻한다.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.dashboard',
    href: '/',
    icon: 'LayoutDashboard',
  },
  {
    key: 'tenants',
    labelKey: 'nav.tenants',
    href: '/tenants',
    icon: 'Building2',
    permissions: [PERMISSIONS.DISTRIBUTOR_PROFILE_READ, PERMISSIONS.BRAND_PROFILE_READ, PERMISSIONS.CORPORATE_PROFILE_READ],
    permissionMode: 'any',
    children: [
      {
        key: 'tenants.distributors',
        labelKey: 'nav.tenants.distributors',
        href: '/tenants/distributors',
        icon: 'Network',
        permissions: [PERMISSIONS.DISTRIBUTOR_PROFILE_READ],
      },
      {
        key: 'tenants.brands',
        labelKey: 'nav.tenants.brands',
        href: '/tenants/brands',
        icon: 'Store',
        permissions: [PERMISSIONS.BRAND_PROFILE_READ],
      },
      {
        key: 'tenants.corporates',
        labelKey: 'nav.tenants.corporates',
        href: '/tenants/corporates',
        icon: 'Ticket',
        permissions: [PERMISSIONS.CORPORATE_PROFILE_READ],
      },
    ],
  },
  {
    key: 'settlement',
    labelKey: 'nav.settlement',
    href: '/settlements',
    icon: 'Landmark',
  },
  {
    key: 'deploy',
    labelKey: 'nav.deploy',
    href: '/deploy',
    icon: 'Rocket',
    children: [
      { key: 'deploy.packages', labelKey: 'nav.deploy.packages', href: '/deploy/packages', icon: 'Package' },
      { key: 'deploy.releases', labelKey: 'nav.deploy.releases', href: '/deploy/releases', icon: 'GitBranch' },
      { key: 'deploy.rollouts', labelKey: 'nav.deploy.rollouts', href: '/deploy/rollouts', icon: 'Activity' },
    ],
  },
  {
    key: 'governance',
    labelKey: 'nav.governance',
    href: '/governance',
    icon: 'ShieldCheck',
    children: [
      { key: 'governance.hub', labelKey: 'nav.governance.hub', href: '/governance', icon: 'LayoutGrid' },
      {
        key: 'governance.contracts',
        labelKey: 'nav.governance.contracts',
        href: '/governance/contracts',
        icon: 'FileText',
        permissions: [PERMISSIONS.CONTRACT_READ],
      },
    ],
  },
  {
    key: 'operations',
    labelKey: 'nav.operations',
    href: '/operations',
    icon: 'Radar',
    children: [
      { key: 'operations.sync', labelKey: 'nav.operations.sync', href: '/operations/sync', icon: 'RefreshCw' },
      { key: 'operations.realtime', labelKey: 'nav.operations.realtime', href: '/operations/realtime', icon: 'Waves' },
      { key: 'operations.telemetry', labelKey: 'nav.operations.telemetry', href: '/operations/telemetry', icon: 'MonitorDot' },
      { key: 'operations.incidents', labelKey: 'nav.operations.incidents', href: '/operations/incidents', icon: 'AlertTriangle' },
    ],
  },
  {
    key: 'system',
    labelKey: 'nav.system',
    href: '/system',
    icon: 'Settings2',
    children: [
      {
        key: 'system.audit',
        labelKey: 'nav.system.audit',
        href: '/system/audit',
        icon: 'ScrollText',
        permissions: [PERMISSIONS.PLATFORM_AUDIT_READ],
      },
      { key: 'system.reference', labelKey: 'nav.system.reference', href: '/system/reference/currencies', icon: 'Database' },
      { key: 'system.health', labelKey: 'nav.system.health', href: '/system/health', icon: 'Heart' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'nav.settings',
    href: '/settings',
    icon: 'Settings',
    children: [
      { key: 'settings.profile', labelKey: 'nav.settings.profile', href: '/settings/profile', icon: 'UserCog' },
      {
        key: 'settings.rbac',
        labelKey: 'nav.settings.rbac',
        href: '/settings/rbac',
        icon: 'ShieldCheck',
        permissions: [PERMISSIONS.PLATFORM_USER_READ],
      },
      { key: 'settings.policies', labelKey: 'nav.settings.policies', href: '/settings/policies', icon: 'SlidersHorizontal' },
      { key: 'settings.einvoice', labelKey: 'nav.settings.einvoice', href: '/settings/einvoice', icon: 'FileText' },
      { key: 'settings.notifications', labelKey: 'nav.settings.notifications', href: '/settings/notifications', icon: 'BellRing' },
      { key: 'settings.about', labelKey: 'nav.settings.about', href: '/settings/about', icon: 'Info' },
    ],
  },
];
