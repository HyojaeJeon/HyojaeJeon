/* ─── VMeal App Design Mockup — Mock Data (Vietnamese context) ─── */

import type {
  MockMealWallet,
  MockMealEmployee,
  MockMealOrder,
  MockMealTransaction,
  MockMerchant,
  MockMenuItem,
  MockMealPolicy,
  MockPaymentMethod,
  ScreenMeta,
} from './types';

/* ─── Employee (logged-in user) ─── */

export const MOCK_EMPLOYEE: MockMealEmployee = {
  id: 'emp-001',
  employeeCode: 'NV-2024-0156',
  name: 'Nguyễn Minh Tuấn',
  phone: '+84795050727',
  email: 'tuan.nguyen@techcorp.vn',
  department: 'Phòng Kỹ thuật',
  corporateId: 'corp-001',
  corporateName: 'TechCorp Vietnam',
  rfidBadgeId: 'RFID-7890',
  avatarUrl: null,
  languageCode: 'vi',
  biometricType: 'FINGERPRINT',
};

/* ─── Wallet ─── */

export const MOCK_WALLET: MockMealWallet = {
  id: 'wallet-001',
  employeeId: 'emp-001',
  balanceVnd: 2_450_000,
  companyAllowanceVnd: 2_000_000,
  personalTopUpVnd: 450_000,
  dailyLimitVnd: 200_000,
  dailySpentVnd: 65_000,
  status: 'ACTIVE',
};

/* ─── Merchants (Ho Chi Minh City) ─── */

export const MOCK_MERCHANTS: MockMerchant[] = [
  {
    id: 'merch-001',
    brandName: 'Phở 24',
    branchName: 'Phở 24 - Nguyễn Huệ',
    address: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
    latitude: 10.7735,
    longitude: 106.7019,
    photoUrl: '',
    cuisineType: 'Việt Nam',
    rating: 4.5,
    reviewCount: 328,
    isOpen: true,
    operatingHours: '06:00 – 22:00',
    distanceKm: 0.3,
    avgPriceVnd: 65_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 100_000,
    phone: '+84281234567',
  },
  {
    id: 'merch-002',
    brandName: 'Cơm Tấm Bà Năm',
    branchName: 'Cơm Tấm Bà Năm - Lê Lợi',
    address: '45 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
    latitude: 10.7726,
    longitude: 106.6981,
    photoUrl: '',
    cuisineType: 'Việt Nam',
    rating: 4.3,
    reviewCount: 215,
    isOpen: true,
    operatingHours: '06:30 – 21:00',
    distanceKm: 0.5,
    avgPriceVnd: 55_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 100_000,
    phone: '+84289876543',
  },
  {
    id: 'merch-003',
    brandName: 'Bún Chả Hà Nội',
    branchName: 'Bún Chả Hà Nội - Trần Hưng Đạo',
    address: '78 Trần Hưng Đạo, P.7, Q.5, TP.HCM',
    latitude: 10.7546,
    longitude: 106.6793,
    photoUrl: '',
    cuisineType: 'Việt Nam',
    rating: 4.6,
    reviewCount: 412,
    isOpen: true,
    operatingHours: '10:00 – 21:30',
    distanceKm: 1.2,
    avgPriceVnd: 50_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 100_000,
    phone: '+84285551234',
  },
  {
    id: 'merch-004',
    brandName: 'K-BBQ',
    branchName: 'K-BBQ Korean - Đồng Khởi',
    address: '12 Đồng Khởi, P. Bến Nghé, Q.1, TP.HCM',
    latitude: 10.7768,
    longitude: 106.7032,
    photoUrl: '',
    cuisineType: 'Hàn Quốc',
    rating: 4.2,
    reviewCount: 187,
    isOpen: true,
    operatingHours: '11:00 – 22:00',
    distanceKm: 0.4,
    avgPriceVnd: 120_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 150_000,
    phone: '+84287774321',
  },
  {
    id: 'merch-005',
    brandName: 'Canteen TechCorp',
    branchName: 'Canteen TechCorp - Tầng B1',
    address: 'B1, Toà nhà TechCorp, 100 Nguyễn Du, Q.1, TP.HCM',
    latitude: 10.7755,
    longitude: 106.6995,
    photoUrl: '',
    cuisineType: 'Canteen',
    rating: 4.0,
    reviewCount: 89,
    isOpen: true,
    operatingHours: '07:00 – 19:00',
    distanceKm: 0.0,
    avgPriceVnd: 35_000,
    loopType: 'CLOSED_LOOP',
    policyMaxAmountVnd: 100_000,
    phone: '+84281110000',
  },
  {
    id: 'merch-006',
    brandName: 'Bánh Mì Huỳnh Hoa',
    branchName: 'Bánh Mì Huỳnh Hoa - Lê Thị Riêng',
    address: '26 Lê Thị Riêng, P. Phạm Ngũ Lão, Q.1, TP.HCM',
    latitude: 10.7690,
    longitude: 106.6905,
    photoUrl: '',
    cuisineType: 'Việt Nam',
    rating: 4.7,
    reviewCount: 1024,
    isOpen: false,
    operatingHours: '15:00 – 23:00',
    distanceKm: 0.8,
    avgPriceVnd: 45_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 100_000,
    phone: '+84283334444',
  },
  {
    id: 'merch-007',
    brandName: 'CoCo Ichibanya',
    branchName: 'CoCo Ichibanya - Pasteur',
    address: '234 Pasteur, P.6, Q.3, TP.HCM',
    latitude: 10.7810,
    longitude: 106.6892,
    photoUrl: '',
    cuisineType: 'Nhật Bản',
    rating: 4.4,
    reviewCount: 156,
    isOpen: true,
    operatingHours: '10:00 – 22:00',
    distanceKm: 1.5,
    avgPriceVnd: 95_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 150_000,
    phone: '+84286667777',
  },
  {
    id: 'merch-008',
    brandName: 'Cơm Gà Xối Mỡ',
    branchName: 'Cơm Gà Xối Mỡ - Nguyễn Trãi',
    address: '56 Nguyễn Trãi, P.3, Q.5, TP.HCM',
    latitude: 10.7540,
    longitude: 106.6810,
    photoUrl: '',
    cuisineType: 'Việt Nam',
    rating: 4.1,
    reviewCount: 93,
    isOpen: true,
    operatingHours: '10:00 – 20:00',
    distanceKm: 2.1,
    avgPriceVnd: 50_000,
    loopType: 'OPEN_LOOP',
    policyMaxAmountVnd: 100_000,
    phone: '+84289990000',
  },
];

/* ─── Menu Items (Phở 24 as primary example) ─── */

export const MOCK_MENU_PHO24: MockMenuItem[] = [
  { id: 'mi-001', name: 'Phở Bò Tái', nameVi: 'Phở Bò Tái', descriptionVi: 'Phở bò tái truyền thống, nước dùng hầm xương 12 giờ', priceVnd: 65_000, category: 'Phở', isAvailable: true, isPopular: true },
  { id: 'mi-002', name: 'Phở Bò Chín', nameVi: 'Phở Bò Chín', descriptionVi: 'Phở bò chín nạm, gân mềm', priceVnd: 60_000, category: 'Phở', isAvailable: true, isPopular: true },
  { id: 'mi-003', name: 'Phở Gà', nameVi: 'Phở Gà', descriptionVi: 'Phở gà ta thả vườn, thịt ngọt mềm', priceVnd: 55_000, category: 'Phở', isAvailable: true, isPopular: false },
  { id: 'mi-004', name: 'Gỏi Cuốn', nameVi: 'Gỏi Cuốn (2 cuốn)', descriptionVi: 'Gỏi cuốn tôm thịt, rau sống tươi', priceVnd: 35_000, category: 'Khai vị', isAvailable: true, isPopular: true },
  { id: 'mi-005', name: 'Chả Giò', nameVi: 'Chả Giò (4 chiếc)', descriptionVi: 'Chả giò giòn rụm, nhân thịt heo', priceVnd: 40_000, category: 'Khai vị', isAvailable: true, isPopular: false },
  { id: 'mi-006', name: 'Nước Chanh Muối', nameVi: 'Nước Chanh Muối', descriptionVi: 'Chanh muối giải khát, đá xay', priceVnd: 25_000, category: 'Đồ uống', isAvailable: true, isPopular: false },
  { id: 'mi-007', name: 'Trà Đá', nameVi: 'Trà Đá', descriptionVi: 'Trà đá miễn phí', priceVnd: 0, category: 'Đồ uống', isAvailable: true, isPopular: false },
  { id: 'mi-008', name: 'Phở Đặc Biệt', nameVi: 'Phở Đặc Biệt', descriptionVi: 'Phở tái, chín, nạm, gầu, gân — đầy đủ topping', priceVnd: 85_000, category: 'Phở', isAvailable: true, isPopular: true },
];

export const MOCK_MENU_COMTAM: MockMenuItem[] = [
  { id: 'mi-101', name: 'Cơm Tấm Sườn Bì Chả', nameVi: 'Cơm Tấm Sườn Bì Chả', descriptionVi: 'Cơm tấm sườn nướng, bì, chả trứng', priceVnd: 55_000, category: 'Cơm', isAvailable: true, isPopular: true },
  { id: 'mi-102', name: 'Cơm Tấm Sườn', nameVi: 'Cơm Tấm Sườn', descriptionVi: 'Cơm tấm sườn nướng than hoa', priceVnd: 45_000, category: 'Cơm', isAvailable: true, isPopular: true },
  { id: 'mi-103', name: 'Cơm Tấm Bì Chả', nameVi: 'Cơm Tấm Bì Chả', descriptionVi: 'Cơm tấm bì, chả trứng', priceVnd: 40_000, category: 'Cơm', isAvailable: true, isPopular: false },
  { id: 'mi-104', name: 'Canh Khổ Qua', nameVi: 'Canh Khổ Qua Nhồi Thịt', descriptionVi: 'Canh khổ qua nhồi thịt heo', priceVnd: 20_000, category: 'Canh', isAvailable: true, isPopular: false },
  { id: 'mi-105', name: 'Nước Mía', nameVi: 'Nước Mía Ép', descriptionVi: 'Nước mía ép tươi', priceVnd: 15_000, category: 'Đồ uống', isAvailable: true, isPopular: false },
];

/* ─── Orders ─── */

export const MOCK_ORDERS: MockMealOrder[] = [
  {
    id: 'order-001',
    branchId: 'merch-001',
    merchantName: 'Phở 24 - Nguyễn Huệ',
    branchAddress: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
    items: [
      { id: 'oi-001', name: 'Phở Bò Tái', nameVi: 'Phở Bò Tái', quantity: 1, unitPriceVnd: 65_000, options: ['Thêm hành'] },
      { id: 'oi-002', name: 'Gỏi Cuốn', nameVi: 'Gỏi Cuốn (2 cuốn)', quantity: 1, unitPriceVnd: 35_000, options: [] },
    ],
    totalAmountVnd: 100_000,
    companyShareVnd: 100_000,
    employeeShareVnd: 0,
    diningType: 'DINE_IN',
    scheduledAt: '2026-04-12T12:00:00+07:00',
    status: 'PREPARING',
    tableNo: 'A-05',
    createdAt: '2026-04-12T11:45:00+07:00',
    idempotencyKey: 'idem-abc-001',
  },
  {
    id: 'order-002',
    branchId: 'merch-002',
    merchantName: 'Cơm Tấm Bà Năm - Lê Lợi',
    branchAddress: '45 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
    items: [
      { id: 'oi-003', name: 'Cơm Tấm Sườn Bì Chả', nameVi: 'Cơm Tấm Sườn Bì Chả', quantity: 1, unitPriceVnd: 55_000, options: [] },
      { id: 'oi-004', name: 'Nước Mía', nameVi: 'Nước Mía Ép', quantity: 1, unitPriceVnd: 15_000, options: [] },
    ],
    totalAmountVnd: 70_000,
    companyShareVnd: 70_000,
    employeeShareVnd: 0,
    diningType: 'TAKEOUT',
    scheduledAt: '2026-04-11T12:30:00+07:00',
    status: 'COMPLETED',
    tableNo: null,
    createdAt: '2026-04-11T12:15:00+07:00',
    idempotencyKey: 'idem-abc-002',
  },
  {
    id: 'order-003',
    branchId: 'merch-004',
    merchantName: 'K-BBQ Korean - Đồng Khởi',
    branchAddress: '12 Đồng Khởi, P. Bến Nghé, Q.1, TP.HCM',
    items: [
      { id: 'oi-005', name: 'Bộ Nướng Hàn Quốc', nameVi: 'Bộ Nướng Hàn Quốc (2 người)', quantity: 1, unitPriceVnd: 180_000, options: ['Thêm kimchi'] },
    ],
    totalAmountVnd: 180_000,
    companyShareVnd: 150_000,
    employeeShareVnd: 30_000,
    diningType: 'DINE_IN',
    scheduledAt: '2026-04-10T18:30:00+07:00',
    status: 'COMPLETED',
    tableNo: 'B-02',
    createdAt: '2026-04-10T18:15:00+07:00',
    idempotencyKey: 'idem-abc-003',
  },
];

/* ─── Transactions ─── */

export const MOCK_TRANSACTIONS: MockMealTransaction[] = [
  { id: 'txn-001', orderId: 'order-001', merchantName: 'Phở 24', branchName: 'Phở 24 - Nguyễn Huệ', amountVnd: 100_000, companyShareVnd: 100_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-12T11:45:00+07:00', policyName: 'Chính sách ăn trưa' },
  { id: 'txn-002', orderId: 'order-002', merchantName: 'Cơm Tấm Bà Năm', branchName: 'Cơm Tấm Bà Năm - Lê Lợi', amountVnd: 70_000, companyShareVnd: 70_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-11T12:15:00+07:00', policyName: 'Chính sách ăn trưa' },
  { id: 'txn-003', orderId: 'order-003', merchantName: 'K-BBQ', branchName: 'K-BBQ Korean - Đồng Khởi', amountVnd: 180_000, companyShareVnd: 150_000, employeeShareVnd: 30_000, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-10T18:15:00+07:00', policyName: 'Chính sách ăn tối' },
  { id: 'txn-004', orderId: null, merchantName: '', branchName: '', amountVnd: 200_000, companyShareVnd: 0, employeeShareVnd: 200_000, status: 'APPROVED', type: 'TOP_UP', createdAt: '2026-04-09T09:00:00+07:00', policyName: null },
  { id: 'txn-005', orderId: 'order-004', merchantName: 'Bún Chả Hà Nội', branchName: 'Bún Chả Hà Nội - Trần Hưng Đạo', amountVnd: 50_000, companyShareVnd: 50_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-09T12:05:00+07:00', policyName: 'Chính sách ăn trưa' },
  { id: 'txn-006', orderId: 'order-005', merchantName: 'CoCo Ichibanya', branchName: 'CoCo Ichibanya - Pasteur', amountVnd: 95_000, companyShareVnd: 95_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-08T12:30:00+07:00', policyName: 'Chính sách ăn trưa' },
  { id: 'txn-007', orderId: 'order-006', merchantName: 'Canteen TechCorp', branchName: 'Canteen TechCorp - Tầng B1', amountVnd: 35_000, companyShareVnd: 35_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-08T07:15:00+07:00', policyName: 'Chính sách ăn sáng' },
  { id: 'txn-008', orderId: null, merchantName: '', branchName: '', amountVnd: 500_000, companyShareVnd: 0, employeeShareVnd: 500_000, status: 'APPROVED', type: 'TOP_UP', createdAt: '2026-04-07T10:00:00+07:00', policyName: null },
  { id: 'txn-009', orderId: 'order-007', merchantName: 'Phở 24', branchName: 'Phở 24 - Nguyễn Huệ', amountVnd: 85_000, companyShareVnd: 85_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-07T12:00:00+07:00', policyName: 'Chính sách ăn trưa' },
  { id: 'txn-010', orderId: 'order-008', merchantName: 'Cơm Gà Xối Mỡ', branchName: 'Cơm Gà Xối Mỡ - Nguyễn Trãi', amountVnd: 50_000, companyShareVnd: 50_000, employeeShareVnd: 0, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-06T12:10:00+07:00', policyName: 'Chính sách ăn trưa' },
  { id: 'txn-011', orderId: 'order-009', merchantName: 'K-BBQ', branchName: 'K-BBQ Korean - Đồng Khởi', amountVnd: 160_000, companyShareVnd: 100_000, employeeShareVnd: 60_000, status: 'DECLINED', type: 'PAYMENT', createdAt: '2026-04-05T18:45:00+07:00', policyName: 'Chính sách ăn tối' },
  { id: 'txn-012', orderId: 'order-009', merchantName: 'K-BBQ', branchName: 'K-BBQ Korean - Đồng Khởi', amountVnd: 160_000, companyShareVnd: 100_000, employeeShareVnd: 60_000, status: 'APPROVED', type: 'PAYMENT', createdAt: '2026-04-05T18:46:00+07:00', policyName: 'Chính sách ăn tối' },
];

/* ─── Policies ─── */

export const MOCK_POLICIES: MockMealPolicy[] = [
  {
    id: 'policy-001',
    name: 'Lunch Allowance',
    nameVi: 'Chính sách ăn trưa',
    status: 'ACTIVE',
    maxAmountPerTxnVnd: 100_000,
    dailyLimitVnd: 200_000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    allowedDays: [1, 2, 3, 4, 5],
    allowedTimeStart: '11:00',
    allowedTimeEnd: '14:00',
    mealTypes: ['LUNCH'],
    hybridPaymentAllowed: true,
    merchantCategories: ['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Canteen'],
  },
  {
    id: 'policy-002',
    name: 'Dinner Allowance',
    nameVi: 'Chính sách ăn tối',
    status: 'ACTIVE',
    maxAmountPerTxnVnd: 150_000,
    dailyLimitVnd: 150_000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    allowedDays: [1, 2, 3, 4, 5],
    allowedTimeStart: '17:00',
    allowedTimeEnd: '21:00',
    mealTypes: ['DINNER'],
    hybridPaymentAllowed: true,
    merchantCategories: ['Việt Nam', 'Hàn Quốc', 'Nhật Bản'],
  },
  {
    id: 'policy-003',
    name: 'Breakfast',
    nameVi: 'Chính sách ăn sáng',
    status: 'ACTIVE',
    maxAmountPerTxnVnd: 50_000,
    dailyLimitVnd: 50_000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    allowedDays: [1, 2, 3, 4, 5],
    allowedTimeStart: '06:00',
    allowedTimeEnd: '09:00',
    mealTypes: ['BREAKFAST'],
    hybridPaymentAllowed: false,
    merchantCategories: ['Việt Nam', 'Canteen'],
  },
];

/* ─── Payment Methods ─── */

export const MOCK_PAYMENT_METHODS: MockPaymentMethod[] = [
  { id: 'pm-001', name: 'NAPAS QR', type: 'NAPAS_QR', status: 'AVAILABLE' },
  { id: 'pm-002', name: 'Visa / Mastercard', type: 'VISA_MASTERCARD', status: 'AVAILABLE' },
  { id: 'pm-003', name: 'MoMo', type: 'MOMO', status: 'LINKED' },
  { id: 'pm-004', name: 'ZaloPay', type: 'ZALOPAY', status: 'NOT_LINKED' },
  { id: 'pm-005', name: 'Chuyển khoản ngân hàng', type: 'BANK_TRANSFER', status: 'AVAILABLE' },
];

/* ─── Screen Metadata ─── */

export const SCREEN_LIST: ScreenMeta[] = [
  { id: 'splash', title: 'Splash', titleVi: 'Màn hình chờ', category: 'auth', showBottomTab: false },
  { id: 'onboarding', title: 'Onboarding', titleVi: 'Giới thiệu', category: 'auth', showBottomTab: false },
  { id: 'auth', title: 'Authentication', titleVi: 'Xác thực', category: 'auth', showBottomTab: false },
  { id: 'walletHome', title: 'Wallet Home', titleVi: 'Trang chủ', category: 'wallet', showBottomTab: true, activeTab: 'home' },
  { id: 'order', title: 'Order', titleVi: 'Đặt món', category: 'order', showBottomTab: false },
  { id: 'orderStatus', title: 'Order Status', titleVi: 'Trạng thái đơn', category: 'order', showBottomTab: false },
  { id: 'merchantMap', title: 'Merchant Map', titleVi: 'Bản đồ quán ăn', category: 'merchant', showBottomTab: true, activeTab: 'explore' },
  { id: 'merchantDetail', title: 'Merchant Detail', titleVi: 'Chi tiết quán', category: 'merchant', showBottomTab: false },
  { id: 'dailyMenuList', title: 'Daily Menu', titleVi: 'Thực đơn hôm nay', category: 'merchant', showBottomTab: false },
  { id: 'transactionList', title: 'Transactions', titleVi: 'Lịch sử giao dịch', category: 'transaction', showBottomTab: true, activeTab: 'activity' },
  { id: 'transactionDetail', title: 'Transaction Detail', titleVi: 'Chi tiết giao dịch', category: 'transaction', showBottomTab: false },
  { id: 'topUp', title: 'Top Up', titleVi: 'Nạp tiền', category: 'wallet', showBottomTab: false },
  { id: 'settings', title: 'Account', titleVi: 'Tài khoản', category: 'account', showBottomTab: true, activeTab: 'account' },
  { id: 'badgeLink', title: 'Badge Link', titleVi: 'Liên kết thẻ RFID', category: 'account', showBottomTab: false },
  { id: 'policyView', title: 'Policy View', titleVi: 'Chính sách áp dụng', category: 'account', showBottomTab: false },
  { id: 'preOrder', title: 'Pre-Order', titleVi: 'Đặt trước', category: 'order', showBottomTab: false },
  { id: 'myPreOrders', title: 'My Pre-Orders', titleVi: 'Đơn đặt trước', category: 'order', showBottomTab: false },
  { id: 'groupPay', title: 'Group Pay', titleVi: 'Cùng trả', category: 'wallet', showBottomTab: false },
];

/* ─── Helpers ─── */

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatTime(iso)} · ${formatDate(iso)}`;
}
