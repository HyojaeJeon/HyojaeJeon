'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface DeviceInfo {
  name: string;
  connected: boolean;
  type: string;
}

interface DeviceStatusProps {
  devices: DeviceInfo[];
}

const TYPE_LABELS: Record<string, string> = {
  printer: 'common.devicePrinter',
  cardReader: 'common.deviceCardReader',
  scale: 'common.deviceScale',
  network: 'common.deviceNetwork',
};

/**
 * DeviceStatus -- 장치 연결 상태 표시 바
 *
 * 수평 행에 장치별 상태 점을 표시한다.
 * 녹색=연결됨, 빨강=연결 끊김.
 */
export default function DeviceStatus({ devices }: DeviceStatusProps) {
  const { t } = usePosI18n();

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-pos-surface rounded-pos-sm border border-pos-border">
      {devices.map((device, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          {/* 상태 점 */}
          <span
            className={`
              w-2 h-2 rounded-pos-full shrink-0
              ${device.connected ? 'bg-pos-success' : 'bg-pos-error'}
            `}
          />
          {/* 장치 이름 */}
          <span className="text-2xs text-pos-text-secondary">
            {t(TYPE_LABELS[device.type] ?? '') || device.name}
            <span className="ml-1 text-pos-text-muted">
              {device.connected ? `(${t('common.connected')})` : `(${t('common.disconnected')})`}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
