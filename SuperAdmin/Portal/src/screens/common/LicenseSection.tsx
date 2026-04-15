'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Plus, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  SectionCard,
  DataTable,
  Badge,
  Button,
  Select,
  DatePicker,
  Modal,
  NumberInput,
  Skeleton,
  type DataTableColumn,
  type SelectOption,
} from '@platform/shared-ui';
import {
  GOV_DETAIL_LICENSE_QUERY,
  CREATE_LICENSE_MUTATION,
  UPDATE_LICENSE_STATUS_MUTATION,
  DELETE_LICENSE_MUTATION,
  type GovDetailLicenseData,
  type LicenseDetailRow,
  type CreateLicenseInput,
} from '@graphql/queries/governance';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';

/* ─────────────────────── Props ─────────────────────── */

interface LicenseSectionProps {
  scopeType: 'BRAND_HQ' | 'REGIONAL_DISTRIBUTOR';
  scopeId: string;
  entityName: string;
}

const LICENSE_TYPE_KEYS = ['SUBSCRIPTION', 'PERPETUAL', 'TRIAL'] as const;
const LICENSE_STATUS_KEYS = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;

/* ─────────────────────── Create License Modal ─────────────────────── */

function IssueLicenseModal({
  open,
  onClose,
  scopeType,
  scopeId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  scopeType: string;
  scopeId: string;
  onCreated: () => void;
}) {
  const { t } = useI18n();
  const [createLicense, { loading }] = useMutation(CREATE_LICENSE_MUTATION);

  const [licenseType, setLicenseType] = useState('SUBSCRIPTION');
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState('');
  const [maxBranch, setMaxBranch] = useState('0');
  const [maxTerminal, setMaxTerminal] = useState('0');

  const setDuration = (years: number) => {
    const from = new Date(effectiveFrom || Date.now());
    const to = new Date(from);
    to.setFullYear(to.getFullYear() + years);
    setEffectiveTo(to.toISOString().slice(0, 10));
  };

  const handleSubmit = async () => {
    const input: CreateLicenseInput = {
      scopeType,
      scopeId,
      licenseType,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      maxBranchCount: Number(maxBranch) || 0,
      maxTerminalCount: Number(maxTerminal) || 0,
    };
    try {
      const res = await createLicense({ variables: { input } });
      if (res.data?.createLicense?.success?.data) {
        toast.success(t('license.toast.created'));
        onCreated();
        onClose();
      } else {
        toast.error(res.data?.createLicense?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('license.action.issue')}
      width={520}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} disabled={!effectiveFrom} onClick={handleSubmit}>
            {t('license.action.issue')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11.5px] font-medium text-fg-muted">{t('license.field.type')}</span>
          <Select value={licenseType} onChange={setLicenseType} options={LICENSE_TYPE_KEYS.map((v) => ({ value: v, label: t(`license.licenseType.${v}`) }))} minWidth="100%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('field.effectiveFrom')} *</span>
            <DatePicker value={effectiveFrom} onChange={(v) => setEffectiveFrom(v ?? '')} minWidth="100%" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('field.effectiveTo')}</span>
            <DatePicker value={effectiveTo || null} onChange={(v) => setEffectiveTo(v ?? '')} minDate={effectiveFrom} minWidth="100%" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 5].map((y) => (
            <button
              key={y}
              type="button"
              className="rounded-full border px-3 py-0.5 text-[11px] text-fg-muted hover:border-primary hover:text-primary"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => setDuration(y)}
            >
              {y}Y
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('license.field.maxBranch')}</span>
            <NumberInput value={maxBranch} onValueChange={({ raw }) => setMaxBranch(raw)} min={0} style={{ width: '100%' }} placeholder="0 = unlimited" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('license.field.maxTerminal')}</span>
            <NumberInput value={maxTerminal} onValueChange={({ raw }) => setMaxTerminal(raw)} min={0} style={{ width: '100%' }} placeholder="0 = unlimited" />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────── Main Section ─────────────────────── */

export function LicenseSection({ scopeType, scopeId, entityName }: LicenseSectionProps) {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.LICENSE_READ);
  const canCreate = useHasPermission(PERMISSIONS.LICENSE_CREATE);
  const canUpdate = useHasPermission(PERMISSIONS.LICENSE_UPDATE);

  const [issueOpen, setIssueOpen] = useState(false);

  const { data, loading, refetch } = useQuery<GovDetailLicenseData>(GOV_DETAIL_LICENSE_QUERY, {
    variables: { scopeType, scopeId },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const [updateStatus] = useMutation(UPDATE_LICENSE_STATUS_MUTATION);

  if (!canRead) return null;

  const licenses = data?.licensesByScope.success?.data ?? [];

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateStatus({ variables: { id, status: newStatus } });
      if (res.data?.updateLicenseStatus?.success) {
        toast.success(t('license.toast.statusUpdated'));
        void refetch();
      } else {
        toast.error(res.data?.updateLicenseStatus?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const columns: DataTableColumn<LicenseDetailRow>[] = [
    { key: 'licenseCode', header: t('license.field.code'), width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg">{r.licenseCode}</span> },
    { key: 'licenseType', header: t('license.field.type'), width: '120px', render: (r) => <Badge tone="info" variant="soft">{t(`license.licenseType.${r.licenseType}`)}</Badge> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'effectiveFrom', header: t('field.effectiveFrom'), width: '110px', render: (r) => <span className="num text-[11px] text-fg-muted">{formatDateTime(r.effectiveFrom)}</span> },
    { key: 'effectiveTo', header: t('field.effectiveTo'), width: '110px', render: (r) => <span className="num text-[11px] text-fg-muted">{r.effectiveTo ? formatDateTime(r.effectiveTo) : '∞'}</span> },
    ...(canUpdate
      ? [{
          key: 'actions' as const,
          header: '',
          width: '140px',
          align: 'right' as const,
          render: (r: LicenseDetailRow) => (
            <Select
              value={r.status}
              onChange={(v) => handleStatusChange(r.id, v)}
              options={LICENSE_STATUS_KEYS.map((v) => ({ value: v, label: t(`license.status.${v}`) }))}
              minWidth={120}
            />
          ),
        }]
      : []),
  ];

  return (
    <>
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <Shield size={15} className="text-fg-muted" />
            {t('license.section.title')}
          </span>
        }
        description={`${entityName} · ${licenses.length} ${t('license.section.count')}`}
        padding="none"
      >
        <div className="flex items-center justify-end gap-2 border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
          <Button
            variant="ghost"
            size="sm"
            startIcon={<ExternalLink size={13} />}
            onClick={() => router.push(`/governance/${scopeType === 'BRAND_HQ' ? 'brand' : 'distributor'}/${scopeId}`)}
          >
            {t('license.action.viewInGovernance')}
          </Button>
          {canCreate && (
            <Button variant="primary" size="sm" startIcon={<Plus size={13} />} onClick={() => setIssueOpen(true)}>
              {t('license.action.issue')}
            </Button>
          )}
        </div>
        {loading && licenses.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={28} />)}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={licenses}
            rowKey={(r) => r.id}
            compact
            emptyState={t('license.section.empty')}
            onRowClick={(r) => router.push(`/governance/licenses/${r.id}`)}
          />
        )}
      </SectionCard>

      <IssueLicenseModal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        scopeType={scopeType}
        scopeId={scopeId}
        onCreated={() => void refetch()}
      />
    </>
  );
}
