'use client';

/**
 * DataDeleteDialog (SET-DATADEL)
 *
 * 데이터 삭제 설정 화면 (Maintenance mode).
 * 판매/주문/카드설정 등 다양한 데이터 삭제와 전체 초기화.
 * 삭제 기간 라디오 선택, 확인 후 실행.
 *
 * Legacy: IDD_DATADEL (리소스 163)
 * Bridge: SETUP:DATA:GET_STATUS, SETUP:DATA:DELETE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Radio from '@shared/ui/atoms/Radio';
import Checkbox from '@shared/ui/atoms/Checkbox';

// ─── Types ───

type DeletePeriod = '1month' | '3months' | '6months' | '1year';

type DeleteTarget =
  | 'sales'
  | 'orders'
  | 'cardConfig'
  | 'kioskImages'
  | 'holdingPlace'
  | 'all';

interface DataDeleteDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ───

export default function DataDeleteDialog({
  open,
  onClose,
}: DataDeleteDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<DeletePeriod>('1month');
  const [selectedTargets, setSelectedTargets] = useState<Set<DeleteTarget>>(new Set());

  // TODO: RTK Query - setupApi.useGetDataStatusQuery()
  // TODO: RTK Query - setupApi.useDeleteDataMutation()

  const handleToggleTarget = useCallback((target: DeleteTarget) => {
    setSelectedTargets((prev) => {
      const next = new Set(prev);
      if (next.has(target)) next.delete(target);
      else next.add(target);
      return next;
    });
  }, []);

  const handleDelete = useCallback(() => {
    // TODO: 확인 다이얼로그 표시 후 Bridge SETUP:DATA:DELETE 호출
  }, [selectedPeriod, selectedTargets]);

  const handleReset = useCallback(() => {
    // TODO: 전체 초기화 확인 후 실행
  }, []);

  const periods: { value: DeletePeriod; label: string }[] = [
    { value: '1month', label: '1개월' },
    { value: '3months', label: '3개월' },
    { value: '6months', label: '6개월' },
    { value: '1year', label: '1년' },
  ];

  const targets: { value: DeleteTarget; label: string }[] = [
    { value: 'sales', label: '판매데이터' },
    { value: 'orders', label: '주문데이터' },
    { value: 'cardConfig', label: '카드설정' },
    { value: 'holdingPlace', label: '거치장소설정' },
    { value: 'kioskImages', label: '키오스크 이미지' },
  ];

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="데이터 삭제"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={handleDelete}>선택 삭제</Button>
          <Button variant="danger" size="sm" onClick={handleReset}>초기화</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* 삭제 기간 선택 */}
            <div className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
              <div className="mb-2 font-medium text-pos-text">삭제 기간</div>
              <div className="flex gap-4">
                {periods.map((p) => (
                  <Radio
                    key={p.value}
                    name="deletePeriod"
                    checked={selectedPeriod === p.value}
                    onChange={() => setSelectedPeriod(p.value)}
                    label={p.label}
                  />
                ))}
              </div>
            </div>

            {/* 삭제 대상 선택 */}
            <div className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
              <div className="mb-2 font-medium text-pos-text">삭제 대상</div>
              <div className="flex flex-col gap-2">
                {targets.map((t) => (
                  <Checkbox
                    key={t.value}
                    checked={selectedTargets.has(t.value)}
                    onChange={() => handleToggleTarget(t.value)}
                    label={t.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
