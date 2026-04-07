'use client';

/**
 * EtcSettingsV2Dialog (SET-ETCSETV2-DLG / ETCSETV2_DLG)
 *
 * 기타 설정: Kitchen Display(KDS) 전송, M Connect 연동, 애드온 KDS.
 * 다수 항목 조건부 숨김. 섹션별 ConfigSection 구성.
 *
 * Legacy: IDD_ETCSETV2_DLG
 * Bridge: SETUP:ETC:GET_CONFIG, SETUP:ETC:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

interface EtcConfig {
  kdsTransferType: string;
  mConnectEnabled: boolean;
  mConnectUrl: string;
  addonKdsEnabled: boolean;
  addonKdsType: string;
  addonExtraStoreCode: string;
}

interface EtcSettingsV2DialogProps {
  open: boolean;
  onClose: () => void;
  showMConnect?: boolean;
  showAddonKds?: boolean;
}

const KDS_TRANSFER_OPTIONS = [
  { value: '', label: '선택' },
  { value: 'none', label: '사용안함' },
  { value: 'android', label: 'Android KDS' },
  { value: 'network', label: 'Network KDS' },
];

// ─── Component ───

export default function EtcSettingsV2Dialog({
  open,
  onClose,
  showMConnect = false,
  showAddonKds = false,
}: EtcSettingsV2DialogProps) {
  const [config, setConfig] = useState<EtcConfig>({
    kdsTransferType: '',
    mConnectEnabled: false,
    mConnectUrl: '',
    addonKdsEnabled: false,
    addonKdsType: '',
    addonExtraStoreCode: '',
  });

  // TODO: RTK Query - setupApi.useGetEtcConfigQuery()
  // TODO: RTK Query - setupApi.useSaveEtcConfigMutation()

  const handleChange = useCallback((field: keyof EtcConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:ETC:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="기타 설정"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-3">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* 섹션 1: Union Add-on / KDS */}
            <div className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
              <div className="mb-2 text-sm font-medium text-pos-text">Union Add-on Usage Status</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-pos-text">Kitchen Display(Android KDS) 전송</span>
                <Dropdown
                  options={KDS_TRANSFER_OPTIONS}
                  value={config.kdsTransferType}
                  onChange={(v) => handleChange('kdsTransferType', v)}
                />
              </div>
            </div>

            {/* 섹션 2: M Connect (조건부) */}
            {showMConnect && (
              <div className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
                <div className="mb-2 text-sm font-medium text-pos-text">푸드테크 M Connect</div>
                <div className="flex flex-col gap-2">
                  <Checkbox
                    checked={config.mConnectEnabled}
                    onChange={(v) => handleChange('mConnectEnabled', v)}
                    label="M Connect 사용"
                  />
                  {config.mConnectEnabled && (
                    <>
                      <TextInput
                        label="연결 URL"
                        value={config.mConnectUrl}
                        onChange={(v) => handleChange('mConnectUrl', v)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary">설치</Button>
                        <Button size="sm" variant="secondary">관리</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 섹션 3: 애드온 KDS (조건부) */}
            {showAddonKds && (
              <div className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
                <div className="mb-2 text-sm font-medium text-pos-text">애드온 KDS</div>
                <div className="flex flex-col gap-2">
                  <Checkbox
                    checked={config.addonKdsEnabled}
                    onChange={(v) => handleChange('addonKdsEnabled', v)}
                    label="애드온 KDS 사용"
                  />
                  {config.addonKdsEnabled && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-pos-text">KDS 타입</span>
                        <Dropdown
                          options={[
                            { value: '', label: '선택' },
                            { value: 'basic', label: '기본' },
                            { value: 'advanced', label: '고급' },
                          ]}
                          value={config.addonKdsType}
                          onChange={(v) => handleChange('addonKdsType', v)}
                        />
                      </div>
                      <TextInput
                        label="추가매장코드"
                        value={config.addonExtraStoreCode}
                        onChange={(v) => handleChange('addonExtraStoreCode', v)}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
