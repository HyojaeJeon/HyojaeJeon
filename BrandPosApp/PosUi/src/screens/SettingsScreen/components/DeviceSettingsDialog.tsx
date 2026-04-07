'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Radio from '@shared/ui/atoms/Radio';
import Dropdown from '@shared/ui/molecules/Dropdown';

/**
 * DeviceSettingsDialog -- POS device configuration
 *
 * Design doc: set-deviceset.md (SCR-SET-DEVICESET)
 * Legacy: IDD_DEVICESET (resource 155)
 *
 * Sections: Settlement Printer / Order Printer / Peripherals
 * COM ports and printer drivers are queried dynamically via C++ system API.
 * Some changes may require POS restart.
 *
 * Bridge Commands:
 *   SETUP:DEVICE:SAVE, SETUP:DEVICE:GET_COM_PORTS, SETUP:DEVICE:GET_PRINTERS
 *
 * RTK Query: setupDeviceApi.getDeviceConfig, saveDeviceConfig, getComPorts, getPrinters
 * UseCase: SaveDeviceConfigUseCase
 */

interface DeviceSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
}

const PLACEHOLDER_OPTS = [{ value: '', label: '-- 선택 --' }];
const USE_OPTS = [
  { value: 'use', label: '사용' },
  { value: 'unuse', label: '미사용' },
];
const BAUD_OPTS = [
  { value: '9600', label: '9600' },
  { value: '19200', label: '19200' },
  { value: '38400', label: '38400' },
  { value: '115200', label: '115200' },
];

export default function DeviceSettingsDialog({ open = true, onClose }: DeviceSettingsDialogProps) {
  // TODO: Load device config with setupDeviceApi.getDeviceConfig
  // TODO: Load COM ports with setupDeviceApi.getComPorts
  // TODO: Load printers with setupDeviceApi.getPrinters

  const [orderPrintMode, setOrderPrintMode] = useState<'item' | 'all'>('item');

  const handleSave = useCallback(() => {
    // TODO: Call setupDeviceApi.saveDeviceConfig mutation
    // TODO: Handle requireRestart flag in response
  }, []);

  const renderField = (label: string, control: React.ReactNode) => (
    <div className="flex items-center gap-2">
      <div className="w-24 shrink-0">
        <Label size="xs">{label}</Label>
      </div>
      <div className="flex-1">{control}</div>
    </div>
  );

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="장비 설정"
      subtitle="POS번호: -- POS이름: --"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 overflow-auto">
        {/* Section: Settlement Printer */}
        <section className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-pos-text">정산영수증 프린터</h3>
          <div className="grid grid-cols-2 gap-3">
            {renderField('프린터이름', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('드라이버', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('포트', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('사용여부', <Dropdown options={USE_OPTS} value="use" onChange={() => {}} />)}
          </div>
        </section>

        {/* Section: Order Printer */}
        <section className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-pos-text">주문영수증 프린터</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <Label size="xs">인쇄방식</Label>
              <Radio
                name="orderPrintMode"
                checked={orderPrintMode === 'item'}
                onChange={() => setOrderPrintMode('item')}
                label="상품별"
              />
              <Radio
                name="orderPrintMode"
                checked={orderPrintMode === 'all'}
                onChange={() => setOrderPrintMode('all')}
                label="전체"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderField('프린터', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
              {renderField('COM명', <TextInput value="" onChange={() => {}} placeholder="COM port name" />)}
              {renderField('데이터속도', <Dropdown options={BAUD_OPTS} value="9600" onChange={() => {}} />)}
            </div>
          </div>
        </section>

        {/* Section: Peripherals */}
        <section className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-pos-text">주변기기</h3>
          <div className="grid grid-cols-2 gap-3">
            {renderField('주문벨', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('U-Chef', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('카드리더기', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('포트', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
            {renderField('바코드스캐너', <Dropdown options={PLACEHOLDER_OPTS} value="" onChange={() => {}} />)}
          </div>
        </section>
      </div>
    </FullScreenPanel>
  );
}
