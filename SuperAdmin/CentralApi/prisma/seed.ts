/**
 * 한국어: 데이터베이스 초기 시드(Seed) 스크립트.
 *   개발 환경 및 최초 배포 시 필요한 기초 데이터를 PostgreSQL에 삽입한다.
 *   upsert를 사용하여 이미 존재하는 데이터는 건너뛰고, 없는 데이터만 생성한다 (멱등성 보장).
 *   삽입 대상:
 *   1. 언어(Language): 한국어(ko-KR), 베트남어(vi-VN), 영어(en-US)
 *   2. 지역(Region): 서울(KR-SEOUL), 호치민(VN-HCMC), 뉴욕(US-NY)
 *   3. 통화(Currency): 원화(KRW), 동(VND), 달러(USD)
 *   4. 초기 SuperAdmin 사용자: 플랫폼 최고 관리자 계정
 *
 * Tiếng Việt: Script khởi tạo dữ liệu gốc (Seed) cho cơ sở dữ liệu.
 *   Chèn dữ liệu nền tảng cần thiết vào PostgreSQL khi triển khai lần đầu và môi trường phát triển.
 *   Sử dụng upsert để bỏ qua dữ liệu đã tồn tại, chỉ tạo dữ liệu chưa có (đảm bảo tính idempotent).
 *   Đối tượng chèn:
 *   1. Ngôn ngữ (Language): Tiếng Hàn (ko-KR), Tiếng Việt (vi-VN), Tiếng Anh (en-US)
 *   2. Khu vực (Region): Seoul (KR-SEOUL), TP.HCM (VN-HCMC), New York (US-NY)
 *   3. Tiền tệ (Currency): Won (KRW), Đồng (VND), Dollar (USD)
 *   4. Người dùng SuperAdmin ban đầu: Tài khoản quản trị viên cao nhất của nền tảng
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ─────────────────────────────────────────────
  // 한국어: 언어(Language) 시드 데이터 삽입
  // Tiếng Việt: Chèn dữ liệu gốc ngôn ngữ (Language)
  // ─────────────────────────────────────────────

  // 한국어: 한국어 - 플랫폼 기본 언어 (isDefault: true)
  // Tiếng Việt: Tiếng Hàn - ngôn ngữ mặc định của nền tảng (isDefault: true)
  await prisma.language.upsert({
    where: { languageCode: 'ko-KR' },
    update: {},
    create: {
      languageCode: 'ko-KR',
      nativeName: '한국어',
      displayName: 'Korean',
      direction: 'LTR',
      isDefault: true,
      isActive: true,
    },
  });

  // 한국어: 베트남어 - 베트남 시장 지원용
  // Tiếng Việt: Tiếng Việt - hỗ trợ thị trường Việt Nam
  await prisma.language.upsert({
    where: { languageCode: 'vi-VN' },
    update: {},
    create: {
      languageCode: 'vi-VN',
      nativeName: 'Tiếng Việt',
      displayName: 'Vietnamese',
      direction: 'LTR',
      isDefault: false,
      isActive: true,
    },
  });

  // 한국어: 영어 - 국제 표준 언어
  // Tiếng Việt: Tiếng Anh - ngôn ngữ tiêu chuẩn quốc tế
  await prisma.language.upsert({
    where: { languageCode: 'en-US' },
    update: {},
    create: {
      languageCode: 'en-US',
      nativeName: 'English',
      displayName: 'English (US)',
      direction: 'LTR',
      isDefault: false,
      isActive: true,
    },
  });

  // ─────────────────────────────────────────────
  // 한국어: 지역(Region) 시드 데이터 삽입
  // Tiếng Việt: Chèn dữ liệu gốc khu vực (Region)
  // ─────────────────────────────────────────────

  // 한국어: 서울 지역 - 한국 시장의 주요 거점
  // Tiếng Việt: Khu vực Seoul - cứ điểm chính của thị trường Hàn Quốc
  await prisma.region.upsert({
    where: { regionCode: 'KR-SEOUL' },
    update: {},
    create: {
      regionCode: 'KR-SEOUL',
      countryCode: 'KR',
      regionName: 'Seoul',
      currencyCode: 'KRW',
      timeZoneCode: 'Asia/Seoul',
      isActive: true,
    },
  });

  // 한국어: 호치민시 지역 - 베트남 시장의 주요 거점
  // Tiếng Việt: Khu vực TP.HCM - cứ điểm chính của thị trường Việt Nam
  await prisma.region.upsert({
    where: { regionCode: 'VN-HCMC' },
    update: {},
    create: {
      regionCode: 'VN-HCMC',
      countryCode: 'VN',
      regionName: 'Ho Chi Minh City',
      currencyCode: 'VND',
      timeZoneCode: 'Asia/Ho_Chi_Minh',
      isActive: true,
    },
  });

  // 한국어: 뉴욕 지역 - 미국 시장 지원용
  // Tiếng Việt: Khu vực New York - hỗ trợ thị trường Mỹ
  await prisma.region.upsert({
    where: { regionCode: 'US-NY' },
    update: {},
    create: {
      regionCode: 'US-NY',
      countryCode: 'US',
      regionName: 'New York',
      currencyCode: 'USD',
      timeZoneCode: 'America/New_York',
      isActive: true,
    },
  });

  // ─────────────────────────────────────────────
  // 한국어: 통화(Currency) 시드 데이터 삽입
  // Tiếng Việt: Chèn dữ liệu gốc tiền tệ (Currency)
  // ─────────────────────────────────────────────

  // 한국어: 한국 원화 - 소수점 0자리, 플랫폼 기본 통화 (isDefault: true)
  // Tiếng Việt: Won Hàn Quốc - 0 chữ số thập phân, tiền tệ mặc định nền tảng (isDefault: true)
  await prisma.currency.upsert({
    where: { currencyCode: 'KRW' },
    update: {},
    create: {
      currencyCode: 'KRW',
      currencyName: 'Korean Won',
      symbol: '₩',
      decimalDigits: 0,
      roundingMode: 'HALF_UP',
      isDefault: true,
      isActive: true,
    },
  });

  // 한국어: 베트남 동화 - 소수점 0자리
  // Tiếng Việt: Đồng Việt Nam - 0 chữ số thập phân
  await prisma.currency.upsert({
    where: { currencyCode: 'VND' },
    update: {},
    create: {
      currencyCode: 'VND',
      currencyName: 'Vietnamese Dong',
      symbol: '₫',
      decimalDigits: 0,
      roundingMode: 'HALF_UP',
      isDefault: false,
      isActive: true,
    },
  });

  // 한국어: 미국 달러 - 소수점 2자리
  // Tiếng Việt: Dollar Mỹ - 2 chữ số thập phân
  await prisma.currency.upsert({
    where: { currencyCode: 'USD' },
    update: {},
    create: {
      currencyCode: 'USD',
      currencyName: 'US Dollar',
      symbol: '$',
      decimalDigits: 2,
      roundingMode: 'HALF_UP',
      isDefault: false,
      isActive: true,
    },
  });

  // ─────────────────────────────────────────────
  // 한국어: 초기 SuperAdmin 사용자 생성
  // Tiếng Việt: Tạo người dùng SuperAdmin ban đầu
  // ─────────────────────────────────────────────

  // 한국어: bcrypt로 초기 비밀번호를 해싱한다.
  //   salt rounds = 12 (보안과 성능의 균형).
  //   프로덕션 배포 후 반드시 비밀번호를 변경해야 한다.
  // Tiếng Việt: Hash mật khẩu ban đầu bằng bcrypt.
  //   salt rounds = 12 (cân bằng giữa bảo mật và hiệu suất).
  //   Sau khi triển khai production, phải thay đổi mật khẩu.
  const passwordHash = await bcrypt.hash('admin1234!', 12);

  // 한국어: PLATFORM_SUPER_ADMIN 역할의 초기 관리자 계정을 생성한다.
  //   이 계정은 플랫폼의 모든 기능에 접근 가능한 최상위 권한을 가진다.
  // Tiếng Việt: Tạo tài khoản quản trị viên ban đầu với vai trò PLATFORM_SUPER_ADMIN.
  //   Tài khoản này có quyền hạn cao nhất, truy cập được tất cả chức năng của nền tảng.
  const superAdmin = await prisma.superAdminUser.upsert({
    where: { loginId: 'superadmin' },
    update: {},
    create: {
      loginId: 'superadmin',
      passwordHash,
      displayName: 'Platform Super Admin',
      email: 'admin@platform.local',
      status: 'ACTIVE',
    },
  });

  // ─────────────────────────────────────────────
  // POS 테스트 유저 (loginId: 000, password: 000000)
  // ─────────────────────────────────────────────
  const posTestHash = await bcrypt.hash('000000', 12);
  const posTestUser = await prisma.superAdminUser.upsert({
    where: { loginId: '000' },
    update: {},
    create: {
      loginId: '000',
      passwordHash: posTestHash,
      displayName: '김민수',
      email: 'pos-test@platform.local',
      status: 'ACTIVE',
    },
  });

  // ─────────────────────────────────────────────
  // RBAC seed (P0) — 기준서 §100.7 권한 계산식의 우변 제공
  // 기존 hardcoded RoleCode enum(8개)을 DB Role 로 이전.
  // ─────────────────────────────────────────────
  await seedRbac();

  console.log('Seed completed.');
}

/**
 * RBAC seed:
 *   1. legacy 8개 역할을 Role 테이블에 isSystem=true 로 upsert
 *   2. 도메인별 system permission 어휘 등록
 *   3. 역할별 sensible default 매핑
 */
async function seedRbac() {
  // 한국어: name = 베트남어 기본, nameKo / nameEn 은 선택 라벨. description 도 3쌍.
  // Tiếng Việt: name là tiếng Việt mặc định, nameKo / nameEn là nhãn bổ sung.
  const legacyRoles: Array<{
    code: string;
    name: string; // vi
    nameKo: string;
    nameEn: string;
    scope: string;
    level: number;
    description: string; // vi
    descriptionKo: string;
    descriptionEn: string;
  }> = [
    {
      code: 'PLATFORM_SUPER_ADMIN',
      name: 'Quản trị viên tối cao nền tảng',
      nameKo: '플랫폼 최고 관리자',
      nameEn: 'Platform Super Admin',
      scope: 'PLATFORM',
      level: 100,
      description: 'Toàn quyền trên toàn bộ nền tảng.',
      descriptionKo: '플랫폼 전체에 대한 최상위 권한.',
      descriptionEn: 'Full authority across the entire platform.',
    },
    {
      code: 'PLATFORM_SUPPORT_ENGINEER',
      name: 'Kỹ sư hỗ trợ nền tảng',
      nameKo: '플랫폼 기술 지원 엔지니어',
      nameEn: 'Platform Support Engineer',
      scope: 'PLATFORM',
      level: 90,
      description: 'Quyền chỉ đọc để hỗ trợ vận hành.',
      descriptionKo: '운영 지원을 위한 읽기 전용 권한.',
      descriptionEn: 'Read-only access for operational support.',
    },
    {
      code: 'REGIONAL_DISTRIBUTOR_ADMIN',
      name: 'Quản trị viên nhà phân phối khu vực',
      nameKo: '지역 대리점 관리자',
      nameEn: 'Regional Distributor Admin',
      scope: 'PLATFORM',
      level: 80,
      description: 'Quản lý các thương hiệu thuộc khu vực phân phối.',
      descriptionKo: '담당 지역의 브랜드를 관리.',
      descriptionEn: 'Manages brands within an assigned distribution region.',
    },
    {
      code: 'BRAND_OWNER',
      name: 'Chủ thương hiệu',
      nameKo: '브랜드 소유자',
      nameEn: 'Brand Owner',
      scope: 'BRAND_HQ',
      level: 70,
      description: 'Toàn quyền trên một thương hiệu.',
      descriptionKo: '단일 브랜드에 대한 전체 권한.',
      descriptionEn: 'Full ownership of a single brand.',
    },
    {
      code: 'BRAND_HQ_ADMIN',
      name: 'Quản trị viên trụ sở thương hiệu',
      nameKo: '브랜드 본사 관리자',
      nameEn: 'Brand HQ Admin',
      scope: 'BRAND_HQ',
      level: 60,
      description: 'Quản lý vận hành trụ sở thương hiệu.',
      descriptionKo: '브랜드 본사의 운영을 관리.',
      descriptionEn: 'Administers brand headquarters operations.',
    },
    {
      code: 'BRAND_HQ_OPERATOR',
      name: 'Nhân viên vận hành trụ sở thương hiệu',
      nameKo: '브랜드 본사 운영자',
      nameEn: 'Brand HQ Operator',
      scope: 'BRAND_HQ',
      level: 50,
      description: 'Vận hành danh mục và báo cáo hàng ngày của thương hiệu.',
      descriptionKo: '브랜드 카탈로그와 리포트 일상 운영.',
      descriptionEn: 'Day-to-day brand catalog and reporting operations.',
    },
    {
      code: 'BRANCH_MANAGER',
      name: 'Quản lý chi nhánh',
      nameKo: '지점 매니저',
      nameEn: 'Branch Manager',
      scope: 'BRANCH',
      level: 40,
      description: 'Quản lý vận hành tại chi nhánh đơn lẻ.',
      descriptionKo: '단일 지점의 운영 관리.',
      descriptionEn: 'Manages operations at a single branch.',
    },
    {
      code: 'STORE_OPERATOR',
      name: 'Nhân viên cửa hàng',
      nameKo: '매장 운영자',
      nameEn: 'Store Operator',
      scope: 'BRANCH',
      level: 30,
      description: 'Vận hành POS tại cửa hàng.',
      descriptionKo: '매장 POS 운영.',
      descriptionEn: 'Operates in-store POS.',
    },
  ];

  for (const r of legacyRoles) {
    await prisma.role.upsert({
      where: { roleCode: r.code },
      update: {
        roleName: r.name,
        nameKo: r.nameKo,
        nameEn: r.nameEn,
        scope: r.scope,
        hierarchyLevel: r.level,
        isSystem: true,
        description: r.description,
        descriptionKo: r.descriptionKo,
        descriptionEn: r.descriptionEn,
      },
      create: {
        roleCode: r.code,
        roleName: r.name,
        nameKo: r.nameKo,
        nameEn: r.nameEn,
        scope: r.scope,
        hierarchyLevel: r.level,
        isSystem: true,
        description: r.description,
        descriptionKo: r.descriptionKo,
        descriptionEn: r.descriptionEn,
      },
    });
  }

  // 한국어: 다국어 라벨. name(vi) / nameKo / nameEn + description 3쌍.
  // Tiếng Việt: Nhãn đa ngôn ngữ cho từ vựng quyền.
  type PermSeed = {
    key: string;
    domain: string;
    name: string;
    nameKo: string;
    nameEn: string;
    desc: string;
    descKo: string;
    descEn: string;
  };
  const SYSTEM_PERMISSIONS: Array<PermSeed> = [
    // platform 네임스페이스 — SuperAdmin 운영
    { key: 'platform.user.read',        domain: 'platform', name: 'Xem người dùng nền tảng',              nameKo: '플랫폼 사용자 조회',            nameEn: 'Read platform users',          desc: 'Xem danh sách và chi tiết người dùng nền tảng.',       descKo: '플랫폼 사용자 목록 및 상세 조회.',               descEn: 'Read platform user list and details.' },
    { key: 'platform.user.write',       domain: 'platform', name: 'Quản lý người dùng nền tảng',          nameKo: '플랫폼 사용자 생성/수정/삭제',     nameEn: 'Manage platform users',        desc: 'Tạo, sửa, xóa người dùng nền tảng.',                   descKo: '플랫폼 사용자 생성·수정·삭제.',                  descEn: 'Create, update, delete platform users.' },
    { key: 'platform.rbac.read',        domain: 'platform', name: 'Xem RBAC',                              nameKo: 'RBAC 조회',                    nameEn: 'Read RBAC',                    desc: 'Xem Role, Permission, UserRoleAssignment.',            descKo: 'Role/Permission/UserRoleAssignment 조회.',        descEn: 'Read Role, Permission, UserRoleAssignment.' },
    { key: 'platform.rbac.write',       domain: 'platform', name: 'Quản lý RBAC',                          nameKo: 'RBAC 변경',                    nameEn: 'Manage RBAC',                  desc: 'Tạo, sửa, xóa Role / Permission và gán vai trò.',      descKo: 'Role/Permission 변경 및 역할 부여/회수.',        descEn: 'Create, update, delete Role/Permission and assignments.' },
    { key: 'platform.audit.read',       domain: 'platform', name: 'Xem nhật ký audit',                    nameKo: '감사 로그 조회',                nameEn: 'Read audit log',               desc: 'Xem nhật ký audit của nền tảng.',                      descKo: '플랫폼 감사 로그 조회.',                          descEn: 'Read platform audit log.' },
    { key: 'platform.policy.read',      domain: 'platform', name: 'Xem chính sách nền tảng',              nameKo: '플랫폼 정책 조회',              nameEn: 'Read platform policy',         desc: 'Xem PlatformPolicy.',                                  descKo: 'PlatformPolicy 조회.',                            descEn: 'Read PlatformPolicy.' },
    { key: 'platform.policy.write',     domain: 'platform', name: 'Quản lý chính sách nền tảng',          nameKo: '플랫폼 정책 변경',              nameEn: 'Manage platform policy',       desc: 'Tạo, sửa PlatformPolicy.',                             descKo: 'PlatformPolicy 변경.',                            descEn: 'Update PlatformPolicy.' },
    { key: 'platform.license.read',     domain: 'platform', name: 'Xem giấy phép nền tảng',               nameKo: '플랫폼 라이선스 조회',          nameEn: 'Read platform license',        desc: 'Xem PlatformLicense.',                                 descKo: 'PlatformLicense 조회.',                           descEn: 'Read PlatformLicense.' },
    { key: 'platform.license.write',    domain: 'platform', name: 'Quản lý giấy phép nền tảng',           nameKo: '플랫폼 라이선스 변경',          nameEn: 'Manage platform license',      desc: 'Cấp phát / thu hồi PlatformLicense.',                  descKo: 'PlatformLicense 변경.',                           descEn: 'Issue / revoke PlatformLicense.' },
    { key: 'platform.deploy.read',      domain: 'platform', name: 'Xem bản triển khai',                   nameKo: '배포 패키지/릴리스 조회',         nameEn: 'Read deployment packages',     desc: 'Xem gói triển khai và bản phát hành.',                 descKo: '배포 패키지/릴리스 조회.',                        descEn: 'Read deployment packages and releases.' },
    { key: 'platform.deploy.write',     domain: 'platform', name: 'Quản lý bản triển khai',               nameKo: '배포 패키지/릴리스 관리',         nameEn: 'Manage deployment packages',   desc: 'Tạo / phát hành gói triển khai.',                      descKo: '배포 패키지/릴리스 생성 및 배포.',                descEn: 'Create and publish deployment packages.' },
    { key: 'platform.entitlement.read', domain: 'platform', name: 'Xem entitlement của BrandHQ',          nameKo: 'BrandHQ entitlement 조회',       nameEn: 'Read BrandHQ entitlement',     desc: 'Xem entitlement được cấp cho BrandHQ.',                descKo: 'BrandHQ 권한(entitlement) 조회.',                descEn: 'Read BrandHQ entitlements.' },
    { key: 'platform.entitlement.write',domain: 'platform', name: 'Cấp phát entitlement của BrandHQ',     nameKo: 'BrandHQ entitlement 변경',       nameEn: 'Manage BrandHQ entitlement',   desc: 'Cấp / thu hồi entitlement BrandHQ.',                   descKo: 'BrandHQ 권한 부여/회수.',                         descEn: 'Grant / revoke BrandHQ entitlements.' },
    // distributor 네임스페이스 — RegionalDistributor 축
    { key: 'distributor.profile.read',  domain: 'distributor', name: 'Xem nhà phân phối',          nameKo: '대리점 조회',            nameEn: 'Read distributor',            desc: 'Xem thông tin nhà phân phối khu vực.',  descKo: '지역 대리점 조회.',             descEn: 'Read regional distributor info.' },
    { key: 'distributor.profile.write', domain: 'distributor', name: 'Quản lý nhà phân phối',      nameKo: '대리점 생성/수정/삭제',    nameEn: 'Manage distributor',          desc: 'Tạo, sửa, xóa nhà phân phối khu vực.',  descKo: '지역 대리점 생성·수정·삭제.',    descEn: 'Create, update, delete distributor.' },
    // brand 네임스페이스 — BrandHQ 트리
    { key: 'brand.profile.read',    domain: 'brand', name: 'Xem thương hiệu',         nameKo: '브랜드 조회',            nameEn: 'Read brand',                desc: 'Xem thông tin thương hiệu.',                        descKo: '브랜드 조회.',                  descEn: 'Read brand info.' },
    { key: 'brand.profile.write',   domain: 'brand', name: 'Quản lý thương hiệu',     nameKo: '브랜드 생성/수정/삭제',    nameEn: 'Manage brand',              desc: 'Tạo, sửa, xóa thương hiệu.',                        descKo: '브랜드 생성·수정·삭제.',         descEn: 'Create, update, delete brand.' },
    { key: 'brand.branch.read',     domain: 'brand', name: 'Xem chi nhánh',           nameKo: '지점 조회',              nameEn: 'Read branch',               desc: 'Xem danh sách chi nhánh của thương hiệu.',         descKo: '브랜드 지점 조회.',              descEn: 'Read brand branches.' },
    { key: 'brand.branch.write',    domain: 'brand', name: 'Quản lý chi nhánh',       nameKo: '지점 생성/수정/삭제',     nameEn: 'Manage branch',             desc: 'Tạo, sửa, xóa chi nhánh.',                          descKo: '지점 생성·수정·삭제.',           descEn: 'Create, update, delete branch.' },
    { key: 'brand.catalog.read',    domain: 'brand', name: 'Xem catalog',             nameKo: '메뉴/가격/프로모션 조회',    nameEn: 'Read catalog',              desc: 'Xem menu, giá và khuyến mãi.',                      descKo: '메뉴/가격/프로모션 조회.',       descEn: 'Read menu, pricing, promotions.' },
    { key: 'brand.catalog.write',   domain: 'brand', name: 'Quản lý catalog',         nameKo: '메뉴/가격/프로모션 관리',    nameEn: 'Manage catalog',            desc: 'Tạo, sửa, xóa menu / giá / khuyến mãi.',            descKo: '메뉴/가격/프로모션 생성·수정·삭제.', descEn: 'Create, update, delete catalog items.' },
    { key: 'brand.catalog.publish', domain: 'brand', name: 'Phát hành catalog',       nameKo: '카탈로그 배포',           nameEn: 'Publish catalog',           desc: 'Phát hành catalog tới POS.',                        descKo: '카탈로그 배포.',                descEn: 'Publish catalog to POS.' },
    // edge-pos 네임스페이스 — EdgePos 단말
    { key: 'edgepos.terminal.read',  domain: 'edgepos', name: 'Xem thiết bị POS',        nameKo: 'POS 단말 조회',         nameEn: 'Read POS terminal',   desc: 'Xem danh sách thiết bị Edge POS.',      descKo: 'Edge POS 단말 조회.',      descEn: 'Read Edge POS terminals.' },
    { key: 'edgepos.terminal.write', domain: 'edgepos', name: 'Quản lý thiết bị POS',    nameKo: 'POS 단말 관리',         nameEn: 'Manage POS terminal', desc: 'Đăng ký / đổi trạng thái / xóa thiết bị POS.', descKo: 'POS 단말 등록·상태·삭제.', descEn: 'Register / update / delete POS terminals.' },
    { key: 'edgepos.report.read',    domain: 'edgepos', name: 'Xem báo cáo POS',         nameKo: 'POS 리포트 조회',        nameEn: 'Read POS reports',    desc: 'Xem báo cáo bán hàng POS.',              descKo: 'POS 매출 리포트 조회.',      descEn: 'Read POS sales reports.' },
    { key: 'edgepos.refund.write',   domain: 'edgepos', name: 'Hoàn tiền POS',           nameKo: 'POS 환불 처리',          nameEn: 'Process POS refund',  desc: 'Thực hiện hoàn tiền POS.',               descKo: 'POS 환불 처리.',             descEn: 'Process POS refunds.' },
    // corporate 네임스페이스 — CorporatePortal (식권관리)
    { key: 'corporate.profile.read',             domain: 'corporate', name: 'Xem công ty',                    nameKo: '기업 조회',              nameEn: 'Read corporate',              desc: 'Xem hồ sơ công ty.',                          descKo: '기업 프로필 조회.',          descEn: 'Read corporate profile.' },
    { key: 'corporate.profile.write',            domain: 'corporate', name: 'Quản lý công ty',                nameKo: '기업 생성/수정/삭제',     nameEn: 'Manage corporate',            desc: 'Tạo, sửa, xóa hồ sơ công ty.',                descKo: '기업 생성·수정·삭제.',       descEn: 'Create, update, delete corporate.' },
    { key: 'corporate.department.read',          domain: 'corporate', name: 'Xem phòng ban',                  nameKo: '부서 조회',              nameEn: 'Read department',             desc: 'Xem danh sách phòng ban công ty.',            descKo: '기업 부서 조회.',            descEn: 'Read corporate departments.' },
    { key: 'corporate.department.write',         domain: 'corporate', name: 'Quản lý phòng ban',              nameKo: '부서 생성/수정',          nameEn: 'Manage department',           desc: 'Tạo, sửa phòng ban.',                         descKo: '부서 생성·수정.',            descEn: 'Create, update departments.' },
    { key: 'corporate.employee.read',            domain: 'corporate', name: 'Xem nhân viên',                  nameKo: '임직원 조회',             nameEn: 'Read employee',               desc: 'Xem danh sách nhân viên công ty.',            descKo: '임직원 조회.',               descEn: 'Read corporate employees.' },
    { key: 'corporate.employee.write',           domain: 'corporate', name: 'Quản lý nhân viên',              nameKo: '임직원 생성/수정/회수',    nameEn: 'Manage employee',             desc: 'Tạo, sửa, thu hồi nhân viên.',                descKo: '임직원 생성·수정·회수.',      descEn: 'Create, update, revoke employees.' },
    { key: 'corporate.wallet.read',              domain: 'corporate', name: 'Xem ví bữa ăn',                  nameKo: '식권 지갑 조회',           nameEn: 'Read meal wallet',            desc: 'Xem ví voucher bữa ăn.',                      descKo: '식권 지갑 조회.',            descEn: 'Read meal voucher wallet.' },
    { key: 'corporate.wallet.write',             domain: 'corporate', name: 'Tạo ví bữa ăn',                  nameKo: '식권 지갑 생성',           nameEn: 'Create meal wallet',          desc: 'Tạo ví voucher bữa ăn cho nhân viên.',        descKo: '식권 지갑 생성.',            descEn: 'Create meal wallet for employee.' },
    { key: 'corporate.wallet.fund',              domain: 'corporate', name: 'Nạp trợ cấp công ty',            nameKo: '회사 지원금 적립',         nameEn: 'Fund company allowance',      desc: 'Nạp trợ cấp công ty vào ví bữa ăn.',          descKo: '회사 지원금 적립.',          descEn: 'Fund company allowance to wallet.' },
    { key: 'corporate.wallet.topup',             domain: 'corporate', name: 'Nạp tiền cá nhân',               nameKo: '개인 충전',               nameEn: 'Personal top-up',             desc: 'Nhân viên nạp tiền cá nhân vào ví.',          descKo: '개인 식권 충전.',            descEn: 'Employee personal wallet top-up.' },
    { key: 'corporate.policy.read',              domain: 'corporate', name: 'Xem chính sách bữa ăn',          nameKo: '식권 정책 조회',           nameEn: 'Read meal policy',            desc: 'Xem chính sách voucher bữa ăn.',              descKo: '식권 정책 조회.',            descEn: 'Read meal voucher policy.' },
    { key: 'corporate.policy.write',             domain: 'corporate', name: 'Quản lý chính sách bữa ăn',      nameKo: '식권 정책 빌더',           nameEn: 'Manage meal policy',          desc: 'Tạo, sửa chính sách voucher bữa ăn.',         descKo: '식권 정책 생성·수정.',        descEn: 'Create, update meal voucher policy.' },
    { key: 'corporate.transaction.read',         domain: 'corporate', name: 'Xem giao dịch',                  nameKo: '결제 트랜잭션 조회',        nameEn: 'Read transaction',            desc: 'Xem giao dịch thanh toán bữa ăn.',            descKo: '결제 트랜잭션 조회.',         descEn: 'Read meal payment transactions.' },
    { key: 'corporate.transaction.authorize',    domain: 'corporate', name: 'Duyệt thanh toán',               nameKo: '결제 승인',               nameEn: 'Authorize transaction',       desc: 'Duyệt giao dịch thanh toán bữa ăn.',          descKo: '결제 승인.',                descEn: 'Authorize meal payment.' },
    { key: 'corporate.transaction.reverse',      domain: 'corporate', name: 'Hủy thanh toán',                 nameKo: '결제 취소',               nameEn: 'Reverse transaction',         desc: 'Hủy giao dịch thanh toán bữa ăn.',            descKo: '결제 취소.',                descEn: 'Reverse meal payment.' },
    { key: 'corporate.settlement.read',          domain: 'corporate', name: 'Xem đối soát',                   nameKo: '정산 조회',               nameEn: 'Read settlement',             desc: 'Xem kết quả đối soát.',                       descKo: '정산 조회.',                descEn: 'Read settlement results.' },
    { key: 'corporate.settlement.run',           domain: 'corporate', name: 'Chạy đối soát',                  nameKo: '정산 배치 실행',           nameEn: 'Run settlement',              desc: 'Thực thi batch đối soát.',                    descKo: '정산 배치 실행.',            descEn: 'Run settlement batch.' },
    { key: 'corporate.merchant.read',            domain: 'corporate', name: 'Xem đăng ký gian hàng',          nameKo: '가맹점 신청 조회',          nameEn: 'Read merchant enrollment',    desc: 'Xem đăng ký gian hàng voucher bữa ăn.',       descKo: '가맹점 신청 조회.',           descEn: 'Read meal merchant enrollments.' },
    { key: 'corporate.merchant.enroll',          domain: 'corporate', name: 'Đăng ký gian hàng',              nameKo: '가맹점 가입 신청',          nameEn: 'Enroll merchant',             desc: 'Đăng ký gian hàng voucher bữa ăn.',           descKo: '가맹점 가입 신청.',           descEn: 'Enroll meal voucher merchant.' },
    { key: 'corporate.merchant.activate',        domain: 'corporate', name: 'Kích hoạt gian hàng',            nameKo: '가맹점 활성/비활성',        nameEn: 'Activate merchant',           desc: 'Kích hoạt / vô hiệu hóa gian hàng.',          descKo: '가맹점 활성·비활성.',         descEn: 'Activate / deactivate merchant.' },
    { key: 'corporate.merchant.commission.write',domain: 'corporate', name: 'Thiết lập phí hoa hồng',         nameKo: '수수료율 설정',            nameEn: 'Set commission rate',         desc: 'Thiết lập tỉ lệ phí hoa hồng gian hàng.',     descKo: '가맹점 수수료율 설정.',        descEn: 'Set merchant commission rate.' },
    { key: 'corporate.merchant.account.write',   domain: 'corporate', name: 'Quản lý tài khoản đối soát',     nameKo: '정산 계좌 관리',           nameEn: 'Manage settlement account',   desc: 'Quản lý tài khoản đối soát gian hàng.',        descKo: '가맹점 정산 계좌 관리.',       descEn: 'Manage merchant settlement account.' },
    { key: 'corporate.invoice.read',             domain: 'corporate', name: 'Xem hóa đơn điện tử',            nameKo: '통합 세금계산서 조회',       nameEn: 'Read e-invoice',              desc: 'Xem hóa đơn điện tử hợp nhất.',                descKo: '통합 전자세금계산서 조회.',     descEn: 'Read consolidated e-invoices.' },
    { key: 'corporate.invoice.write',            domain: 'corporate', name: 'Phát hành hóa đơn điện tử',      nameKo: '통합 세금계산서 발급',       nameEn: 'Issue e-invoice',             desc: 'Tạo và phát hành hóa đơn điện tử (SuperAdmin).', descKo: '통합 전자세금계산서 생성/발급(SuperAdmin).', descEn: 'Create and issue e-invoices (SuperAdmin).' },
    { key: 'corporate.invoice.request',          domain: 'corporate', name: 'Yêu cầu phát hành hóa đơn',      nameKo: '세금계산서 발행 요청',       nameEn: 'Request e-invoice',           desc: 'Công ty yêu cầu phát hành hóa đơn điện tử.',   descKo: '기업의 세금계산서 발행 요청.',   descEn: 'Corporate requests e-invoice issuance.' },
    { key: 'corporate.invoice.dispute',          domain: 'corporate', name: 'Khiếu nại hóa đơn',              nameKo: '세금계산서 이의 제기',       nameEn: 'Dispute e-invoice',           desc: 'Công ty khiếu nại hóa đơn điện tử.',           descKo: '기업의 세금계산서 이의 제기.',   descEn: 'Corporate disputes e-invoice.' },
  ];

  for (const p of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { permissionKey: p.key },
      update: {
        domain: p.domain,
        name: p.name,
        nameKo: p.nameKo,
        nameEn: p.nameEn,
        description: p.desc,
        descriptionKo: p.descKo,
        descriptionEn: p.descEn,
        isSystem: true,
      },
      create: {
        permissionKey: p.key,
        domain: p.domain,
        name: p.name,
        nameKo: p.nameKo,
        nameEn: p.nameEn,
        description: p.desc,
        descriptionKo: p.descKo,
        descriptionEn: p.descEn,
        isSystem: true,
      },
    });
  }

  const allPerms = await prisma.permission.findMany();
  const permByKey = new Map(allPerms.map((p) => [p.permissionKey, p.id]));
  const allRoles = await prisma.role.findMany();
  const roleByCode = new Map(allRoles.map((r) => [r.roleCode, r.id]));

  const grants: Record<string, string[]> = {
    PLATFORM_SUPER_ADMIN: SYSTEM_PERMISSIONS.map((p) => p.key),
    PLATFORM_SUPPORT_ENGINEER: [
      'platform.user.read',
      'platform.rbac.read',
      'platform.audit.read',
      'platform.policy.read',
      'platform.license.read',
      'platform.deploy.read',
      'platform.entitlement.read',
      'distributor.profile.read',
      'brand.profile.read',
      'brand.branch.read',
      'brand.catalog.read',
      'edgepos.terminal.read',
      'edgepos.report.read',
      'corporate.profile.read',
      'corporate.transaction.read',
      'corporate.settlement.read',
      'corporate.merchant.read',
    ],
    REGIONAL_DISTRIBUTOR_ADMIN: [
      'distributor.profile.read',
      'brand.profile.read',
      'brand.branch.read',
      'brand.catalog.read',
      'edgepos.terminal.read',
      'edgepos.report.read',
    ],
    BRAND_OWNER: [
      'brand.profile.read', 'brand.profile.write',
      'brand.branch.read', 'brand.branch.write',
      'brand.catalog.read', 'brand.catalog.write', 'brand.catalog.publish',
      'edgepos.terminal.read', 'edgepos.terminal.write',
      'edgepos.report.read', 'edgepos.refund.write',
      'corporate.merchant.read', 'corporate.merchant.enroll',
      'corporate.merchant.account.write',
      'corporate.transaction.read', 'corporate.settlement.read',
    ],
    BRAND_HQ_ADMIN: [
      'brand.profile.read',
      'brand.branch.read', 'brand.branch.write',
      'brand.catalog.read', 'brand.catalog.write', 'brand.catalog.publish',
      'edgepos.terminal.read',
      'edgepos.report.read', 'edgepos.refund.write',
      'corporate.merchant.read', 'corporate.merchant.enroll',
      'corporate.merchant.account.write',
      'corporate.transaction.read', 'corporate.settlement.read',
    ],
    BRAND_HQ_OPERATOR: [
      'brand.catalog.read', 'brand.branch.read',
      'edgepos.terminal.read', 'edgepos.report.read',
      'corporate.transaction.read', 'corporate.transaction.authorize',
    ],
    BRANCH_MANAGER: [
      'brand.catalog.read', 'brand.branch.read',
      'edgepos.terminal.read', 'edgepos.report.read', 'edgepos.refund.write',
      'corporate.transaction.read', 'corporate.transaction.authorize', 'corporate.transaction.reverse',
    ],
    STORE_OPERATOR: [
      'brand.catalog.read',
      'edgepos.terminal.read',
      'corporate.transaction.authorize',
    ],
  };

  for (const [roleCode, permKeys] of Object.entries(grants)) {
    const roleId = roleByCode.get(roleCode);
    if (!roleId) continue;
    for (const pk of permKeys) {
      const permissionId = permByKey.get(pk);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { uq_role_permission: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  // 초기 SuperAdmin 사용자에게 PLATFORM_SUPER_ADMIN 역할을 atomic 부여 (idempotent).
  const seedAssignments: Array<{ loginId: string; roleCode: string }> = [
    { loginId: 'superadmin', roleCode: 'PLATFORM_SUPER_ADMIN' },
    { loginId: '000', roleCode: 'PLATFORM_SUPPORT_ENGINEER' },
  ];
  for (const a of seedAssignments) {
    const u = await prisma.superAdminUser.findUnique({ where: { loginId: a.loginId } });
    const r = roleByCode.get(a.roleCode);
    if (!u || !r) continue;
    const existing = await prisma.userRoleAssignment.findFirst({
      where: {
        userType: 'SUPER_ADMIN',
        userId: u.id,
        roleId: r,
        status: 'ACTIVE',
        scopeBrandHqId: null,
        scopeCorporateId: null,
        scopeBranchId: null,
      },
    });
    if (!existing) {
      await prisma.userRoleAssignment.create({
        data: {
          userType: 'SUPER_ADMIN',
          userId: u.id,
          roleId: r,
        },
      });
    }
  }

  console.log(
    `RBAC seed: ${legacyRoles.length} roles, ${SYSTEM_PERMISSIONS.length} permissions, ${Object.values(grants).reduce((a, b) => a + b.length, 0)} role-permission links, ${seedAssignments.length} bootstrap assignments`,
  );
}

// 한국어: 시드 실행 및 에러 처리.
//   실패 시 에러를 출력하고 프로세스를 종료 코드 1로 종료한다.
//   성공/실패 여부와 무관하게 finally에서 DB 연결을 해제한다.
// Tiếng Việt: Thực thi seed và xử lý lỗi.
//   Khi thất bại, in lỗi và thoát process với mã thoát 1.
//   Bất kể thành công hay thất bại, giải phóng kết nối DB trong finally.
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
