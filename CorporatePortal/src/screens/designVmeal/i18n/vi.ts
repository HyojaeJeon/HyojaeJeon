/**
 * VMeal App — Vietnamese (primary)
 * 이 파일은 VMealApp/src/i18n/locales/vi/translation.json 으로 그대로 복사 가능합니다.
 */
const vi = {
  tab: {
    home: 'Trang chủ',
    explore: 'Khám phá',
    activity: 'Giao dịch',
    account: 'Tài khoản',
  },
  common: {
    back: 'Quay lại',
    continue: 'Tiếp tục',
    confirm: 'Xác nhận',
    cancel: 'Huỷ',
    close: 'Đóng',
    loading: 'Đang tải...',
    search: 'Tìm kiếm',
    viewAll: 'Xem tất cả',
    save: 'Lưu',
    share: 'Chia sẻ',
    yes: 'Có',
    no: 'Không',
    total: 'Tổng cộng',
    filter: 'Bộ lọc',
    retry: 'Thử lại',
    today: 'Hôm nay',
    tomorrow: 'Ngày mai',
    companyPercent: '({{pct}}%)',
  },

  /* ─── Splash ─── */
  splash: {
    tagline: 'Phiếu ăn doanh nghiệp',
    loading: 'Đang khởi động...',
  },

  /* ─── Onboarding ─── */
  onboarding: {
    welcome: 'Chào mừng đến VMeal',
    enterCode: 'Nhập mã công ty',
    codePlaceholder: 'VD: TECHCORP',
    codeHelper: 'Mã công ty được cung cấp bởi phòng nhân sự',
    orScanQR: 'Hoặc quét mã QR từ email',
    version: 'Phiên bản',
  },

  /* ─── Auth flow ─── */
  auth: {
    step: 'Bước {{current}}/{{total}}',
    tabs: { phone: 'Điện thoại', info: 'Thông tin', permission: 'Quyền' },
    phoneVerify: {
      title: 'Xác thực số điện thoại',
      resendAfter: 'Gửi lại mã sau',
    },
    companyBind: {
      title: 'Xác nhận thông tin',
      name: 'Họ tên',
      employeeCode: 'Mã nhân viên',
      department: 'Phòng ban',
      company: 'Công ty',
      matchSuccess: 'Thông tin khớp thành công',
    },
    permission: {
      title: 'Cấp quyền ứng dụng',
      location: 'Vị trí',
      locationDesc: 'Tìm nhà hàng gần bạn & xác minh vị trí',
      notification: 'Thông báo',
      notificationDesc: 'Cập nhật trạng thái đơn hàng',
      biometric: 'Sinh trắc học',
      biometricDesc: 'Mở khoá nhanh & xác nhận thanh toán',
    },
  },

  /* ─── Wallet Home ─── */
  wallet: {
    greeting: 'Xin chào,',
    balance: 'Số dư',
    companyFund: 'Công ty',
    personalFund: 'Cá nhân',
    todaySpent: 'Hôm nay',
    order: 'Đặt món',
    topUp: 'Nạp tiền',
    groupPay: 'Cùng trả',
    recentTxn: 'Giao dịch gần đây',
    nearbyMerchants: 'Quán ăn gần đây',
    map: 'Bản đồ',
    personalTopUp: 'Nạp tiền cá nhân',
  },

  /* ─── Order ─── */
  order: {
    menu: 'Thực đơn',
    allCategories: 'Tất cả',
    timeSlot: 'Thời gian đến',
    paymentDetails: 'Chi tiết thanh toán',
    companyPay: 'Công ty chi trả',
    personalPay: 'Cá nhân chi trả',
    gpsVerified: 'Vị trí đã xác minh',
    orderBtn: 'Đặt món',
    dineIn: 'Tại quán',
    takeout: 'Mang về',
    table: 'Bàn',
    scheduledAt: 'Hẹn đến',
    popular: 'Phổ biến',
  },

  /* ─── Order Status ─── */
  orderStatus: {
    success: 'Đặt món thành công!',
    paid: 'Đã thanh toán',
    accepted: 'Quán đã nhận',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng',
    completed: 'Hoàn tất',
    orderDetails: 'Chi tiết đơn',
    goHome: 'Về trang chủ',
    shareReceipt: 'Chia sẻ hoá đơn',
    orderCode: 'Mã đơn',
  },

  /* ─── Merchant Map ─── */
  merchant: {
    whatToEat: 'Hôm nay ăn gì?',
    searchPlaceholder: 'Tìm quán ăn, món ăn...',
    open: 'Đang mở',
    closed: 'Đã đóng',
    listView: 'Danh sách',
    mapView: 'Bản đồ',
    nearby: 'Quán ăn gần bạn',
    companyPolicy: 'Chính sách công ty',
    limit: 'Hạn mức',
    timeApplied: 'Giờ áp dụng',
    hybridPayment: 'Thanh toán kết hợp',
    popularItems: 'Món nổi bật',
    congestion: 'Mức độ đông',
    busiest: 'Đông nhất',
    navigate: 'Chỉ đường',
    rating: 'đánh giá',
    perTransaction: '/lần',
    appliedPolicy: 'Áp dụng {{name}}',
    call: 'Gọi',
  },

  /* ─── Daily Menu ─── */
  dailyMenu: {
    title: 'Thực đơn hôm nay',
    morning: 'Sáng',
    lunch: 'Trưa',
    dinner: 'Tối',
    subscribe: 'Đăng ký nhận thực đơn',
    subscribed: 'Đã đăng ký',
    dailySpecial: 'Thực đơn trưa đặc biệt',
  },

  /* ─── Transaction List ─── */
  transaction: {
    monthlyTotal: 'Tổng chi tiêu',
    company: 'Công ty',
    personal: 'Cá nhân',
    all: 'Tất cả',
    payment: 'Thanh toán',
    topUp: 'Nạp tiền',
    refund: 'Hoàn tiền',
    declined: 'Từ chối',
    companyFull: '100% công ty',
    detail: {
      title: 'Chi tiết giao dịch',
      success: 'Giao dịch thành công',
      restaurant: 'Quán ăn',
      address: 'Địa chỉ',
      type: 'Loại',
      status: 'Trạng thái',
      approved: 'Đã duyệt',
      policy: 'Chính sách',
      transactionId: 'Mã giao dịch',
      orderId: 'Mã đơn hàng',
      saveImage: 'Lưu ảnh',
      reportIssue: 'Báo cáo vấn đề',
    },
  },

  /* ─── Top Up ─── */
  topUp: {
    title: 'Nạp tiền',
    personalBalance: 'Số dư cá nhân',
    personalInfo: 'Tiền cá nhân dùng khi vượt hạn mức công ty',
    selectAmount: 'Chọn số tiền',
    orEnterCustom: 'Hoặc nhập số tiền khác',
    paymentMethod: 'Phương thức thanh toán',
    available: 'Sẵn sàng',
    linked: 'Đã liên kết',
    notLinked: 'Chưa liên kết',
    linkNow: 'Liên kết',
    topUpBtn: 'Nạp {{amount}}',
  },

  /* ─── Settings ─── */
  settings: {
    mealManagement: 'Quản lý phiếu ăn',
    policyView: 'Chính sách áp dụng',
    badgeLink: 'Liên kết thẻ RFID',
    eWallet: 'Ví điện tử',
    appSettings: 'Cài đặt ứng dụng',
    notification: 'Thông báo',
    language: 'Ngôn ngữ',
    languageVi: 'Tiếng Việt',
    biometric: 'Sinh trắc học',
    other: 'Khác',
    support: 'Trung tâm hỗ trợ',
    appInfo: 'Thông tin ứng dụng',
    logout: 'Đăng xuất',
    version: 'Phiên bản {{ver}} (build {{build}})',
    activeAccount: 'Tài khoản hoạt động',
    momoLinked: 'MoMo đã liên kết',
  },

  /* ─── Badge Link ─── */
  badge: {
    title: 'Liên kết thẻ RFID',
    linked: 'Thẻ đã liên kết',
    active: 'Thẻ RFID của bạn đang hoạt động',
    badgeId: 'Mã thẻ',
    status: 'Trạng thái',
    statusActive: 'Đang hoạt động',
    linkedDate: 'Ngày liên kết',
    howToUse: 'Cách sử dụng thẻ RFID',
    step1: 'Quẹt thẻ tại máy POS của quán ăn',
    step2: 'Xác nhận đơn hàng trên màn hình POS',
    step3: 'Thanh toán tự động từ tài khoản VMeal',
    adminInfo:
      'Việc cấp và liên kết thẻ RFID do quản trị viên công ty thực hiện. Nếu cần thay đổi, vui lòng liên hệ phòng nhân sự.',
    reportLost: 'Báo mất thẻ',
    lostWarning: 'Thẻ sẽ bị vô hiệu hoá ngay lập tức',
  },

  /* ─── Policy View ─── */
  policy: {
    title: 'Chính sách áp dụng',
    banner: 'Các chính sách được áp dụng cho tài khoản của bạn bởi {{company}}',
    active: 'Đang áp dụng',
    limitPerTxn: 'Hạn mức/lần',
    dailyLimit: 'Hạn mức/ngày',
    timeApplied: 'Giờ áp dụng',
    daysApplied: 'Ngày áp dụng',
    monFri: 'T2 – T6',
    mealType: 'Bữa',
    hybridPayment: 'Kết hợp cá nhân',
    merchantCategories: 'Loại quán',
    validity: 'Hiệu lực',
    contactAdmin: 'Liên hệ quản trị viên để thay đổi chính sách',
    breakfast: 'Sáng',
    lunch: 'Trưa',
    dinner: 'Tối',
  },

  /* ─── Pre-Order ─── */
  preOrder: {
    title: 'Đặt trước',
    selectMeal: 'Chọn bữa',
    menuDate: 'Thực đơn ngày {{date}}',
    sideDishes: 'Món phụ',
    drinks: 'Đồ uống',
    summary: 'Tóm tắt đơn hàng',
    pickupAt: 'Nhận lúc',
    preOrderBtn: 'Đặt trước',
    morningSlot: 'Sáng 06:00–09:00',
    lunchSlot: 'Trưa 11:00–14:00',
    dinnerSlot: 'Tối 17:00–21:00',
  },

  /* ─── My Pre-Orders ─── */
  myPreOrders: {
    title: 'Đơn đặt trước',
    upcoming: 'Sắp tới',
    completed: 'Đã hoàn tất',
    cancelled: 'Đã huỷ',
    confirmed: 'Đã xác nhận',
    pending: 'Chờ xác nhận',
    cancelOrder: 'Huỷ đơn',
  },

  /* ─── Group Pay ─── */
  groupPay: {
    title: 'Cùng trả',
    totalBill: 'Tổng hoá đơn',
    splitMethod: 'Cách chia',
    equalSplit: 'Chia đều',
    equalDesc: 'Mỗi người trả bằng nhau',
    custom: 'Tuỳ chỉnh',
    customDesc: 'Nhập số tiền cho từng người',
    members: 'Thành viên',
    add: 'Thêm',
    yourShare: 'Phần của bạn',
    startPayment: 'Bắt đầu thanh toán',
    you: 'Bạn',
    waiting: 'Chờ',
    todayAt: 'hôm nay',
  },
} as const;

export default vi;
