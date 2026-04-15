/**
 * [KO] MealOrder Service — VMeal 앱 기반 식사 주문의 핵심 비즈니스 로직
 *
 * 이 서비스는 직원이 모바일 앱에서 메뉴를 선택하고 결제/주문하는 전체 흐름을 처리한다.
 * 주문 생성(create)은 10단계 프로세스로, 멱등성 검사부터 GPS 사기 방지, 정책 평가,
 * 잔액 분할(split payment), 주문/항목/트랜잭션 동시 생성까지 단일 DB 트랜잭션으로 수행한다.
 *
 * ── 주요 기능 ──
 * 1. 주문 생성 (create): 10단계 결제+주문 프로세스
 * 2. 주문 취소 (cancel): 취소 정책 평가 후 잔액 복원
 * 3. 가맹점 수락/거절 (accept/reject): 상태 전이 + 거절 시 환불
 * 4. 상태 업데이트 (updateStatus): ACCEPTED→PREPARING→READY→COMPLETED 전이
 * 5. QR 체크인 (checkin): 테이블 체크인 시각 기록
 * 6. 조회 (findById, listByWallet, listByBranch)
 *
 * ── 보안 원칙 ──
 * - 모든 read/write 경로에서 caller의 corporateContext와 대상 row의 corporateId를 비교
 * - SUPER_ADMIN만 corporate 경계를 넘을 수 있음
 * - capability(MEAL_TICKET) + permission(corp_orders:*) 이중 가드
 *
 * [VI] MealOrder Service — Logic nghiệp vụ cốt lõi đặt hàng bữa ăn qua ứng dụng VMeal
 *
 * Service xử lý toàn bộ luồng nhân viên chọn menu và thanh toán/đặt hàng qua ứng dụng.
 * Tạo đơn hàng (create) gồm 10 bước, từ kiểm tra idempotency đến chống gian lận GPS,
 * đánh giá chính sách, chia thanh toán (split payment), tạo đồng thời đơn/mục/giao dịch
 * trong một DB transaction duy nhất.
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { EntitlementService } from '@shared/entitlement/Entitlement.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  assertCorporateScope,
  withTargetBrand,
  withTargetCorporate,
} from '../_internal/callerCtx';
import { MealPolicyService } from '../policy/Policy.service';
import { CreateMealOrderInput } from './dto/CreateMealOrder.input';
import { DomainError } from '@core/errors/DomainError';
import {
  allocateMealWalletSpend,
  normalizeMealWalletFundingState,
} from '../wallet/_internal/walletLedger';

// ──────────────────────────────────────────────────────
// [KO] 유효한 주문 상태 전이 맵
// [VI] Bản đồ chuyển trạng thái đơn hàng hợp lệ
// ──────────────────────────────────────────────────────
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PAID_PENDING_ACCEPT: ['ACCEPTED', 'CANCELLED_BY_USER', 'REJECTED', 'EXPIRED'],
  ACCEPTED: ['PREPARING', 'CANCELLED_BY_USER'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
};

// ──────────────────────────────────────────────────────
// [KO] 취소 정책 유형
// [VI] Loại chính sách hủy
// ──────────────────────────────────────────────────────
type CancellationPolicyType = 'FREE_UNTIL_ACCEPTED' | 'FREE_UNTIL_DEADLINE' | 'NO_CANCEL';

/**
 * [KO] GPS 기반 Haversine 거리 계산 (미터 단위).
 *      두 GPS 좌표 간의 직선 거리를 구하여 사기 방지에 사용한다.
 * [VI] Tính khoảng cách Haversine dựa trên GPS (đơn vị mét).
 *      Tính khoảng cách đường thẳng giữa hai tọa độ GPS để chống gian lận.
 */
function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000; // [KO] 지구 반지름 (미터) / [VI] Bán kính Trái Đất (mét)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** [KO] GPS 사기 방지 최대 허용 거리 (미터) / [VI] Khoảng cách tối đa cho phép chống gian lận GPS (mét) */
const MAX_GPS_DISTANCE_METERS = 500;

/**
 * [KO] 주문 번호 생성 — ORD-YYYYMMDD-XXXX 형식.
 *      XXXX는 4자리 랜덤 영숫자 코드로, 하루 내 충돌 확률이 매우 낮다.
 * [VI] Tạo số đơn hàng — định dạng ORD-YYYYMMDD-XXXX.
 *      XXXX là 4 ký tự chữ-số ngẫu nhiên, xác suất trùng trong ngày rất thấp.
 */
function generateOrderNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ORD-${date}-${code}`;
}

@Injectable()
export class MealOrderService {
  private readonly logger = new Logger(MealOrderService.name);

  constructor(
    /** [KO] Prisma ORM 서비스 — DB 접근 / [VI] Service Prisma ORM — truy cập DB */
    private readonly prisma: PrismaService,
    /** [KO] 기능 사용 권한(Entitlement) 서비스 — MEAL_TICKET capability 검증 / [VI] Service kiểm tra capability MEAL_TICKET */
    private readonly entitlement: EntitlementService,
    /** [KO] RBAC 권한 서비스 — 세부 작업 권한 검증 / [VI] Service kiểm tra quyền RBAC */
    private readonly permission: PermissionService,
    /** [KO] 식권 정책 평가 서비스 — 시간대, 한도, 가맹점 카테고리 / [VI] Service đánh giá chính sách phiếu ăn */
    private readonly policy: MealPolicyService,
  ) {}

  // ══════════════════════════════════════════════════════
  // [KO] 조회 메서드
  // [VI] Các phương thức truy vấn
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 주문 ID로 단건 조회 — 없으면 ORDER_NOT_FOUND 에러.
   *      caller의 corporateContext와 주문의 corporateId를 비교하여 scope 검증.
   * [VI] Truy vấn đơn hàng theo ID — không tìm thấy thì ném ORDER_NOT_FOUND.
   *      So khớp corporateContext của caller với corporateId của đơn hàng.
   */
  async findById(ctx: MealCallerCtx, id: string) {
    const order = await this.prisma.mealOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new DomainError({
        code: 'ORDER_NOT_FOUND',
        status: 404,
        details: { reason: 'MealOrder not found' },
      });
    }
    assertCorporateScope(ctx, order.corporateId);
    return order;
  }

  /**
   * [KO] 지갑(Wallet) 기준 주문 목록 조회 (페이지네이션).
   *      직원 앱에서 자기 주문 내역을 볼 때 사용한다.
   * [VI] Danh sách đơn hàng theo Wallet (phân trang).
   *      Dùng khi nhân viên xem lịch sử đơn hàng của mình trên ứng dụng.
   */
  async listByWallet(
    ctx: MealCallerCtx,
    walletId: string,
    skip: number,
    take: number,
    statusFilter?: string,
  ) {
    // [KO] 지갑 존재 + corporate scope 검증
    // [VI] Kiểm tra ví tồn tại + phạm vi corporate
    const wallet = await this.prisma.mealWallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Wallet' },
        details: { reason: 'Wallet not found' },
      });
    }
    assertCorporateScope(ctx, wallet.corporateId);

    const where: Record<string, unknown> = { walletId };
    if (statusFilter) where.status = statusFilter;

    const [data, totalCount] = await Promise.all([
      this.prisma.mealOrder.findMany({
        where,
        include: { items: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealOrder.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * [KO] 지점(Branch) 기준 주문 목록 조회 (페이지네이션).
   *      POS/가맹점 측에서 들어온 주문을 관리할 때 사용한다.
   * [VI] Danh sách đơn hàng theo Branch (phân trang).
   *      Dùng khi POS/cửa hàng quản lý đơn hàng nhận được.
   */
  async listByBranch(
    ctx: MealCallerCtx,
    branchId: string,
    skip: number,
    take: number,
    statusFilter?: string,
  ) {
    // [KO] branch 존재 + brand scope 검증
    // [VI] Kiểm tra branch tồn tại + phạm vi brand
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { brandHQId: true },
    });
    if (!branch) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Branch' },
        details: { reason: 'Branch not found' },
      });
    }
    assertBrandScope(ctx, branch.brandHQId);

    const where: Record<string, unknown> = { branchId };
    if (statusFilter) where.status = statusFilter;

    const [data, totalCount] = await Promise.all([
      this.prisma.mealOrder.findMany({
        where,
        include: { items: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealOrder.count({ where }),
    ]);
    return { data, totalCount };
  }

  // ══════════════════════════════════════════════════════
  // [KO] ★ 주문 생성 (create) — 10단계 핵심 Mutation ★
  // [VI] ★ Tạo đơn hàng (create) — Mutation cốt lõi 10 bước ★
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 앱 기반 식사 주문 생성 — 10단계 프로세스.
   *
   * [Step 1] 멱등성 검사 — 동일 idempotencyKey면 기존 주문 반환
   * [Step 2] GPS 사기 방지 — 사용자 좌표와 지점 좌표 간 Haversine 거리 ≤ 500m
   * [Step 3] 직원 + 지갑 + 정책 로드
   * [Step 4] 지갑 상태 검증 (ACTIVE 필수)
   * [Step 5] 가맹점 등록 활성화 검증
   * [Step 6] 정책 엔진 — 시간/요일/가맹점에 맞는 정책 찾기
   * [Step 7] 건당 한도 검증
   * [Step 8] 일일 한도 검증 (오늘 승인된 거래 합산)
   * [Step 9] Split payment — 회사 지원금 우선 차감, 부족분은 개인 충전금
   * [Step 10] 단일 Prisma 트랜잭션으로 MealOrder + MealOrderItems + MealTransaction 생성, 지갑 잔액 업데이트
   *
   * [VI] Tạo đơn hàng bữa ăn qua ứng dụng — 10 bước.
   *
   * [Bước 1] Kiểm tra idempotency — trả đơn cũ nếu cùng key
   * [Bước 2] Chống gian lận GPS — Haversine ≤ 500m
   * [Bước 3] Load nhân viên + ví + chính sách
   * [Bước 4] Kiểm tra trạng thái ví (phải ACTIVE)
   * [Bước 5] Kiểm tra đăng ký cửa hàng hoạt động
   * [Bước 6] Đánh giá chính sách — tìm chính sách phù hợp
   * [Bước 7] Kiểm tra hạn mức mỗi lần
   * [Bước 8] Kiểm tra hạn mức hàng ngày
   * [Bước 9] Split payment — trừ trợ cấp công ty trước, phần thiếu trừ nạp cá nhân
   * [Bước 10] Tạo MealOrder + MealOrderItems + MealTransaction trong một Prisma transaction
   */
  async create(ctx: MealCallerCtx, input: CreateMealOrderInput) {
    // ──────────────────────────────────────────────────────
    // [Step 1] 멱등성 검사
    // [Bước 1] Kiểm tra idempotency
    // ──────────────────────────────────────────────────────
    const existing = await this.prisma.mealOrder.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { items: true },
    });
    if (existing) return existing;

    // ──────────────────────────────────────────────────────
    // [Step 2] GPS 사기 방지 검사
    // [Bước 2] Kiểm tra chống gian lận GPS
    // ──────────────────────────────────────────────────────
    if (input.userLatitude != null && input.userLongitude != null) {
      const gpsBranch = await this.prisma.branch.findUnique({
        where: { id: input.branchId },
        select: { latitude: true, longitude: true },
      });
      // [KO] Prisma Decimal을 number로 변환 — Branch.latitude/longitude는 Decimal 타입
      // [VI] Chuyển Prisma Decimal sang number — Branch.latitude/longitude là kiểu Decimal
      const branchLat = gpsBranch?.latitude != null ? Number(gpsBranch.latitude) : null;
      const branchLon = gpsBranch?.longitude != null ? Number(gpsBranch.longitude) : null;
      if (branchLat != null && branchLon != null) {
        const distance = haversineDistanceMeters(
          input.userLatitude,
          input.userLongitude,
          branchLat,
          branchLon,
        );
        if (distance > MAX_GPS_DISTANCE_METERS) {
          this.logger.warn(
            `GPS fraud detected: distance=${distance.toFixed(0)}m, ` +
            `user=(${input.userLatitude},${input.userLongitude}), ` +
            `branch=(${branchLat},${branchLon})`,
          );
          throw new DomainError({
            code: 'GPS_FRAUD_DETECTED',
            status: 403,
            params: {
              distance: Math.round(distance).toString(),
              maxAllowed: MAX_GPS_DISTANCE_METERS.toString(),
            },
            details: { reason: 'User location is too far from branch' },
          });
        }
      }
    }

    // ──────────────────────────────────────────────────────
    // [Step 3] 직원 + 지갑 + 가맹점 등록 병렬 로드
    // [Bước 3] Load song song nhân viên + ví + đăng ký cửa hàng
    // ──────────────────────────────────────────────────────
    const [wallet, enrollment] = await Promise.all([
      this.prisma.mealWallet.findUnique({ where: { id: input.walletId } }),
      this.prisma.mealMerchantEnrollment.findUnique({ where: { brandHqId: input.brandHqId } }),
    ]);

    if (!wallet) {
      throw new DomainError({
        code: 'RESOURCE_NOT_FOUND',
        params: { resource: 'Wallet' },
        details: { reason: 'Wallet not found' },
      });
    }

    // [KO] corporate scope 검증 — caller가 이 지갑의 corporate에 접근 가능한지
    // [VI] Kiểm tra phạm vi corporate — caller có quyền truy cập corporate của ví này không
    assertCorporateScope(ctx, wallet.corporateId);

    // [KO] brand scope 검증 + capability + permission
    // [VI] Kiểm tra phạm vi brand + capability + permission
    assertBrandScope(ctx, input.brandHqId);
    const brandCtx = withTargetBrand(ctx, input.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.order.create');

    // ──────────────────────────────────────────────────────
    // [Step 4] 지갑 상태 검증
    // [Bước 4] Kiểm tra trạng thái ví
    // ──────────────────────────────────────────────────────
    if (wallet.status !== 'ACTIVE') {
      throw new DomainError({
        code: 'POLICY_VIOLATION',
        params: { reason: 'WALLET_INACTIVE' },
        details: { reason: 'Wallet is not active', walletStatus: wallet.status },
      });
    }

    // ──────────────────────────────────────────────────────
    // [Step 5] 가맹점 등록 활성화 검증
    // [Bước 5] Kiểm tra đăng ký cửa hàng hoạt động
    // ──────────────────────────────────────────────────────
    if (!enrollment || !enrollment.isActive) {
      throw new DomainError({
        code: 'POLICY_VIOLATION',
        params: { reason: 'MERCHANT_INACTIVE' },
        details: { reason: 'Merchant enrollment is inactive or missing' },
      });
    }

    // ──────────────────────────────────────────────────────
    // [Step 6] 정책 엔진 — 시간/요일/가맹점에 맞는 정책 찾기
    // [Bước 6] Đánh giá chính sách — tìm chính sách phù hợp
    // ──────────────────────────────────────────────────────
    const evaluated = await this.policy.evaluateForEmployee(
      wallet.employeeId,
      new Date(),
    );

    if (evaluated && !evaluated.isTimeWindowValid) {
      throw new DomainError({
        code: 'POLICY_VIOLATION',
        params: { reason: 'OUT_OF_POLICY_WINDOW' },
        details: { reason: 'Current time is outside allowed policy window' },
      });
    }

    // [KO] 총 주문 금액 계산 — 각 항목의 (수량 × 단가)를 합산
    // [VI] Tính tổng tiền đơn hàng — cộng (số lượng × đơn giá) của mỗi mục
    const totalAmountVnd = input.items.reduce(
      (sum, item) => sum + item.unitPriceVnd * BigInt(item.quantity),
      0n,
    );

    if (totalAmountVnd <= 0n) {
      throw new DomainError({
        code: 'INVALID_AMOUNT',
        details: { reason: 'Total order amount must be positive' },
      });
    }

    // ──────────────────────────────────────────────────────
    // [Step 7] 건당 한도 검증
    // [Bước 7] Kiểm tra hạn mức mỗi lần giao dịch
    // ──────────────────────────────────────────────────────
    if (
      evaluated &&
      evaluated.maxPerTransactionVnd > 0n &&
      totalAmountVnd > evaluated.maxPerTransactionVnd
    ) {
      throw new DomainError({
        code: 'POLICY_VIOLATION',
        params: {
          reason: 'PER_TRANSACTION_LIMIT_EXCEEDED',
          limit: evaluated.maxPerTransactionVnd.toString(),
          requested: totalAmountVnd.toString(),
        },
        details: { reason: 'Per-transaction limit exceeded' },
      });
    }

    // ──────────────────────────────────────────────────────
    // [Step 8] 일일 한도 검증
    // [Bước 8] Kiểm tra hạn mức hàng ngày
    // ──────────────────────────────────────────────────────
    if (evaluated && evaluated.dailyLimitVnd > 0n) {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      const agg = await this.prisma.mealTransaction.aggregate({
        where: {
          walletId: wallet.id,
          status: { in: ['APPROVED', 'SETTLED'] },
          createdAt: { gte: todayStart },
        },
        _sum: { approvedAmountVnd: true },
      });
      const used = (agg._sum.approvedAmountVnd ?? 0n) as bigint;
      if (used + totalAmountVnd > evaluated.dailyLimitVnd) {
        throw new DomainError({
          code: 'POLICY_VIOLATION',
          params: {
            reason: 'DAILY_LIMIT_EXCEEDED',
            dailyLimit: evaluated.dailyLimitVnd.toString(),
            used: used.toString(),
            requested: totalAmountVnd.toString(),
          },
          details: { reason: 'Daily usage limit exceeded' },
        });
      }
    }

    // ──────────────────────────────────────────────────────
    // [Step 9 + Step 10] Split payment + DB 트랜잭션
    // [Bước 9 + Bước 10] Split payment + DB transaction
    // ──────────────────────────────────────────────────────
    return this.prisma.$transaction(async (tx) => {
      // [KO] 트랜잭션 내부에서 최신 지갑 잔액 재조회 (동시성 보호)
      // [VI] Truy vấn lại ví trong transaction để lấy số dư mới nhất (bảo vệ đồng thời)
      const fresh = await tx.mealWallet.findUnique({
        where: { id: wallet.id },
      });
      if (!fresh) {
        throw new DomainError({
          code: 'RESOURCE_NOT_FOUND',
          params: { resource: 'Wallet' },
          details: { reason: 'Wallet not found in transaction' },
        });
      }

      // [KO] Split payment 할당 — 회사 지원금 우선, 부족분은 개인 충전금
      // [VI] Phân bổ split payment — trợ cấp công ty trước, phần thiếu trừ nạp cá nhân
      const allocation = allocateMealWalletSpend(
        fresh,
        totalAmountVnd,
        Boolean(evaluated?.allowSplitPayment),
      );

      if (!allocation) {
        // [KO] 할당 실패 세부 원인 구분
        // [VI] Phân biệt nguyên nhân chi tiết khi phân bổ thất bại
        const fundingState = normalizeMealWalletFundingState(fresh);
        if (
          evaluated &&
          !evaluated.allowSplitPayment &&
          totalAmountVnd > fundingState.companyAllowanceVnd &&
          totalAmountVnd <= fundingState.balanceVnd
        ) {
          throw new DomainError({
            code: 'POLICY_VIOLATION',
            params: { reason: 'SPLIT_PAYMENT_DISABLED' },
            details: { reason: 'Split payment is disabled and company allowance is insufficient' },
          });
        }
        throw new DomainError({
          code: 'INSUFFICIENT_BALANCE',
          params: {
            available: fundingState.balanceVnd.toString(),
            requested: totalAmountVnd.toString(),
          },
        });
      }

      // [KO] 지갑 잔액 업데이트
      // [VI] Cập nhật số dư ví
      await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: allocation.balanceVnd,
          companyAllowanceVnd: allocation.companyAllowanceVnd,
          personalTopUpVnd: allocation.personalTopUpVnd,
        },
      });

      // [KO] 주문 번호 생성 (충돌 시 1회 재시도)
      // [VI] Tạo số đơn hàng (thử lại 1 lần nếu trùng)
      let orderNo = generateOrderNo();
      const existingOrderNo = await tx.mealOrder.findUnique({
        where: { orderNo },
        select: { id: true },
      });
      if (existingOrderNo) {
        orderNo = generateOrderNo();
      }

      // [KO] MealOrder + MealOrderItems 동시 생성
      // [VI] Tạo đồng thời MealOrder + MealOrderItems
      const order = await tx.mealOrder.create({
        data: {
          walletId: wallet.id,
          corporateId: wallet.corporateId,
          brandHqId: input.brandHqId,
          branchId: input.branchId,
          orderNo,
          orderType: input.orderType,
          diningType: input.diningType,
          status: 'PAID_PENDING_ACCEPT',
          totalAmountVnd,
          companyShareVnd: allocation.companyShareVnd,
          employeeShareVnd: allocation.employeeShareVnd,
          scheduledAt: input.scheduledAt ?? new Date(),
          tableNo: input.tableNo ?? null,
          userLatitude: input.userLatitude ?? null,
          userLongitude: input.userLongitude ?? null,
          idempotencyKey: input.idempotencyKey,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // [KO] 15분 만료 / [VI] Hết hạn sau 15 phút
          items: {
            create: input.items.map((item) => ({
              menuItemName: item.menuItemName,
              quantity: item.quantity,
              unitPriceVnd: item.unitPriceVnd,
              optionsJson: item.optionsJson ?? [],
            })),
          },
        },
        include: { items: true },
      });

      // [KO] MealTransaction 레코드 생성 (APPROVED) — 기존 거래 원장과 통합
      // [VI] Tạo bản ghi MealTransaction (APPROVED) — tích hợp với sổ cái giao dịch hiện có
      await tx.mealTransaction.create({
        data: {
          walletId: wallet.id,
          corporateId: wallet.corporateId,
          brandHqId: input.brandHqId,
          branchId: input.branchId,
          loopType: 'OPEN_LOOP',
          authMethod: 'APP_QR',
          requestedAmountVnd: totalAmountVnd,
          approvedAmountVnd: totalAmountVnd,
          companyShareVnd: allocation.companyShareVnd,
          employeeShareVnd: allocation.employeeShareVnd,
          status: 'APPROVED',
          idempotencyKey: `order:${order.id}`,
          authorizedAt: new Date(),
        },
      });

      return order;
    });
  }

  // ══════════════════════════════════════════════════════
  // [KO] 주문 취소 (cancel)
  // [VI] Hủy đơn hàng (cancel)
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 주문 취소 — 취소 정책 평가 후 잔액 복원.
   *
   *      취소 정책 유형:
   *      - FREE_UNTIL_ACCEPTED: PAID_PENDING_ACCEPT 상태에서만 취소 가능
   *      - FREE_UNTIL_DEADLINE: scheduledAt - deadlineMin 이전에만 취소 가능
   *      - NO_CANCEL: 취소 불가
   *
   *      취소 시: 지갑 잔액 복원 (increment) + 상태 CANCELLED_BY_USER
   *
   * [VI] Hủy đơn hàng — đánh giá chính sách hủy rồi khôi phục số dư.
   *
   *      Loại chính sách hủy:
   *      - FREE_UNTIL_ACCEPTED: chỉ hủy được khi ở trạng thái PAID_PENDING_ACCEPT
   *      - FREE_UNTIL_DEADLINE: chỉ hủy được trước scheduledAt - deadlineMin
   *      - NO_CANCEL: không được hủy
   *
   *      Khi hủy: khôi phục số dư ví (increment) + đổi trạng thái CANCELLED_BY_USER
   */
  async cancel(ctx: MealCallerCtx, orderId: string, reason?: string) {
    const order = await this.findById(ctx, orderId);

    // [KO] 취소 정책 결정 — 기본값은 FREE_UNTIL_ACCEPTED. 향후 정책 DB에서 동적 로드 예정.
    // [VI] Xác định chính sách hủy — mặc định FREE_UNTIL_ACCEPTED. Sẽ load động từ DB chính sách.
    // TODO: Load cancellation policy from MealPolicy entity when available
    const cancellationPolicy = 'FREE_UNTIL_ACCEPTED' as CancellationPolicyType;

    switch (cancellationPolicy) {
      case 'FREE_UNTIL_ACCEPTED':
        if (order.status !== 'PAID_PENDING_ACCEPT' && order.status !== 'ACCEPTED') {
          throw new DomainError({
            code: 'CANCELLATION_NOT_ALLOWED',
            status: 409,
            params: { currentStatus: order.status, policy: cancellationPolicy },
            details: { reason: 'Order can only be cancelled before preparation starts' },
          });
        }
        break;
      case 'FREE_UNTIL_DEADLINE':
        // [KO] scheduledAt 기준 데드라인 검사는 향후 정책 연동 시 구현
        // [VI] Kiểm tra deadline theo scheduledAt sẽ được triển khai khi tích hợp chính sách
        if (order.status !== 'PAID_PENDING_ACCEPT' && order.status !== 'ACCEPTED') {
          throw new DomainError({
            code: 'CANCELLATION_NOT_ALLOWED',
            status: 409,
            params: { currentStatus: order.status, policy: cancellationPolicy },
          });
        }
        break;
      case 'NO_CANCEL':
        throw new DomainError({
          code: 'CANCELLATION_NOT_ALLOWED',
          status: 409,
          params: { policy: 'NO_CANCEL' },
          details: { reason: 'Cancellation policy does not allow cancellation' },
        });
    }

    return this.prisma.$transaction(async (tx) => {
      // [KO] 지갑 잔액 복원 — increment로 동시성 안전하게 처리
      // [VI] Khôi phục số dư ví — dùng increment để đảm bảo an toàn đồng thời
      await tx.mealWallet.update({
        where: { id: order.walletId },
        data: {
          balanceVnd: { increment: order.totalAmountVnd },
          companyAllowanceVnd: { increment: order.companyShareVnd },
          personalTopUpVnd: { increment: order.employeeShareVnd },
        },
      });

      // [KO] 주문 상태를 CANCELLED_BY_USER로 변경
      // [VI] Đổi trạng thái đơn hàng thành CANCELLED_BY_USER
      const updated = await tx.mealOrder.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED_BY_USER',
          cancelledAt: new Date(),
          cancelReason: reason ?? null,
        },
        include: { items: true },
      });

      return updated;
    });
  }

  // ══════════════════════════════════════════════════════
  // [KO] 가맹점 수락 (accept)
  // [VI] Cửa hàng chấp nhận (accept)
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 가맹점이 주문을 수락한다 (PAID_PENDING_ACCEPT → ACCEPTED).
   * [VI] Cửa hàng chấp nhận đơn hàng (PAID_PENDING_ACCEPT → ACCEPTED).
   */
  async accept(ctx: MealCallerCtx, orderId: string) {
    const order = await this.findById(ctx, orderId);

    if (order.status !== 'PAID_PENDING_ACCEPT') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        status: 409,
        params: { from: order.status, to: 'ACCEPTED' },
        details: { reason: 'Order can only be accepted from PAID_PENDING_ACCEPT status' },
      });
    }

    return this.prisma.mealOrder.update({
      where: { id: order.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: { items: true },
    });
  }

  // ══════════════════════════════════════════════════════
  // [KO] 가맹점 거절 (reject) — 환불 포함
  // [VI] Cửa hàng từ chối (reject) — bao gồm hoàn tiền
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 가맹점이 주문을 거절한다 → 지갑 잔액 환불.
   *      PAID_PENDING_ACCEPT 상태에서만 거절 가능.
   * [VI] Cửa hàng từ chối đơn hàng → hoàn tiền vào ví.
   *      Chỉ từ chối được khi ở trạng thái PAID_PENDING_ACCEPT.
   */
  async reject(ctx: MealCallerCtx, orderId: string, reason?: string) {
    const order = await this.findById(ctx, orderId);

    if (order.status !== 'PAID_PENDING_ACCEPT') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        status: 409,
        params: { from: order.status, to: 'REJECTED' },
        details: { reason: 'Order can only be rejected from PAID_PENDING_ACCEPT status' },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // [KO] 지갑 잔액 환불 (increment)
      // [VI] Hoàn tiền vào ví (increment)
      await tx.mealWallet.update({
        where: { id: order.walletId },
        data: {
          balanceVnd: { increment: order.totalAmountVnd },
          companyAllowanceVnd: { increment: order.companyShareVnd },
          personalTopUpVnd: { increment: order.employeeShareVnd },
        },
      });

      return tx.mealOrder.update({
        where: { id: order.id },
        data: {
          status: 'REJECTED',
          cancelledAt: new Date(),
          cancelReason: reason ?? null,
        },
        include: { items: true },
      });
    });
  }

  // ══════════════════════════════════════════════════════
  // [KO] 상태 업데이트 (updateStatus)
  // [VI] Cập nhật trạng thái (updateStatus)
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 주문 상태 전이 — ACCEPTED→PREPARING→READY→COMPLETED.
   *      유효하지 않은 전이는 INVALID_STATUS_TRANSITION 에러.
   * [VI] Chuyển trạng thái đơn hàng — ACCEPTED→PREPARING→READY→COMPLETED.
   *      Chuyển trạng thái không hợp lệ → lỗi INVALID_STATUS_TRANSITION.
   */
  async updateStatus(ctx: MealCallerCtx, orderId: string, newStatus: string) {
    const order = await this.findById(ctx, orderId);

    const allowed = VALID_STATUS_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        status: 409,
        params: { from: order.status, to: newStatus },
        details: {
          reason: `Cannot transition from ${order.status} to ${newStatus}`,
          allowedTransitions: allowed ?? [],
        },
      });
    }

    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'COMPLETED') {
      data.completedAt = new Date();
    }

    return this.prisma.mealOrder.update({
      where: { id: order.id },
      data,
      include: { items: true },
    });
  }

  // ══════════════════════════════════════════════════════
  // [KO] QR 체크인 (checkin)
  // [VI] Check-in QR (checkin)
  // ══════════════════════════════════════════════════════

  /**
   * [KO] QR 테이블 체크인 — checkedInAt 시각을 기록한다.
   *      PAID_PENDING_ACCEPT 또는 ACCEPTED 상태에서만 체크인 가능.
   * [VI] Check-in bàn QR — ghi thời điểm checkedInAt.
   *      Chỉ check-in được khi ở trạng thái PAID_PENDING_ACCEPT hoặc ACCEPTED.
   */
  async checkin(ctx: MealCallerCtx, orderId: string) {
    const order = await this.findById(ctx, orderId);

    if (order.status !== 'PAID_PENDING_ACCEPT' && order.status !== 'ACCEPTED') {
      throw new DomainError({
        code: 'INVALID_STATUS_TRANSITION',
        status: 409,
        params: { currentStatus: order.status },
        details: { reason: 'Check-in is only allowed for pending or accepted orders' },
      });
    }

    return this.prisma.mealOrder.update({
      where: { id: order.id },
      data: { checkedInAt: new Date() },
      include: { items: true },
    });
  }
}
