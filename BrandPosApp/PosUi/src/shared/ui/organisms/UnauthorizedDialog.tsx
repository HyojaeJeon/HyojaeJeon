'use client';

import { useState, useCallback } from 'react';
import { usePosI18n } from '@i18n/PosI18nProvider';
import Modal from './Modal';
import Button from '../atoms/Button';

// ─── Types ────────────────────────────────────────────
interface CardCompany {
  id: string;
  name: string;
}

interface UnauthorizedDialogProps {
  open: boolean;
  onClose: () => void;
  remainingAmount?: number;
  cardCompanies?: CardCompany[];
  onConfirm?: (data: { cardCompanyId: string; amount: number }) => void;
}

// ─── Stub data ────────────────────────────────────────
const DEFAULT_CARD_COMPANIES: CardCompany[] = [
  { id: 'card-1', name: '삼성카드' },
  { id: 'card-2', name: '현대카드' },
  { id: 'card-3', name: '국민카드' },
  { id: 'card-4', name: '신한카드' },
  { id: 'card-5', name: '롯데카드' },
  { id: 'card-6', name: '하나카드' },
  { id: 'card-7', name: 'BC카드' },
  { id: 'card-8', name: '우리카드' },
];

// ─── UnauthorizedDialog (미승인 결제) ─────────────────
export default function UnauthorizedDialog({
  open,
  onClose,
  remainingAmount = 0,
  cardCompanies = DEFAULT_CARD_COMPANIES,
  onConfirm,
}: UnauthorizedDialogProps) {
  const { t } = usePosI18n();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [amount, setAmount] = useState(remainingAmount);

  // Hidden fields (legacy compat, managed in React state)
  const [_date] = useState(new Date().toISOString().slice(0, 10));
  const [_receiptNo] = useState('');

  const selectedCardName = cardCompanies.find((c) => c.id === selectedCardId)?.name ?? '';

  const handleConfirm = useCallback(() => {
    if (!selectedCardId || amount <= 0) return;
    // TODO: STAFF:VERIFY_PERMISSION bridge call -> VerifyPermissionUseCase
    onConfirm?.({ cardCompanyId: selectedCardId, amount });
    onClose();
  }, [selectedCardId, amount, onConfirm, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('common.unauthorizedPaymentTitle')}
      size="md"
      footer={
        <>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={!selectedCardId || amount <= 0}
          >
            {t('common.confirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Info message */}
        <p className="text-xs text-pos-text-secondary leading-relaxed whitespace-pre-line">
          {t('common.cardCompanyGuide')}
        </p>

        {/* Selected card display */}
        <div className="bg-pos-surface rounded-pos-sm px-3 py-2 text-xs font-semibold text-pos-text">
          {selectedCardName || t('common.selectedCardPrompt')}
        </div>

        {/* Card company buttons (2 cols x 4 rows) */}
        <div className="grid grid-cols-2 gap-2">
          {cardCompanies.slice(0, 8).map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCardId(card.id)}
              className={`
                h-touch px-3 rounded-pos-btn text-xs font-semibold
                transition-all duration-fast cursor-pointer select-none
                active:scale-[0.96]
                ${selectedCardId === card.id
                  ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                  : 'bg-pos-surface text-pos-text-secondary active:bg-gray-200'}
              `}
            >
              {card.name}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-xs text-pos-text-secondary mb-1">
            {t('common.manualPaymentAmount')} ({t('common.remainingAmount')}: {remainingAmount.toLocaleString()})
          </label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text text-right tabular-nums"
          />
        </div>
      </div>
    </Modal>
  );
}
