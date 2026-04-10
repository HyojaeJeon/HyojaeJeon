'use client';

import { useRouter } from 'next/navigation';
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
  type DataTableColumn,
  DataTable,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

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

interface TimelineEvent {
  id: string;
  eventType: 'CREATED' | 'REQUESTED' | 'DISPUTED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'VOIDED' | 'COMMENT';
  actorName: string;
  description: string;
  occurredAt: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceVnd: number;
  totalVnd: number;
}

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

function getTimelineIcon(eventType: TimelineEvent['eventType']) {
  switch (eventType) {
    case 'CREATED':
      return <FileText size={16} className="text-fg-muted" />;
    case 'REQUESTED':
      return <Send size={16} style={{ color: 'var(--brand)' }} />;
    case 'DISPUTED':
      return <MessageSquare size={16} style={{ color: 'var(--warn)' }} />;
    case 'SUBMITTED':
      return <Loader2 size={16} style={{ color: 'var(--brand)' }} />;
    case 'ACCEPTED':
      return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
    case 'REJECTED':
      return <XCircle size={16} className="text-danger" />;
    case 'VOIDED':
      return <Ban size={16} className="text-fg-muted" />;
    case 'COMMENT':
      return <MessageSquare size={16} className="text-fg-muted" />;
  }
}

export function InvoiceDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.INVOICE_READ);
  const canRequest = useHasPermission(PERMISSIONS.INVOICE_REQUEST);
  const canDispute = useHasPermission(PERMISSIONS.INVOICE_DISPUTE);

  if (!canRead) return <LockedScreen />;

  // TODO: useQuery for invoiceDetail(params.id) - replace these skeleton placeholders
  const loading = true;
  const status = 'DRAFT' as InvoiceStatus;
  const reviewDeadline: string | null = null;
  const timelineEvents: TimelineEvent[] = [];
  const lineItems: LineItem[] = [];

  const dday = computeDDay(reviewDeadline);

  const handleRequestIssuance = () => {
    // TODO: mutation invoiceRequestIssuance
  };

  const handleDispute = () => {
    // TODO: mutation invoiceDispute
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
            className="sticky top-0 z-10 flex items-center gap-4 rounded-xl border-2 px-5 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
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
                <Button variant="ghost" startIcon={<MessageSquare size={14} />} onClick={handleDispute}>
                  이의 제기
                </Button>
              )}
              {canRequest && (
                <Button variant="primary" startIcon={<Send size={14} />} onClick={handleRequestIssuance}>
                  발행 요청
                </Button>
              )}
            </div>
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

  const lineItemCols: DataTableColumn<LineItem>[] = [
    {
      key: 'description',
      header: '항목',
      render: (r) => <span className="text-fg">{r.description}</span>,
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
      render: (r) => <span className="num text-fg-muted">{r.unitPriceVnd.toLocaleString('vi-VN')} VND</span>,
    },
    {
      key: 'total',
      header: '합계',
      width: '140px',
      render: (r) => <span className="num font-semibold">{r.totalVnd.toLocaleString('vi-VN')} VND</span>,
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.invoices'), href: '/invoices' },
          { label: loading ? '...' : '인보이스 상세' },
        ],
        title: loading ? t('common.loading') : '인보이스 상세',
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
      <div className="mb-4">{renderStatusActionPanel()}</div>

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
              <span className="font-mono text-sm text-fg">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">기간</span>
              <span className="text-sm text-fg">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">상태</span>
              <Badge tone={STATUS_TONE[status]} size="sm" startDot>
                {STATUS_LABEL[status]}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">생성일</span>
              <span className="text-sm text-fg">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">총금액</span>
              <span className="text-sm font-semibold text-fg">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">VAT</span>
              <span className="text-sm text-fg">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">검토마감일</span>
              <span className="text-sm text-fg">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-fg-muted">GDT접수번호</span>
              <span className="font-mono text-sm text-fg">—</span>
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
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">세금코드</span>
                <span className="font-mono text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">대표자</span>
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">주소</span>
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">이메일</span>
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">전화번호</span>
                <span className="text-sm text-fg">—</span>
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
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">세금코드</span>
                <span className="font-mono text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">대표자</span>
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">주소</span>
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">이메일</span>
                <span className="text-sm text-fg">—</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-fg-muted">전화번호</span>
                <span className="text-sm text-fg">—</span>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Section 4: Line Items */}
      <div className="mt-4">
        <SectionCard title="라인 항목" description="인보이스 세부 항목" padding="none">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={30} />
              ))}
            </div>
          ) : (
            <DataTable
              columns={lineItemCols}
              rows={lineItems}
              rowKey={(r) => r.id}
              compact
              emptyState="라인 항목이 없습니다."
            />
          )}
        </SectionCard>
      </div>

      {/* Section 5: Timeline */}
      <div className="mt-4">
        <SectionCard title="검토/발행 타임라인" description="인보이스 이벤트 이력">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton width={32} height={32} radius={16} />
                  <div className="flex-1 space-y-1">
                    <Skeleton width={200} height={14} />
                    <Skeleton width={300} height={12} />
                  </div>
                  <Skeleton width={100} height={12} />
                </div>
              ))}
            </div>
          ) : timelineEvents.length === 0 ? (
            <p className="text-sm text-fg-muted">이벤트 이력이 없습니다.</p>
          ) : (
            <div className="space-y-0">
              {timelineEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="relative flex items-start gap-3 py-3"
                >
                  {/* Connector line */}
                  {idx < timelineEvents.length - 1 && (
                    <div
                      className="absolute left-4 top-10 h-full w-px"
                      style={{ background: 'var(--border)' }}
                    />
                  )}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    {getTimelineIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-fg">{event.actorName}</p>
                    <p className="text-[12px] text-fg-muted">{event.description}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-fg-subtle">
                    {new Date(event.occurredAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
