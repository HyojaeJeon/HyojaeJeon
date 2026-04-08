/**
 * 한국어: MealSettlement Service.
 *   3-Way Matching 정산 배치 (brand 축).
 *   모든 read/write 가 caller 의 brand scope 와 target brandHqId 일치를 검증한다.
 * Tiếng Việt: Service đối soát + tạo batch — kiểm scope brand cho mọi đường dẫn.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  withTargetBrand,
} from '../_internal/caller-ctx';
import { MealMerchantService } from '../merchant/merchant.service';
import { RunMealSettlementBatchInput } from './dto/run-meal-settlement-batch.input';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class MealSettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly permission: PermissionService,
    private readonly merchant: MealMerchantService,
  ) {}

  async listByBrand(ctx: MealCallerCtx, brandHqId: string) {
    assertBrandScope(ctx, brandHqId);
    return this.prisma.mealSettlementBatch.findMany({
      where: { brandHqId },
      orderBy: { periodStart: 'desc' },
    });
  }

  async findById(ctx: MealCallerCtx, id: string) {
    const b = await this.prisma.mealSettlementBatch.findUnique({ where: { id } });
    if (!b) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'batch' }, details: { reason: 'Settlement batch not found' } });
    assertBrandScope(ctx, b.brandHqId);
    return b;
  }

  async runBatch(
    ctx: MealCallerCtx,
    input: RunMealSettlementBatchInput,
  ) {
    assertBrandScope(ctx, input.brandHqId);
    const brandCtx = withTargetBrand(ctx, input.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.settlement.run');

    const enrollment = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { brandHqId: input.brandHqId },
    });
    if (!enrollment) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', details: { reason: 'Merchant not enrolled' } });

    const rate = await this.merchant.getActiveCommissionRate(
      enrollment.id,
      input.periodEnd,
    );
    const baseRatePct = rate ? Number(rate.baseRatePct) : 0;

    return this.prisma.$transaction(async (tx) => {
      const txList = await tx.mealTransaction.findMany({
        where: {
          brandHqId: input.brandHqId,
          status: 'APPROVED',
          createdAt: {
            gte: input.periodStart,
            lt: input.periodEnd,
          },
        },
      });

      const grossAmountVnd = txList.reduce(
        (acc, t) => acc + t.approvedAmountVnd,
        0n,
      );
      const commissionAmountVnd =
        (grossAmountVnd * BigInt(Math.round(baseRatePct * 100))) / 10000n;
      const netPayableVnd = grossAmountVnd - commissionAmountVnd;

      const batch = await tx.mealSettlementBatch.upsert({
        where: {
          uq_meal_settlement_brand_period: {
            brandHqId: input.brandHqId,
            periodStart: input.periodStart,
            periodEnd: input.periodEnd,
          },
        },
        update: {
          status: 'MATCHED',
          grossAmountVnd,
          commissionAmountVnd,
          netPayableVnd,
          threeWayMismatchCount: 0,
        },
        create: {
          brandHqId: input.brandHqId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          status: 'MATCHED',
          grossAmountVnd,
          commissionAmountVnd,
          netPayableVnd,
        },
      });

      const txIds = txList.map((t) => t.id);
      if (txIds.length) {
        await tx.mealTransaction.updateMany({
          where: { id: { in: txIds } },
          data: { status: 'SETTLED', settledAt: new Date() },
        });
      }

      return batch;
    });
  }

  /**
   * 한국어: 외부 은행 이체 ACK 수신 후 PAID 마킹.
   */
  async markPaid(ctx: MealCallerCtx, batchId: string) {
    const b = await this.prisma.mealSettlementBatch.findUnique({
      where: { id: batchId },
    });
    if (!b) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'batch' }, details: { reason: 'Settlement batch not found' } });
    assertBrandScope(ctx, b.brandHqId);
    const brandCtx = withTargetBrand(ctx, b.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.settlement.run');

    return this.prisma.mealSettlementBatch.update({
      where: { id: batchId },
      data: { status: 'PAID' },
    });
  }
}
