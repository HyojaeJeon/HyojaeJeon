'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DetailPageTemplate, SectionCard, Badge, Button, Select, Skeleton, ConfirmModal, type SelectOption } from '@platform/shared-ui';
import {
  LICENSE_DETAIL_QUERY,
  UPDATE_LICENSE_STATUS_MUTATION,
  DELETE_LICENSE_MUTATION,
  type LicenseDetailData,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

const STATUS_KEYS = ['ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'] as const;

export function LicenseDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.PLATFORM_AUDIT_READ);

  const statusOptions: SelectOption[] = STATUS_KEYS.map((v) => ({
    value: v,
    label: t(`license.status.${v}`),
  }));

  const { data, loading, error, refetch } = useQuery<LicenseDetailData>(LICENSE_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  const [updateStatus, { loading: updatingStatus }] = useMutation(UPDATE_LICENSE_STATUS_MUTATION);
  const [deleteLicense, { loading: deleting }] = useMutation(DELETE_LICENSE_MUTATION);

  const [nextStatus, setNextStatus] = useState<string>('ACTIVE');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (!canRead) return <LockedScreen />;
  const l = data?.license.success?.data;

  const handleStatusUpdate = async () => {
    if (!id) return;
    try {
      const res = await updateStatus({ variables: { id, status: nextStatus } });
      const result = res.data?.updateLicenseStatus;
      if (result?.success?.data) {
        toast.success(t('license.toast.statusUpdated'));
        void refetch();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const res = await deleteLicense({ variables: { id } });
      const result = res.data?.deleteLicense;
      if (result?.success) {
        toast.success(t('license.toast.deleted'));
        router.push('/governance/licenses');
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <DetailPageTemplate
        header={{
          breadcrumbs: [
            { label: t('nav.governance') },
            { label: t('nav.governance.licenses'), href: '/governance/licenses' },
            { label: l?.licenseCode ?? '...' },
          ],
          title: l ? l.licenseCode : t('common.loading'),
          description: l ? (
            <span className="flex items-center gap-2">
              <Badge tone="info" variant="soft">{t(`license.licenseType.${l.licenseType}`)}</Badge>
              <Badge tone="neutral" variant="soft">{t(`license.scopeType.${l.scopeType}`)}</Badge>
              <StatusBadge status={l.status} />
            </span>
          ) : undefined,
          meta: <code className="text-[11px] text-fg-subtle">SA-LIC-002</code>,
          actions: (
            <div className="flex items-center gap-2">
              <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/governance/licenses')}>
                {t('common.close')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                startIcon={<Trash2 size={14} />}
                disabled={deleting}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                {t('license.action.delete')}
              </Button>
            </div>
          ),
        }}
      >
        {error && (
          <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
        )}

        {/* Status Update Section */}
        {l && (
          <SectionCard title={t('license.action.updateStatus')} description={t('license.form.status')}>
            <div className="flex items-center gap-3">
              <Select
                value={nextStatus}
                onChange={setNextStatus}
                options={statusOptions}
                minWidth={200}
              />
              <Button
                variant="primary"
                size="sm"
                disabled={updatingStatus || nextStatus === l.status}
                onClick={handleStatusUpdate}
              >
                {updatingStatus ? t('common.busy') : t('license.action.updateStatus')}
              </Button>
            </div>
          </SectionCard>
        )}

        <SectionCard title={t('license.form.code')} description={t('license.list.title')}>
          {loading && !l ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={22} />)}</div>
          ) : l ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.code')}</span><span className="font-mono text-fg">{l.licenseCode}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.type')}</span><span className="text-fg">{t(`license.licenseType.${l.licenseType}`)}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.scope')}</span><span className="text-fg">{t(`license.scopeType.${l.scopeType}`)}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.scopeId')}</span><span className="font-mono text-fg text-[11px]">{l.scopeId ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.country')}</span><span className="text-fg">{l.allowedCountryCode ? t(`license.country.${l.allowedCountryCode}`) : '—'}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.status')}</span><StatusBadge status={l.status} /></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.effectiveFrom')}</span><span className="num font-mono text-fg">{formatDateTime(l.effectiveFrom)}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('license.form.effectiveTo')}</span><span className="num font-mono text-fg">{l.effectiveTo ? formatDateTime(l.effectiveTo) : '∞'}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('field.createdAt')}</span><span className="num font-mono text-fg">{formatDateTime(l.createdAt)}</span></div>
              <div className="flex gap-3"><span className="w-36 text-fg-muted">{t('field.updatedAt')}</span><span className="num font-mono text-fg">{formatDateTime(l.updatedAt)}</span></div>
              <div className="col-span-2 mt-3">
                <div className="text-fg-muted text-[11px] mb-1">{t('license.form.payload')}</div>
                <pre className="rounded-md border bg-surface-1 p-3 font-mono text-[11px] text-fg-muted overflow-auto" style={{ borderColor: 'var(--border)' }}>
                  {JSON.stringify(l.licensePayloadJson, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </DetailPageTemplate>

      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
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
