'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AlertTriangle, CheckCircle2, CreditCard, PiggyBank, Info, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  Badge,
  Button,
  Modal,
  NumberInput,
  Input,
  Skeleton,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';
import { FUNDING_STATUS_QUERY, CONFIRM_DEPOSIT_MUTATION, type FundingStatusData } from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

export function BudgetFundingScreen() {
  const { t } = useI18n();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.WALLET_READ);
  const corporateId = useCorporateId();

  const { data, loading, refetch } = useQuery<FundingStatusData>(FUNDING_STATUS_QUERY, {
    variables: { id: corporateId },
    skip: !corporateId,
  });
  const [confirmDeposit, { loading: confirming }] = useMutation(CONFIRM_DEPOSIT_MUTATION);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositRef, setDepositRef] = useState('');

  if (hydrated && !canRead) return <LockedScreen />;

  const corp = data?.mealCorporate?.success?.data;
  const model = corp?.fundingModel ?? null;

  const handleConfirmDeposit = async () => {
    const amount = Number(depositAmount);
    if (amount <= 0 || !depositRef.trim()) return;
    try {
      const res = await confirmDeposit({ variables: { corporateId, amountVnd: String(amount), referenceNo: depositRef.trim() } });
      if (res.data?.mealDepositConfirm?.success) {
        toast.success(t('budget.funding.depositConfirmed'));
        setShowDepositModal(false);
        setDepositAmount('');
        setDepositRef('');
        void refetch();
      } else {
        toast.error(res.data?.mealDepositConfirm?.error?.message ?? t('common.errorOccurred'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.errorOccurred'));
    }
  };

  return (
    <>
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.budget') }, { label: t('nav.budget.funding') }],
        title: t('nav.budget.funding'),
        description: t('budget.funding.description'),
      }}
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton height={120} />
          <Skeleton height={200} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Funding model badge */}
          <SectionCard title={t('budget.funding.modelTitle')}>
            <div className="flex items-center gap-3">
              <Badge tone={model ? 'success' : 'warning'} size="sm" startDot>
                {model ? t(`budget.funding.model.${model}`) : t('budget.funding.model.UNASSIGNED')}
              </Badge>
              <span className="text-[12px] text-fg-muted">{corp?.companyName}</span>
            </div>
          </SectionCard>

          {/* Model-specific content */}
          {!model && (
            <SectionCard title={t('budget.funding.unassigned.title')}>
              <div className="flex items-start gap-4 rounded-lg border-2 border-dashed p-5" style={{ borderColor: 'var(--warn)' }}>
                <AlertTriangle size={24} className="mt-0.5 shrink-0" style={{ color: 'var(--warn)' }} />
                <div>
                  <p className="font-semibold text-fg">{t('budget.funding.unassigned.heading')}</p>
                  <p className="mt-1 text-[13px] text-fg-muted">{t('budget.funding.unassigned.desc')}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {model === 'PREPAID_DEPOSIT' && (
            <SectionCard title={t('budget.funding.prepaid.title')}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                  <div className="flex items-center gap-2">
                    <PiggyBank size={16} className="text-fg-muted" />
                    <span className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.prepaid.depositBalance')}</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-fg">{formatCurrency(corp?.depositBalanceVnd ?? '0')}</p>
                </div>
                <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-fg-muted" />
                    <span className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.prepaid.monthlyBudget')}</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-fg">{formatCurrency(corp?.monthlyBudgetVnd ?? '0')}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowDepositModal(true)}>
                  {t('budget.funding.prepaid.confirmDeposit')}
                </Button>
              </div>
            </SectionCard>
          )}

          {(model === 'CREDIT_NET15' || model === 'CREDIT_NET30') && (
            <SectionCard title={t('budget.funding.credit.title')}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-fg-muted" />
                    <span className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.credit.limit')}</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-fg">{formatCurrency(corp?.creditLimitVnd ?? '0')}</p>
                </div>
                <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-fg-muted" />
                    <span className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.credit.paymentTerms')}</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-fg">{model === 'CREDIT_NET15' ? 'NET 15' : 'NET 30'}</p>
                </div>
                <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-fg-muted" />
                    <span className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.prepaid.monthlyBudget')}</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-fg">{formatCurrency(corp?.monthlyBudgetVnd ?? '0')}</p>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </DetailPageTemplate>

    {/* Deposit Confirm Modal */}
    <Modal
      open={showDepositModal}
      onClose={() => setShowDepositModal(false)}
      title={t('budget.funding.prepaid.confirmDeposit')}
      width={480}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setShowDepositModal(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={confirming} disabled={Number(depositAmount) <= 0 || !depositRef.trim()} onClick={handleConfirmDeposit}>
            {t('budget.funding.prepaid.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.prepaid.depositAmount')} *</label>
          <NumberInput value={depositAmount} onValueChange={({ raw }) => setDepositAmount(raw)} locale="vi-VN" min={0} placeholder="10,000,000" style={{ width: '100%' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-fg-muted">{t('budget.funding.prepaid.referenceNo')} *</label>
          <Input value={depositRef} onChange={(e) => setDepositRef(e.target.value)} placeholder="BANK-REF-20260414-001" />
        </div>
      </div>
    </Modal>
    </>
  );
}
