'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Input,
  Select,
  Tabs,
  type SelectOption,
} from '@platform/shared-ui';
import {
  CONTRACT_TEMPLATE_CREATE_MUTATION,
  type ContractType,
} from '@graphql/queries/contract';
import { HtmlEditor } from '@shared/ui/HtmlEditor';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

const CONTRACT_TYPES: ContractType[] = ['MERCHANT', 'DISTRIBUTOR', 'CORPORATE'];

type LocaleTab = 'vi' | 'ko' | 'en';
const LOCALE_TABS: { key: LocaleTab; label: string }[] = [
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
];

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

export function ContractTemplateCreateScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canCreate = useHasPermission(PERMISSIONS.CONTRACT_CREATE);
  const [create, { loading }] = useMutation(CONTRACT_TEMPLATE_CREATE_MUTATION);

  const [contractType, setContractType] = useState<string>('CORPORATE');
  const [title, setTitle] = useState('');
  const [titleKo, setTitleKo] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* body (3-locale HTML) */
  const [bodyLocale, setBodyLocale] = useState<LocaleTab>('vi');
  const [bodyVi, setBodyVi] = useState({ html: '', text: '' });
  const [bodyKo, setBodyKo] = useState({ html: '', text: '' });
  const [bodyEn, setBodyEn] = useState({ html: '', text: '' });

  /* clauses JSON */
  const [clausesRaw, setClausesRaw] = useState('{}');

  const currentBody = bodyLocale === 'vi' ? bodyVi : bodyLocale === 'ko' ? bodyKo : bodyEn;
  const setCurrentBody = bodyLocale === 'vi' ? setBodyVi : bodyLocale === 'ko' ? setBodyKo : setBodyEn;

  const contractTypeOptions: SelectOption[] = CONTRACT_TYPES.map((v) => ({
    value: v,
    label: t(`contract.type.${v}`),
  }));

  const canSubmit = title.trim().length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let clausesJson: unknown = {};
    try {
      clausesJson = JSON.parse(clausesRaw);
    } catch {
      setError(t('contract.create.invalidTermsJson'));
      return;
    }

    const bodyJson: Record<string, { html: string }> = {};
    if (bodyVi.html) bodyJson.vi = { html: bodyVi.html };
    if (bodyKo.html) bodyJson.ko = { html: bodyKo.html };
    if (bodyEn.html) bodyJson.en = { html: bodyEn.html };

    try {
      const res = await create({
        variables: {
          input: {
            contractType,
            title: title.trim(),
            titleKo: titleKo.trim() || null,
            titleEn: titleEn.trim() || null,
            bodyJson,
            clausesJson: Object.keys(clausesJson as object).length > 0 ? clausesJson : undefined,
          },
        },
      });
      const result = res.data?.contractTemplateCreate;
      if (result?.success?.data) {
        toast.success(t('contract.template.created'));
        router.push('/governance/contracts?tab=TEMPLATES');
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!canCreate) return <LockedScreen />;

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance') },
          { label: t('nav.governance.contracts'), href: '/governance/contracts' },
          { label: t('contract.template.createTitle') },
        ],
        title: t('contract.template.createTitle'),
        description: t('contract.template.createDesc'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CTR-TPL</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/governance/contracts?tab=TEMPLATES')}>
            {t('action.cancel')}
          </Button>
        ),
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error}</div>
        )}

        {/* 기본 정보 */}
        <SectionCard title={t('contract.template.basicInfo')} description={t('contract.template.basicInfoDesc')}>
          <div className="flex flex-col gap-4">
            <Field label={t('contract.col.contractType')} required>
              <Select value={contractType} onChange={setContractType} options={contractTypeOptions} minWidth="100%" />
            </Field>
            <Field label={t('contract.create.titleVi')} required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('contract.create.titleViPlaceholder')} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('contract.create.titleKo')}>
                <Input value={titleKo} onChange={(e) => setTitleKo(e.target.value)} placeholder={t('contract.create.titleKoPlaceholder')} />
              </Field>
              <Field label={t('contract.create.titleEn')}>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder={t('contract.create.titleEnPlaceholder')} />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* 템플릿 본문 (3개 언어 HTML 에디터) */}
        <SectionCard title={t('contract.template.bodyTitle')} description={t('contract.template.bodyDesc')}>
          <div className="flex flex-col gap-3">
            <Tabs variant="underline" items={LOCALE_TABS} value={bodyLocale} onChange={(k) => setBodyLocale(k as LocaleTab)} />
            <HtmlEditor
              key={bodyLocale}
              value={currentBody.html}
              onChange={(html, text) => setCurrentBody({ html, text })}
              placeholder={t('contract.template.bodyPlaceholder')}
              minHeight={400}
            />
          </div>
        </SectionCard>

        {/* 조항 구조 (JSON) */}
        <SectionCard title={t('contract.template.clausesTitle')} description={t('contract.template.clausesDesc')}>
          <textarea
            className="w-full rounded-md border bg-surface-1 p-3 font-mono text-[12px] text-fg"
            style={{ borderColor: 'var(--border)', minHeight: 160 }}
            value={clausesRaw}
            onChange={(e) => setClausesRaw(e.target.value)}
            placeholder={`{
  "variables": ["partyB.companyName", "terms.commissionRate"],
  "clauses": [
    { "id": "purpose", "titleVi": "Điều 1: Mục đích", "titleKo": "제1조: 목적" }
  ]
}`}
          />
        </SectionCard>

        <div className="flex justify-end gap-3 pb-8">
          <Button type="button" variant="ghost" onClick={() => router.push('/governance/contracts?tab=TEMPLATES')}>
            {t('action.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!canSubmit} startIcon={<Save size={14} />}>
            {t('contract.template.createAction')}
          </Button>
        </div>
      </form>
    </DetailPageTemplate>
  );
}
