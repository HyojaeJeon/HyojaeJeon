'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_EINVOICE_DETAIL_QUERY,
  REQUEST_CONSOLIDATED_INVOICE_MUTATION,
  DISPUTE_CONSOLIDATED_INVOICE_MUTATION,
  SUBMIT_CONSOLIDATED_INVOICE_MUTATION,
  type CorporateEInvoiceDetailData,
  type CorporateEInvoiceDetailRow,
  type CorporateEInvoiceLineRow,
  type CorporateEInvoiceSubmissionLogRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-[11.5px] font-semibold uppercase tracking-wide text-fg-subtle">{label}</span>
      <span className="text-right text-[12.5px] text-fg">{value ?? '—'}</span>
    </div>
  );
}

export function CorporateEInvoiceDetailScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');
  const params = useParams<{ id: string; invoiceId: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const invoiceId = params?.invoiceId;

  const canRead = useHasPermission(PERMISSIONS.CORPORATE_INVOICE_READ);
  const canRequest = useHasPermission(PERMISSIONS.CORPORATE_INVOICE_REQUEST);
  const canDispute = useHasPermission(PERMISSIONS.CORPORATE_INVOICE_DISPUTE);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_INVOICE_WRITE);

  const { data, loading, refetch } = useQuery<CorporateEInvoiceDetailData>(CORPORATE_EINVOICE_DETAIL_QUERY, {
    variables: { id: corporateId, invoiceId },
    skip: !corporateId || !invoiceId,
    errorPolicy: 'all',
  });

  const [requestIssuance, { loading: requesting }] = useMutation(REQUEST_CONSOLIDATED_INVOICE_MUTATION, { onCompleted: () => refetch() });
  const [dispute, { loading: disputing }] = useMutation(DISPUTE_CONSOLIDATED_INVOICE_MUTATION, { onCompleted: () => refetch() });
  const [submit, { loading: submitting }] = useMutation(SUBMIT_CONSOLIDATED_INVOICE_MUTATION, { onCompleted: () => refetch() });

  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const inv: CorporateEInvoiceDetailRow | undefined = data?.eInvoice.success?.data;
  const lines: CorporateEInvoiceLineRow[] = inv?.lines ?? [];
  const logs: CorporateEInvoiceSubmissionLogRow[] = inv?.submissionLogs ?? [];

  const lineCols: DataTableColumn<CorporateEInvoiceLineRow>[] = [
    { key: 'seq', header: '#', width: '50px', render: (r) => <span className="font-mono text-[11px] text-fg-subtle">{r.seq}</span> },
    { key: 'item', header: t('field.name'), render: (r) => (
      <div className="flex flex-col">
        <span className="font-semibold text-fg">{r.itemName}</span>
        {r.itemCode && <span className="font-mono text-[10px] text-fg-subtle">{r.itemCode}</span>}
      </div>
    ) },
    { key: 'uom', header: t('field.uom'), width: '70px', render: (r) => <span className="text-[12px] text-fg-muted">{r.uom}</span> },
    { key: 'qty', header: t('field.qty'), align: 'right', width: '90px', render: (r) => <span className="num font-mono text-[12px]">{r.quantity}</span> },
    { key: 'unit', header: t('field.unitPrice'), align: 'right', width: '120px', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.unitPriceVnd)}</span> },
    { key: 'amount', header: t('field.lineAmount'), align: 'right', width: '130px', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.amountVnd)}</span> },
    { key: 'vatRate', header: t('field.vatRatePct'), align: 'right', width: '80px', render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{r.vatTreatment === 'TAXED' ? `${r.vatRatePct}%` : r.vatTreatment}</span> },
    { key: 'vat', header: t('field.lineVat'), align: 'right', width: '120px', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.vatAmountVnd)}</span> },
    { key: 'pay', header: t('field.linePayable'), align: 'right', width: '130px', render: (r) => <span className="num font-mono text-[12px] font-bold">{fmt.decimal(r.payAmountVnd)}</span> },
  ];

  const logCols: DataTableColumn<CorporateEInvoiceSubmissionLogRow>[] = [
    { key: 'attempt', header: t('einvoices.detail.attempt'), width: '70px', render: (r) => <span className="font-mono text-[12px]">#{r.attempt}</span> },
    { key: 'provider', header: t('einvoices.detail.providerType'), width: '120px', render: (r) => <span className="font-mono text-[11px]">{r.providerType}</span> },
    { key: 'env', header: t('einvoices.detail.environment'), width: '120px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.environment}</span> },
    { key: 'status', header: t('field.status'), width: '140px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'errorCode', header: t('einvoices.detail.errorCode'), width: '160px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.errorCode ?? '—'}</span> },
    { key: 'message', header: t('field.actionLabel'), render: (r) => <span className="text-[12px] text-fg-muted">{r.errorMessage ?? '—'}</span> },
    { key: 'duration', header: t('einvoices.detail.duration'), width: '100px', align: 'right', render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{r.durationMs ?? '—'}</span> },
    { key: 'createdAt', header: t('field.when'), width: '170px', render: (r) => <span className="num text-[11px] text-fg-muted">{formatDateTime(r.createdAt, localeTag)}</span> },
  ];

  const onRequest = async () => {
    setError(null);
    const res = await requestIssuance({ variables: { id: invoiceId } });
    if (res.data?.eInvoiceRequestIssuance?.error) {
      setError(res.data.eInvoiceRequestIssuance.error.message);
    }
  };

  const onSubmit = async () => {
    setError(null);
    const res = await submit({ variables: { id: invoiceId } });
    if (res.data?.eInvoiceSubmitForIssuance?.error) {
      setError(res.data.eInvoiceSubmitForIssuance.error.message);
    }
  };

  const onDispute = async () => {
    if (!disputeReason.trim()) return;
    setError(null);
    const res = await dispute({ variables: { id: invoiceId, reason: disputeReason.trim() } });
    if (res.data?.eInvoiceDispute?.error) {
      setError(res.data.eInvoiceDispute.error.message);
      return;
    }
    setShowDispute(false);
    setDisputeReason('');
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.detail.subnav.einvoices'), href: `/tenants/corporates/${corporateId}/einvoices` },
          { label: inv?.serialNo ? `${inv.serialNo}-${inv.invoiceNo ?? '?'}` : (inv?.refId ?? '…') },
        ],
        title: inv ? `${c?.companyName ?? ''} · ${t('corporate.einvoices.detail.title')}` : t('common.loading'),
        description: inv ? `${inv.periodStart.slice(0, 10)} → ${inv.periodEnd.slice(0, 10)}` : '',
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-INV-002</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}/einvoices`)}>
              {t('action.cancel')}
            </Button>
            {inv?.status === 'DRAFT' && canRequest && (
              <Button variant="primary" startIcon={<Send size={14} />} loading={requesting} onClick={onRequest}>
                {t('corporate.einvoices.detail.action.request')}
              </Button>
            )}
            {inv?.status === 'DRAFT' && canDispute && (
              <Button variant="ghost" startIcon={<AlertTriangle size={14} />} onClick={() => setShowDispute((v) => !v)}>
                {t('corporate.einvoices.detail.action.dispute')}
              </Button>
            )}
            {inv?.status === 'REQUESTED' && canWrite && (
              <Button variant="primary" startIcon={<CheckCircle2 size={14} />} loading={submitting} onClick={onSubmit}>
                {t('corporate.einvoices.detail.action.submit')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={inv ? [
        { label: t('field.totVndPretax'), value: <span className="num font-mono">{fmt.decimal(inv.totAmountVnd)}</span> },
        { label: t('field.totVndDiscount'), value: <span className="num font-mono">{fmt.decimal(inv.totDiscountVnd)}</span> },
        { label: t('field.totVndVat'), value: <span className="num font-mono">{fmt.decimal(inv.totVatAmountVnd)}</span>, tone: 'info' },
        { label: t('field.totVndPayable'), value: <span className="num font-mono">{fmt.decimal(inv.totPayableVnd)}</span>, tone: 'brand' },
        { label: t('field.status'), value: <StatusBadge status={inv.status} /> },
      ] : []}
    >
      {error && <div className="mb-3 rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}

      {showDispute && canDispute && (
        <div className="mb-3">
          <SectionCard title={t('corporate.einvoices.detail.disputePromptTitle')}>
            <div className="flex flex-col gap-3">
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder={t('corporate.einvoices.detail.disputePromptPlaceholder')}
                rows={3}
                className="w-full rounded-md px-3 py-2 text-[13px]"
                style={{ background: 'var(--surface-1)', boxShadow: 'inset 0 0 0 1px var(--border)' }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setShowDispute(false); setDisputeReason(''); }}>{t('action.cancel')}</Button>
                <Button variant="primary" loading={disputing} onClick={onDispute} disabled={!disputeReason.trim()}>
                  {t('corporate.einvoices.detail.action.dispute')}
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {loading && !inv ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={40} />)}</div>
      ) : !inv ? (
        <SectionCard title="—"><div className="text-center text-[12px] text-fg-subtle">No invoice</div></SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Issuance metadata */}
          <SectionCard title={<span className="flex items-center gap-2"><FileText size={14} className="text-primary" />{t('corporate.einvoices.detail.section.summary')}</span>}>
            <div className="flex flex-col">
              <MetaRow label={t('einvoices.detail.refId')} value={<span className="font-mono text-[11px]">{inv.refId ?? '—'}</span>} />
              <MetaRow label={t('field.invoiceSerial')} value={<span className="font-mono text-[11px]">{inv.serialNo ? `${inv.serialNo}-${inv.invoiceNo ?? '?'}` : '—'}</span>} />
              <MetaRow label={t('einvoices.detail.cqtCode')} value={<span className="font-mono text-[11px]">{inv.cqtCode ?? '—'}</span>} />
              <MetaRow label={t('einvoices.detail.lookupCode')} value={<span className="font-mono text-[11px]">{inv.lookupCode ?? '—'}</span>} />
              <MetaRow label={t('field.gdtReceipt')} value={<span className="font-mono text-[11px]">{inv.gdtReceiptNo ?? '—'}</span>} />
              <MetaRow label={t('einvoices.detail.providerType')} value={inv.providerType ?? '—'} />
              <MetaRow label={t('einvoices.detail.consolidationStrategy')} value={inv.consolidationStrategy ?? '—'} />
              <MetaRow label={t('einvoices.detail.sourceTransactionCount')} value={inv.sourceTransactionCount ?? '—'} />
            </div>
          </SectionCard>

          {/* Workflow + legal timestamps */}
          <SectionCard title={t('corporate.einvoices.detail.section.workflow')}>
            <div className="flex flex-col">
              <MetaRow label={t('einvoices.detail.requestedAt')} value={inv.requestedAt ? formatDateTime(inv.requestedAt, localeTag) : '—'} />
              <MetaRow label={t('einvoices.detail.disputedAt')} value={inv.disputedAt ? formatDateTime(inv.disputedAt, localeTag) : '—'} />
              {inv.disputeReason && <MetaRow label={t('einvoices.detail.disputeReason')} value={<span className="text-[12px]">{inv.disputeReason}</span>} />}
              <MetaRow label={t('einvoices.detail.submittedAt')} value={inv.submittedAt ? formatDateTime(inv.submittedAt, localeTag) : '—'} />
              <div className="my-1.5 h-px" style={{ background: 'var(--border)' }} />
              <MetaRow label={t('einvoices.detail.invoiceIssuedAt')} value={inv.invoiceIssuedAt ? formatDateTime(inv.invoiceIssuedAt, localeTag) : '—'} />
              <MetaRow label={t('einvoices.detail.signedAt')} value={inv.signedAt ? formatDateTime(inv.signedAt, localeTag) : '—'} />
              <MetaRow label={t('einvoices.detail.acceptedAt')} value={inv.acceptedAt ? formatDateTime(inv.acceptedAt, localeTag) : '—'} />
              <MetaRow label={t('einvoices.detail.rejectedAt')} value={inv.rejectedAt ? formatDateTime(inv.rejectedAt, localeTag) : '—'} />
              {inv.rejectionReason && <MetaRow label={t('einvoices.detail.rejectionReason')} value={<span className="text-[12px] text-danger">{inv.rejectionReason}</span>} />}
            </div>
          </SectionCard>

          {/* Seller */}
          <SectionCard title={t('corporate.einvoices.detail.section.seller')}>
            <div className="flex flex-col">
              <MetaRow label={t('field.taxCodeShort')} value={<span className="font-mono text-[11px]">{inv.sellerTaxCode ?? '—'}</span>} />
              <MetaRow label={t('field.company')} value={inv.sellerCompanyName ?? '—'} />
              <MetaRow label={t('field.email')} value={inv.sellerEmail ?? '—'} />
              <MetaRow label="Address" value={<span className="text-[12px]">{inv.sellerAddress ?? '—'}</span>} />
            </div>
          </SectionCard>

          {/* Buyer */}
          <SectionCard title={t('corporate.einvoices.detail.section.buyer')}>
            <div className="flex flex-col">
              <MetaRow label={t('field.taxCodeShort')} value={<span className="font-mono text-[11px]">{inv.buyerTaxCode ?? '—'}</span>} />
              <MetaRow label={t('field.company')} value={inv.buyerCompanyName ?? '—'} />
              <MetaRow label={t('field.email')} value={inv.buyerEmail ?? '—'} />
              <MetaRow label="Address" value={<span className="text-[12px]">{inv.buyerAddress ?? '—'}</span>} />
            </div>
          </SectionCard>
        </div>
      )}

      {inv && (
        <>
          <div className="mt-3">
            <SectionCard title={t('corporate.einvoices.detail.section.lines')} description={`${lines.length} line(s)`} padding="none">
              <DataTable columns={lineCols} rows={lines} rowKey={(r) => r.id} compact emptyState={t('corporate.einvoices.detail.noLines')} />
            </SectionCard>
          </div>
          <div className="mt-3">
            <SectionCard title={t('corporate.einvoices.detail.section.submissionLogs')} description={`${logs.length} attempt(s)`} padding="none">
              <DataTable columns={logCols} rows={logs} rowKey={(r) => r.id} compact emptyState={t('corporate.einvoices.detail.noLogs')} />
            </SectionCard>
          </div>
        </>
      )}
    </DetailPageTemplate>
  );
}
