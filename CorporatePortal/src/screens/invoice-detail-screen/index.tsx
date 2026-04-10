'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  MessageSquare,
  XCircle,
  Loader2,
  Ban,
} from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Badge,
  Skeleton,
  Input,
  type DataTableColumn,
  DataTable,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';
import {
  INVOICE_DETAIL_QUERY,
  REQUEST_ISSUANCE_MUTATION,
  DISPUTE_MUTATION,
  type InvoiceDetailData,
  type InvoiceDetail,
  type InvoiceLine,
} from '@graphql/queries/invoice';

type InvoiceStatus =
  | 'DRAFT'
  | 'DISPUTED'
  | 'REQUESTED'
  | 'SUBMITTING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'VOIDED';

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: '검토 대기',
  DISPUTED: '이의 제기 중',
  REQUESTED: '발행 요청됨',
  SUBMITTING: '제출 중',
  ACCEPTED: '발급 완료',
  REJECTED: '거부됨',
  VOIDED: '무효',
};

const STATUS_TONE: Record<InvoiceStatus, 'neutral' | 'warning' | 'brand' | 'success' | 'danger'> = {
  DRAFT: 'neutral',
  DISPUTED: 'warning',
  REQUESTED: 'brand',
  SUBMITTING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  VOIDED: 'neutral',
};

function computeDDay(deadline: string | null): string | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
}

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}

export function InvoiceDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const canRead = useHasPermission(PERMISSIONS.INVOICE_READ);
  const canRequest = useHasPermission(PERMISSIONS.INVOICE_REQUEST);
  const canDispute = useHasPermission(PERMISSIONS.INVOICE_DISPUTE);

  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<InvoiceDetailData>(INVOICE_DETAIL_QUERY, {
    variables: { id: params?.id },
    skip: !params?.id,
  });
  const invoice = (data?.eInvoice?.success?.data ?? null) as InvoiceDetail | null;

  const [requestIssuance, { loading: requesting }] = useMutation(REQUEST_ISSUANCE_MUTATION);
  const [dispute, { loading: disputing }] = useMutation(DISPUTE_MUTATION);

  if (!canRead) return <LockedScreen />;

  const status = (invoice?.status ?? 'DRAFT') as InvoiceStatus;
  const dday = computeDDay(invoice?.reviewDueAt ?? null);
  const lines: InvoiceLine[] = invoice?.lines ?? [];

  const handleRequestIssuance = async () => {
    setActionError(null);
    try {
      const result = await requestIssuance({ variables: { id: params?.id } });
      const gqlError = result.data?.eInvoiceRequestIssuance?.error;
      if (gqlError) {
        setActionError(gqlError.message);
        return;
      }
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '발행 요청에 실패했습니다.');
    }
  };

  const handleDispute = async () => {
    setActionError(null);
    if (!disputeReason.trim()) {
      setActionError('이의 제기 사유를 입력해주세요.');
      return;
    }
    try {
      const result = await dispute({ variables: { id: params?.id, reason: disputeReason } });
      const gqlError = result.data?.eInvoiceDispute?.error;
      if (gqlError) {
        setActionError(gqlError.message);
        return;
      }
      setDisputeReason('');
      setShowDisputeForm(false);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '이의 제기에 실패했습니다.');
    }
  };

  const handleDownloadPdf = () => {
    // TODO: download PDF
  };

  const handleDownloadXml = () => {
    // TODO: download XML
  };

  const renderStatusActionPanel = () => {
    switch (status) {
      case 'DRAFT':
        return (
          <div
            className="sticky top-0 z-10 flex flex-col gap-3 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
            {actionError && (
              <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>
                {actionError}
              </div>
            )}
            <div className="flex items-center gap-4">
              <Clock size={24} className="text-fg-muted" />
              <div className="flex-1">
                <p className="text-sm font-bold text-fg">검토 대기 중</p>
                <p className="text-[12px] text-fg-muted">
                  마감일 전에 내용을 확인하고 발행 요청하세요.
                </p>
              </div>
              {dday && (
                <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[13px] font-bold text-fg">
                  {dday}
                </span>
              )}
              <div className="flex gap-2">
                {canDispute && (
                  <Button variant="ghost" startIcon={<MessageSquare size={14} />} onClick={() => setShowDisputeForm((v) => !v)}>
                    이의 제기
                  </Button>
                )}
                {canRequest && (
                  <Button variant="primary" startIcon={<Send size={14} />} onClick={handleRequestIssuance} disabled={requesting}>
                    {requesting ? '요청 중...' : '발행 요청'}
                  </Button>
                )}
              </div>
            </div>
            {showDisputeForm && canDispute && (
              <div className="flex items-end gap-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">이의 제기 사유 *</label>
                  <Input
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="이의 제기 사유를 입력하세요"
                    required
                  />
                </div>
                <Button variant="ghost" onClick={() => setShowDisputeForm(false)}>취소</Button>
                <Button variant="primary" onClick={handleDispute} disabled={disputing}>
                  {disputing ? '제출 중...' : '제출'}
                </Button>
              </div>
            )}
          </div>
        );

      case 'DISPUTED':
        return (
          <div
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)' }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--warn)' }} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--warn)' }}>
                이의 제기 중 -- SuperAdmin 응답 대기
              </p>
              <p className="text-[12px] text-fg-muted">
                이의 제기 내용이 SuperAdmin에게 전달되었습니다. 응답을 기다려주세요.
              </p>
              {invoice?.disputeReason && (
                <p className="mt-1 text-[12px] text-fg-muted">
                  사유: {invoice.disputeReason}
                </p>
              )}
            </div>
          </div>
        );

      case 'REQUESTED':
        return (
          <div
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--brand)', background: 'var(--brand-soft)' }}
          >
            <Send size={24} style={{ color: 'var(--brand)' }} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                발행 요청 완료 -- SuperAdmin 검수 대기
              </p>
              <p className="text-[12px] text-fg-muted">
                발행 요청이 접수되었습니다. SuperAdmin의 검수를 기다려주세요.
              </p>
            </div>
          </div>
        );

      case 'SUBMITTING':
        return (
          <div
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)' }}
          >
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--warn)' }} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--warn)' }}>
                GDT 제출 중
              </p>
              <p className="text-[12px] text-fg-muted">
                세금계산서가 GDT에 제출 중입니다. 잠시 기다려주세요.
              </p>
            </div>
          </div>
        );

      case 'ACCEPTED':
        return (
          <div
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--success)', background: 'var(--success-soft)' }}
          >
            <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                발급 완료
              </p>
              <p className="text-[12px] text-fg-muted">
                GDT에서 정상적으로 승인되었습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" startIcon={<Download size={14} />} onClick={handleDownloadPdf}>
                PDF 다운로드
              </Button>
              <Button variant="ghost" startIcon={<Download size={14} />} onClick={handleDownloadXml}>
                XML 다운로드
              </Button>
            </div>
          </div>
        );

      case 'REJECTED':
        return (
          <div
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}
          >
            <XCircle size={24} className="text-danger" />
            <div className="flex-1">
              <p className="text-sm font-bold text-danger">GDT 거부됨</p>
              <p className="text-[12px] text-fg-muted">
                세금계산서가 GDT에서 거부되었습니다. SuperAdmin에게 문의하세요.
              </p>
              {invoice?.rejectionReason && (
                <p className="mt-1 text-[12px] text-fg-muted">
                  거부 사유: {invoice.rejectionReason}
                </p>
              )}
            </div>
            <Button variant="danger" size="sm" onClick={() => { /* TODO: open support link */ }}>
              SuperAdmin 문의
            </Button>
          </div>
        );

      case 'VOIDED':
        return (
          <div
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <Ban size={24} className="text-fg-muted" />
            <div className="flex-1">
              <p className="text-sm font-bold text-fg-muted">무효 처리됨</p>
              <p className="text-[12px] text-fg-subtle">
                이 세금계산서는 무효 처리되었습니다.
              </p>
            </div>
          </div>
        );
    }
  };

  const lineItemCols: DataTableColumn<InvoiceLine>[] = [
    {
      key: 'itemName',
      header: '항목',
      render: (r) => (
        <div>
          <span className="text-fg">{r.itemName}</span>
          {r.itemCode && <span className="ml-2 font-mono text-[11px] text-fg-subtle">{r.itemCode}</span>}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: '수량',
      width: '80px',
      render: (r) => <span className="num">{r.quantity}</span>,
    },
    {
      key: 'unitPrice',
      header: '단가',
      width: '140px',
      render: (r) => <span className="num text-fg-muted">{formatCurrency(r.unitPriceVnd)}</span>,
    },
    {
      key: 'vatAmount',
      header: 'VAT',
      width: '120px',
      render: (r) => <span className="num text-fg-muted">{formatCurrency(r.vatAmountVnd)}</span>,
    },
    {
      key: 'total',
      header: '합계',
      width: '140px',
      render: (r) => <span className="num font-semibold">{formatCurrency(r.payAmountVnd)}</span>,
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.invoices'), href: '/invoices' },
          { label: loading ? '...' : (invoice?.invoiceNo ?? '인보이스 상세') },
        ],
        title: loading ? t('common.loading') : (invoice?.invoiceNo ?? '인보이스 상세'),
        actions: (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => router.push('/invoices')}
            >
              {t('common.back')}
            </Button>
          </div>
        ),
      }}
    >
      {/* Status Action Panel */}
      {!loading && <div className="mb-4">{renderStatusActionPanel()}</div>}

      {/* Section 1: Invoice Header */}
      <SectionCard title="인보이스 정보">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton width={80} height={12} />
                <Skeleton width={140} height={20} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">참조번호</span>
              <span className="font-mono text-sm text-fg">{invoice?.invoiceNo ?? '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">기간</span>
              <span className="text-sm text-fg">
                {invoice ? formatPeriod(invoice.periodStart, invoice.periodEnd) : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">상태</span>
              <Badge tone={STATUS_TONE[status]} size="sm" startDot>
                {STATUS_LABEL[status]}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">생성일</span>
              <span className="text-sm text-fg">
                {invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ko-KR') : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">총금액</span>
              <span className="text-sm font-semibold text-fg">
                {invoice ? formatCurrency(invoice.totPayableVnd) : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">VAT</span>
              <span className="text-sm text-fg">
                {invoice ? formatCurrency(invoice.totVatAmountVnd) : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">검토마감일</span>
              <span className="text-sm text-fg">
                {invoice?.reviewDueAt ? new Date(invoice.reviewDueAt).toLocaleDateString('ko-KR') : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">GDT접수번호</span>
              <span className="font-mono text-sm text-fg">{invoice?.gdtReceiptNo ?? '—'}</span>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Section 2: Seller Snapshot */}
      <div className="mt-4">
        <SectionCard title="플랫폼 사업자 정보 (Seller)" description="판매자 정보 — 읽기 전용">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton width={80} height={12} />
                  <Skeleton width={160} height={20} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">사업자명</span>
                <span className="text-sm text-fg">{invoice?.sellerCompanyName ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">세금코드</span>
                <span className="font-mono text-sm text-fg">{invoice?.sellerTaxCode ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">주소</span>
                <span className="text-sm text-fg">{invoice?.sellerAddress ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">이메일</span>
                <span className="text-sm text-fg">{invoice?.sellerEmail ?? '—'}</span>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Section 3: Buyer Snapshot */}
      <div className="mt-4">
        <SectionCard title="우리 회사 정보 (Buyer)" description="매입자 정보 — 읽기 전용">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton width={80} height={12} />
                  <Skeleton width={160} height={20} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">사업자명</span>
                <span className="text-sm text-fg">{invoice?.buyerCompanyName ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">세금코드</span>
                <span className="font-mono text-sm text-fg">{invoice?.buyerTaxCode ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">주소</span>
                <span className="text-sm text-fg">{invoice?.buyerAddress ?? '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">이메일</span>
                <span className="text-sm text-fg">{invoice?.buyerEmail ?? '—'}</span>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Section 4: Line Items */}
      <div className="mt-4">
        <SectionCard title="라인 항목" description={`${lines.length}건`} padding="none">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={30} />
              ))}
            </div>
          ) : (
            <DataTable
              columns={lineItemCols}
              rows={lines}
              rowKey={(r) => r.id}
              compact
              emptyState="라인 항목이 없습니다."
            />
          )}
        </SectionCard>
      </div>

      {/* Section 5: Submission Logs */}
      {invoice?.submissionLogs && invoice.submissionLogs.length > 0 && (
        <div className="mt-4">
          <SectionCard title="제출 이력" description={`${invoice.submissionLogs.length}건`}>
            <div className="space-y-0">
              {invoice.submissionLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b py-3 last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                    ) : log.status === 'FAILED' ? (
                      <XCircle size={16} className="text-danger" />
                    ) : (
                      <Loader2 size={16} className="text-fg-muted" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-fg">
                      Attempt #{log.attempt} - {log.providerType} ({log.environment})
                    </p>
                    <p className="text-[12px] text-fg-muted">
                      {log.status}{log.durationMs ? ` - ${log.durationMs}ms` : ''}
                    </p>
                    {log.errorMessage && (
                      <p className="mt-0.5 text-[12px] text-danger">{log.errorCode}: {log.errorMessage}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-fg-subtle">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </DetailPageTemplate>
  );
}
