'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FileText, Power, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Input,
  Modal,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import {
  EINVOICE_PROVIDERS_QUERY,
  UPDATE_EINVOICE_PROVIDER_CONFIG_MUTATION,
  TOGGLE_EINVOICE_PROVIDER_MUTATION,
  UPDATE_EINVOICE_CREDENTIALS_MUTATION,
  type EinvoiceProvidersData,
  type EinvoiceProviderRow,
  type EinvoiceProviderConfigRow,
} from '@graphql/queries/settings';

export function SettingsEinvoiceScreen() {
  const { t } = useI18n();
  const { data, loading, refetch } = useQuery<EinvoiceProvidersData>(EINVOICE_PROVIDERS_QUERY);
  const [toggleProvider] = useMutation(TOGGLE_EINVOICE_PROVIDER_MUTATION);
  const [updateConfig] = useMutation(UPDATE_EINVOICE_PROVIDER_CONFIG_MUTATION);
  const [updateCredentials] = useMutation(UPDATE_EINVOICE_CREDENTIALS_MUTATION);
  const [editConfig, setEditConfig] = useState<EinvoiceProviderConfigRow | null>(null);
  const [credModal, setCredModal] = useState<{ configId: string; providerType: string } | null>(null);
  const [credValues, setCredValues] = useState<Record<string, string>>({});

  const providers = data?.einvoiceProviders?.success?.data ?? [];

  const CREDENTIAL_FIELDS: Record<string, { key: string; label: string; secret?: boolean }[]> = {
    WETAX: [
      { key: 'username', label: t('settings.einvoice.field.username') },
      { key: 'password', label: t('settings.einvoice.field.password'), secret: true },
    ],
    VIETTEL: [
      { key: 'username', label: t('settings.einvoice.field.username') },
      { key: 'password', label: t('settings.einvoice.field.password'), secret: true },
      { key: 'invoiceType', label: t('settings.einvoice.field.invoiceType') },
      { key: 'templateCode', label: t('settings.einvoice.field.templateCode') },
      { key: 'invoiceSeries', label: t('settings.einvoice.field.invoiceSeries') },
    ],
    MISA: [
      { key: 'appId', label: t('settings.einvoice.field.appId') },
      { key: 'sellerTaxCode', label: t('settings.einvoice.field.sellerTaxCode') },
      { key: 'username', label: t('settings.einvoice.field.username') },
      { key: 'password', label: t('settings.einvoice.field.password'), secret: true },
      { key: 'invoiceSeries', label: t('settings.einvoice.field.invoiceSeries') },
    ],
  };

  const configColumns: DataTableColumn<EinvoiceProviderConfigRow>[] = [
    { key: 'environment', header: t('settings.einvoice.col.environment'), width: '120px', render: (r) => <Badge tone={r.environment === 'PRODUCTION' ? 'danger' : 'info'} variant="soft">{t(`settings.einvoice.env.${r.environment}`)}</Badge> },
    { key: 'baseUrl', header: t('settings.einvoice.col.baseUrl'), render: (r) => <span className="font-mono text-[11px]">{r.baseUrl}</span> },
    { key: 'defaultCurrencyCode', header: t('settings.einvoice.col.currency'), width: '80px', render: (r) => <span>{r.defaultCurrencyCode}</span> },
    { key: 'defaultSerialPrefix', header: t('settings.einvoice.col.prefix'), width: '70px', render: (r) => <span>{r.defaultSerialPrefix}</span> },
    { key: 'defaultFormNo', header: t('settings.einvoice.col.formNo'), width: '70px', render: (r) => <span>{r.defaultFormNo}</span> },
    { key: 'isActive', header: t('field.status'), width: '90px', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'} startDot>{r.isActive ? t('enum.status.ACTIVE') : t('enum.status.INACTIVE')}</Badge> },
  ];

  const handleToggle = async (provider: EinvoiceProviderRow) => {
    try {
      const res = await toggleProvider({ variables: { id: provider.id, isActive: !provider.isActive } });
      if (res.data?.toggleEinvoiceProvider?.error) {
        toast.error(res.data.toggleEinvoiceProvider.error.message);
        return;
      }
      toast.success(`${provider.displayName} ${provider.isActive ? t('settings.einvoice.deactivated') : t('settings.einvoice.activated')}`);
      await refetch();
    } catch (err) { toast.error((err as Error).message); }
  };

  const openCredModal = (configId: string, providerType: string) => {
    setCredValues({});
    setCredModal({ configId, providerType });
  };

  const handleSaveCredentials = async () => {
    if (!credModal) return;
    try {
      const res = await updateCredentials({
        variables: { configId: credModal.configId, credentials: JSON.stringify(credValues) },
      });
      if (res.data?.updateEinvoiceProviderCredentials?.error) {
        toast.error(res.data.updateEinvoiceProviderCredentials.error.message);
        return;
      }
      toast.success(t('settings.einvoice.credentialsSaved'));
      setCredModal(null);
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleSaveConfig = async () => {
    if (!editConfig) return;
    try {
      const res = await updateConfig({
        variables: {
          input: {
            id: editConfig.id,
            baseUrl: editConfig.baseUrl,
            defaultSerialPrefix: editConfig.defaultSerialPrefix,
            defaultFormNo: editConfig.defaultFormNo,
            defaultCurrencyCode: editConfig.defaultCurrencyCode,
            defaultPaymentMethod: editConfig.defaultPaymentMethod,
            isActive: editConfig.isActive,
          },
        },
      });
      if (res.data?.updateEinvoiceProviderConfig?.error) {
        toast.error(res.data.updateEinvoiceProviderConfig.error.message);
        return;
      }
      toast.success(t('settings.einvoice.configSaved'));
      setEditConfig(null);
      await refetch();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.settings') }, { label: t('nav.settings.einvoice') }],
        title: t('nav.settings.einvoice'),
        description: t('settings.einvoice.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SET-EINV</code>,
      }}
    >
      {loading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={60} />)}</div>
      ) : providers.length === 0 ? (
        <SectionCard title={t('settings.einvoice.noProvider')} description={t('settings.einvoice.noProviderDesc')}>
          <div className="flex items-center justify-center p-8 text-fg-muted text-[13px]">
            <FileText size={18} className="mr-2" />
            {t('settings.einvoice.noProviderHint')}
          </div>
        </SectionCard>
      ) : (
        providers.map((provider) => (
          <SectionCard
            key={provider.id}
            title={
              <span className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2">
                  <FileText size={16} className="text-fg-muted" />
                </div>
                <div>
                  <span className="text-[14px] font-bold">{provider.displayName}</span>
                  <span className="ml-2 font-mono text-[11px] text-fg-subtle">{provider.providerType}</span>
                </div>
              </span>
            }
            description={provider.description}
            actions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  startIcon={<KeyRound size={13} />}
                  onClick={() => {
                    const cfg = provider.configs[0];
                    if (cfg) openCredModal(cfg.id, provider.providerType);
                  }}
                >
                  {t('settings.einvoice.credentials')}
                </Button>
                <Button
                  variant={provider.isActive ? 'outline' : 'primary'}
                  size="sm"
                  startIcon={<Power size={13} />}
                  onClick={() => handleToggle(provider)}
                >
                  {provider.isActive ? t('settings.einvoice.deactivate') : t('settings.einvoice.activate')}
                </Button>
              </div>
            }
          >
            <DataTable
              columns={configColumns}
              rows={provider.configs}
              rowKey={(r) => r.id}
              compact
              onRowClick={(r) => setEditConfig({ ...r })}
              emptyState={t('common.empty')}
            />
          </SectionCard>
        ))
      )}

      {editConfig && (
        <Modal
          open
          onClose={() => setEditConfig(null)}
          title={t('settings.einvoice.editConfig')}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setEditConfig(null)}>{t('action.cancel')}</Button>
              <Button variant="primary" size="md" onClick={handleSaveConfig}>{t('action.save')}</Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-medium text-fg-muted">{t('settings.einvoice.col.baseUrl')}</label>
              <Input value={editConfig.baseUrl} onChange={(e) => setEditConfig({ ...editConfig, baseUrl: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-fg-muted">{t('settings.einvoice.col.prefix')}</label>
              <Input value={editConfig.defaultSerialPrefix} onChange={(e) => setEditConfig({ ...editConfig, defaultSerialPrefix: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-fg-muted">{t('settings.einvoice.col.formNo')}</label>
              <Input value={editConfig.defaultFormNo} onChange={(e) => setEditConfig({ ...editConfig, defaultFormNo: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-fg-muted">{t('settings.einvoice.col.currency')}</label>
              <Input value={editConfig.defaultCurrencyCode} onChange={(e) => setEditConfig({ ...editConfig, defaultCurrencyCode: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-fg-muted">{t('settings.einvoice.field.paymentMethod')}</label>
              <Input value={editConfig.defaultPaymentMethod} onChange={(e) => setEditConfig({ ...editConfig, defaultPaymentMethod: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}

      {credModal && (
        <Modal
          open
          onClose={() => setCredModal(null)}
          title={t('settings.einvoice.credentialsTitle')}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setCredModal(null)}>{t('action.cancel')}</Button>
              <Button variant="primary" size="md" onClick={handleSaveCredentials}>{t('action.save')}</Button>
            </div>
          }
        >
          <div className="grid gap-4">
            {(CREDENTIAL_FIELDS[credModal.providerType] ?? []).map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-fg-muted">{field.label}</label>
                <Input
                  type={field.secret ? 'password' : 'text'}
                  value={credValues[field.key] ?? ''}
                  onChange={(e) => setCredValues({ ...credValues, [field.key]: e.target.value })}
                  placeholder={field.secret ? '••••••••' : ''}
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </ListPageTemplate>
  );
}
