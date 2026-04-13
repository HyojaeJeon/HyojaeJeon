'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { Modal, Button, Input, Select, DatePicker, type SelectOption } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import {
  CONTRACT_CREATE_MUTATION,
  CONTRACT_TEMPLATES_QUERY,
  type ContractTemplatesData,
  type CreateContractInput,
} from '@graphql/queries/contract';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CONTRACT_TYPES = ['MERCHANT', 'DISTRIBUTOR', 'CORPORATE'] as const;
const PARTY_B_TYPES = ['BRAND_HQ', 'DISTRIBUTOR', 'CORPORATE'] as const;

export function CreateContractModal({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const [createContract, { loading: creating }] = useMutation(CONTRACT_CREATE_MUTATION);

  const [contractType, setContractType] = useState<string>('MERCHANT');
  const [partyBType, setPartyBType] = useState<string>('BRAND_HQ');
  const [partyBId, setPartyBId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [titleKo, setTitleKo] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const { data: templatesData } = useQuery<ContractTemplatesData>(CONTRACT_TEMPLATES_QUERY, {
    variables: { contractType },
    skip: !open,
  });

  const contractTypeOptions: SelectOption[] = CONTRACT_TYPES.map((v) => ({
    value: v,
    label: t(`contract.type.${v}`),
  }));

  const partyBTypeOptions: SelectOption[] = PARTY_B_TYPES.map((v) => ({
    value: v,
    label: t(`contract.partyBType.${v}`),
  }));

  const templateOptions: SelectOption[] = useMemo(() => {
    const templates = templatesData?.contractTemplates.success?.data ?? [];
    return [
      { value: '', label: t('contract.create.noTemplate') },
      ...templates
        .filter((tpl) => tpl.isActive)
        .map((tpl) => ({ value: tpl.id, label: `${tpl.templateCode} — ${tpl.title}` })),
    ];
  }, [templatesData, t]);

  const canSubmit =
    contractType.trim().length > 0 &&
    partyBType.trim().length > 0 &&
    partyBId.trim().length > 0 &&
    title.trim().length > 0 &&
    !creating;

  const resetForm = () => {
    setContractType('MERCHANT');
    setPartyBType('BRAND_HQ');
    setPartyBId('');
    setTemplateId('');
    setTitle('');
    setTitleKo('');
    setTitleEn('');
    setEffectiveFrom('');
    setEffectiveTo('');
    setErr(null);
  };

  const handleSubmit = async () => {
    setErr(null);
    const input: CreateContractInput = {
      contractType,
      partyBType,
      partyBId: partyBId.trim(),
      templateId: templateId || null,
      title: title.trim(),
      titleKo: titleKo.trim() || null,
      titleEn: titleEn.trim() || null,
      effectiveFrom: effectiveFrom || null,
      effectiveTo: effectiveTo || null,
    };
    try {
      const res = await createContract({ variables: { input } });
      const result = res.data?.contractCreate;
      if (result?.success?.data) {
        toast.success(t('contract.toast.created'));
        resetForm();
        onCreated();
        onClose();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('contract.action.create')}
      width={600}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={creating}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            {creating ? t('common.busy') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={t('contract.col.contractType')}>
          <Select value={contractType} onChange={setContractType} options={contractTypeOptions} />
        </Field>

        <Field label={t('contract.col.partyBType')}>
          <Select value={partyBType} onChange={setPartyBType} options={partyBTypeOptions} />
        </Field>

        <Field label={t('contract.create.partyBId')}>
          <Input
            value={partyBId}
            onChange={(e) => setPartyBId(e.target.value)}
            placeholder="UUID"
          />
        </Field>

        <Field label={t('contract.create.template')}>
          <Select value={templateId} onChange={setTemplateId} options={templateOptions} />
        </Field>

        <Field label={t('contract.col.title')}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('contract.create.titleKo')}>
            <Input value={titleKo} onChange={(e) => setTitleKo(e.target.value)} />
          </Field>
          <Field label={t('contract.create.titleEn')}>
            <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('field.effectiveFrom')}>
            <DatePicker
              value={effectiveFrom || null}
              onChange={(v) => setEffectiveFrom(v ?? '')}
              minWidth="100%"
            />
          </Field>
          <Field label={t('field.effectiveTo')}>
            <DatePicker
              value={effectiveTo || null}
              onChange={(v) => setEffectiveTo(v ?? '')}
              minDate={effectiveFrom || undefined}
              minWidth="100%"
            />
          </Field>
        </div>

        {err && <div className="text-[12px] text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-fg-muted">{label}</span>
      {children}
    </div>
  );
}
