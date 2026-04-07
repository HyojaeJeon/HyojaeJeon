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
  await prisma.superAdminUser.upsert({
    where: { loginId: 'superadmin' },
    update: {},
    create: {
      loginId: 'superadmin',
      passwordHash,
      displayName: 'Platform Super Admin',
      email: 'admin@platform.local',
      roleCode: 'PLATFORM_SUPER_ADMIN',
      status: 'Active',
    },
  });

  // ─────────────────────────────────────────────
  // POS 테스트 유저 (loginId: 000, password: 000000)
  // Edge POS 로그인 테스트용. 비밀번호 최소 6자 (class-validator MinLength(6))
  // ─────────────────────────────────────────────
  const posTestHash = await bcrypt.hash('000000', 12);
  await prisma.superAdminUser.upsert({
    where: { loginId: '000' },
    update: {},
    create: {
      loginId: '000',
      passwordHash: posTestHash,
      displayName: '김민수',
      email: 'pos-test@platform.local',
      roleCode: 'PLATFORM_SUPPORT_ENGINEER',
      status: 'Active',
    },
  });

  console.log('Seed completed.');
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
