'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

/**
 * DeliveryAddressDialog -- 배달 주소 등록/관리 모달 (레거시 IDD_CUSTDELI_ADDR)
 *
 * 마스터-디테일 패턴: 좌측 주소 그룹 목록 + 우측 선택 그룹의 상세 주소 목록.
 * 선택한 주소를 부모 화면에 반환.
 *
 * Bridge Commands: DELIVERY:SEARCH_ADDRESS, CUSTOMER:UPDATE
 * UseCases: SearchDeliveryAddressUseCase, UpdateCustomerUseCase
 */

// ─── Types ───

interface AddressGroup {
  groupId: string;
  groupName: string;
}

interface AddressItem {
  addressId: string;
  groupId: string;
  addr: string;
  addrDetail: string;
  memo: string;
}

interface DeliveryAddressDialogProps {
  open: boolean;
  onClose: () => void;
  onAddressSelected: (address: AddressItem) => void;
}

// ─── Stub Data ───

const STUB_GROUPS: AddressGroup[] = [
  { groupId: 'AG1', groupName: '강남동' },
  { groupId: 'AG2', groupName: '서초동' },
  { groupId: 'AG3', groupName: '삼성동' },
];

const STUB_ADDRESSES: AddressItem[] = [
  { addressId: 'A001', groupId: 'AG1', addr: '강남구 테헤란로 123', addrDetail: '4층 401호', memo: '엘리베이터 사용' },
  { addressId: 'A002', groupId: 'AG1', addr: '강남구 역삼로 45', addrDetail: '2층', memo: '' },
  { addressId: 'A003', groupId: 'AG2', addr: '서초구 서초대로 67', addrDetail: '지하1층', memo: '주차장 입구' },
];

// ─── Component ───

export default function DeliveryAddressDialog({
  open,
  onClose,
  onAddressSelected,
}: DeliveryAddressDialogProps) {
  const [groups, setGroups] = useState<AddressGroup[]>(STUB_GROUPS);
  const [addresses, setAddresses] = useState<AddressItem[]>(STUB_ADDRESSES);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(STUB_GROUPS[0]?.groupId ?? null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Filtered addresses
  const filteredAddresses = addresses.filter((a) => a.groupId === selectedGroupId);

  // ─── Group Handlers ───

  const handleGroupAdd = useCallback(() => {
    // TODO: DELIVERY:SEARCH_ADDRESS or CUSTOMER:UPDATE for new group
    const newId = `AG${groups.length + 1}`;
    setGroups((prev) => [...prev, { groupId: newId, groupName: `새그룹${groups.length + 1}` }]);
    console.log('[DeliveryAddressDialog] add group');
  }, [groups]);

  const handleGroupSave = useCallback(async () => {
    // TODO: CUSTOMER:UPDATE Bridge command for group save
    // - idempotencyKey: `CUSTOMER:UPDATE:<uuid>`
    console.log('[DeliveryAddressDialog] save groups', groups);
  }, [groups]);

  const handleGroupDelete = useCallback(() => {
    if (!selectedGroupId) return;
    // TODO: CUSTOMER:UPDATE for group deletion
    console.log('[DeliveryAddressDialog] delete group', selectedGroupId);
    setGroups((prev) => prev.filter((g) => g.groupId !== selectedGroupId));
    setSelectedGroupId(null);
  }, [selectedGroupId]);

  // ─── Address Handlers ───

  const handleAddressAdd = useCallback(() => {
    if (!selectedGroupId) return;
    // TODO: CUSTOMER:UPDATE for new address item
    const newId = `A${String(addresses.length + 1).padStart(3, '0')}`;
    setAddresses((prev) => [
      ...prev,
      { addressId: newId, groupId: selectedGroupId, addr: '', addrDetail: '', memo: '' },
    ]);
    console.log('[DeliveryAddressDialog] add address');
  }, [selectedGroupId, addresses]);

  const handleAddressSave = useCallback(async () => {
    // TODO: CUSTOMER:UPDATE Bridge command for address save
    // - idempotencyKey: `CUSTOMER:UPDATE:<uuid>`
    console.log('[DeliveryAddressDialog] save addresses', addresses);
  }, [addresses]);

  const handleAddressDelete = useCallback(() => {
    if (!selectedAddressId) return;
    // TODO: CUSTOMER:UPDATE for address deletion
    console.log('[DeliveryAddressDialog] delete address', selectedAddressId);
    setAddresses((prev) => prev.filter((a) => a.addressId !== selectedAddressId));
    setSelectedAddressId(null);
  }, [selectedAddressId]);

  const handleSelect = useCallback(() => {
    if (!selectedAddressId) return;
    const addr = addresses.find((a) => a.addressId === selectedAddressId);
    if (addr) {
      onAddressSelected(addr);
    }
  }, [selectedAddressId, addresses, onAddressSelected]);

  const handleGroupNameEdit = useCallback((groupId: string, name: string) => {
    setGroups((prev) => prev.map((g) => (g.groupId === groupId ? { ...g, groupName: name } : g)));
  }, []);

  const handleAddressFieldEdit = useCallback(
    (addressId: string, field: keyof AddressItem, value: string) => {
      setAddresses((prev) =>
        prev.map((a) => (a.addressId === addressId ? { ...a, [field]: value } : a))
      );
    },
    []
  );

  // ─── Render ───

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="주소등록 및 관리"
      size="lg"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSelect} disabled={!selectedAddressId}>
            선택
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>
            닫기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleGroupAdd}>그룹추가</Button>
            <Button variant="outline" size="sm" onClick={handleGroupSave}>그룹저장</Button>
            <Button variant="ghost" size="sm" onClick={handleGroupDelete} disabled={!selectedGroupId}>그룹삭제</Button>
          </div>
          <div className="w-px h-5 bg-pos-border" />
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleAddressAdd} disabled={!selectedGroupId}>주소추가</Button>
            <Button variant="outline" size="sm" onClick={handleAddressSave}>주소저장</Button>
            <Button variant="ghost" size="sm" onClick={handleAddressDelete} disabled={!selectedAddressId}>주소삭제</Button>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="flex gap-3">
          {/* Left: Group List */}
          <div className="w-[160px] border border-pos-border rounded-pos-sm overflow-hidden shrink-0">
            <div className="bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
              주소 그룹
            </div>
            <div className="max-h-[240px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {groups.map((g) => (
                <div
                  key={g.groupId}
                  onClick={() => { setSelectedGroupId(g.groupId); setSelectedAddressId(null); }}
                  className={`px-2 py-2 border-b border-pos-border cursor-pointer
                    ${selectedGroupId === g.groupId ? 'bg-primary-50 border-l-2 border-l-primary-500' : 'active:bg-pos-surface'}
                  `}
                >
                  <input
                    type="text"
                    value={g.groupName}
                    onChange={(e) => handleGroupNameEdit(g.groupId, e.target.value)}
                    className="w-full text-sm bg-transparent outline-none text-pos-text"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Address Items */}
          <div className="flex-1 border border-pos-border rounded-pos-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_100px] bg-pos-surface border-b border-pos-border">
              <div className="px-2 py-1 text-xs font-semibold text-pos-text-muted">주소</div>
              <div className="px-2 py-1 text-xs font-semibold text-pos-text-muted">상세주소</div>
              <div className="px-2 py-1 text-xs font-semibold text-pos-text-muted">비고</div>
            </div>
            <div className="max-h-[240px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {filteredAddresses.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-pos-text-muted">
                  {selectedGroupId ? '주소가 없습니다' : '그룹을 선택하세요'}
                </div>
              ) : (
                filteredAddresses.map((a) => (
                  <div
                    key={a.addressId}
                    onClick={() => setSelectedAddressId(a.addressId)}
                    className={`grid grid-cols-[1fr_1fr_100px] border-b border-pos-border cursor-pointer
                      ${selectedAddressId === a.addressId ? 'bg-primary-50' : 'active:bg-pos-surface'}
                    `}
                  >
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={a.addr}
                        onChange={(e) => handleAddressFieldEdit(a.addressId, 'addr', e.target.value)}
                        className="w-full text-sm bg-transparent outline-none text-pos-text"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={a.addrDetail}
                        onChange={(e) => handleAddressFieldEdit(a.addressId, 'addrDetail', e.target.value)}
                        className="w-full text-sm bg-transparent outline-none text-pos-text"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={a.memo}
                        onChange={(e) => handleAddressFieldEdit(a.addressId, 'memo', e.target.value)}
                        className="w-full text-sm bg-transparent outline-none text-pos-text"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
