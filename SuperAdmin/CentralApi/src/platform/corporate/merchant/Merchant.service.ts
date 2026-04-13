/**
 * [KO] 식권 가맹점(Meal Merchant) 서비스
 *      BrandHQ(브랜드 본사 = 제휴식당)의 식권 Enrollment, 수수료율, 정산 계좌를 관리합니다.
 *
 *      이 서비스가 담당하는 핵심 업무:
 *        1. Enrollment 관리  : 가맹점 등록 → 활성화 → 비활성화 생명주기
 *        2. Commission 관리  : 기간별 수수료율 레코드 생성 (append-only)
 *        3. Settlement Account: 정산 대금 수령 은행 계좌 관리 (primary 교체)
 *
 *      보안 모델:
 *        - 모든 read 메서드: MealCallerCtx 의 brand scope 검증 (assertBrandScope)
 *        - 모든 write 메서드: brand scope + MEAL_TICKET capability + RBAC permission 3중 검증
 *        - getActiveCommissionRate() 만 예외 — 내부 시스템 호출용 (정산 배치 등)
 *
 *      Open Loop vs Closed Loop:
 *        - OPEN_LOOP  가맹점: 도심 제휴 식당. 수수료율 3종(base/specialZone/franchise) 모두 사용 가능.
 *        - CLOSED_LOOP 가맹점: 구내식당. 보통 baseRatePct 만 사용, 수수료가 0% 인 경우도 있음.
 *
 * [VI] Service quản lý Meal Merchant (merchant phiếu ăn)
 *      Quản lý Enrollment, hoa hồng, tài khoản quyết toán cho BrandHQ (trụ sở thương hiệu = nhà hàng đối tác).
 *
 *      Nghiệp vụ chính:
 *        1. Quản lý Enrollment  : Đăng ký merchant -> kích hoạt -> vô hiệu hóa
 *        2. Quản lý Commission  : Tạo bản ghi hoa hồng theo giai đoạn (append-only)
 *        3. Settlement Account  : Quản lý tài khoản ngân hàng nhận tiền quyết toán (thay primary)
 *
 *      Mô hình bảo mật:
 *        - Mọi phương thức read: kiểm tra brand scope của MealCallerCtx (assertBrandScope)
 *        - Mọi phương thức write: brand scope + MEAL_TICKET capability + RBAC permission (3 lớp)
 *        - Ngoại lệ duy nhất: getActiveCommissionRate() — dành cho gọi nội bộ hệ thống (batch quyết toán)
 *
 *      Open Loop vs Closed Loop:
 *        - OPEN_LOOP  : Nhà hàng liên kết ngoài. Dùng được cả 3 loại hoa hồng (base/specialZone/franchise).
 *        - CLOSED_LOOP: Canteen nội bộ. Thường chỉ dùng baseRatePct, có thể 0%.
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { EntitlementService } from '@shared/entitlement/Entitlement.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  withTargetBrand,
} from '../_internal/callerCtx';
import { EnrollMealMerchantInput } from './dto/EnrollMealMerchant.input';
import { SetMealMerchantCommissionInput } from './dto/SetMealMerchantCommission.input';
import { SetMealMerchantSettlementAccountInput } from './dto/SetMealMerchantSettlementAccount.input';
import { DomainError } from '@core/errors/DomainError';

@Injectable()
export class MealMerchantService {
  constructor(
    /** [KO] Prisma DB 접근 서비스 / [VI] Service truy cập DB Prisma */
    private readonly prisma: PrismaService,
    /** [KO] 기업 capability(MEAL_TICKET 등) 검증 서비스 / [VI] Service kiểm tra capability (MEAL_TICKET, v.v.) */
    private readonly entitlement: EntitlementService,
    /** [KO] RBAC 권한 검증 서비스 / [VI] Service kiểm tra quyền RBAC */
    private readonly permission: PermissionService,
  ) {}

  // ───── Read (조회 / Truy vấn)

  /**
   * [KO] 특정 BrandHQ 의 가맹점 등록 정보를 조회합니다. 호출자의 brand scope 를 검증합니다.
   * [VI] Truy vấn enrollment của BrandHQ cụ thể. Kiểm tra brand scope của caller.
   */
  async findEnrollmentByBrand(ctx: MealCallerCtx, brandHqId: string) {
    assertBrandScope(ctx, brandHqId);
    return this.prisma.mealMerchantEnrollment.findUnique({
      where: { brandHqId },
    });
  }

  /**
   * [KO] 전체 가맹점 등록 목록을 페이지네이션으로 조회합니다.
   *      brandHqId 에서 BrandProfile.brandName 을 JOIN 하여 brandName 을 포함합니다.
   * [VI] Truy vấn danh sách enrollment toàn bộ với phân trang.
   *      JOIN BrandProfile.brandName từ brandHqId để bao gồm tên thương hiệu.
   */
  async listEnrollments(ctx: MealCallerCtx, skip: number, take: number) {
    const [rows, totalCount] = await Promise.all([
      this.prisma.mealMerchantEnrollment.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealMerchantEnrollment.count(),
    ]);

    // brandHqId → brandName join
    const brandIds = [...new Set(rows.map((r) => r.brandHqId))];
    const brands = brandIds.length > 0
      ? await this.prisma.brandProfile.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, brandName: true },
        })
      : [];
    const brandMap = new Map(brands.map((b) => [b.id, b.brandName]));

    return {
      data: rows.map((r) => ({
        ...r,
        brandName: brandMap.get(r.brandHqId) ?? null,
      })),
      totalCount,
    };
  }

  /**
   * [KO] 특정 시점에 유효한 수수료율 레코드를 조회합니다 (시스템 내부 호출 전용).
   *      Settlement 배치 등 서버 내부에서 호출하므로 caller scope 검증을 생략합니다.
   *      effectiveFrom <= at AND (effectiveTo IS NULL OR effectiveTo >= at) 조건으로
   *      가장 최근 레코드를 반환합니다.
   * [VI] Truy vấn bản ghi hoa hồng hiệu lực tại thời điểm cụ thể (chỉ gọi nội bộ hệ thống).
   *      Được gọi từ Settlement batch, v.v., nên bỏ qua kiểm tra scope caller.
   *      Trả về bản ghi mới nhất thỏa điều kiện effectiveFrom <= at AND (effectiveTo IS NULL OR effectiveTo >= at).
   */
  async getActiveCommissionRate(enrollmentId: string, at: Date = new Date()) {
    return this.prisma.mealMerchantCommissionRate.findFirst({
      where: {
        enrollmentId,
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: at } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  // ───── Mutations (변경 / Thay đổi)

  /**
   * [KO] BrandHQ 를 식권 가맹점으로 등록합니다.
   *      - 이미 등록된 brandHqId 가 있으면 ENROLLMENT_ALREADY_EXISTS 오류를 발생시킵니다.
   *      - 등록 직후 isActive=false. activate() 를 별도로 호출해야 거래 가능.
   * [VI] Đăng ký BrandHQ làm merchant phiếu ăn.
   *      - Nếu brandHqId đã đăng ký thì trả lỗi ENROLLMENT_ALREADY_EXISTS.
   *      - Sau đăng ký isActive=false. Cần gọi activate() riêng để cho phép giao dịch.
   */
  async enroll(ctx: MealCallerCtx, input: EnrollMealMerchantInput) {
    assertBrandScope(ctx, input.brandHqId);
    const brandCtx = withTargetBrand(ctx, input.brandHqId);
    await this.permission.require(brandCtx, 'corporate.merchant.enroll');

    const existing = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { brandHqId: input.brandHqId },
    });
    if (existing) {
      throw new DomainError({ code: 'ENROLLMENT_ALREADY_EXISTS', params: { enrollmentId: existing.id } });
    }
    return this.prisma.mealMerchantEnrollment.create({
      data: {
        brandHqId: input.brandHqId,
        loopType: input.loopType,
        contractEndsAt: input.contractEndsAt ?? null,
        isActive: false,
      },
    });
  }

  /**
   * [KO] 가맹점 등록을 활성화합니다 (isActive=false -> true).
   *      BrandHQ 가 MEAL_TICKET capability 를 보유해야 활성화할 수 있습니다.
   *      활성화 후 해당 가맹점에서 식권 거래가 가능해집니다.
   * [VI] Kích hoạt enrollment merchant (isActive=false -> true).
   *      BrandHQ phải có capability MEAL_TICKET mới kích hoạt được.
   *      Sau kích hoạt, merchant có thể thực hiện giao dịch phiếu ăn.
   */
  async activate(ctx: MealCallerCtx, enrollmentId: string) {
    const row = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Enrollment' }, details: { reason: 'Enrollment not found' } });
    assertBrandScope(ctx, row.brandHqId);
    const brandCtx = withTargetBrand(ctx, row.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.merchant.activate');

    return this.prisma.mealMerchantEnrollment.update({
      where: { id: enrollmentId },
      data: { isActive: true },
    });
  }

  /**
   * [KO] 가맹점 등록을 비활성화합니다 (isActive=true -> false).
   *      비활성화 후 해당 가맹점에서 식권 거래가 차단됩니다.
   * [VI] Vô hiệu hóa enrollment merchant (isActive=true -> false).
   *      Sau vô hiệu hóa, giao dịch phiếu ăn tại merchant bị chặn.
   */
  async deactivate(ctx: MealCallerCtx, enrollmentId: string) {
    const row = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Enrollment' }, details: { reason: 'Enrollment not found' } });
    assertBrandScope(ctx, row.brandHqId);
    const brandCtx = withTargetBrand(ctx, row.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.merchant.activate');

    return this.prisma.mealMerchantEnrollment.update({
      where: { id: enrollmentId },
      data: { isActive: false },
    });
  }

  /**
   * [KO] 가맹점에 새 수수료율 레코드를 추가합니다 (append-only).
   *      기존 수수료율은 수정하지 않고, 새 레코드를 생성합니다.
   *      정산(settlement) 시 적용 기간 내 가장 최근 레코드의 baseRatePct 를 사용합니다.
   * [VI] Thêm bản ghi hoa hồng mới cho merchant (append-only).
   *      Không sửa bản ghi cũ, luôn tạo mới.
   *      Khi quyết toán, bản ghi mới nhất trong khoảng hiệu lực sẽ được áp dụng (baseRatePct).
   */
  async setCommissionRate(
    ctx: MealCallerCtx,
    input: SetMealMerchantCommissionInput,
  ) {
    const row = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { id: input.enrollmentId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Enrollment' }, details: { reason: 'Enrollment not found' } });
    assertBrandScope(ctx, row.brandHqId);
    const brandCtx = withTargetBrand(ctx, row.brandHqId);
    await this.permission.require(brandCtx, 'corporate.merchant.commission.write');

    return this.prisma.mealMerchantCommissionRate.create({
      data: {
        enrollmentId: input.enrollmentId,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        baseRatePct: input.baseRatePct,
        specialZoneRatePct: input.specialZoneRatePct ?? null,
        franchiseFlatRatePct: input.franchiseFlatRatePct ?? null,
      },
    });
  }

  /**
   * [KO] 가맹점의 주 정산 계좌를 교체합니다.
   *      트랜잭션 내에서 기존 isPrimary=true 계좌를 false 로 변경하고,
   *      새 계좌를 isPrimary=true 로 생성합니다 (이전 계좌는 이력으로 보존).
   * [VI] Thay đổi tài khoản quyết toán chính của merchant.
   *      Trong transaction: đặt isPrimary=false cho tài khoản cũ,
   *      tạo tài khoản mới isPrimary=true (tài khoản cũ được giữ lại làm lịch sử).
   */
  async setSettlementAccount(
    ctx: MealCallerCtx,
    input: SetMealMerchantSettlementAccountInput,
  ) {
    const row = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { id: input.enrollmentId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Enrollment' }, details: { reason: 'Enrollment not found' } });
    assertBrandScope(ctx, row.brandHqId);
    const brandCtx = withTargetBrand(ctx, row.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.merchant.account.write');

    return this.prisma.$transaction(async (tx) => {
      await tx.mealMerchantSettlementAccount.updateMany({
        where: { enrollmentId: input.enrollmentId, isPrimary: true },
        data: { isPrimary: false },
      });
      return tx.mealMerchantSettlementAccount.create({
        data: {
          enrollmentId: input.enrollmentId,
          bankCode: input.bankCode,
          bankAccountNumber: input.bankAccountNumber,
          bankAccountHolder: input.bankAccountHolder,
          taxCode: input.taxCode,
          isPrimary: true,
        },
      });
    });
  }
}
