/* ─── VMeal App Design Mockup — Type Definitions ─── */

export interface MockMealWallet {
  id: string;
  employeeId: string;
  balanceVnd: number;
  companyAllowanceVnd: number;
  personalTopUpVnd: number;
  dailyLimitVnd: number;
  dailySpentVnd: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';
}

export interface MockMealEmployee {
  id: string;
  employeeCode: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  corporateId: string;
  corporateName: string;
  rfidBadgeId: string | null;
  avatarUrl: string | null;
  languageCode: 'vi' | 'ko' | 'en';
  biometricType: 'FACE_ID' | 'TOUCH_ID' | 'FINGERPRINT' | null;
}

export interface MockOrderItem {
  id: string;
  name: string;
  nameVi: string;
  quantity: number;
  unitPriceVnd: number;
  options: string[];
}

export interface MockMealOrder {
  id: string;
  branchId: string;
  merchantName: string;
  branchAddress: string;
  items: MockOrderItem[];
  totalAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  diningType: 'DINE_IN' | 'TAKEOUT';
  scheduledAt: string;
  status:
    | 'PAID_PENDING_ACCEPT'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
  tableNo: string | null;
  createdAt: string;
  idempotencyKey: string;
}

export interface MockMealTransaction {
  id: string;
  orderId: string | null;
  merchantName: string;
  branchName: string;
  amountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  status: 'APPROVED' | 'DECLINED' | 'REVERSED';
  type: 'PAYMENT' | 'TOP_UP' | 'REFUND';
  createdAt: string;
  policyName: string | null;
}

export interface MockMerchant {
  id: string;
  brandName: string;
  branchName: string;
  address: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  cuisineType: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  operatingHours: string;
  distanceKm: number;
  avgPriceVnd: number;
  loopType: 'OPEN_LOOP' | 'CLOSED_LOOP';
  policyMaxAmountVnd: number;
  phone: string;
}

export interface MockMenuItem {
  id: string;
  name: string;
  nameVi: string;
  descriptionVi: string;
  priceVnd: number;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
}

export interface MockMealPolicy {
  id: string;
  name: string;
  nameVi: string;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'EXPIRED';
  maxAmountPerTxnVnd: number;
  dailyLimitVnd: number;
  validFrom: string;
  validTo: string;
  allowedDays: number[];
  allowedTimeStart: string;
  allowedTimeEnd: string;
  mealTypes: string[];
  hybridPaymentAllowed: boolean;
  merchantCategories: string[];
}

export interface MockPaymentMethod {
  id: string;
  name: string;
  type: 'NAPAS_QR' | 'VISA_MASTERCARD' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER';
  status: 'AVAILABLE' | 'LINKED' | 'NOT_LINKED';
}

export type ScreenId =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'walletHome'
  | 'order'
  | 'orderStatus'
  | 'merchantMap'
  | 'merchantDetail'
  | 'dailyMenuList'
  | 'transactionList'
  | 'transactionDetail'
  | 'topUp'
  | 'settings'
  | 'badgeLink'
  | 'policyView'
  | 'preOrder'
  | 'myPreOrders'
  | 'groupPay';

export interface ScreenMeta {
  id: ScreenId;
  title: string;
  titleVi: string;
  category: 'auth' | 'wallet' | 'merchant' | 'transaction' | 'account' | 'order';
  showBottomTab: boolean;
  activeTab?: 'home' | 'explore' | 'activity' | 'account';
}
