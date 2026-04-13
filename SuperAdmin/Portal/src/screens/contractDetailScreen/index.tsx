'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  History,
  Paperclip,
  Activity,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  Tabs,
  Badge,
  Button,
  DataTable,
  Skeleton,
  ConfirmModal,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CONTRACT_DETAIL_QUERY,
  CONTRACT_ACTIVITIES_QUERY,
  CONTRACT_TRANSITION_STATUS_MUTATION,
  type ContractDetailData,
  type ContractDetail,
  type ContractActivitiesData,
  type ContractActivity,
  type ContractStatus,
} from '@graphql/queries/contract';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

/* ─────────────────────── Status Transition Map ─────────────────────── */

const STATUS_TRANSITIONS: Record<string, { toStatus: ContractStatus; labelKey: string; variant: 'primary' | 'danger' | 'ghost' }[]> = {
  REQUESTED: [
    { toStatus: 'DRAFT', labelKey: 'contract.action.startDraft', variant: 'primary' },
    { toStatus: 'CANCELLED', labelKey: 'contract.action.cancel', variant: 'danger' },
  ],
  DRAFT: [
    { toStatus: 'INTERNAL_REVIEW', labelKey: 'contract.action.requestReview', variant: 'primary' },
    { toStatus: 'CANCELLED', labelKey: 'contract.action.cancel', variant: 'danger' },
  ],
  INTERNAL_REVIEW: [
    { toStatus: 'SENT_TO_PARTY', labelKey: 'contract.action.sendToParty', variant: 'primary' },
    { toStatus: 'DRAFT', labelKey: 'contract.action.reject', variant: 'ghost' },
  ],
  SENT_TO_PARTY: [
    { toStatus: 'NEGOTIATING', labelKey: 'contract.action.startNegotiation', variant: 'primary' },
    { toStatus: 'CANCELLED', labelKey: 'contract.action.cancel', variant: 'danger' },
  ],
  NEGOTIATING: [
    { toStatus: 'AGREED', labelKey: 'contract.action.agree', variant: 'primary' },
    { toStatus: 'CANCELLED', labelKey: 'contract.action.cancel', variant: 'danger' },
  ],
  AGREED: [
    { toStatus: 'PENDING_SIGNATURE', labelKey: 'contract.action.requestSignature', variant: 'primary' },
  ],
  PENDING_SIGNATURE: [
    { toStatus: 'SIGNING', labelKey: 'contract.action.startSigning', variant: 'primary' },
  ],
  SIGNING: [
    { toStatus: 'EXCHANGING', labelKey: 'contract.action.exchange', variant: 'primary' },
  ],
  EXCHANGING: [
    { toStatus: 'ACTIVE', labelKey: 'contract.action.activate', variant: 'primary' },
  ],
  ACTIVE: [
    { toStatus: 'EXPIRING', labelKey: 'contract.action.markExpiring', variant: 'ghost' },
    { toStatus: 'SUSPENDED', labelKey: 'contract.action.suspend', variant: 'danger' },
    { toStatus: 'TERMINATED', labelKey: 'contract.action.terminate', variant: 'danger' },
  ],
  EXPIRING: [
    { toStatus: 'RENEWED', labelKey: 'contract.action.renew', variant: 'primary' },
    { toStatus: 'TERMINATED', labelKey: 'contract.action.terminate', variant: 'danger' },
  ],
  SUSPENDED: [
    { toStatus: 'ACTIVE', labelKey: 'contract.action.reactivate', variant: 'primary' },
    { toStatus: 'TERMINATED', labelKey: 'contract.action.terminate', variant: 'danger' },
  ],
};

/* ─────────────────────── Activity Icon Map ─────────────────────── */

const ACTIVITY_ICON_MAP: Record<string, typeof Clock> = {
  STATUS_CHANGE: ArrowRight,
  BODY_EDIT: FileText,
  TERMS_CHANGE: FileText,
  FILE_UPLOAD: Upload,
  REVISION_ACK: CheckCircle2,
  CREATED: Activity,
};

/* ─────────────────────── Detail Field ─────────────────────── */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[12.5px]">
      <span className="w-36 shrink-0 text-fg-muted">{label}</span>
      <span className="text-fg">{value ?? '—'}</span>
    </div>
  );
}

/* ─────────────────────── Body Tab Content ─────────────────────── */

type LocaleTab = 'vi' | 'ko' | 'en';

function BodyTabContent({ contract }: { contract: ContractDetail }) {
  const { t } = useI18n();
  const [localeLang, setLocaleLang] = useState<LocaleTab>('vi');

  const localeTabs = [
    { key: 'vi' as const, label: 'Tiếng Việt' },
    { key: 'ko' as const, label: '한국어' },
    { key: 'en' as const, label: 'English' },
  ];

  const bodyJson = contract.bodyJson as Record<string, unknown> | null;
  const htmlContent =
    localeLang === 'vi'
      ? (bodyJson?.vi as string) ?? (bodyJson?.html as string) ?? ''
      : localeLang === 'ko'
        ? (bodyJson?.ko as string) ?? ''
        : (bodyJson?.en as string) ?? '';

  return (
    <SectionCard title={t('contract.tab.body')} description={t('contract.body.description')}>
      <Tabs
        variant="underline"
        items={localeTabs}
        value={localeLang}
        onChange={(k) => setLocaleLang(k as LocaleTab)}
      />
      <div className="mt-4">
        {htmlContent ? (
          <div
            className="prose prose-sm max-w-none rounded-md border bg-surface-1 p-4 text-[13px] text-fg"
            style={{ borderColor: 'var(--border)' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div className="rounded-md border bg-surface-1 p-6 text-center text-[12.5px] text-fg-subtle" style={{ borderColor: 'var(--border)' }}>
            {t('contract.body.empty')}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-[11.5px] font-medium text-fg-muted mb-2">{t('contract.terms.title')}</div>
        <pre
          className="rounded-md border bg-surface-1 p-3 font-mono text-[11px] text-fg-muted overflow-auto"
          style={{ borderColor: 'var(--border)', maxHeight: 300 }}
        >
          {JSON.stringify(contract.termsJson, null, 2)}
        </pre>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────── Revisions Tab ─────────────────────── */

function RevisionsTabContent({ contractId }: { contractId: string }) {
  const { t } = useI18n();

  // Revisions are loaded from the contract detail bodyJson for now.
  // When the server adds a dedicated revisionsForContract query, this will switch.
  // For now, display a placeholder that shows "Phase 2" message.
  return (
    <SectionCard title={t('contract.tab.revisions')} description={t('contract.revisions.description')}>
      <div className="rounded-md border bg-surface-1 p-6 text-center text-[12.5px] text-fg-subtle" style={{ borderColor: 'var(--border)' }}>
        {t('contract.revisions.comingSoon')}
      </div>
    </SectionCard>
  );
}

/* ─────────────────────── Files Tab ─────────────────────── */

function FilesTabContent({ contractId }: { contractId: string }) {
  const { t } = useI18n();

  return (
    <SectionCard title={t('contract.tab.files')} description={t('contract.files.description')}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12.5px] text-fg-muted">{t('contract.files.attachments')}</span>
        <Button variant="ghost" size="sm" startIcon={<Upload size={14} />}>
          {t('contract.action.uploadFile')}
        </Button>
      </div>
      <div className="rounded-md border bg-surface-1 p-6 text-center text-[12.5px] text-fg-subtle" style={{ borderColor: 'var(--border)' }}>
        {t('contract.files.empty')}
      </div>
    </SectionCard>
  );
}

/* ─────────────────────── Timeline Tab ─────────────────────── */

function TimelineTabContent({ contractId }: { contractId: string }) {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';

  const { data, loading, error } = useQuery<ContractActivitiesData>(CONTRACT_ACTIVITIES_QUERY, {
    variables: { contractId, skip: 0, take: 50 },
    errorPolicy: 'all',
  });

  const activities = data?.contractActivities.success?.data ?? [];

  const getSummary = (act: ContractActivity): string => {
    if (locale === 'ko' && act.summaryKo) return act.summaryKo;
    if (locale === 'en' && act.summaryEn) return act.summaryEn;
    return act.summary;
  };

  return (
    <SectionCard title={t('contract.tab.timeline')} description={t('contract.timeline.description')}>
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
          {error.message}
        </div>
      )}
      {loading && activities.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={48} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-md border bg-surface-1 p-6 text-center text-[12.5px] text-fg-subtle" style={{ borderColor: 'var(--border)' }}>
          {t('contract.timeline.empty')}
        </div>
      ) : (
        <div className="relative ml-4 border-l-2 pl-6" style={{ borderColor: 'var(--border)' }}>
          {activities.map((act) => {
            const IconComponent = ACTIVITY_ICON_MAP[act.activityType] ?? Clock;
            return (
              <div key={act.id} className="relative mb-6 last:mb-0">
                <div
                  className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 border"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <IconComponent size={12} className="text-fg-muted" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-fg">{getSummary(act)}</span>
                    {act.fromStatus && act.toStatus && (
                      <span className="flex items-center gap-1 text-[11px] text-fg-muted">
                        <StatusBadge status={act.fromStatus} />
                        <ArrowRight size={10} />
                        <StatusBadge status={act.toStatus} />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-fg-subtle">
                    <span className="num font-mono">{formatDateTime(act.createdAt, localeTag)}</span>
                    <span>·</span>
                    <Badge tone="neutral" variant="soft">{act.actorType}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

/* ─────────────────────── Main Detail Screen ─────────────────────── */

type DetailTab = 'body' | 'revisions' | 'files' | 'timeline';

export function ContractDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CONTRACT_READ);
  const canWrite = useHasPermission(PERMISSIONS.CONTRACT_UPDATE);

  const [activeTab, setActiveTab] = useState<DetailTab>('body');
  const [confirmAction, setConfirmAction] = useState<{ toStatus: ContractStatus; labelKey: string } | null>(null);
  const [memo, setMemo] = useState('');

  const { data, loading, error, refetch } = useQuery<ContractDetailData>(CONTRACT_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  const [transitionStatus, { loading: transitioning }] = useMutation(CONTRACT_TRANSITION_STATUS_MUTATION);

  if (!canRead) return <LockedScreen />;

  const c = data?.contract.success?.data;

  const tabItems = [
    { key: 'body' as const, label: t('contract.tab.body'), icon: <FileText size={14} /> },
    { key: 'revisions' as const, label: t('contract.tab.revisions'), icon: <History size={14} /> },
    { key: 'files' as const, label: t('contract.tab.files'), icon: <Paperclip size={14} /> },
    { key: 'timeline' as const, label: t('contract.tab.timeline'), icon: <Activity size={14} /> },
  ];

  const transitions = c ? STATUS_TRANSITIONS[c.status] ?? [] : [];

  const handleTransition = async () => {
    if (!id || !confirmAction) return;
    try {
      const res = await transitionStatus({
        variables: { id, toStatus: confirmAction.toStatus, memo: memo.trim() || null },
      });
      const result = res.data?.contractTransitionStatus;
      if (result?.success?.data) {
        toast.success(t('contract.toast.statusChanged'));
        setConfirmAction(null);
        setMemo('');
        void refetch();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <>
      <DetailPageTemplate
        header={{
          breadcrumbs: [
            { label: t('nav.governance') },
            { label: t('nav.governance.contracts'), href: '/governance/contracts' },
            { label: c?.contractCode ?? '...' },
          ],
          title: c ? c.title : t('common.loading'),
          description: c ? (
            <span className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-fg-muted">{c.contractCode}</span>
              <Badge tone="info" variant="soft">{t(`contract.type.${c.contractType}`)}</Badge>
              <Badge tone="neutral" variant="soft">v{c.version}</Badge>
              <StatusBadge status={c.status} />
            </span>
          ) : undefined,
          meta: <code className="text-[11px] text-fg-subtle">SA-CTR-002</code>,
          actions: (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="md"
                startIcon={<ArrowLeft size={14} />}
                onClick={() => router.push('/governance/contracts')}
              >
                {t('action.back')}
              </Button>
              {canWrite && c && (
                <Button
                  variant="primary"
                  size="md"
                  startIcon={<Pencil size={14} />}
                  onClick={() => router.push(`/governance/contracts/${id}/edit`)}
                >
                  {t('contract.action.edit')}
                </Button>
              )}
            </div>
          ),
        }}
      >
        {error && (
          <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
            {error.message}
          </div>
        )}

        {/* Status Action Panel */}
        {canWrite && c && transitions.length > 0 && (
          <SectionCard title={t('contract.action.statusTransition')} description={t('contract.action.statusTransitionDesc')}>
            <div className="flex flex-wrap items-center gap-2">
              {transitions.map((tr) => (
                <Button
                  key={tr.toStatus}
                  variant={tr.variant}
                  size="sm"
                  onClick={() => setConfirmAction(tr)}
                >
                  {t(tr.labelKey)}
                </Button>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Overview */}
        <SectionCard title={t('contract.detail.overview')} description={t('contract.detail.overviewDesc')}>
          {loading && !c ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={20} />)}
            </div>
          ) : c ? (
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              <Field label={t('contract.col.contractCode')} value={<span className="font-mono">{c.contractCode}</span>} />
              <Field label={t('contract.col.contractType')} value={<Badge tone="info" variant="soft">{t(`contract.type.${c.contractType}`)}</Badge>} />
              <Field label={t('contract.col.partyBType')} value={<Badge tone="neutral" variant="soft">{t(`contract.partyBType.${c.partyBType}`)}</Badge>} />
              <Field label={t('contract.detail.partyBId')} value={<span className="font-mono text-[11px]">{c.partyBId}</span>} />
              <Field label={t('field.status')} value={<StatusBadge status={c.status} />} />
              <Field label={t('contract.detail.version')} value={`v${c.version}`} />
              <Field label={t('field.effectiveFrom')} value={c.effectiveFrom ? <span className="num font-mono">{formatDateTime(c.effectiveFrom)}</span> : '—'} />
              <Field label={t('field.effectiveTo')} value={c.effectiveTo ? <span className="num font-mono">{formatDateTime(c.effectiveTo)}</span> : '∞'} />
              <Field label={t('contract.detail.signedAt')} value={c.signedAt ? <span className="num font-mono">{formatDateTime(c.signedAt)}</span> : '—'} />
              <Field label={t('contract.detail.reviewDeadline')} value={c.reviewDeadlineAt ? <span className="num font-mono">{formatDateTime(c.reviewDeadlineAt)}</span> : '—'} />
              <Field label={t('contract.detail.createdBy')} value={<span className="font-mono text-[11px]">{c.createdBy}</span>} />
              <Field label={t('field.createdAt')} value={<span className="num font-mono">{formatDateTime(c.createdAt)}</span>} />
              <Field label={t('field.updatedAt')} value={<span className="num font-mono">{formatDateTime(c.updatedAt)}</span>} />
              {c.terminatedAt && (
                <>
                  <Field label={t('contract.detail.terminatedAt')} value={<span className="num font-mono text-danger">{formatDateTime(c.terminatedAt)}</span>} />
                  <Field label={t('contract.detail.terminationReason')} value={c.terminationReason} />
                </>
              )}
            </div>
          ) : (
            <div className="text-fg-subtle text-[12.5px]">{t('common.empty')}</div>
          )}
        </SectionCard>

        {/* Tabs */}
        {c && (
          <div className="mt-4">
            <Tabs
              variant="underline"
              items={tabItems}
              value={activeTab}
              onChange={(k) => setActiveTab(k as DetailTab)}
            />
            <div className="mt-4">
              {activeTab === 'body' && <BodyTabContent contract={c} />}
              {activeTab === 'revisions' && <RevisionsTabContent contractId={c.id} />}
              {activeTab === 'files' && <FilesTabContent contractId={c.id} />}
              {activeTab === 'timeline' && <TimelineTabContent contractId={c.id} />}
            </div>
          </div>
        )}
      </DetailPageTemplate>

      {/* Status Transition Confirm Modal */}
      <ConfirmModal
        open={!!confirmAction}
        onClose={() => {
          setConfirmAction(null);
          setMemo('');
        }}
        onConfirm={handleTransition}
        title={confirmAction ? t(confirmAction.labelKey) : ''}
        message={
          <div className="flex flex-col gap-3">
            <div className="text-[12.5px] text-fg-muted">
              {t('contract.confirm.statusTransition')
                .replace('{{from}}', c?.status ?? '')
                .replace('{{to}}', confirmAction?.toStatus ?? '')}
            </div>
            <textarea
              className="w-full rounded-md border bg-surface-1 p-2 font-mono text-[12px] text-fg"
              style={{ borderColor: 'var(--border)', minHeight: 60 }}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t('contract.confirm.memoPlaceholder')}
            />
          </div>
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={confirmAction?.toStatus === 'CANCELLED' || confirmAction?.toStatus === 'TERMINATED' ? 'danger' : 'default'}
        busy={transitioning}
      />
    </>
  );
}
