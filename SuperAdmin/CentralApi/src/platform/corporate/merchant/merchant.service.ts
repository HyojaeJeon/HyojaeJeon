/**
 * 한국어: MealMerchant Service.
 *   BrandHQ(제휴식당)의 식권 enrollment / 수수료율 / 정산계좌 관리 (brand 축).
 *   - read 는 caller brand scope 검증.
 *   - enroll/activate/deactivate/setCommission/setSettlementAccount 는 brand scope + capability + permission.
 *
 * Tiếng Việt: Service quản lý merchant — kiểm scope brand cho mọi đường dẫn.
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  withTargetBrand,
} from '../_internal/caller-ctx';
import { EnrollMealMerchantInput } from './dto/enroll-meal-merchant.input';
import { SetMealMerchantCommissionInput } from './dto/set-meal-merchant-commission.input';
import { SetMealMerchantSettlementAccountInput } from './dto/set-meal-merchant-settlement-account.input';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class MealMerchantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly permission: PermissionService,
  ) {}

  // ───── Read

  async findEnrollmentByBrand(ctx: MealCallerCtx, brandHqId: string) {
    assertBrandScope(ctx, brandHqId);
    return this.prisma.mealMerchantEnrollment.findUnique({
      where: { brandHqId },
    });
  }

  async listEnrollments(ctx: MealCallerCtx, skip: number, take: number) {
    // SUPER_ADMIN 만 전체 enrollment 목록 열람.
    if (ctx.userType !== 'SUPER_ADMIN') {
      throw new DomainError({ code: 'ENROLLMENT_LIST_PLATFORM_ONLY', params: { userType: ctx.userType } });
    }
    return this.prisma.mealMerchantEnrollment.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 시스템 내부 호출 (settlement 등) — caller scope 검증 생략.
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

  // ───── Mutations

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
   * enrollment → isActive=true 전이 시 BrandHQ 가 MEAL_TICKET capability 보유 필수.
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
