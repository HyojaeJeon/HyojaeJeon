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
  const legacyRoles: Array<{
    code: string;
    name: string;
    scope: string;
    level: number;
  }> = [
    { code: 'PLATFORM_SUPER_ADMIN', name: '플랫폼 최고 관리자', scope: 'PLATFORM', level: 100 },
    { code: 'PLATFORM_SUPPORT_ENGINEER', name: '플랫폼 기술 지원 엔지니어', scope: 'PLATFORM', level: 90 },
    { code: 'REGIONAL_DISTRIBUTOR_ADMIN', name: '지역 대리점 관리자', scope: 'PLATFORM', level: 80 },
    { code: 'BRAND_OWNER', name: '브랜드 소유자', scope: 'BRAND_HQ', level: 70 },
    { code: 'BRAND_HQ_ADMIN', name: '브랜드 본사 관리자', scope: 'BRAND_HQ', level: 60 },
    { code: 'BRAND_HQ_OPERATOR', name: '브랜드 본사 운영자', scope: 'BRAND_HQ', level: 50 },
    { code: 'BRANCH_MANAGER', name: '지점 매니저', scope: 'BRANCH', level: 40 },
    { code: 'STORE_OPERATOR', name: '매장 운영자', scope: 'BRANCH', level: 30 },
  ];

  for (const r of legacyRoles) {
    await prisma.role.upsert({
      where: { roleCode: r.code },
      update: { roleName: r.name, scope: r.scope, hierarchyLevel: r.level, isSystem: true },
      create: {
        roleCode: r.code,
        roleName: r.name,
        scope: r.scope,
        hierarchyLevel: r.level,
        isSystem: true,
      },
    });
  }

  const SYSTEM_PERMISSIONS: Array<{ key: string; domain: string; desc: string }> = [
    // platform 네임스페이스 — SuperAdmin 운영
    { key: 'platform.user.read', domain: 'platform', desc: '플랫폼 사용자 조회' },
    { key: 'platform.user.write', domain: 'platform', desc: '플랫폼 사용자 생성/수정/삭제' },
    { key: 'platform.rbac.read', domain: 'platform', desc: 'Role/Permission/UserRoleAssignment 조회' },
    { key: 'platform.rbac.write', domain: 'platform', desc: 'Role/Permission/UserRoleAssignment 변경' },
    { key: 'platform.audit.read', domain: 'platform', desc: '감사 로그 조회' },
    { key: 'platform.policy.read', domain: 'platform', desc: 'PlatformPolicy 조회' },
    { key: 'platform.policy.write', domain: 'platform', desc: 'PlatformPolicy 변경' },
    { key: 'platform.license.read', domain: 'platform', desc: 'PlatformLicense 조회' },
    { key: 'platform.license.write', domain: 'platform', desc: 'PlatformLicense 변경' },
    { key: 'platform.deploy.read', domain: 'platform', desc: '배포 패키지/릴리스 조회' },
    { key: 'platform.deploy.write', domain: 'platform', desc: '배포 패키지/릴리스 관리' },
    { key: 'platform.entitlement.read', domain: 'platform', desc: 'BrandHQ entitlement 조회' },
    { key: 'platform.entitlement.write', domain: 'platform', desc: 'BrandHQ entitlement grant/revoke' },
    // distributor 네임스페이스 — RegionalDistributor 축
    { key: 'distributor.profile.read', domain: 'distributor', desc: 'Distributor 조회' },
    { key: 'distributor.profile.write', domain: 'distributor', desc: 'Distributor 생성/수정/삭제' },
    // brand 네임스페이스 — BrandHQ 트리
    { key: 'brand.profile.read', domain: 'brand', desc: 'Brand 조회' },
    { key: 'brand.profile.write', domain: 'brand', desc: 'Brand 생성/수정/삭제' },
    { key: 'brand.branch.read', domain: 'brand', desc: 'Branch 조회' },
    { key: 'brand.branch.write', domain: 'brand', desc: 'Branch 생성/수정/삭제' },
    { key: 'brand.catalog.read', domain: 'brand', desc: '메뉴/가격/프로모션 조회' },
    { key: 'brand.catalog.write', domain: 'brand', desc: '메뉴/가격/프로모션 생성/수정/삭제' },
    { key: 'brand.catalog.publish', domain: 'brand', desc: '카탈로그 배포' },
    // edge-pos 네임스페이스 — EdgePos 단말
    { key: 'edgepos.terminal.read', domain: 'edgepos', desc: 'Edge POS 단말 조회' },
    { key: 'edgepos.terminal.write', domain: 'edgepos', desc: 'Edge POS 단말 등록/상태/삭제' },
    { key: 'edgepos.report.read', domain: 'edgepos', desc: 'POS 리포트 조회' },
    { key: 'edgepos.refund.write', domain: 'edgepos', desc: 'POS 환불 처리' },
    // corporate 네임스페이스 — CorporatePortal (식권관리)
    { key: 'corporate.profile.read', domain: 'corporate', desc: 'Corporate 조회' },
    { key: 'corporate.profile.write', domain: 'corporate', desc: 'Corporate 생성/수정/삭제' },
    { key: 'corporate.department.read', domain: 'corporate', desc: '부서 조회' },
    { key: 'corporate.department.write', domain: 'corporate', desc: '부서 생성/수정' },
    { key: 'corporate.employee.read', domain: 'corporate', desc: '임직원 조회' },
    { key: 'corporate.employee.write', domain: 'corporate', desc: '임직원 생성/수정/회수' },
    { key: 'corporate.wallet.read', domain: 'corporate', desc: '지갑 조회' },
    { key: 'corporate.wallet.write', domain: 'corporate', desc: '지갑 생성' },
    { key: 'corporate.wallet.fund', domain: 'corporate', desc: '지갑 충전' },
    { key: 'corporate.policy.read', domain: 'corporate', desc: '정책 조회' },
    { key: 'corporate.policy.write', domain: 'corporate', desc: '정책 빌더' },
    { key: 'corporate.transaction.read', domain: 'corporate', desc: '결제 트랜잭션 조회' },
    { key: 'corporate.transaction.authorize', domain: 'corporate', desc: '결제 승인' },
    { key: 'corporate.transaction.reverse', domain: 'corporate', desc: '결제 취소' },
    { key: 'corporate.settlement.read', domain: 'corporate', desc: '정산 조회' },
    { key: 'corporate.settlement.run', domain: 'corporate', desc: '정산 배치 실행' },
    { key: 'corporate.merchant.read', domain: 'corporate', desc: 'Merchant enrollment 조회' },
    { key: 'corporate.merchant.enroll', domain: 'corporate', desc: '식권 가입 신청' },
    { key: 'corporate.merchant.activate', domain: 'corporate', desc: '식권 활성/비활성' },
    { key: 'corporate.merchant.commission.write', domain: 'corporate', desc: '수수료율 설정' },
    { key: 'corporate.merchant.account.write', domain: 'corporate', desc: '정산 계좌 관리' },
    { key: 'corporate.invoice.read', domain: 'corporate', desc: '통합 세금계산서 조회' },
    { key: 'corporate.invoice.write', domain: 'corporate', desc: '통합 세금계산서 생성/서명' },
  ];

  for (const p of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { permissionKey: p.key },
      update: { domain: p.domain, description: p.desc, isSystem: true },
      create: {
        permissionKey: p.key,
        domain: p.domain,
        description: p.desc,
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
