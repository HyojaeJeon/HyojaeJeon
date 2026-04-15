'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  Tabs,
  DataTable,
  Badge,
  Button,
  Select,
  Skeleton,
  ConfirmModal,
  EmptyState,
  type DataTableColumn,
  type SelectOption,
} from '@platform/shared-ui';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';
import {
  GOV_DETAIL_LICENSE_QUERY,
  GOV_DETAIL_BRANDS_QUERY,
  GOV_DETAIL_CAPABILITIES_QUERY,
  GOV_DETAIL_USERS_QUERY,
  UPDATE_LICENSE_STATUS_MUTATION,
  DELETE_LICENSE_MUTATION,
  type GovDetailLicenseData,
  type GovDetailBrandsData,
  type GovDetailBrandWithBranches,
  type GovDetailCapabilitiesData,
  type GovDetailUsersData,
  type LicenseDetailRow,
  type TenantUserAccountRow,
} from '@graphql/queries/governance';
import { GrantCapabilityModal } from '@screens/entitlementsOverviewScreen/GrantCapabilityModal';
import { SuspendModal } from '@screens/entitlementsOverviewScreen/SuspendModal';
import { ResumeModal } from '@screens/entitlementsOverviewScreen/ResumeModal';
import { RevokeModal } from '@screens/entitlementsOverviewScreen/RevokeModal';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { IssueLicenseModal } from './IssueLicenseModal';

const ENTITY_TYPE_MAP: Record<string, { scopeType: string; userType: string; label: string }> = {
  distributor: { scopeType: 'REGIONAL_DISTRIBUTOR', userType: 'DISTRIBUTOR_USER', label: 'governanceHub.tab.distributor' },
  brand: { scopeType: 'BRAND_HQ', userType: 'BRAND_ADMIN', label: 'governanceHub.tab.brand' },
  corporate: { scopeType: 'CORPORATE', userType: 'CORPORATE_ADMIN', label: 'governanceHub.tab.corporate' },
};

type Section = 'license' | 'brands' | 'capabilities' | 'users';

export function GovernanceDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ entityType: string; entityId: string }>();

  const entityType = params?.entityType ?? '';
  const entityId = params?.entityId ?? '';
  const config = ENTITY_TYPE_MAP[entityType];
  const isBrand = entityType === 'brand';
  const isDistributor = entityType === 'distributor';

  const section = (searchParams.get('section') as Section) || 'license';

  const updateQuery = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => { if (v === null || v === '') p.delete(k); else p.set(k, v); });
    router.push(`${pathname}?${p.toString()}`);
  };

  const availableSections: Section[] = entityType === 'corporate'
    ? ['users']
    : isBrand
      ? ['license', 'capabilities', 'users']
      : isDistributor
        ? ['license', 'brands', 'users']
        : ['license', 'users'];

  const sectionItems = availableSections.map((s) => ({
    key: s,
    label: t(`governanceHub.section.${s}`),
  }));

  // ── 1P1Q: 각 탭별 쿼리를 skip 패턴으로 선언 ──
  const licenseQuery = useQuery<GovDetailLicenseData>(GOV_DETAIL_LICENSE_QUERY, {
    variables: { scopeType: config?.scopeType ?? '', scopeId: entityId },
    skip: section !== 'license' || !config,
    fetchPolicy: 'cache-and-network',
  });

  const brandsQuery = useQuery<GovDetailBrandsData>(GOV_DETAIL_BRANDS_QUERY, {
    variables: { skip: 0, take: 100 },
    skip: section !== 'brands' || !isDistributor,
    fetchPolicy: 'cache-and-network',
  });

  const capabilitiesQuery = useQuery<GovDetailCapabilitiesData>(GOV_DETAIL_CAPABILITIES_QUERY, {
    variables: { brandHqId: entityId },
    skip: section !== 'capabilities' || !isBrand,
    fetchPolicy: 'cache-and-network',
  });

  const usersQuery = useQuery<GovDetailUsersData>(GOV_DETAIL_USERS_QUERY, {
    variables: { skip: 0, take: 100 },
    skip: section !== 'users' || !config,
    fetchPolicy: 'cache-and-network',
  });

  if (!config) {
    return <div className="p-8 text-fg-muted">{t('common.error')}</div>;
  }

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance'), href: '/governance' },
          { label: t(config.label), href: `/governance?tab=${entityType}` },
          { label: entityId.slice(0, 8) + '...' },
        ],
        title: t('governanceHub.detail'),
        meta: <code className="text-[11px] text-fg-subtle">{entityType}/{entityId.slice(0, 8)}</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/governance?tab=${entityType}`)}>
            {t('common.close')}
          </Button>
        ),
      }}
    >
      <div className="flex flex-col gap-4">
        <Tabs variant="pill" items={sectionItems} value={section} onChange={(k) => updateQuery({ section: k })} />

        {(() => {
          const activeQuery =
            section === 'license' ? licenseQuery
            : section === 'brands' ? brandsQuery
            : section === 'capabilities' ? capabilitiesQuery
            : usersQuery;
          return activeQuery.error ? (
            <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{activeQuery.error.message}</div>
          ) : null;
        })()}

        {section === 'license' && (
          <LicenseContent data={licenseQuery.data} loading={licenseQuery.loading} refetch={licenseQuery.refetch} scopeType={config.scopeType} scopeId={entityId} />
        )}
        {section === 'brands' && isDistributor && (
          <BrandsContent data={brandsQuery.data} loading={brandsQuery.loading} distributorId={entityId} />
        )}
        {section === 'capabilities' && isBrand && (
          <CapabilitiesContent data={capabilitiesQuery.data} loading={capabilitiesQuery.loading} refetch={capabilitiesQuery.refetch} brandHqId={entityId} />
        )}
        {section === 'users' && (
          <UsersContent data={usersQuery.data} loading={usersQuery.loading} entityId={entityId} entityType={entityType} userType={config.userType} />
        )}
      </div>
    </DetailPageTemplate>
  );
}

/* ─────────────────────────── License Content ─────────────────────────── */

function LicenseContent({ data, loading, refetch, scopeType, scopeId }: { data?: GovDetailLicenseData; loading: boolean; refetch: () => void; scopeType: string; scopeId: string }) {
  const { t } = useI18n();
  const canCreate = useHasPermission(PERMISSIONS.LICENSE_CREATE);
  const [updateStatus, { loading: updating }] = useMutation(UPDATE_LICENSE_STATUS_MUTATION);
  const [deleteLicense, { loading: deleting }] = useMutation(DELETE_LICENSE_MUTATION);
  const [nextStatus, setNextStatus] = useState('ACTIVE');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  const licenses = data?.licensesByScope.success?.data ?? [];

  const statusOptions: SelectOption[] = ['ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'].map((v) => ({
    value: v,
    label: t(`license.status.${v}`),
  }));

  const handleStatusUpdate = async (id: string) => {
    const res = await updateStatus({ variables: { id, status: nextStatus } });
    if (res.data?.updateLicenseStatus?.success) {
      toast.success(t('license.toast.statusUpdated'));
      refetch();
    } else {
      toast.error(res.data?.updateLicenseStatus?.error?.message ?? t('common.error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteLicense({ variables: { id: deleteTarget } });
    if (res.data?.deleteLicense?.success) {
      toast.success(t('license.toast.deleted'));
      setDeleteTarget(null);
      refetch();
    } else {
      toast.error(t('common.error'));
    }
  };

  if (loading) return <Skeleton height={120} />;

  if (licenses.length === 0) {
    return (
      <>
        <SectionCard title={t('governanceHub.section.license')}>
          <EmptyState icon={<Trash2 size={24} />} title={t('governanceHub.noLicense')} size="md" tone="neutral" />
          {canCreate && (
            <div className="mt-4 flex justify-center">
              <Button variant="primary" size="md" startIcon={<Plus size={14} />} onClick={() => setIssueOpen(true)}>
                {t('license.action.issue')}
              </Button>
            </div>
          )}
        </SectionCard>
        <IssueLicenseModal open={issueOpen} onClose={() => setIssueOpen(false)} scopeType={scopeType} scopeId={scopeId} onCreated={refetch} />
      </>
    );
  }

  return (
    <>
      {licenses.map((l) => (
        <SectionCard key={l.id} title={l.licenseCode} description={t(`license.licenseType.${l.licenseType}`)}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('license.form.status')}</span><StatusBadge status={l.status} /></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('license.form.type')}</span>{t(`license.licenseType.${l.licenseType}`)}</div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('license.form.effectiveFrom')}</span><span className="font-mono">{formatDateTime(l.effectiveFrom)}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('license.form.effectiveTo')}</span><span className="font-mono">{l.effectiveTo ? formatDateTime(l.effectiveTo) : '∞'}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('license.form.maxBranch')}</span>{(l as LicenseDetailRow & { maxBranchCount?: number }).maxBranchCount ?? 0}</div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('license.form.maxTerminal')}</span>{(l as LicenseDetailRow & { maxTerminalCount?: number }).maxTerminalCount ?? 0}</div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Select value={nextStatus} onChange={setNextStatus} options={statusOptions} minWidth={160} />
            <Button variant="primary" size="sm" disabled={updating || nextStatus === l.status} onClick={() => handleStatusUpdate(l.id)}>
              {t('license.action.updateStatus')}
            </Button>
            <Button variant="danger" size="sm" startIcon={<Trash2 size={12} />} disabled={deleting} onClick={() => setDeleteTarget(l.id)}>
              {t('license.action.delete')}
            </Button>
          </div>
        </SectionCard>
      ))}
      {canCreate && (
        <div className="flex justify-end">
          <Button variant="primary" size="sm" startIcon={<Plus size={13} />} onClick={() => setIssueOpen(true)}>
            {t('license.action.issue')}
          </Button>
        </div>
      )}
      <IssueLicenseModal open={issueOpen} onClose={() => setIssueOpen(false)} scopeType={scopeType} scopeId={scopeId} onCreated={refetch} />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('license.action.delete')}
        message={t('license.confirm.delete')}
        confirmLabel={t('action.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        busy={deleting}
      />
    </>
  );
}

/* ─────────────────────────── Brands Content ─────────────────────────── */

function BrandsContent({ data, loading, distributorId }: { data?: GovDetailBrandsData; loading: boolean; distributorId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);

  const allBrands = data?.brands.success?.data ?? [];
  const brands = allBrands.filter((b) => b.distributorId === distributorId);

  const cols: DataTableColumn<GovDetailBrandWithBranches>[] = [
    { key: 'code', header: t('governanceHub.col.code'), width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.brandCode}</span> },
    { key: 'name', header: t('governanceHub.col.name'), render: (r) => r.brandName },
    { key: 'country', header: t('governanceHub.col.country'), width: '80px', render: (r) => r.countryCode },
    { key: 'branches', header: t('license.form.maxBranch'), width: '80px', align: 'right', render: (r) => <span className="text-[12px]">{r.branches?.length ?? 0}</span> },
    { key: 'status', header: t('governanceHub.col.status'), width: '100px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <Skeleton height={120} />;

  return (
    <SectionCard title={t('governanceHub.section.brands')} description={`${brands.length}`}>
      <DataTable
        columns={cols}
        rows={brands}
        rowKey={(r) => r.id}
        emptyState={t('common.empty')}
        compact
        onRowClick={(r) => setExpandedBrandId(expandedBrandId === r.id ? null : r.id)}
        expandedRowKey={expandedBrandId}
        renderExpandedRow={(r) => (
          <div className="bg-surface-1 px-6 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-fg-muted">{r.brandName} — {t('license.form.maxBranch')}</span>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/governance/brand/${r.id}`)}>
                {t('governanceHub.detail')} &rarr;
              </Button>
            </div>
            {r.branches && r.branches.length > 0 ? (
              <div className="space-y-1">
                {r.branches.map((br) => (
                  <div key={br.id} className="flex items-center gap-3 text-[12px]">
                    <span className="font-mono text-fg-muted">{br.branchCode}</span>
                    <span className="text-fg">{br.branchName}</span>
                    <Badge tone="neutral" variant="soft">{t(`enum.branchType.${br.branchType}`)}</Badge>
                    <StatusBadge status={br.status} />
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[12px] text-fg-muted">{t('common.empty')}</span>
            )}
          </div>
        )}
      />
    </SectionCard>
  );
}

/* ─────────────────────────── Capabilities Content ─────────────────────────── */

function CapabilitiesContent({ data, loading, refetch, brandHqId }: { data?: GovDetailCapabilitiesData; loading: boolean; refetch: () => void; brandHqId: string }) {
  const { t } = useI18n();
  const [grantOpen, setGrantOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<{ id: string; capability: string } | null>(null);
  const [resumeTarget, setResumeTarget] = useState<{ id: string; capability: string } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; capability: string } | null>(null);

  const entitlements = data?.brandHqEntitlements.success?.data ?? [];

  type EntRow = { id: string; capability: string; status: string; activatedAt: string | null; expiresAt: string | null };
  const cols: DataTableColumn<EntRow>[] = [
    { key: 'capability', header: t('entitlement.columns.capability'), render: (r) => <Badge tone="info" variant="soft">{t(`enum.capability.${r.capability}`)}</Badge> },
    { key: 'status', header: t('entitlement.columns.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'activated', header: t('entitlement.columns.activated'), width: '140px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.activatedAt ? formatDateTime(r.activatedAt) : '—'}</span> },
    { key: 'expires', header: t('entitlement.columns.expires'), width: '140px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.expiresAt ? formatDateTime(r.expiresAt) : '∞'}</span> },
    { key: 'actions', header: t('entitlement.columns.actions'), width: '200px', render: (r) => (
      <div className="flex gap-1">
        {(r.status === 'ACTIVE' || r.status === 'TRIAL') && (
          <Button variant="ghost" size="sm" onClick={() => setSuspendTarget({ id: r.id, capability: r.capability })}>{t('entitlement.action.suspend')}</Button>
        )}
        {r.status === 'SUSPENDED' && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setResumeTarget({ id: r.id, capability: r.capability })}>{t('entitlement.action.resume')}</Button>
            <Button variant="danger" size="sm" onClick={() => setRevokeTarget({ id: r.id, capability: r.capability })}>{t('entitlement.action.revoke')}</Button>
          </>
        )}
      </div>
    )},
  ];

  if (loading) return <Skeleton height={120} />;

  return (
    <>
      <SectionCard title={t('governanceHub.section.capabilities')} description={`${entitlements.length}`}>
        <div className="mb-3">
          <Button variant="primary" size="sm" startIcon={<Plus size={14} />} onClick={() => setGrantOpen(true)}>
            {t('entitlement.action.grant')}
          </Button>
        </div>
        <DataTable columns={cols} rows={entitlements} rowKey={(r) => r.id} emptyState={t('entitlement.empty.noEntitlements')} compact />
      </SectionCard>

      <GrantCapabilityModal open={grantOpen} brandHqId={brandHqId} onClose={() => setGrantOpen(false)} onGranted={() => { setGrantOpen(false); refetch(); }} />
      {suspendTarget && <SuspendModal open entitlementId={suspendTarget.id} capability={suspendTarget.capability} onClose={() => setSuspendTarget(null)} onDone={() => { setSuspendTarget(null); refetch(); }} />}
      {resumeTarget && <ResumeModal open entitlementId={resumeTarget.id} capability={resumeTarget.capability} onClose={() => setResumeTarget(null)} onDone={() => { setResumeTarget(null); refetch(); }} />}
      {revokeTarget && <RevokeModal open entitlementId={revokeTarget.id} capability={revokeTarget.capability} onClose={() => setRevokeTarget(null)} onDone={() => { setRevokeTarget(null); refetch(); }} />}
    </>
  );
}

/* ─────────────────────────── Users Content ─────────────────────────── */

function UsersContent({ data, loading, entityId, entityType, userType }: { data?: GovDetailUsersData; loading: boolean; entityId: string; entityType: string; userType: string }) {
  const { t } = useI18n();
  const allUsers = data?.authAccounts.success?.data ?? [];
  const scopeField = entityType === 'distributor' ? 'distributorId' : entityType === 'brand' ? 'brandHQId' : 'corporateId';
  const users = allUsers.filter((u) => {
    const scopedUser = u as TenantUserAccountRow & {
      distributorId?: string | null;
      brandHQId?: string | null;
      corporateId?: string | null;
    };
    return scopedUser.userType === userType && scopedUser[scopeField] === entityId;
  });

  const cols: DataTableColumn<TenantUserAccountRow>[] = [
    { key: 'loginId', header: t('table.header.loginId'), render: (r) => <span className="font-mono text-[12px]">{r.loginId}</span> },
    { key: 'name', header: t('governanceHub.col.name'), render: (r) => r.displayName },
    { key: 'email', header: t('field.email'), render: (r) => <span className="text-[12px] text-fg-muted">{r.email ?? '—'}</span> },
    { key: 'status', header: t('governanceHub.col.status'), width: '100px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <Skeleton height={120} />;

  return (
    <SectionCard title={t('governanceHub.section.users')} description={`${users.length}`}>
      <DataTable columns={cols} rows={users} rowKey={(r) => r.id} emptyState={t('common.empty')} compact />
    </SectionCard>
  );
}

/* ─────────────────────────── Policies Content ─────────────────────────── */
