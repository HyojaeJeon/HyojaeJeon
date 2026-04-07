'use client';

/**
 * ViettelIssuanceDialog (SCR-VIETTEL-ISSUANCE)
 *
 * Vietnam Viettel S-Invoice (electronic tax invoice) issuance screen.
 * Vietnam market only (locale=vi or feature flag).
 * Online required. NOT Outbox target.
 * 19 buyer info fields, issuance/bulk issuance, customer search/save.
 *
 * Legacy: IDD_VIETTEL_ISSUANCE (385), 512x384 DLU, 44 controls
 * Shared UI: DataTable, TextInput, Select, DatePicker, Checkbox, Label, Button
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';
import DatePicker from '@shared/ui/molecules/DatePicker';

// --- Types ---

interface ViettelIssuanceDialogProps {
  open: boolean;
  onClose: () => void;
}

interface BuyerInfo {
  taxCode: string;
  companyName: string;
  customerCode: string;
  buyerName: string;
  cityName: string;
  districtName: string;
  address: string;
  bankAccount: string;
  bankName: string;
  email: string;
  phoneNumber: string;
  faxNumber: string;
  idType: string;
  idNumber: string;
  birthday: string;
  countryCode: string;
}

interface IssuanceRecord {
  date: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  status: string;
}

const ID_TYPE_OPTIONS = [
  { label: 'CMND/CCCD', value: 'CMND' },
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Other', value: 'OTHER' },
];

// --- Component ---

export default function ViettelIssuanceDialog({ open, onClose }: ViettelIssuanceDialogProps) {
  const [issuer, setIssuer] = useState('');
  const [directBankInput, setDirectBankInput] = useState(false);
  const [buyer, setBuyer] = useState<BuyerInfo>({
    taxCode: '',
    companyName: '',
    customerCode: '',
    buyerName: '',
    cityName: '',
    districtName: '',
    address: '',
    bankAccount: '',
    bankName: '',
    email: '',
    phoneNumber: '',
    faxNumber: '',
    idType: 'CMND',
    idNumber: '',
    birthday: '',
    countryCode: 'VN',
  });

  // Stub data
  const issuanceHistory: IssuanceRecord[] = [];

  const updateBuyer = <K extends keyof BuyerInfo>(field: K, value: BuyerInfo[K]) => {
    setBuyer((prev) => ({ ...prev, [field]: value }));
  };

  // --- Handlers (stubs) ---

  const handleIssue = () => {
    // TODO: Bridge NOTIFICATION:ISSUE_VIETTEL { customerInfo }
    //       -> IssueViettelCardUseCase -> ExternalBridge/Viettel
    //       Online required: OFFLINE_BLOCKED if offline
  };

  const handleBulkIssue = () => {
    // TODO: Bridge NOTIFICATION:ISSUE_VIETTEL (bulk mode)
    //       -> IssueViettelCardUseCase
  };

  const handleSearch = () => {
    // TODO: Bridge ITEM:SEARCH { taxCode?, customerCode? }
    //       -> IssueViettelCardUseCase -> CustMgr.SearchByTaxCode
  };

  const handleSaveCustomer = () => {
    // TODO: Bridge NOTIFICATION:ISSUE_VIETTEL (save customer)
    //       -> CustMgr.SaveCustomer
  };

  const handleClear = () => {
    setBuyer({
      taxCode: '',
      companyName: '',
      customerCode: '',
      buyerName: '',
      cityName: '',
      districtName: '',
      address: '',
      bankAccount: '',
      bankName: '',
      email: '',
      phoneNumber: '',
      faxNumber: '',
      idType: 'CMND',
      idNumber: '',
      birthday: '',
      countryCode: 'VN',
    });
    setDirectBankInput(false);
  };

  // --- Render ---

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="Viettel S-Invoice"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleIssue}>Issue</Button>
          <Button variant="secondary" size="sm" onClick={handleBulkIssue}>Bulk Issue</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Top action bar */}
        <div className="shrink-0 flex items-center gap-2 h-9">
          <select
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className="border border-pos-border rounded px-2 py-1 text-sm"
          >
            <option value="">{/* i18n: viettel.selectIssuer */}Select Issuer</option>
            {/* TODO: systemApi.getConfig -> issuer list */}
          </select>
        </div>

        {/* Form fields (19 buyer info fields) */}
        <div className="shrink-0 overflow-y-auto" style={{ maxHeight: 280 }}>
          <div className="grid grid-cols-2 gap-3">
          {/* Row 1 */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Tax Code</label>
            <TextInput value={buyer.taxCode} onChange={(v: string) => updateBuyer('taxCode', v)} className="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Company</label>
            <TextInput value={buyer.companyName} onChange={(v: string) => updateBuyer('companyName', v)} className="flex-1" />
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Cust Code</label>
            <TextInput value={buyer.customerCode} onChange={(v: string) => updateBuyer('customerCode', v)} className="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Buyer Name</label>
            <TextInput value={buyer.buyerName} onChange={(v: string) => updateBuyer('buyerName', v)} className="flex-1" />
            <Button onClick={handleSearch}>Search</Button>
            <Button onClick={handleSaveCustomer}>Save</Button>
            <Button onClick={handleClear}>Clear</Button>
          </div>

          {/* Row 3 */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">City</label>
            <TextInput value={buyer.cityName} onChange={(v: string) => updateBuyer('cityName', v)} className="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">District</label>
            <TextInput value={buyer.districtName} onChange={(v: string) => updateBuyer('districtName', v)} className="flex-1" />
          </div>

          {/* Row 4 - Address (wide) */}
          <div className="col-span-2 flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Address</label>
            <TextInput value={buyer.address} onChange={(v: string) => updateBuyer('address', v)} className="flex-1" />
          </div>

          {/* Row 5 - Bank */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">Bank Acc.</label>
            <TextInput value={buyer.bankAccount} onChange={(v: string) => updateBuyer('bankAccount', v)} className="flex-1" disabled={!directBankInput} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">Bank Name</label>
            <TextInput value={buyer.bankName} onChange={(v: string) => updateBuyer('bankName', v)} className="flex-1" />
            <Checkbox checked={directBankInput} onChange={() => setDirectBankInput(!directBankInput)} />
            <span className="text-xs">Direct</span>
          </div>

          {/* Row 6 - Contact */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Email</label>
            <TextInput value={buyer.email} onChange={(v: string) => updateBuyer('email', v)} className="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">*Phone</label>
            <TextInput value={buyer.phoneNumber} onChange={(v: string) => updateBuyer('phoneNumber', v)} className="flex-1" />
          </div>

          {/* Row 7 - ID */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">ID Type</label>
            <select
              value={buyer.idType}
              onChange={(e) => updateBuyer('idType', e.target.value)}
              className="flex-1 border border-pos-border rounded px-2 py-1 text-sm"
            >
              {ID_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">ID Number</label>
            <TextInput value={buyer.idNumber} onChange={(v: string) => updateBuyer('idNumber', v)} className="flex-1" />
          </div>

          {/* Row 8 */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">Birthday</label>
            <DatePicker value={buyer.birthday} onChange={(val) => updateBuyer('birthday', val)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">Country</label>
            <TextInput value={buyer.countryCode} onChange={(v: string) => updateBuyer('countryCode', v)} className="flex-1" />
          </div>

          {/* Fax */}
          <div className="flex items-center gap-2">
            <label className="w-24 text-xs font-medium">Fax</label>
            <TextInput value={buyer.faxNumber} onChange={(v: string) => updateBuyer('faxNumber', v)} className="flex-1" />
          </div>
        </div>
      </div>

        {/* Issuance history grid */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-pos-surface sticky top-0">
              <tr>
                <th className="text-left px-2 py-1">Date</th>
                <th className="text-left px-2 py-1">Invoice No</th>
                <th className="text-left px-2 py-1">Customer</th>
                <th className="text-right px-2 py-1">Amount</th>
                <th className="text-left px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {issuanceHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-pos-text-secondary text-xs">
                    {/* TODO: viettelApi.getIssuanceHistory */}
                    No issuance history
                  </td>
                </tr>
              ) : (
                issuanceHistory.map((record, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1">{record.date}</td>
                    <td className="px-2 py-1">{record.invoiceNo}</td>
                    <td className="px-2 py-1">{record.customerName}</td>
                    <td className="px-2 py-1 text-right">{record.amount.toLocaleString()}</td>
                    <td className="px-2 py-1">{record.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FullScreenPanel>
  );
}
