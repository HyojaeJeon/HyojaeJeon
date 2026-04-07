'use client';

import React, { lazy, Suspense } from 'react';

/* ─── Loading Fallback ─── */
function LoadingSpinner() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-pos-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-pos-text-muted">불러오는 중...</p>
      </div>
    </div>
  );
}

/* ─── Placeholder for unimplemented screens ─── */
function NotReady({ slug }: { slug: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-pos-bg gap-2">
      <p className="text-sm text-pos-text-muted">준비 중입니다.</p>
      <p className="text-xs text-pos-text-muted/60 font-mono">{slug}</p>
    </div>
  );
}

/* ─── Dialog Preview Wrapper ───
   Wraps modal/dialog components. Provides open/close state so close buttons work.
   open=false 일 때 children을 렌더링하지 않아서 자체 overlay 컴포넌트도 확실히 사라진다.
   "다시 열기" button appears when dialog is closed. */
function DialogPreview({ children }: { children: (props: { open: boolean; onClose: () => void }) => React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="w-full h-full bg-pos-bg relative overflow-hidden">
      {open && children({ open, onClose: () => setOpen(false) })}
      {!open && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg text-sm font-bold active:bg-primary-700 cursor-pointer"
          >
            다시 열기
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Legacy noop-based wrapper (for components that manage their own state) ─── */
function SimplePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full bg-pos-bg relative overflow-hidden">
      {children}
    </div>
  );
}

/* ─── Mock data for preview props ─── */
const MOCK_SESSION = {
  employeeId: 'EMP001',
  employeeName: '김민수',
  role: 'MANAGER',
  storeCode: 'S001',
  storeName: '효정 레스토랑 강남점',
  posNo: 'POS-001',
  adjustNo: '001',
  loginAt: new Date().toISOString(),
};

const noop = () => {};

/* ═══════════════════════════════════════════════════════
   LAZY IMPORTS
   ═══════════════════════════════════════════════════════ */

// --- Full Screens ---
const LazyMainMenuScreen = lazy(() => import('@screens/MainMenuScreen'));
const LazyTableScreen = lazy(() => import('@screens/TableScreen'));
const LazyOrderScreen = lazy(() => import('@screens/OrderScreen'));
const LazyPaymentScreen = lazy(() => import('@screens/PaymentScreen'));
const LazyLoginScreen = lazy(() => import('@screens/LoginScreen'));
const LazyCustomerScreen = lazy(() => import('@screens/CustomerScreen'));
const LazyEmployeeScreen = lazy(() => import('@screens/EmployeeScreen'));
const LazyStockScreen = lazy(() => import('@screens/StockScreen'));

// --- Customer Dialogs ---
const LazyCustomerRegistrationDialog = lazy(() => import('@screens/CustomerScreen/components/CustomerRegistrationDialog'));
const LazyCustomerSearchDialog = lazy(() => import('@screens/CustomerScreen/components/CustomerSearchDialog'));
const LazyCustomerInputDialog = lazy(() => import('@screens/CustomerScreen/components/CustomerInputDialog'));
const LazyCustomerDetailDialog = lazy(() => import('@screens/CustomerScreen/components/CustomerDetailDialog'));
const LazyCustomerCreditDialog = lazy(() => import('@screens/CustomerScreen/components/CustomerCreditDialog'));
const LazyDeliveryManageDialog = lazy(() => import('@screens/CustomerScreen/components/DeliveryManageDialog'));
const LazyDeliveryManageV2Dialog = lazy(() => import('@screens/CustomerScreen/components/DeliveryManageV2Dialog'));
const LazyDeliveryAddressDialog = lazy(() => import('@screens/CustomerScreen/components/DeliveryAddressDialog'));
const LazyDeliveryPrintDialog = lazy(() => import('@screens/CustomerScreen/components/DeliveryPrintDialog'));
const LazyCallerIdDialog = lazy(() => import('@screens/CustomerScreen/components/CallerIdDialog'));
const LazyContentViewDialog = lazy(() => import('@screens/CustomerScreen/components/ContentViewDialog'));

// --- Employee Dialogs ---
const LazyEmployeeSelectDialog = lazy(() => import('@screens/EmployeeScreen/components/EmployeeSelectDialog'));
const LazyAttendanceDialog = lazy(() => import('@screens/EmployeeScreen/components/AttendanceDialog'));
const LazyAutoWorkDialog = lazy(() => import('@screens/EmployeeScreen/components/AutoWorkDialog'));
const LazyIniSettingsDialog = lazy(() => import('@screens/EmployeeScreen/components/IniSettingsDialog'));
const LazySalesListViewDialog = lazy(() => import('@screens/EmployeeScreen/components/SalesListViewDialog'));
const LazyContentView2Dialog = lazy(() => import('@screens/EmployeeScreen/components/ContentView2Dialog'));

// --- Stock Dialogs ---
const LazyStockInputDialog = lazy(() => import('@screens/StockScreen/components/StockInputDialog'));
const LazyStockViewDialog = lazy(() => import('@screens/StockScreen/components/StockViewDialog'));
const LazyPurchaseManagerDialog = lazy(() => import('@screens/StockScreen/components/PurchaseManagerDialog'));
const LazyPurchaseModifyDialog = lazy(() => import('@screens/StockScreen/components/PurchaseModifyDialog'));
const LazyGetItemServerDialog = lazy(() => import('@screens/StockScreen/components/GetItemServerDialog'));
const LazyGroupSelectDialog = lazy(() => import('@screens/StockScreen/components/GroupSelectDialog'));
const LazyStockAccountDialog = lazy(() => import('@screens/StockScreen/components/StockAccountDialog'));
const LazyStockSupplyDialog = lazy(() => import('@screens/StockScreen/components/StockSupplyDialog'));

// --- Order Dialogs ---
const LazyItemSearchDialog = lazy(() => import('@screens/OrderScreen/components/ItemSearchDialog'));
const LazyItemRegistrationDialog = lazy(() => import('@screens/OrderScreen/components/ItemRegistrationDialog'));
const LazyPLUSetDialog = lazy(() => import('@screens/OrderScreen/components/PLUSetDialog'));
const LazyMenuMoveDialog = lazy(() => import('@screens/OrderScreen/components/MenuMoveDialog'));
const LazyInputAndCustomerDialog = lazy(() => import('@screens/OrderScreen/components/InputAndCustomerDialog'));

// --- Payment Dialogs ---
const LazyOrderPaymentDialog = lazy(() => import('@screens/PaymentScreen/components/OrderPaymentDialog'));
const LazyOrderPaymentQuickSelect = lazy(() => import('@screens/PaymentScreen/components/OrderPaymentQuickSelect'));
const LazyDutchPayDialog = lazy(() => import('@screens/PaymentScreen/components/DutchPayDialog'));
const LazyPaymentEtcDialog = lazy(() => import('@screens/PaymentScreen/components/PaymentEtcDialog'));
const LazyAsyncPaymentNotification = lazy(() => import('@screens/PaymentScreen/components/AsyncPaymentNotification'));
const LazyPaymentQuickSelect = lazy(() => import('@screens/PaymentScreen/components/PaymentQuickSelect'));
const LazyPaymentQuickSelectVN = lazy(() => import('@screens/PaymentScreen/components/PaymentQuickSelectVN'));
const LazyCashManagementDialog = lazy(() => import('@screens/PaymentScreen/components/CashManagementDialog'));
const LazySalesViewDialog = lazy(() => import('@screens/PaymentScreen/components/SalesViewDialog'));
const LazySalesViewSelectDialog = lazy(() => import('@screens/PaymentScreen/components/SalesViewSelectDialog'));
const LazyPointSaveSellDialog = lazy(() => import('@screens/PaymentScreen/components/PointSaveSellDialog'));
const LazyMartSellDialog = lazy(() => import('@screens/PaymentScreen/components/MartSellDialog'));
const LazyPaymentVNExtension = lazy(() => import('@screens/PaymentScreen/components/PaymentVNExtension'));

// --- Payment Method Dialogs (VN) ---
const LazyZaloPayQRDialog = lazy(() => import('@screens/PaymentScreen/components/ZaloPayQRDialog'));
const LazyHJVietPayDialog = lazy(() => import('@screens/PaymentScreen/components/HJVietPayDialog'));
const LazyInfoplusBIDVQRDialog = lazy(() => import('@screens/PaymentScreen/components/InfoplusBIDVQRDialog'));
const LazyInfoplusShinhanQRDialog = lazy(() => import('@screens/PaymentScreen/components/InfoplusShinhanQRDialog'));
const LazyInfoplusWooriQRDialog = lazy(() => import('@screens/PaymentScreen/components/InfoplusWooriQRDialog'));
const LazyNapasQRDialog = lazy(() => import('@screens/PaymentScreen/components/NapasQRDialog'));
const LazyKakaoAlimDialog = lazy(() => import('@screens/PaymentScreen/components/KakaoAlimDialog'));
const LazyViettelIssuanceDialog = lazy(() => import('@screens/PaymentScreen/components/ViettelIssuanceDialog'));

// --- Payment Misc Dialogs ---
const LazyPaymentMemoDialog = lazy(() => import('@screens/PaymentScreen/components/PaymentMemoDialog'));
const LazyGiftManageDialog = lazy(() => import('@screens/PaymentScreen/components/GiftManageDialog'));
const LazyGiftRegisterDialog = lazy(() => import('@screens/PaymentScreen/components/GiftRegisterDialog'));
const LazyGiftUseDialog = lazy(() => import('@screens/PaymentScreen/components/GiftUseDialog'));
const LazyCouponUseDialog = lazy(() => import('@screens/PaymentScreen/components/CouponUseDialog'));

// --- Table Dialogs ---
const LazyTableBtnSelectDialog = lazy(() => import('@screens/TableScreen/components/TableBtnSelectDialog'));
const LazyTableMessageDialog = lazy(() => import('@screens/TableScreen/components/TableMessageDialog'));

// --- Settings Dialogs ---
const LazyBarcodeSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/BarcodeSettingsDialog'));
const LazySettingsMainDialog = lazy(() => import('@screens/SettingsScreen/components/SettingsMainDialog'));
const LazyBasicSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/BasicSettingsDialog'));
const LazyCompanyInfoDialog = lazy(() => import('@screens/SettingsScreen/components/CompanyInfoDialog'));
const LazyDeviceSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/DeviceSettingsDialog'));
const LazyEmployeeInputDialog = lazy(() => import('@screens/SettingsScreen/components/EmployeeInputDialog'));
const LazyCustomerInfoSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/CustomerInfoSettingsDialog'));
const LazyItemInputDialog = lazy(() => import('@screens/SettingsScreen/components/ItemInputDialog'));
const LazyItemInputDetailDialog = lazy(() => import('@screens/SettingsScreen/components/ItemInputDetailDialog'));
const LazyItemSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/ItemSettingsDialog'));
const LazyItemGroupPosDialog = lazy(() => import('@screens/SettingsScreen/components/ItemGroupPosDialog'));
const LazySetPaymentManagerDialog = lazy(() => import('@screens/SettingsScreen/components/PaymentManagerDialog'));
const LazySetPrintManagerDialog = lazy(() => import('@screens/SettingsScreen/components/PrintManagerDialog'));
const LazyKioskManagerDialog = lazy(() => import('@screens/SettingsScreen/components/KioskManagerDialog'));
const LazyQRPayManagerDialog = lazy(() => import('@screens/SettingsScreen/components/QRPayManagerDialog'));
const LazyCardReaderManagerDialog = lazy(() => import('@screens/SettingsScreen/components/CardReaderManagerDialog'));
const LazyZaloOAManagerDialog = lazy(() => import('@screens/SettingsScreen/components/ZaloOAManagerDialog'));
const LazyZaloOAPaymentDialog = lazy(() => import('@screens/SettingsScreen/components/ZaloOAPaymentDialog'));
const LazyZaloOAAppointmentDialog = lazy(() => import('@screens/SettingsScreen/components/ZaloOAAppointmentDialog'));
const LazyZaloPayQRSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/ZaloPayQRSettingsDialog'));
const LazySetSaleDiscountDialog = lazy(() => import('@screens/SettingsScreen/components/SaleDiscountDialog'));
const LazyEventSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/EventSettingsDialog'));
const LazyFavoritesDialog = lazy(() => import('@screens/SettingsScreen/components/FavoritesDialog'));
const LazyGroupAppDialog = lazy(() => import('@screens/SettingsScreen/components/GroupAppDialog'));
const LazyInOutSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/InOutSettingsDialog'));
const LazyOrderMessageDialog = lazy(() => import('@screens/SettingsScreen/components/OrderMessageDialog'));
const LazyNumpadSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/NumpadSettingsDialog'));
const LazyTableMessageSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/TableMessageSettingsDialog'));
const LazyStoreInfoDialog = lazy(() => import('@screens/SettingsScreen/components/StoreInfoDialog'));
const LazySupplierDialog = lazy(() => import('@screens/SettingsScreen/components/SupplierDialog'));
const LazyBasicCodeDialog = lazy(() => import('@screens/SettingsScreen/components/BasicCodeDialog'));
const LazyDataDeleteDialog = lazy(() => import('@screens/SettingsScreen/components/DataDeleteDialog'));
const LazySetIniSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/IniSettingsDialog'));
const LazySimpleReceiptDialog = lazy(() => import('@screens/SettingsScreen/components/SimpleReceiptDialog'));
const LazySelectSellDeleteDialog = lazy(() => import('@screens/SettingsScreen/components/SelectSellDeleteDialog'));
const LazyPrintSettingsDialog = lazy(() => import('@screens/SettingsScreen/components/PrintSettingsDialog'));
const LazyPrintBillDialog = lazy(() => import('@screens/SettingsScreen/components/PrintBillDialog'));
const LazyPrintReceiptDialog = lazy(() => import('@screens/SettingsScreen/components/PrintReceiptDialog'));
const LazyPrintRegDialog = lazy(() => import('@screens/SettingsScreen/components/PrintRegDialog'));
const LazyPrintMessageDialog = lazy(() => import('@screens/SettingsScreen/components/PrintMessageDialog'));
const LazyPrintQRDialog = lazy(() => import('@screens/SettingsScreen/components/PrintQRDialog'));
const LazyTaxRefundDialog = lazy(() => import('@screens/SettingsScreen/components/TaxRefundDialog'));
const LazyTaxSellerDialog = lazy(() => import('@screens/SettingsScreen/components/TaxSellerDialog'));
const LazyPaymentCompanyDialog = lazy(() => import('@screens/SettingsScreen/components/PaymentCompanyDialog'));
const LazyEtcSettingsV2Dialog = lazy(() => import('@screens/SettingsScreen/components/EtcSettingsV2Dialog'));

// --- Common Dialogs ---
const LazyHoldOrderDialog = lazy(() => import('@screens/common/HoldOrderDialog'));
const LazyInOutDialog = lazy(() => import('@screens/common/InOutDialog'));
const LazyTicketSearchDialog = lazy(() => import('@screens/common/TicketSearchDialog'));

// --- Shared UI Organisms ---
const LazyMessageDialog = lazy(() => import('@shared/ui/organisms/MessageDialog'));
const LazyUnauthorizedDialog = lazy(() => import('@shared/ui/organisms/UnauthorizedDialog'));
const LazyPhoneNumPad = lazy(() => import('@shared/ui/organisms/PhoneNumPad'));

/* ═══════════════════════════════════════════════════════
   SLUG -> RENDER
   ═══════════════════════════════════════════════════════ */

function renderScreen(slug: string): React.ReactNode {
  switch (slug) {
    // ═══ Full Screens ═══
    case 'main-menu':
    case 'rc-restaurant-dialog':
      return <LazyMainMenuScreen session={MOCK_SESSION} />;

    case 'table':
    case 'rc-table-dialog':
      return <LazyTableScreen />;

    case 'order':
    case 'rc-order-dialog':
      return <LazyOrderScreen />;

    case 'payment':
    case 'rc-oracc-dialog':
    case 'rc-account-dialog':
    case 'rc-account-dialog-vn':
      return <LazyPaymentScreen />;

    case 'login':
    case 'rc-login':
      return <LazyLoginScreen />;

    case 'stock':
      return <LazyStockScreen />;

    // ═══ Customer Dialogs ═══
    case 'customer-register':
    case 'customer-all-register':
    case 'rc-custregi':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCustomerRegistrationDialog open={open} onClose={onClose} onRegistered={noop} />
          )}
        </DialogPreview>
      );

    case 'customer-search':
    case 'rc-custsel':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCustomerSearchDialog open={open} onClose={onClose} onSelected={noop} />
          )}
        </DialogPreview>
      );

    case 'customer-input':
    case 'rc-custinput':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCustomerInputDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'customer-detail':
    case 'rc-cust-detail':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCustomerDetailDialog open={open} customerId="CUST-001" onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'customer-info':
    case 'customer-keep':
    case 'rc-cust-keep':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCustomerCreditDialog open={open} customerId="CUST-001" onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Delivery Dialogs ═══
    case 'delivery':
    case 'rc-custdeli':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyDeliveryManageDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'delivery-agency':
    case 'rc-custdeli2':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyDeliveryManageV2Dialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'delivery-address':
    case 'delivery-address-input':
    case 'rc-custdeli-addr':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyDeliveryAddressDialog open={open} onClose={onClose} onAddressSelected={noop} />
          )}
        </DialogPreview>
      );

    case 'delivery-print':
    case 'rc-custdeli-prn':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyDeliveryPrintDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'delivery-cid':
    case 'rc-cid-numview':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyCallerIdDialog
              phoneNumber="010-1234-5678"
              channel={1}
              address="서울시 강남구 테헤란로 123"
              onAssign={noop}
              onReserve={noop}
              onClose={onClose}
            />
          )}
        </DialogPreview>
      );

    case 'rc-contentview':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyContentViewDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Employee Dialogs ═══
    case 'employee-select':
    case 'employee-call':
    case 'employee-alert':
    case 'rc-empsel':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyEmployeeSelectDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'attendance':
    case 'attendance-pay':
    case 'attendance-modify':
    case 'attendance-settings':
    case 'rc-emp-diligence':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyAttendanceDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'auto-end-work':
    case 'rc-autowork':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyAutoWorkDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-iniset':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyIniSettingsDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'sell-list-view':
    case 'rc-selllistview':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazySalesListViewDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-contentview2':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyContentView2Dialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Stock Dialogs ═══
    case 'stock-input':
    case 'rc-stock-input':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyStockInputDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'stock-view':
    case 'stock-date-view':
    case 'rc-stock-view':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyStockViewDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'purchase':
    case 'purchase-view':
    case 'rc-purchasemgr-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPurchaseManagerDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'purchase-modify':
    case 'rc-pur-stomodify':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPurchaseModifyDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-getitemserver':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyGetItemServerDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-groupsel-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyGroupSelectDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'stock-account':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyStockAccountDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'stock-supply':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyStockSupplyDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Order Dialogs ═══
    case 'plu-set':
    case 'rc-order-pluset':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPLUSetDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'item-register':
    case 'rc-itemregi':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyItemRegistrationDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-item-search':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyItemSearchDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-menumove':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyMenuMoveDialog
              open={open}
              onClose={onClose}
              sourceTableName="테이블 1"
              targetTableName="테이블 3"
              sourceItems={[
                { id: '1', name: '김치찌개', quantity: 2, price: 16000 },
                { id: '2', name: '된장찌개', quantity: 1, price: 8000 },
                { id: '3', name: '공기밥', quantity: 3, price: 3000 },
              ]}
            />
          )}
        </DialogPreview>
      );

    case 'rc-inputandcust':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyInputAndCustomerDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Table Dialogs ═══
    case 'table-select':
    case 'table-quick-select':
    case 'rc-table-bselect':
    case 'rc-oracc-bselect':
    case 'rc-account-bselect':
    case 'rc-account-bselect-vn':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyTableBtnSelectDialog
              selectedTableId={1}
              onClose={onClose}
              onOpenTableMessage={noop}
            />
          )}
        </DialogPreview>
      );

    case 'table-message':
    case 'rc-tablemsg-dlg':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyTableMessageDialog
              tableId={1}
              tableName="테이블 1"
              initialMessage="VIP 고객"
              onClose={onClose}
              onSave={noop}
            />
          )}
        </DialogPreview>
      );

    // ═══ Payment Dialogs ═══
    case 'order-payment':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyOrderPaymentDialog tableCode="T01" personCount={4} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'order-payment-quick':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyOrderPaymentQuickSelect locale="ko" onPaymentMethodSelect={noop} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'dutch-pay':
    case 'dutch-pay-people':
    case 'dutch-pay-item':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyDutchPayDialog open={open} onClose={onClose} tableId="T01" />
          )}
        </DialogPreview>
      );

    case 'payment-etc':
    case 'rc-saledc':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPaymentEtcDialog open={open} onClose={onClose} tableId="T01" totalAmount={150000} paidAmount={0} />
          )}
        </DialogPreview>
      );

    case 'async-payment-noti':
    case 'rc-async-paynoti-dlg':
      return (
        <SimplePreview>
          <LazyAsyncPaymentNotification />
        </SimplePreview>
      );

    case 'payment-quick-select':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyPaymentQuickSelect onPaymentMethodSelect={noop} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'payment-quick-select-vn':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyPaymentQuickSelectVN locale="vi" onPaymentMethodSelect={noop} onLanguageChange={noop} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'cash-inout':
    case 'rc-catcashmgr-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCashManagementDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-sellview':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazySalesViewDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'sell-view-select':
    case 'rc-sellview-select':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazySalesViewSelectDialog open={open} onClose={onClose} onConfirm={noop} />
          )}
        </DialogPreview>
      );

    case 'point-save':
    case 'rc-pointsavesell':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPointSaveSellDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-martsell-dlg':
      return (
        <DialogPreview>
          {({ onClose }) => (
            <LazyMartSellDialog onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'payment-vn':
      return (
        <SimplePreview>
          <LazyPaymentVNExtension locale="vi" totalAmount={500000} />
        </SimplePreview>
      );

    // ═══ Payment Method Dialogs (VN QR) ═══
    case 'zalopay':
    case 'rc-zalopay-qr':
    case 'rc-set-zalopay-qr':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyZaloPayQRDialog open={open} onClose={onClose} amount={500000} tableCode="T01" />
          )}
        </DialogPreview>
      );

    case 'hjvietpay':
    case 'rc-hjvietpay-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyHJVietPayDialog open={open} onClose={onClose} amount={500000} tableCode="T01" />
          )}
        </DialogPreview>
      );

    case 'infoplus-bidv':
    case 'rc-infoplus-bidv-qr':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyInfoplusBIDVQRDialog open={open} onClose={onClose} amount={500000} tableCode="T01" />
          )}
        </DialogPreview>
      );

    case 'infoplus-shinhan':
    case 'rc-infoplus-shinhan-qr':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyInfoplusShinhanQRDialog open={open} onClose={onClose} amount={500000} tableCode="T01" />
          )}
        </DialogPreview>
      );

    case 'infoplus-woori':
    case 'rc-infoplus-woori-qr':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyInfoplusWooriQRDialog open={open} onClose={onClose} amount={500000} tableCode="T01" />
          )}
        </DialogPreview>
      );

    case 'napas':
    case 'rc-napas-qr':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyNapasQRDialog open={open} onClose={onClose} amount={500000} tableCode="T01" />
          )}
        </DialogPreview>
      );

    case 'kakaotalk-alert':
    case 'rc-kakaotalk-alim':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyKakaoAlimDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'rc-viettel-issuance':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyViettelIssuanceDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Payment Misc Dialogs ═══
    case 'payment-memo':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPaymentMemoDialog open={open} onClose={onClose} onSave={noop} initialMemo="" />
          )}
        </DialogPreview>
      );

    case 'gift-manage':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyGiftManageDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'gift-register':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyGiftRegisterDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'gift-use':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyGiftUseDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'coupon-use':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyCouponUseDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Settings Dialogs ═══
    case 'barcode-settings':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyBarcodeSettingsDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ RC Setup (설정 앱) ═══
    case 'rc-set-restaurantset-dialog':
      return (
        <SimplePreview>
          <LazySettingsMainDialog onNavigate={noop} />
        </SimplePreview>
      );
    case 'rc-set-basicset':
      return <SimplePreview><LazyBasicSettingsDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-companyinfo':
      return <SimplePreview><LazyCompanyInfoDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-deviceset':
      return <SimplePreview><LazyDeviceSettingsDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-empinput':
      return <SimplePreview><LazyEmployeeInputDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-custinfoset':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyCustomerInfoSettingsDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-iteminput':
      return <SimplePreview><LazyItemInputDialog onClose={noop} onDetailOpen={noop} onSetOpen={noop} /></SimplePreview>;
    case 'rc-set-iteminput-detail':
      return <SimplePreview><LazyItemInputDetailDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-itemset':
      return <SimplePreview><LazyItemSettingsDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-item-grpos':
      return <SimplePreview><LazyItemGroupPosDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-pay-mgr':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazySetPaymentManagerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-print-mgr':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazySetPrintManagerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-kio-mgr':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyKioskManagerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-qrpay-mgr':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyQRPayManagerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-cardreader-mgr':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyCardReaderManagerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-zalooa-mgr':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyZaloOAManagerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-zalooa-payment-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyZaloOAPaymentDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-zalooa-appointment-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyZaloOAAppointmentDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-saledc':
      return <SimplePreview><LazySetSaleDiscountDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-eventset':
      return <SimplePreview><LazyEventSettingsDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-favorites':
      return <SimplePreview><LazyFavoritesDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-grpappdlg':
      return <SimplePreview><LazyGroupAppDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-inoutset':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyInOutSettingsDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-ordermsg':
      return <SimplePreview><LazyOrderMessageDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-numpad':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyNumpadSettingsDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-tablemsg':
      return <SimplePreview><LazyTableMessageSettingsDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-storeinfo':
      return <SimplePreview><LazyStoreInfoDialog onClose={noop} /></SimplePreview>;
    case 'rc-set-supply-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazySupplierDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-basic-code':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyBasicCodeDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-datadel':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyDataDeleteDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-iniset':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazySetIniSettingsDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-simplereceipt':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazySimpleReceiptDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-selectselldel-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazySelectSellDeleteDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-printset-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPrintSettingsDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-printbill-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPrintBillDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-printrece-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPrintReceiptDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-printreg-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPrintRegDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-printmsg-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPrintMessageDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-printqr-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPrintQRDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-pay-taxref':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyTaxRefundDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-pay-taxseller-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyTaxSellerDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-paycoset-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyPaymentCompanyDialog open={open} onClose={onClose} />}
        </DialogPreview>
      );
    case 'rc-set-etcsetv2-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => <LazyEtcSettingsV2Dialog open={open} onClose={onClose} />}
        </DialogPreview>
      );

    // ═══ Common Dialogs ═══
    case 'checkout':
    case 'rc-gethold-dlg':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyHoldOrderDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'cash-inout-input':
    case 'rc-inout-dialog':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyInOutDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    case 'text-search':
    case 'rc-tickserch':
    case 'rc-gettick-dialog':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyTicketSearchDialog open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Shared UI Organisms ═══
    case 'message-box':
    case 'message-view':
    case 'rc-message-dialog':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyMessageDialog
              open={open}
              mode="confirm"
              title="주문을 확정하시겠습니까?"
              description="확인 후에는 취소할 수 없습니다."
              onConfirm={noop}
              onCancel={onClose}
            />
          )}
        </DialogPreview>
      );

    case 'no-permission':
    case 'auth':
    case 'rc-unpermission':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyUnauthorizedDialog open={open} onClose={onClose} remainingAmount={150000} />
          )}
        </DialogPreview>
      );

    case 'phone-numpad':
    case 'numpad':
    case 'rc-numpad':
    case 'rc-phone-numpad':
    case 'rc-phone-numpad2':
      return (
        <DialogPreview>
          {({ open, onClose }) => (
            <LazyPhoneNumPad open={open} onClose={onClose} />
          )}
        </DialogPreview>
      );

    // ═══ Not yet implemented ═══
    default:
      return <NotReady slug={slug} />;
  }
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */

export default function ScreenPreviewClient({ slug }: { slug: string }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        {renderScreen(slug)}
      </Suspense>
    </div>
  );
}
