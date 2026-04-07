'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import Label from '@shared/ui/atoms/Label';
import CustomerRegistrationDialog from './components/CustomerRegistrationDialog';
import CustomerSearchDialog from './components/CustomerSearchDialog';
import CustomerInputDialog from './components/CustomerInputDialog';
import CustomerDetailDialog from './components/CustomerDetailDialog';
import CustomerCreditDialog from './components/CustomerCreditDialog';
import DeliveryManageDialog from './components/DeliveryManageDialog';
import DeliveryManageV2Dialog from './components/DeliveryManageV2Dialog';
import DeliveryAddressDialog from './components/DeliveryAddressDialog';
import DeliveryPrintDialog from './components/DeliveryPrintDialog';
import CallerIdDialog from './components/CallerIdDialog';
import ContentViewDialog from './components/ContentViewDialog';

/**
 * CustomerScreen -- Customer management hub / entry point.
 *
 * Provides navigation buttons to open each customer-related dialog.
 * In production, these dialogs are typically opened from other screens
 * (TableScreen, OrderScreen, DeliveryScreen, etc.) rather than this hub.
 */

type DialogKey =
  | 'registration'
  | 'search'
  | 'input'
  | 'detail'
  | 'credit'
  | 'delivery'
  | 'deliveryV2'
  | 'deliveryAddress'
  | 'deliveryPrint'
  | 'callerId'
  | 'contentView'
  | null;

interface CustomerScreenProps {
  onClose?: () => void;
}

export default function CustomerScreen({ onClose }: CustomerScreenProps) {
  const [activeDialog, setActiveDialog] = useState<DialogKey>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const openDialog = useCallback((key: DialogKey) => {
    setActiveDialog(key);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const handleCustomerSelected = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveDialog(null);
    // TODO: notify parent or update global state
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-pos-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Label size="lg" weight="bold">Customer Management</Label>
          <Label size="xs" color="muted">
            {selectedCustomerId ? `Selected: ${selectedCustomerId}` : 'No customer selected'}
          </Label>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-pos-sm border border-pos-border bg-pos-bg text-pos-text-muted transition active:scale-[0.97]"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-3 gap-3 max-w-[600px]">
        <Button variant="outline" size="md" onClick={() => openDialog('registration')}>
          Customer Registration
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('search')}>
          Customer Search
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('input')}>
          Customer Management
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('detail')}>
          Customer Detail
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('credit')}>
          Keep Items (Credit)
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('delivery')}>
          Delivery Manage
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('deliveryV2')}>
          Delivery Order V2
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('deliveryAddress')}>
          Delivery Address
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('deliveryPrint')}>
          Delivery Print
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('callerId')}>
          Caller ID
        </Button>
        <Button variant="outline" size="md" onClick={() => openDialog('contentView')}>
          Content View
        </Button>
      </div>

      {/* ═══ Dialogs ═══ */}

      <CustomerRegistrationDialog
        open={activeDialog === 'registration'}
        onClose={closeDialog}
        onRegistered={handleCustomerSelected}
      />

      <CustomerSearchDialog
        open={activeDialog === 'search'}
        onClose={closeDialog}
        onSelected={handleCustomerSelected}
      />

      <CustomerInputDialog
        open={activeDialog === 'input'}
        onClose={closeDialog}
      />

      <CustomerDetailDialog
        open={activeDialog === 'detail'}
        customerId={selectedCustomerId ?? 'C001'}
        onClose={closeDialog}
      />

      <CustomerCreditDialog
        open={activeDialog === 'credit'}
        customerId={selectedCustomerId ?? 'C001'}
        onClose={closeDialog}
      />

      <DeliveryManageDialog
        open={activeDialog === 'delivery'}
        onClose={closeDialog}
      />

      <DeliveryManageV2Dialog
        open={activeDialog === 'deliveryV2'}
        onClose={closeDialog}
      />

      <DeliveryAddressDialog
        open={activeDialog === 'deliveryAddress'}
        onClose={closeDialog}
        onAddressSelected={() => {
          // TODO: handle address selection
          closeDialog();
        }}
      />

      <DeliveryPrintDialog
        open={activeDialog === 'deliveryPrint'}
        onClose={closeDialog}
      />

      {activeDialog === 'callerId' && (
        <CallerIdDialog
          phoneNumber="010-1234-5678"
          channel={1}
          address="Seoul, Gangnam-gu"
          onAssign={() => {
            // TODO: STAFF:VERIFY_PERMISSION -> assign
            closeDialog();
          }}
          onReserve={() => {
            // TODO: STAFF:VERIFY_PERMISSION -> reserve
            closeDialog();
          }}
          onClose={closeDialog}
        />
      )}

      <ContentViewDialog
        open={activeDialog === 'contentView'}
        size="full"
        onClose={closeDialog}
      />
    </div>
  );
}
