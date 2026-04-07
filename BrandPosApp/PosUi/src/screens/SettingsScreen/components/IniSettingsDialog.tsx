'use client';

/**
 * IniSettingsDialog (SET-INISET)
 *
 * INI 설정 (POS 초기 설정) 화면.
 * POS 타입, POS 번호(읽기전용), POS 이름, 판매처, 서버 접속 정보 등.
 * INI feature flag 기반 화면 전환/롤백 제어.
 *
 * Legacy: IDD_INISET (리소스 410)
 * Bridge: SETUP:INI:GET_CONFIG, SETUP:INI:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ───

interface IniConfig {
  posType: string;
  posNumber: string;
  posName: string;
  sellerName: string;
  sellerIp: string;
  sellerPort: string;
  serverType: string;
  serverName: string;
  serverIp: string;
  serverPort: string;
}

interface IniSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ───

export default function IniSettingsDialog({
  open,
  onClose,
}: IniSettingsDialogProps) {
  const [config, setConfig] = useState<IniConfig>({
    posType: '',
    posNumber: '',
    posName: '',
    sellerName: '',
    sellerIp: '',
    sellerPort: '',
    serverType: '',
    serverName: '',
    serverIp: '',
    serverPort: '',
  });

  // TODO: RTK Query - setupApi.useGetIniConfigQuery()
  // TODO: RTK Query - setupApi.useSaveIniConfigMutation()

  const handleChange = useCallback((field: keyof IniConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:INI:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="INI 설정"
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
            {/* POS 기본 정보 */}
            <fieldset className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
              <legend className="px-1 text-sm font-medium">POS 기본 정보</legend>
              <div className="flex flex-col gap-2">
                <TextInput
                  label="POS 타입"
                  value={config.posType}
                  onChange={(v) => handleChange('posType', v)}
                />
                <TextInput
                  label="POS 번호"
                  value={config.posNumber}
                  onChange={() => {}}
                  disabled
                />
                <TextInput
                  label="POS 이름"
                  value={config.posName}
                  onChange={(v) => handleChange('posName', v)}
                />
              </div>
            </fieldset>

            {/* 판매처 정보 */}
            <fieldset className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
              <legend className="px-1 text-sm font-medium">판매처 정보</legend>
              <div className="flex flex-col gap-2">
                <TextInput
                  label="판매처 이름"
                  value={config.sellerName}
                  onChange={(v) => handleChange('sellerName', v)}
                />
                <TextInput
                  label="판매처 IP"
                  value={config.sellerIp}
                  onChange={(v) => handleChange('sellerIp', v)}
                />
                <TextInput
                  label="판매처 포트"
                  value={config.sellerPort}
                  onChange={(v) => handleChange('sellerPort', v)}
                />
              </div>
            </fieldset>

            {/* 서버 정보 */}
            <fieldset className="rounded-xl bg-pos-bg p-4 shadow-pos-card">
              <legend className="px-1 text-sm font-medium">서버 정보</legend>
              <div className="flex flex-col gap-2">
                <TextInput
                  label="서버 타입"
                  value={config.serverType}
                  onChange={(v) => handleChange('serverType', v)}
                />
                <TextInput
                  label="서버 이름"
                  value={config.serverName}
                  onChange={(v) => handleChange('serverName', v)}
                />
                <TextInput
                  label="서버 IP"
                  value={config.serverIp}
                  onChange={(v) => handleChange('serverIp', v)}
                />
                <TextInput
                  label="서버 포트"
                  value={config.serverPort}
                  onChange={(v) => handleChange('serverPort', v)}
                />
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
