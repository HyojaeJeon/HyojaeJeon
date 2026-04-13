'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Badge, Button, Skeleton } from '@platform/shared-ui';
import {
  PLATFORM_POLICY_DETAIL_QUERY,
  type PlatformPolicyDetailData,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';
import { CreatePolicyModal } from '@screens/platformPolicyListScreen/CreatePolicyModal';

export function PlatformPolicyDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const { data, loading, error, refetch } = useQuery<PlatformPolicyDetailData>(
    PLATFORM_POLICY_DETAIL_QUERY,
    {
      variables: { id },
      skip: !id,
      errorPolicy: 'all',
    },
  );

  const p = data?.policy.success?.data;

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance') },
          { label: t('nav.governance.policies'), href: '/governance/platformPolicies' },
          { label: p?.policyKey ?? '...' },
        ],
        title: p ? p.policyKey : t('common.loading'),
        description: p ? (
          <span className="flex items-center gap-2">
            <Badge tone="info" variant="soft">{p.scopeType}</Badge>
            <Badge tone="neutral" variant="soft">v{p.version}</Badge>
            {p.isActive ? (
              <Badge tone="success" startDot>{t('policy.form.isActive')}</Badge>
            ) : (
              <Badge tone="neutral" variant="soft">INACTIVE</Badge>
            )}
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-POL-002</code>,
        actions: (
          <span className="flex items-center gap-2">
            <Button
              variant="ghost"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => router.push('/governance/platformPolicies')}
            >
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              {t('policy.action.newVersion')}
            </Button>
          </span>
        ),
      }}
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
          {error.message}
        </div>
      )}
      <SectionCard title={t('policy.detail.title')} description={t('policy.detail.description')}>
        {loading && !p ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={22} />
            ))}
          </div>
        ) : p ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('policy.form.policyKey')}</span>
              <span className="font-mono text-fg">{p.policyKey}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('policy.form.scopeType')}</span>
              <Badge tone="info" variant="soft">{p.scopeType}</Badge>
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('policy.form.scopeId')}</span>
              <span className="text-fg">{p.scopeId ?? '\u2014'}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('policy.form.version')}</span>
              <span className="num font-mono text-fg">v{p.version}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('policy.form.isActive')}</span>
              {p.isActive ? (
                <Badge tone="success" startDot>ACTIVE</Badge>
              ) : (
                <Badge tone="neutral" variant="soft">INACTIVE</Badge>
              )}
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('common.createdAt')}</span>
              <span className="num font-mono text-fg">{formatDateTime(p.createdAt)}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-fg-muted">{t('common.updatedAt')}</span>
              <span className="num font-mono text-fg">{formatDateTime(p.updatedAt)}</span>
            </div>
            <div className="col-span-2 mt-3">
              <div className="text-fg-muted text-[11px] mb-1">{t('policy.form.policyValue')}</div>
              <pre
                className="rounded-md border bg-surface-1 p-3 font-mono text-[11px] text-fg-muted overflow-auto"
                style={{ borderColor: 'var(--border)' }}
              >
                {JSON.stringify(p.policyValueJson, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <CreatePolicyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
        defaultPolicyKey={p?.policyKey}
        defaultScopeType={p?.scopeType}
        defaultScopeId={p?.scopeId}
      />
    </DetailPageTemplate>
  );
}
