'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  DatePicker,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_EINVOICES_QUERY,
  GENERATE_CONSOLIDATED_INVOICE_MUTATION,
  type CorporateEInvoicesData,
  type CorporateInvoiceRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';

export function CorporateEInvoicesScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_INVOICE_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_INVOICE_WRITE);

  const { data, loading, refetch } = useQuery<CorporateEInvoicesData>(CORPORATE_EINVOICES_QUERY, {
    variables: { id: corporateId },
    skip: !corporateId,
    errorPolicy: 'all',
  });
  const [generate, { loading: generating }] = useMutation(GENERATE_CONSOLIDATED_INVOICE_MUTATION, { onCompleted: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [periodStart, setPeriodStart] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const invoices: CorporateInvoiceRow[] = data?.eInvoicesByCorporate.success?.data ?? [];

  const cols: DataTableColumn<CorporateInvoiceRow>[] = [
    { key: 'period', header: t('field.period'), width: '220px', render: (r) => <span className="font-mono text-[12px]">{r.periodStart.slice(0, 10)} → {r.periodEnd.slice(0, 10)}</span> },
    { key: 'serial', header: t('field.invoiceSerial'), width: '160px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.serialNo ? `${r.serialNo}-${r.invoiceNo ?? '?'}` : '—'}</span> },
    { key: 'pretax', header: t('field.totVndPretax'), align: 'right', render: (r) => <span className="num font-mono text-[12px] text-fg-muted">{fmt.decimal(r.totAmountVnd)}</span> },
    { key: 'vat', header: t('field.totVndVat'), align: 'right', render: (r) => <span className="num font-mono text-[12px] text-fg-muted">{fmt.decimal(r.totVatAmountVnd)}</span> },
    { key: 'payable', header: t('field.totVndPayable'), align: 'right', render: (r) => <span className="num font-mono text-[12px] font-bold">{fmt.decimal(r.totPayableVnd)}</span> },
    { key: 'gdt', header: t('field.gdtReceipt'), render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.gdtReceiptNo ?? '—'}</span> },
    { key: 'status', header: t('field.status'), width: '140px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'issued', header: t('field.invoiceIssuedAt'), width: '160px', render: (r) => <span className="num text-[11px] text-fg-muted">{r.invoiceIssuedAt ? formatDateTime(r.invoiceIssuedAt, localeTag) : formatDateTime(r.createdAt, localeTag)}</span> },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!periodStart || !periodEnd) {
      setError(t('corporate.errorPeriodRequired'));
      return;
    }
    const res = await generate({
      variables: {
        input: {
          corporateId,
          periodStart: new Date(periodStart).toISOString(),
          periodEnd: new Date(periodEnd).toISOString(),
        },
      },
    });
    const env = res.data?.eInvoiceGenerate;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    setPeriodStart(null);
    setPeriodEnd(null);
    setShowForm(false);
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.detail.subnav.einvoices') },
        ],
        title: c ? `${c.companyName} · E-Invoices` : t('common.loading'),
        description: t('corporate.einvoices.pageDescription'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-INV-001</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}`)}>{t('action.cancel')}</Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowForm((v) => !v)}>
                {t('corporate.action.cta.generateInvoice')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.einvoices.summary.total'), value: invoices.length, tone: 'brand' },
        { label: t('corporate.einvoices.summary.taxCode'), value: <span className="font-mono text-sm">{c?.taxCode ?? '—'}</span> },
      ]}
    >
      {showForm && canWrite && (
        <div className="mb-3">
          <SectionCard
            title={<span className="flex items-center gap-2"><FileText size={14} className="text-primary" />{t('corporate.einvoices.formTitle')}</span>}
            description={t('corporate.einvoices.formDescription')}
          >
            <form onSubmit={submit} className="flex flex-col gap-3">
              {error && <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('corporate.einvoices.periodStart')} *</label>
                  <DatePicker value={periodStart} onChange={setPeriodStart} locale={localeTag} minWidth="100%" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('corporate.einvoices.periodEnd')} *</label>
                  <DatePicker value={periodEnd} onChange={setPeriodEnd} locale={localeTag} minWidth="100%" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('action.cancel')}</Button>
                <Button type="submit" variant="primary" loading={generating}>{t('corporate.einvoices.generate')}</Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}
      <SectionCard title={t('corporate.einvoices.cardTitle')} description={`${invoices.length} invoice(s)`} padding="none">
        {loading && invoices.length === 0 ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable
            columns={cols}
            rows={invoices}
            rowKey={(r) => r.id}
            compact
            emptyState={t('corporate.einvoices.empty')}
            onRowClick={(r) => router.push(`/tenants/corporates/${corporateId}/einvoices/${r.id}`)}
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
