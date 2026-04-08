/**
 * 한국어: MealPolicy Service.
 *   부서/직급/시간대/한도/Split Payment 정책 빌더.
 *   모든 read/write 가 caller 의 corporateContext 와 target row 의 corporateId 일치 검증.
 * Tiếng Việt: Service builder chính sách phiếu ăn — kiểm scope corporate cho mọi đường dẫn.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/caller-ctx';
import { CreateMealPolicyInput } from './dto/create-meal-policy.input';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class MealPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly permission: PermissionService,
  ) {}

  async listByCorporate(ctx: MealCallerCtx, corporateId: string) {
    assertCorporateScope(ctx, corporateId);
    return this.prisma.mealPolicy.findMany({
      where: { corporateId, deletedAt: null },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findById(ctx: MealCallerCtx, id: string) {
    const p = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!p) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    assertCorporateScope(ctx, p.corporateId);
    return p;
  }

  async create(ctx: MealCallerCtx, input: CreateMealPolicyInput) {
    assertCorporateScope(ctx, input.corporateId);
    const targetCtx = withTargetCorporate(ctx, input.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    return this.prisma.mealPolicy.create({
      data: {
        corporateId: input.corporateId,
        policyCode: input.policyCode,
        policyName: input.policyName,
        appliesToDepartmentIds: input.appliesToDepartmentIds,
        appliesToRoleCodes: input.appliesToRoleCodes,
        ruleJson: {},
        maxPerTransactionVnd: input.maxPerTransactionVnd,
        dailyLimitVnd: input.dailyLimitVnd,
        allowSplitPayment: input.allowSplitPayment,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
    });
  }

  async softDelete(ctx: MealCallerCtx, id: string) {
    const before = await this.prisma.mealPolicy.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Policy' }, details: { reason: 'Policy not found' } });
    assertCorporateScope(ctx, before.corporateId);
    const targetCtx = withTargetCorporate(ctx, before.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.policy.write');

    await this.prisma.mealPolicy.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
    return true;
  }

  /**
   * 한국어: 정책 평가 — 시스템 내부 호출 전용 (transaction service 에서 사용).
   *   호출 컨텍스트가 시스템(트랜잭션 평가)이므로 caller scope 검증을 생략한다.
   */
  async evaluateForEmployee(
    employeeId: string,
    now: Date,
  ): Promise<{ policyId: string; dailyLimitVnd: bigint; maxPerTransactionVnd: bigint; allowSplitPayment: boolean } | null> {
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) return null;

    const candidates = await this.prisma.mealPolicy.findMany({
      where: {
        corporateId: employee.corporateId,
        status: 'ACTIVE',
        deletedAt: null,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    const matchingDept = employee.departmentId
      ? candidates.find((p) =>
          p.appliesToDepartmentIds.includes(employee.departmentId as string),
        )
      : undefined;
    const fallback = candidates.find((p) => p.appliesToDepartmentIds.length === 0);
    const chosen = matchingDept ?? fallback ?? candidates[0];
    if (!chosen) return null;

    return {
      policyId: chosen.id,
      dailyLimitVnd: chosen.dailyLimitVnd,
      maxPerTransactionVnd: chosen.maxPerTransactionVnd,
      allowSplitPayment: chosen.allowSplitPayment,
    };
  }
}
