'use client';

/**
 * PrintSettingsDialog (SET-PRINTSET-DLG)
 *
 * 주문전표 인쇄 레이아웃 설정.
 * 영역별 글꼴 크기를 라디오 그룹으로 제어. 주문번호 최대값/시작값, 프린터 선택.
 *
 * Legacy: IDD_PRINTSET_DLG (리소스 171)
 * Bridge: SETUP:PRINT:GET_CONFIG, SETUP:PRINT:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Radio from '@shared/ui/atoms/Radio';
import Checkbox from '@shared/ui/atoms/Checkbox';

// ─── Types ───

type FontSize = 'small' | 'medium' | 'large';

interface PrintAreaConfig {
  label: string;
  fontSize: FontSize;
  visible: boolean;
}

interface PrintConfig {
  areas: Record<string, PrintAreaConfig>;
  orderNumberMax: number;
  orderNumberStart: number;
  waitNumberReset: boolean;
  selectedPrinter: string;
  marginType: string;
}

interface PrintSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const PRINT_AREAS = [
  'topMargin',
  'title',
  'tableName',
  'orderNumber',
  'orderTime',
  'orderMenu',
  'orderMessage',
  'bottomMargin',
] as const;

const AREA_LABELS: Record<string, string> = {
  topMargin: '상단여백',
  title: '타이틀',
  tableName: '테이블명/주문번호',
  orderNumber: '주문번호',
  orderTime: '주문시간',
  orderMenu: '주문메뉴',
  orderMessage: '주문메시지',
  bottomMargin: '하단여백',
};

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: '소' },
  { value: 'medium', label: '중' },
  { value: 'large', label: '대' },
];

// ─── Component ───

export default function PrintSettingsDialog({
  open,
  onClose,
}: PrintSettingsDialogProps) {
  const [config, setConfig] = useState<PrintConfig>({
    areas: Object.fromEntries(
      PRINT_AREAS.map((area) => [
        area,
        { label: AREA_LABELS[area], fontSize: 'medium' as FontSize, visible: true },
      ])
    ),
    orderNumberMax: 999,
    orderNumberStart: 1,
    waitNumberReset: false,
    selectedPrinter: '',
    marginType: 'normal',
  });

  // TODO: RTK Query - setupApi.useGetPrintConfigQuery()
  // TODO: RTK Query - setupApi.useSavePrintConfigMutation()

  const handleAreaFontChange = useCallback((area: string, fontSize: FontSize) => {
    setConfig((prev) => ({
      ...prev,
      areas: {
        ...prev.areas,
        [area]: { ...prev.areas[area], fontSize },
      },
    }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:PRINT:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="인쇄(주문전표) 설정"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* 영역별 글꼴 설정 */}
          <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
            <Label size="sm" weight="semibold">영역별 글꼴</Label>
            <div className="mt-3 flex flex-col gap-3">
              {PRINT_AREAS.map((area) => (
                <div key={area} className="flex items-center gap-3">
                  <span className="w-40 text-sm text-pos-text">{AREA_LABELS[area]}</span>
                  <div className="flex gap-3">
                    {FONT_SIZES.map((fs) => (
                      <Radio
                        key={fs.value}
                        name={`font-${area}`}
                        checked={config.areas[area]?.fontSize === fs.value}
                        onChange={() => handleAreaFontChange(area, fs.value)}
                        label={fs.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주문번호 설정 */}
          <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
            <Label size="sm" weight="semibold">주문번호 설정</Label>
            <div className="mt-3 flex gap-4">
              <TextInput
                label="최대값"
                value={String(config.orderNumberMax)}
                onChange={(v) =>
                  setConfig((prev) => ({ ...prev, orderNumberMax: Number(v) || 0 }))
                }
              />
              <TextInput
                label="시작값"
                value={String(config.orderNumberStart)}
                onChange={(v) =>
                  setConfig((prev) => ({ ...prev, orderNumberStart: Number(v) || 0 }))
                }
              />
            </div>
            <div className="mt-3">
              <Checkbox
                checked={config.waitNumberReset}
                onChange={(v) =>
                  setConfig((prev) => ({ ...prev, waitNumberReset: v }))
                }
                label="대기번호 초기화"
              />
            </div>
          </div>

          {/* 프린터 선택 */}
          <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
            <TextInput
              label="프린터"
              value={config.selectedPrinter}
              onChange={(v) =>
                setConfig((prev) => ({ ...prev, selectedPrinter: v }))
              }
              placeholder="프린터를 선택하세요"
              fullWidth
            />
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
