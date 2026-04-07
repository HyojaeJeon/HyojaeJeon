'use client';

/**
 * IniSettingsDialog (SCR-INISET)
 *
 * POS initial settings screen (maintenance mode only).
 * POS type, number, store PC name, server connection settings.
 * MSSQL -> SQLite transition: server fields become central sync config.
 *
 * Legacy: IDD_INISET (410), 400x300 DLU, 24 controls
 * Shared UI: Select, TextInput, Label, Button
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// --- Types ---

interface IniSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

type PosType = 'RESTAURANT' | 'MART' | 'KIOSK';

interface IniConfig {
  posType: PosType;
  posNo: string;
  posName: string;
  storePcName: string;
  serverType: string;
  serverName: string;
  serverIp: string;
  serverPort: string;
}

const POS_TYPE_OPTIONS: { label: string; value: PosType }[] = [
  { label: 'Restaurant', value: 'RESTAURANT' },
  { label: 'Mart', value: 'MART' },
  { label: 'Kiosk', value: 'KIOSK' },
];

// --- Component ---

export default function IniSettingsDialog({ open, onClose }: IniSettingsDialogProps) {
  // Local form state -- will be populated from systemApi.getConfig
  const [config, setConfig] = useState<IniConfig>({
    posType: 'RESTAURANT',
    posNo: '',
    posName: '',
    storePcName: '',
    serverType: '',
    serverName: '',
    serverIp: '',
    serverPort: '',
  });

  const [showServerConfig, setShowServerConfig] = useState(false);

  // --- Handlers (stubs) ---

  const handleSave = () => {
    // TODO: Bridge SYSTEM:UPDATE_CONFIG { posType, posNo, posName, saleName, serverConfig }
    //       -> UpdateSystemConfigUseCase -> Config/StoreInfo SQLite update
  };

  const updateField = <K extends keyof IniConfig>(field: K, value: IniConfig[K]) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // --- Render ---

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="system.iniSettings.title"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Form */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* POS Type */}
          <div className="flex items-center gap-4">
          <label className="w-32 text-sm font-medium text-pos-text">
            {/* i18n: system.iniSettings.posType */}
            POS Type
          </label>
            <select
            value={config.posType}
            onChange={(e) => updateField('posType', e.target.value as PosType)}
            className="flex-1 h-9 border border-pos-border rounded px-3 text-sm"
          >
            {POS_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* POS Number */}
        <div className="flex items-center gap-4">
          <label className="w-32 text-sm font-medium text-pos-text">
            {/* i18n: system.iniSettings.posNo */}
            POS Number
          </label>
          <TextInput
            value={config.posNo}
            onChange={(v: string) => updateField('posNo', v)}
            className="flex-1"
          />
        </div>

        {/* Store PC Name */}
        <div className="flex items-center gap-4">
          <label className="w-32 text-sm font-medium text-pos-text">
            {/* i18n: system.iniSettings.storePcName */}
            Store PC Name
          </label>
          <TextInput
            value={config.storePcName}
            onChange={(v: string) => updateField('storePcName', v)}
            className="flex-1"
          />
        </div>

        {/* Server config toggle (conditional - maintenance mode) */}
        <div className="pt-2">
          <Button onClick={() => setShowServerConfig((prev) => !prev)}>
            {showServerConfig ? 'Hide Server Config' : 'Show Server Config'}
          </Button>
        </div>

        {/* Server connection settings (conditional) */}
        {showServerConfig && (
          <div className="flex flex-col gap-3 border border-pos-border rounded p-3">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-pos-text">
                Server Type
              </label>
              <TextInput
                value={config.serverType}
                onChange={(v: string) => updateField('serverType', v)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-pos-text">
                Server Name
              </label>
              <TextInput
                value={config.serverName}
                onChange={(v: string) => updateField('serverName', v)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-pos-text">
                Server IP
              </label>
              <TextInput
                value={config.serverIp}
                onChange={(v: string) => updateField('serverIp', v)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-pos-text">
                Server Port
              </label>
              <TextInput
                value={config.serverPort}
                onChange={(v: string) => updateField('serverPort', v)}
                className="flex-1"
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </FullScreenPanel>
  );
}
