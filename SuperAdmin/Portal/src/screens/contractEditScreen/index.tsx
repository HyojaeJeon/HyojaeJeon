'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  FileText,
  Settings,
  Paperclip,
  Upload,
  Download,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  Tabs,
  Badge,
  Button,
  Input,
  Select,
  DatePicker,
  DataTable,
  Skeleton,
  type DataTableColumn,
  type SelectOption,
} from '@platform/shared-ui';
import {
  CONTRACT_DETAIL_QUERY,
  CONTRACT_UPDATE_BODY_MUTATION,
  CONTRACT_UPDATE_TERMS_MUTATION,
  CONTRACT_UPLOAD_FILE_MUTATION,
  type ContractDetailData,
  type ContractDetail,
  type ContractFile,
} from '@graphql/queries/contract';
import { HtmlEditor } from '@shared/ui/HtmlEditor';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatDateTime } from '@shared/utils/format';

/* ─────────────────────── Types ─────────────────────── */

type EditTab = 'body' | 'terms' | 'files' | 'metadata';
type LocaleTab = 'vi' | 'ko' | 'en';

const LOCALE_TABS: { key: LocaleTab; label: string }[] = [
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
];

const FILE_TYPES: SelectOption[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'AGREED', label: 'Agreed' },
  { value: 'SIGNED_A', label: 'Signed (Party A)' },
  { value: 'SIGNED_B', label: 'Signed (Party B)' },
  { value: 'SIGNED_COMPLETE', label: 'Signed (Complete)' },
  { value: 'EXPORT_DOCX', label: 'Export DOCX' },
  { value: 'EXPORT_PDF', label: 'Export PDF' },
];

interface BodyState {
  html: string;
  text: string;
}

/* ─────────────────────── Helpers ─────────────────────── */

function extractBody(bodyJson: unknown, locale: LocaleTab): BodyState {
  const obj = bodyJson as Record<string, { html?: string; text?: string } | string> | null;
  if (!obj) return { html: '', text: '' };
  const localeData = obj[locale];
  if (!localeData) return { html: '', text: '' };
  if (typeof localeData === 'string') return { html: localeData, text: '' };
  return { html: localeData.html ?? '', text: localeData.text ?? '' };
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-fg-muted">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────── Body Editor Tab ─────────────────────── */

function BodyEditTab({
  contract,
  refetch,
}: {
  contract: ContractDetail;
  refetch: () => void;
}) {
  const { t } = useI18n();
  const [localeLang, setLocaleLang] = useState<LocaleTab>('vi');
  const [bodies, setBodies] = useState<Record<LocaleTab, BodyState>>({
    vi: extractBody(contract.bodyJson, 'vi'),
    ko: extractBody(contract.bodyJson, 'ko'),
    en: extractBody(contract.bodyJson, 'en'),
  });
  const [dirty, setDirty] = useState<Record<LocaleTab, boolean>>({ vi: false, ko: false, en: false });
  const [updateBody, { loading: saving }] = useMutation(CONTRACT_UPDATE_BODY_MUTATION);

  const handleBodyChange = (html: string, text: string) => {
    setBodies((prev) => ({ ...prev, [localeLang]: { html, text } }));
    setDirty((prev) => ({ ...prev, [localeLang]: true }));
  };

  const saveCurrentLocale = async () => {
    const body = bodies[localeLang];
    try {
      const res = await updateBody({
        variables: {
          id: contract.id,
          locale: localeLang,
          html: body.html,
          text: body.text,
        },
      });
      const result = res.data?.contractUpdateBody;
      if (result?.success) {
        toast.success(t('contract.edit.bodySaved').replace('{{locale}}', localeLang.toUpperCase()));
        setDirty((prev) => ({ ...prev, [localeLang]: false }));
        refetch();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  const saveAllLocales = async () => {
    const dirtyLocales = (Object.entries(dirty) as [LocaleTab, boolean][]).filter(([, d]) => d);
    if (dirtyLocales.length === 0) {
      toast.info(t('contract.edit.noChanges'));
      return;
    }
    for (const [loc] of dirtyLocales) {
      const body = bodies[loc];
      try {
        await updateBody({
          variables: { id: contract.id, locale: loc, html: body.html, text: body.text },
        });
      } catch (err) {
        toast.error(`${loc}: ${err instanceof Error ? err.message : t('common.error')}`);
        return;
      }
    }
    toast.success(t('contract.edit.allBodySaved'));
    setDirty({ vi: false, ko: false, en: false });
    refetch();
  };

  const hasDirty = Object.values(dirty).some(Boolean);

  return (
    <SectionCard
      title={t('contract.edit.bodyTitle')}
      description={t('contract.edit.bodyDescription')}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Tabs
            variant="underline"
            items={LOCALE_TABS.map((lt) => ({
              ...lt,
              label: dirty[lt.key] ? `${lt.label} *` : lt.label,
            }))}
            value={localeLang}
            onChange={(k) => setLocaleLang(k as LocaleTab)}
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!dirty[localeLang] || saving}
              onClick={saveCurrentLocale}
              startIcon={<Save size={13} />}
            >
              {t('contract.edit.saveLocale').replace('{{locale}}', localeLang.toUpperCase())}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!hasDirty || saving}
              loading={saving}
              onClick={saveAllLocales}
              startIcon={<Save size={13} />}
            >
              {t('contract.edit.saveAll')}
            </Button>
          </div>
        </div>

        <HtmlEditor
          key={localeLang}
          value={bodies[localeLang].html}
          onChange={handleBodyChange}
          placeholder={t('contract.edit.bodyPlaceholder')}
          minHeight={400}
        />
      </div>
    </SectionCard>
  );
}

/* ─────────────────────── Terms Editor Tab ─────────────────────── */

function TermsEditTab({
  contract,
  refetch,
}: {
  contract: ContractDetail;
  refetch: () => void;
}) {
  const { t } = useI18n();
  const [raw, setRaw] = useState(JSON.stringify(contract.termsJson ?? {}, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [updateTerms, { loading: saving }] = useMutation(CONTRACT_UPDATE_TERMS_MUTATION);

  const handleSave = async () => {
    setParseError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setParseError(t('contract.create.invalidTermsJson'));
      return;
    }
    try {
      const res = await updateTerms({ variables: { id: contract.id, termsJson: parsed } });
      const result = res.data?.contractUpdateTerms;
      if (result?.success) {
        toast.success(t('contract.edit.termsSaved'));
        refetch();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <SectionCard
      title={t('contract.edit.termsTitle')}
      description={t('contract.edit.termsDescription')}
    >
      <div className="flex flex-col gap-3">
        {parseError && (
          <div className="rounded-md border border-danger bg-danger-soft p-2 text-[12px] text-danger">{parseError}</div>
        )}
        <textarea
          className="w-full rounded-md border bg-surface-1 p-3 font-mono text-[12px] text-fg"
          style={{ borderColor: 'var(--border)', minHeight: 400 }}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="flex justify-end">
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave} startIcon={<Save size={13} />}>
            {t('contract.edit.saveTerms')}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────── Files Tab ─────────────────────── */

function FilesEditTab({
  contract,
  refetch,
}: {
  contract: ContractDetail;
  refetch: () => void;
}) {
  const { t } = useI18n();
  const [uploadFile, { loading: uploading }] = useMutation(CONTRACT_UPLOAD_FILE_MUTATION);
  const [fileType, setFileType] = useState('DRAFT');
  const [fileLocale, setFileLocale] = useState('vi');

  const files: ContractFile[] = ((contract as unknown as Record<string, unknown>).files as ContractFile[] | undefined) ?? [];

  const fileColumns: DataTableColumn<ContractFile>[] = [
    { key: 'fileName', header: t('contract.files.name'), render: (r) => <span className="font-mono text-[12px]">{r.fileName}</span> },
    { key: 'fileType', header: t('contract.files.type'), width: '120px', render: (r) => <Badge tone="info" variant="soft">{r.fileType}</Badge> },
    { key: 'locale', header: t('contract.files.locale'), width: '80px', render: (r) => <Badge tone="neutral" variant="soft">{r.locale.toUpperCase()}</Badge> },
    {
      key: 'fileSize',
      header: t('contract.files.size'),
      width: '100px',
      align: 'right',
      render: (r) => <span className="text-[11px] text-fg-muted num">{(r.fileSize / 1024).toFixed(1)} KB</span>,
    },
    {
      key: 'uploadedAt',
      header: t('contract.files.uploadedAt'),
      width: '160px',
      render: (r) => <span className="text-[11px] text-fg-muted num font-mono">{formatDateTime(r.uploadedAt)}</span>,
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFile({
        variables: {
          id: contract.id,
          fileType,
          locale: fileLocale,
          filePath: `/storage/contracts/${contract.id}/${fileType.toLowerCase()}_${fileLocale}.${file.name.split('.').pop()}`,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
        },
      });
      const result = res.data?.contractUploadFile;
      if (result?.success) {
        toast.success(t('contract.edit.fileUploaded'));
        refetch();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
    e.target.value = '';
  };

  const localeOptions: SelectOption[] = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
  ];

  return (
    <SectionCard
      title={t('contract.edit.filesTitle')}
      description={t('contract.edit.filesDescription')}
    >
      <div className="flex flex-col gap-4">
        {/* Upload controls */}
        <div className="flex items-end gap-3 rounded-md border bg-surface-2 p-3" style={{ borderColor: 'var(--border)' }}>
          <Field label={t('contract.files.type')}>
            <Select value={fileType} onChange={setFileType} options={FILE_TYPES} minWidth="180px" />
          </Field>
          <Field label={t('contract.files.locale')}>
            <Select value={fileLocale} onChange={setFileLocale} options={localeOptions} minWidth="140px" />
          </Field>
          <div className="flex-1" />
          <label className="cursor-pointer">
            <Button
              variant="primary"
              size="sm"
              startIcon={<Upload size={13} />}
              loading={uploading}
              onClick={() => document.getElementById('contract-file-input')?.click()}
            >
              {t('contract.action.uploadFile')}
            </Button>
            <input
              id="contract-file-input"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* File list */}
        {files.length > 0 ? (
          <DataTable
            columns={fileColumns}
            rows={files}
            rowKey={(r) => r.id}
            compact
            emptyState={t('contract.files.empty')}
          />
        ) : (
          <div
            className="rounded-md border bg-surface-1 p-8 text-center text-[12.5px] text-fg-subtle"
            style={{ borderColor: 'var(--border)' }}
          >
            {t('contract.files.empty')}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

/* ─────────────────────── Metadata Tab ─────────────────────── */

function MetadataTab({ contract }: { contract: ContractDetail }) {
  const { t } = useI18n();

  return (
    <SectionCard title={t('contract.edit.metadataTitle')} description={t('contract.edit.metadataDescription')}>
      <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
        <MetaRow label={t('contract.col.contractCode')} value={<span className="font-mono">{contract.contractCode}</span>} />
        <MetaRow label={t('contract.col.contractType')} value={<Badge tone="info" variant="soft">{t(`contract.type.${contract.contractType}`)}</Badge>} />
        <MetaRow label={t('contract.col.partyBType')} value={<Badge tone="neutral" variant="soft">{t(`contract.partyBType.${contract.partyBType}`)}</Badge>} />
        <MetaRow label={t('contract.detail.partyBId')} value={<span className="font-mono text-[11px]">{contract.partyBId}</span>} />
        <MetaRow label={t('contract.col.title')} value={contract.title} />
        <MetaRow label={t('contract.create.titleKo')} value={contract.titleKo ?? '—'} />
        <MetaRow label={t('contract.create.titleEn')} value={contract.titleEn ?? '—'} />
        <MetaRow label={t('field.status')} value={<StatusBadge status={contract.status} />} />
        <MetaRow label={t('contract.detail.version')} value={`v${contract.version}`} />
        <MetaRow label={t('field.effectiveFrom')} value={contract.effectiveFrom ? formatDateTime(contract.effectiveFrom) : '—'} />
        <MetaRow label={t('field.effectiveTo')} value={contract.effectiveTo ? formatDateTime(contract.effectiveTo) : '∞'} />
        <MetaRow label={t('contract.detail.createdBy')} value={<span className="font-mono text-[11px]">{contract.createdBy}</span>} />
        <MetaRow label={t('field.createdAt')} value={formatDateTime(contract.createdAt)} />
        <MetaRow label={t('field.updatedAt')} value={formatDateTime(contract.updatedAt)} />
      </div>
    </SectionCard>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2 text-[12.5px]">
      <span className="w-40 shrink-0 text-fg-muted">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}

/* ─────────────────────── Main Edit Screen ─────────────────────── */

export function ContractEditScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CONTRACT_READ);
  const canWrite = useHasPermission(PERMISSIONS.CONTRACT_UPDATE);

  const [activeTab, setActiveTab] = useState<EditTab>('body');

  const { data, loading, error, refetch } = useQuery<ContractDetailData>(CONTRACT_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead || !canWrite) return <LockedScreen />;

  const c = data?.contract.success?.data;

  const tabItems = [
    { key: 'body' as const, label: t('contract.edit.tabBody'), icon: <FileText size={14} /> },
    { key: 'terms' as const, label: t('contract.edit.tabTerms'), icon: <Settings size={14} /> },
    { key: 'files' as const, label: t('contract.edit.tabFiles'), icon: <Paperclip size={14} /> },
    { key: 'metadata' as const, label: t('contract.edit.tabMetadata'), icon: <FileText size={14} /> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance') },
          { label: t('nav.governance.contracts'), href: '/governance/contracts' },
          { label: c?.contractCode ?? '...', href: c ? `/governance/contracts/${c.id}` : undefined },
          { label: t('contract.edit.title') },
        ],
        title: c ? `${t('contract.edit.title')} — ${c.title}` : t('common.loading'),
        description: c ? (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">{c.contractCode}</span>
            <Badge tone="info" variant="soft">{t(`contract.type.${c.contractType}`)}</Badge>
            <Badge tone="neutral" variant="soft">v{c.version}</Badge>
            <StatusBadge status={c.status} />
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-CTR-EDIT</code>,
        actions: (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="md"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => router.push(c ? `/governance/contracts/${c.id}` : '/governance/contracts')}
            >
              {t('action.back')}
            </Button>
          </div>
        ),
      }}
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
          {error.message}
        </div>
      )}

      {loading && !c ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={80} />
          ))}
        </div>
      ) : c ? (
        <div className="flex flex-col gap-4">
          <Tabs
            variant="underline"
            items={tabItems}
            value={activeTab}
            onChange={(k) => setActiveTab(k as EditTab)}
          />
          <div className="mt-2">
            {activeTab === 'body' && <BodyEditTab contract={c} refetch={() => void refetch()} />}
            {activeTab === 'terms' && <TermsEditTab contract={c} refetch={() => void refetch()} />}
            {activeTab === 'files' && <FilesEditTab contract={c} refetch={() => void refetch()} />}
            {activeTab === 'metadata' && <MetadataTab contract={c} />}
          </div>
        </div>
      ) : (
        <div className="text-fg-subtle text-[12.5px]">{t('common.empty')}</div>
      )}
    </DetailPageTemplate>
  );
}
