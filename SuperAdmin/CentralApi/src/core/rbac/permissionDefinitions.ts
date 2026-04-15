/**
 * 메뉴 기반 계층형 권한 정의.
 * 사이드바 메뉴 구조와 1:1 매핑되며, CRUD 단위로 세분화.
 * 와일드카드(`resource:*`) 지원.
 */

// 한국어: 권한의 이름을 3개 언어(한국어, 영어, 베트남어)로 표시하기 위한 구조체입니다.
// Tiếng Việt: Cấu trúc chứa tên quyền bằng 3 ngôn ngữ (Hàn, Anh, Việt).
export interface PermissionLabel {
  ko: string;
  en: string;
  vi: string;
}

// 한국어: 하나의 권한을 나타냅니다. key는 'brands:create' 같은 권한 식별자이고, label은 화면에 표시할 이름입니다.
// Tiếng Việt: Đại diện cho một quyền. key là mã quyền (vd: 'brands:create'), label là tên hiển thị.
export interface PermissionDefinition {
  key: string;       // 한국어: 권한 키 (예: 'brands:create') / Tiếng Việt: Mã quyền (vd: 'brands:create')
  label: PermissionLabel; // 한국어: 다국어 표시 이름 / Tiếng Việt: Tên hiển thị đa ngôn ngữ
}

// 한국어: 권한들을 그룹으로 묶는 카테고리입니다. 예: 'brands' 카테고리 안에 list/read/create/update/delete 권한이 들어갑니다.
// Tiếng Việt: Nhóm các quyền lại với nhau. Ví dụ: nhóm 'brands' chứa các quyền list/read/create/update/delete.
export interface PermissionCategory {
  category: string;                    // 한국어: 카테고리 ID (예: 'brands') / Tiếng Việt: ID nhóm (vd: 'brands')
  label: PermissionLabel;              // 한국어: 카테고리 표시 이름 / Tiếng Việt: Tên hiển thị nhóm
  permissions: PermissionDefinition[]; // 한국어: 이 카테고리에 속하는 권한 목록 / Tiếng Việt: Danh sách quyền thuộc nhóm này
}

// 한국어: 사이드바 메뉴 한 항목을 나타냅니다. 메뉴를 클릭하면 어떤 권한 카테고리가 필요한지 연결합니다.
//   children이 있으면 하위 메뉴(서브메뉴)를 가진 부모 메뉴입니다.
// Tiếng Việt: Đại diện cho một mục trong sidebar. Liên kết menu với các nhóm quyền cần thiết.
//   Nếu có children thì đây là menu cha có menu con bên trong.
export interface MenuPermissionNode {
  id: string;                          // 한국어: 메뉴 고유 ID / Tiếng Việt: ID duy nhất của menu
  labelKey: string;                    // 한국어: 다국어 번역 키 (예: 'nav.dashboard') / Tiếng Việt: Khoá dịch (vd: 'nav.dashboard')
  icon?: string;                       // 한국어: 아이콘 이름 (선택) / Tiếng Việt: Tên icon (tuỳ chọn)
  categories?: string[];               // 한국어: 이 메뉴에 연결된 권한 카테고리 ID 목록 / Tiếng Việt: Danh sách nhóm quyền liên kết
  children?: MenuPermissionNode[];     // 한국어: 하위 메뉴 목록 (재귀 구조) / Tiếng Việt: Danh sách menu con (đệ quy)
}

// ── CRUD 헬퍼 ──

// 한국어: crud() 헬퍼는 하나의 리소스에 대해 5개의 표준 권한을 자동 생성합니다.
//   예: crud('brands', ...) → ['brands:list', 'brands:read', 'brands:create', 'brands:update', 'brands:delete']
//   매번 5개를 수동으로 적지 않아도 되므로 편리합니다.
// Tiếng Việt: Hàm crud() tự động tạo 5 quyền chuẩn cho một tài nguyên.
//   Ví dụ: crud('brands', ...) → ['brands:list', 'brands:read', 'brands:create', 'brands:update', 'brands:delete']
//   Tiện lợi vì không phải viết thủ công 5 quyền mỗi lần.
function crud(resource: string, label: PermissionLabel): PermissionDefinition[] {
  return [
    { key: `${resource}:list`, label: { ko: '목록', en: 'List', vi: 'Danh sách' } },
    { key: `${resource}:read`, label: { ko: '상세', en: 'Read', vi: 'Xem' } },
    { key: `${resource}:create`, label: { ko: '생성', en: 'Create', vi: 'Tạo' } },
    { key: `${resource}:update`, label: { ko: '수정', en: 'Update', vi: 'Sửa' } },
    { key: `${resource}:delete`, label: { ko: '삭제', en: 'Delete', vi: 'Xoá' } },
  ];
}

// 한국어: readOnly() 헬퍼는 읽기 전용 권한(list, read)만 2개 생성합니다.
//   생성/수정/삭제가 필요 없는 리소스(예: 거래 내역, 감사 로그)에 사용합니다.
// Tiếng Việt: Hàm readOnly() chỉ tạo 2 quyền đọc (list, read).
//   Dùng cho tài nguyên chỉ xem, không cần tạo/sửa/xoá (vd: lịch sử giao dịch, nhật ký).
function readOnly(resource: string): PermissionDefinition[] {
  return [
    { key: `${resource}:list`, label: { ko: '목록', en: 'List', vi: 'Danh sách' } },
    { key: `${resource}:read`, label: { ko: '상세', en: 'Read', vi: 'Xem' } },
  ];
}

// ── 권한 카테고리 정의 ──

// 한국어: PERMISSION_CATEGORIES는 시스템의 모든 권한을 정의하는 마스터 목록입니다.
//   새 권한을 추가하려면 이 배열에만 추가하면 됩니다. Portal이 GraphQL로 자동 동기화합니다.
//   이 파일이 권한의 "진실의 원천(Single Source of Truth)"입니다.
// Tiếng Việt: PERMISSION_CATEGORIES là danh sách chính định nghĩa TẤT CẢ quyền trong hệ thống.
//   Muốn thêm quyền mới, chỉ cần thêm vào mảng này. Portal sẽ tự đồng bộ qua GraphQL.
//   File này là "nguồn sự thật duy nhất (Single Source of Truth)" cho quyền.
export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  // 대시보드
  {
    category: 'dashboard',
    label: { ko: '대시보드', en: 'Dashboard', vi: 'Bảng điều khiển' },
    permissions: [
      { key: 'dashboard:view', label: { ko: '조회', en: 'View', vi: 'Xem' } },
    ],
  },

  // 테넌트 > 대리점
  { category: 'distributors', label: { ko: '대리점', en: 'Distributors', vi: 'Nhà phân phối' }, permissions: crud('distributors', { ko: '대리점', en: 'Distributors', vi: 'Nhà phân phối' }) },

  // 테넌트 > 브랜드
  { category: 'brands', label: { ko: '브랜드', en: 'Brands', vi: 'Thương hiệu' }, permissions: crud('brands', { ko: '브랜드', en: 'Brands', vi: 'Thương hiệu' }) },
  { category: 'branches', label: { ko: '지점', en: 'Branches', vi: 'Chi nhánh' }, permissions: crud('branches', { ko: '지점', en: 'Branches', vi: 'Chi nhánh' }) },
  { category: 'edgepos', label: { ko: 'Edge POS', en: 'Edge POS', vi: 'Edge POS' }, permissions: crud('edgepos', { ko: 'Edge POS', en: 'Edge POS', vi: 'Edge POS' }) },
  {
    category: 'catalog',
    label: { ko: '카탈로그', en: 'Catalog', vi: 'Danh mục' },
    permissions: [
      ...crud('catalog', { ko: '카탈로그', en: 'Catalog', vi: 'Danh mục' }),
      { key: 'catalog:approve', label: { ko: '승인', en: 'Approve', vi: 'Phê duyệt' } },
    ],
  },

  // 테넌트 > 식권 고객사
  { category: 'corporates', label: { ko: '고객사', en: 'Corporates', vi: 'Khách hàng' }, permissions: crud('corporates', { ko: '고객사', en: 'Corporates', vi: 'Khách hàng' }) },
  { category: 'departments', label: { ko: '부서', en: 'Departments', vi: 'Phòng ban' }, permissions: crud('departments', { ko: '부서', en: 'Departments', vi: 'Phòng ban' }) },
  { category: 'employees', label: { ko: '직원', en: 'Employees', vi: 'Nhân viên' }, permissions: crud('employees', { ko: '직원', en: 'Employees', vi: 'Nhân viên' }) },
  {
    category: 'wallets',
    label: { ko: '지갑(Allowance)', en: 'Wallets', vi: 'Ví' },
    permissions: [
      ...crud('wallets', { ko: '지갑', en: 'Wallets', vi: 'Ví' }),
      { key: 'wallets:fund', label: { ko: '회사지원금', en: 'Fund', vi: 'Cấp quỹ' } },
      { key: 'wallets:topup', label: { ko: '개인충전', en: 'Top-up', vi: 'Nạp cá nhân' } },
    ],
  },
  { category: 'corp_policies', label: { ko: '식권 정책', en: 'Meal Policies', vi: 'Chính sách' }, permissions: crud('corp_policies', { ko: '정책', en: 'Policies', vi: 'Chính sách' }) },
  { category: 'transactions', label: { ko: '거래', en: 'Transactions', vi: 'Giao dịch' }, permissions: readOnly('transactions') },
  { category: 'settlements', label: { ko: '정산', en: 'Settlements', vi: 'Quyết toán' }, permissions: [
    ...readOnly('settlements'),
    { key: 'settlements:run', label: { ko: '정산 실행', en: 'Run', vi: 'Chạy' } },
    { key: 'settlements:approve', label: { ko: '정산 승인', en: 'Approve', vi: 'Phê duyệt' } },
  ]},
  {
    category: 'corp_wallets',
    label: { ko: '법인 자금 계좌', en: 'Corporate Funding', vi: 'Tài khoản cấp quỹ' },
    permissions: [
      ...readOnly('corp_wallets'),
      { key: 'corp_wallets:fund', label: { ko: '입금 확인', en: 'Confirm Deposit', vi: 'Xác nhận nạp tiền' } },
    ],
  },
  { category: 'merchants', label: { ko: '제휴식당', en: 'Merchants', vi: 'Nhà hàng' }, permissions: crud('merchants', { ko: '제휴식당', en: 'Merchants', vi: 'Nhà hàng' }) },
  {
    category: 'corp_orders',
    label: { ko: '앱 주문', en: 'App Orders', vi: 'Đơn hàng ứng dụng' },
    permissions: crud('corp_orders', { ko: '주문', en: 'Orders', vi: 'Đơn hàng' }),
  },
  {
    category: 'corp_daily_menus',
    label: { ko: '일일 메뉴', en: 'Daily Menus', vi: 'Thực đơn hàng ngày' },
    permissions: [
      { key: 'corp_daily_menus:list', label: { ko: '목록', en: 'List', vi: 'Danh sách' } },
      { key: 'corp_daily_menus:read', label: { ko: '상세', en: 'Read', vi: 'Xem' } },
      { key: 'corp_daily_menus:create', label: { ko: '생성', en: 'Create', vi: 'Tạo' } },
      { key: 'corp_daily_menus:update', label: { ko: '수정', en: 'Update', vi: 'Sửa' } },
    ],
  },
  {
    category: 'corp_preorders',
    label: { ko: '사전 주문', en: 'Pre-Orders', vi: 'Đặt trước' },
    permissions: [
      { key: 'corp_preorders:list', label: { ko: '목록', en: 'List', vi: 'Danh sách' } },
      { key: 'corp_preorders:read', label: { ko: '상세', en: 'Read', vi: 'Xem' } },
      { key: 'corp_preorders:create', label: { ko: '생성', en: 'Create', vi: 'Tạo' } },
      { key: 'corp_preorders:update', label: { ko: '수정', en: 'Update', vi: 'Sửa' } },
    ],
  },
  {
    category: 'einvoices',
    label: { ko: '전자세금계산서', en: 'E-Invoices', vi: 'Hoá đơn ĐT' },
    permissions: [
      ...readOnly('einvoices'),
      { key: 'einvoices:generate', label: { ko: '생성', en: 'Generate', vi: 'Tạo' } },
      { key: 'einvoices:request', label: { ko: '발행 요청', en: 'Request', vi: 'Yêu cầu' } },
      { key: 'einvoices:submit', label: { ko: '발행 승인', en: 'Submit', vi: 'Gửi' } },
    ],
  },

  // 배포
  { category: 'deploy_packages', label: { ko: '배포 패키지', en: 'Deploy Packages', vi: 'Gói triển khai' }, permissions: crud('deploy_packages', { ko: '패키지', en: 'Packages', vi: 'Gói' }) },
  { category: 'deploy_releases', label: { ko: '배포 릴리스', en: 'Deploy Releases', vi: 'Phát hành' }, permissions: crud('deploy_releases', { ko: '릴리스', en: 'Releases', vi: 'Phát hành' }) },

  // 거버넌스
  { category: 'licenses', label: { ko: '라이선스', en: 'Licenses', vi: 'Giấy phép' }, permissions: crud('licenses', { ko: '라이선스', en: 'Licenses', vi: 'Giấy phép' }) },
  { category: 'entitlements', label: { ko: '엔타이틀먼트', en: 'Entitlements', vi: 'Quyền lợi' }, permissions: [
    ...readOnly('entitlements'),
    { key: 'entitlements:grant', label: { ko: '발급', en: 'Grant', vi: 'Cấp' } },
    { key: 'entitlements:suspend', label: { ko: '정지', en: 'Suspend', vi: 'Tạm ngưng' } },
    { key: 'entitlements:revoke', label: { ko: '회수', en: 'Revoke', vi: 'Thu hồi' } },
  ]},

  // 운영
  { category: 'sync', label: { ko: 'Sync Monitor', en: 'Sync Monitor', vi: 'Giám sát đồng bộ' }, permissions: readOnly('sync') },
  { category: 'realtime', label: { ko: 'Realtime', en: 'Realtime', vi: 'Thời gian thực' }, permissions: readOnly('realtime') },
  { category: 'telemetry', label: { ko: 'Telemetry', en: 'Telemetry', vi: 'Đo lường' }, permissions: readOnly('telemetry') },
  { category: 'incidents', label: { ko: 'Incidents', en: 'Incidents', vi: 'Sự cố' }, permissions: readOnly('incidents') },

  // 시스템
  { category: 'audit', label: { ko: '감사 로그', en: 'Audit Log', vi: 'Nhật ký' }, permissions: readOnly('audit') },
  { category: 'reference', label: { ko: '마스터 데이터', en: 'Reference Data', vi: 'Dữ liệu gốc' }, permissions: crud('reference', { ko: '마스터', en: 'Reference', vi: 'Dữ liệu gốc' }) },
  { category: 'health', label: { ko: '시스템 상태', en: 'System Health', vi: 'Tình trạng' }, permissions: readOnly('health') },

  // 설정
  { category: 'roles', label: { ko: '역할 관리', en: 'Role Management', vi: 'Quản lý vai trò' }, permissions: crud('roles', { ko: '역할', en: 'Roles', vi: 'Vai trò' }) },
  { category: 'users', label: { ko: '사용자 관리', en: 'User Management', vi: 'Quản lý người dùng' }, permissions: [
    ...crud('users', { ko: '사용자', en: 'Users', vi: 'Người dùng' }),
    { key: 'users:assign_role', label: { ko: '역할 할당', en: 'Assign Role', vi: 'Gán vai trò' } },
    { key: 'users:reset_password', label: { ko: '비밀번호 재설정', en: 'Reset Password', vi: 'Đặt lại mật khẩu' } },
  ]},
  { category: 'einvoice_providers', label: { ko: '전자세금계산서 연동', en: 'E-Invoice Providers', vi: 'Nhà cung cấp HĐĐT' }, permissions: crud('einvoice_providers', { ko: '프로바이더', en: 'Providers', vi: 'Nhà cung cấp' }) },
  { category: 'notifications', label: { ko: '알림 설정', en: 'Notifications', vi: 'Thông báo' }, permissions: crud('notifications', { ko: '알림', en: 'Notifications', vi: 'Thông báo' }) },

  // ── SP-B1: Corporate Portal 전용 권한 ──
  {
    category: 'corporate_portal',
    label: { ko: '고객사 포털', en: 'Corporate Portal', vi: 'Cổng khách hàng' },
    permissions: [
      { key: 'corporate:merchant:allow:write', label: { ko: '제휴식당 허용 설정', en: 'Merchant Allow Write', vi: 'Cài đặt cho phép nhà hàng' } },
      { key: 'corporate:report:read', label: { ko: '리포트 조회', en: 'Report Read', vi: 'Xem báo cáo' } },
      { key: 'corporate:audit:read', label: { ko: '감사 로그 조회', en: 'Audit Read', vi: 'Xem nhật ký' } },
      { key: 'corporate:admin:manage', label: { ko: '관리자 관리', en: 'Admin Manage', vi: 'Quản lý admin' } },
      { key: 'corporate:funding:read:limit', label: { ko: '지원금 한도 조회', en: 'Funding Limit Read', vi: 'Xem giới hạn cấp quỹ' } },
    ],
  },

  // ── SP-B8: SuperAdmin 전용 플랫폼 운영 권한 ──
  {
    category: 'platform_corporate',
    label: { ko: '플랫폼 고객사 관리', en: 'Platform Corporate Mgmt', vi: 'Quản lý KH nền tảng' },
    permissions: [
      { key: 'platform:corporate:fundingpolicy:write', label: { ko: '지원금 정책 설정', en: 'Funding Policy Write', vi: 'Cài đặt chính sách cấp quỹ' } },
      { key: 'platform:corporate:credit:assess:write', label: { ko: '신용 평가 작성', en: 'Credit Assess Write', vi: 'Đánh giá tín dụng' } },
      { key: 'platform:corporate:deposit:approve', label: { ko: '보증금 승인', en: 'Deposit Approve', vi: 'Phê duyệt tiền đặt cọc' } },
    ],
  },
];

// ── 레거시 키 호환 맵 ──

// 한국어: LEGACY_KEY_MAP은 외부에서 dot 표기법으로 참조되던 레거시 권한 키를 표준 colon 표기법으로 변환합니다.
//   SP-B1/SP-B8 요구사항에서 전달된 dot 표기법 키를 내부 표준 colon 키로 매핑합니다.
// Tiếng Việt: LEGACY_KEY_MAP chuyển đổi mã quyền ký hiệu dấu chấm (legacy) sang ký hiệu dấu hai chấm (chuẩn).
export const LEGACY_KEY_MAP: Record<string, string> = {
  // SP-B1 corporate portal
  'corporate.merchant.allow.write': 'corporate:merchant:allow:write',
  'corporate.report.read': 'corporate:report:read',
  'corporate.audit.read': 'corporate:audit:read',
  'corporate.admin.manage': 'corporate:admin:manage',
  'corporate.funding.read.limit': 'corporate:funding:read:limit',
  // SP-B8 SA-only platform
  'platform.corporate.fundingpolicy.write': 'platform:corporate:fundingpolicy:write',
  'platform.corporate.credit.assess.write': 'platform:corporate:credit:assess:write',
  'platform.corporate.deposit.approve': 'platform:corporate:deposit:approve',
};

// ── 사이드바 메뉴 ↔ 권한 카테고리 매핑 ──

// 한국어: MENU_PERMISSION_STRUCTURE는 Portal 사이드바의 메뉴 구조를 정의하고,
//   각 메뉴가 어떤 권한 카테고리와 연결되는지 매핑합니다.
//   사용자가 특정 권한이 없으면 해당 메뉴가 사이드바에서 숨겨집니다.
//   예: 'dashboard' 메뉴는 'dashboard' 카테고리의 권한이 있어야 보입니다.
// Tiếng Việt: MENU_PERMISSION_STRUCTURE định nghĩa cấu trúc menu sidebar của Portal,
//   và ánh xạ mỗi menu với nhóm quyền tương ứng.
//   Nếu người dùng không có quyền, menu đó sẽ bị ẩn trong sidebar.
//   Ví dụ: menu 'dashboard' chỉ hiện khi có quyền nhóm 'dashboard'.
export const MENU_PERMISSION_STRUCTURE: MenuPermissionNode[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'LayoutDashboard', categories: ['dashboard'] },
  {
    id: 'tenants',
    labelKey: 'nav.tenants',
    icon: 'Building2',
    children: [
      { id: 'distributors', labelKey: 'nav.tenants.distributors', categories: ['distributors'] },
      { id: 'brands', labelKey: 'nav.tenants.brands', categories: ['brands', 'branches', 'edgepos', 'catalog'] },
      { id: 'corporates', labelKey: 'nav.tenants.corporates', categories: ['corporates', 'departments', 'employees', 'wallets', 'corp_wallets', 'corp_policies', 'corp_orders', 'corp_daily_menus', 'corp_preorders', 'transactions', 'settlements', 'merchants', 'einvoices', 'corporate_portal'] },
    ],
  },
  {
    id: 'deploy',
    labelKey: 'nav.deploy',
    icon: 'Rocket',
    categories: ['deploy_packages', 'deploy_releases'],
  },
  {
    id: 'governance',
    labelKey: 'nav.governance',
    icon: 'ShieldCheck',
    categories: ['licenses', 'entitlements'],
  },
  {
    id: 'operations',
    labelKey: 'nav.operations',
    icon: 'Radar',
    categories: ['sync', 'realtime', 'telemetry', 'incidents'],
  },
  {
    id: 'system',
    labelKey: 'nav.system',
    icon: 'Settings2',
    categories: ['audit', 'reference', 'health', 'platform_corporate'],
  },
  {
    id: 'settings',
    labelKey: 'nav.settings',
    icon: 'Settings',
    children: [
      { id: 'settings.rbac', labelKey: 'nav.settings.rbac', categories: ['roles', 'users'] },
      { id: 'settings.einvoice', labelKey: 'nav.settings.einvoice', categories: ['einvoice_providers'] },
      { id: 'settings.notifications', labelKey: 'nav.settings.notifications', categories: ['notifications'] },
    ],
  },
];

// ── 와일드카드 유틸 ──

// 한국어: matchPermission()은 사용자가 가진 권한 목록(permissions)에서 특정 권한 키(key)가 허용되는지 확인합니다.
//   와일드카드(*)를 지원하여 유연한 권한 부여가 가능합니다.
//   매칭 예시:
//     - permissions에 'brands:create'가 있고 key가 'brands:create' → true (정확히 일치)
//     - permissions에 '*'가 있으면 → 어떤 key든 true (모든 권한 = 슈퍼 관리자)
//     - permissions에 'brands:*'가 있고 key가 'brands:create' → true (brands 관련 모든 권한)
//     - permissions에 'catalog:sub:*'가 있고 key가 'catalog:sub:approve' → true (서브리소스 전체)
// Tiếng Việt: matchPermission() kiểm tra xem một quyền cụ thể (key) có được phép không,
//   dựa trên danh sách quyền của người dùng (permissions). Hỗ trợ ký tự đại diện (*).
//   Ví dụ:
//     - permissions có 'brands:create', key là 'brands:create' → true (khớp chính xác)
//     - permissions có '*' → true cho mọi key (toàn quyền = siêu quản trị)
//     - permissions có 'brands:*', key là 'brands:create' → true (tất cả quyền brands)
//     - permissions có 'catalog:sub:*', key là 'catalog:sub:approve' → true (toàn bộ sub-resource)
export function matchPermission(permissions: string[], key: string): boolean {
  if (permissions.includes(key)) return true;       // 한국어: 정확히 일치 / Tiếng Việt: Khớp chính xác
  if (permissions.includes('*')) return true;        // 한국어: 전체 와일드카드 (모든 권한) / Tiếng Việt: Đại diện toàn bộ (mọi quyền)
  // 한국어: 모든 깊이의 prefix:* 와일드카드를 검사합니다.
  //   예: 'corporate:merchant:allow:write' 키에 대해
  //     'corporate:*', 'corporate:merchant:*', 'corporate:merchant:allow:*' 를 모두 확인합니다.
  // Tiếng Việt: Kiểm tra ký tự đại diện prefix:* ở mọi độ sâu.
  const parts = key.split(':');
  for (let i = 1; i < parts.length; i++) {
    const prefix = parts.slice(0, i).join(':') + ':*';
    if (permissions.includes(prefix)) return true;
  }
  return false;
}

// 한국어: 카테고리 ID를 넘기면 해당 카테고리에 속하는 모든 권한 키 목록을 반환합니다.
//   예: getCategoryPermissionKeys('brands') → ['brands:list', 'brands:read', 'brands:create', 'brands:update', 'brands:delete']
// Tiếng Việt: Truyền ID nhóm, trả về danh sách tất cả mã quyền thuộc nhóm đó.
//   Ví dụ: getCategoryPermissionKeys('brands') → ['brands:list', 'brands:read', 'brands:create', 'brands:update', 'brands:delete']
export function getCategoryPermissionKeys(categoryId: string): string[] {
  const cat = PERMISSION_CATEGORIES.find((c) => c.category === categoryId);
  return cat?.permissions.map((p) => p.key) ?? [];
}

// 한국어: 메뉴 노드 하나를 넘기면, 그 메뉴와 모든 하위 메뉴에 연결된 카테고리 ID를 모아 반환합니다.
//   예: 'tenants' 메뉴를 넘기면 → ['distributors', 'brands', 'branches', 'edgepos', 'catalog', 'corporates', ...]
//   하위 메뉴가 있으면 재귀적으로 탐색합니다.
// Tiếng Việt: Truyền một node menu, trả về tất cả ID nhóm quyền từ menu đó và các menu con.
//   Ví dụ: truyền 'tenants' → ['distributors', 'brands', 'branches', 'edgepos', 'catalog', 'corporates', ...]
//   Nếu có menu con, sẽ duyệt đệ quy.
export function getAllCategoriesForMenu(node: MenuPermissionNode): string[] {
  const cats: string[] = [...(node.categories ?? [])];
  if (node.children) {
    for (const child of node.children) {
      cats.push(...getAllCategoriesForMenu(child));
    }
  }
  return cats;
}

