/**
 * 한국어: MealTransaction Service.
 *   Open/Closed Loop 실시간 결제 승인.
 *   read 는 caller corporateContext (필요 시 brandContext) 검증.
 *   authorize 는 brand 축의 capability 와 corporate 축의 wallet/policy 양쪽을 모두 본다.
 * Tiếng Việt: Service phê duyệt giao dịch phiếu ăn — hợp nhất kiểm scope.
 */
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  assertCorporateScope,
  withTargetBrand,
} from '../_internal/caller-ctx';
import { MealPolicyService } from '../policy/policy.service';
import { AuthorizeMealTransactionInput } from './dto/authorize-meal-transaction.input';
import { DomainError } from '@core/errors/domain-error';
import {
  allocateMealWalletSpend,
  normalizeMealWalletFundingState,
} from '../wallet/_internal/wallet-ledger';

@Injectable()
export class MealTransactionService {
  private readonly logger = new Logger(MealTransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly permission: PermissionService,
    private readonly policy: MealPolicyService,
  ) {}

  async findById(ctx: MealCallerCtx, id: string) {
    const t = await this.prisma.mealTransaction.findUnique({ where: { id } });
    if (!t) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Transaction' }, details: { reason: 'Transaction not found' } });
    // 트랜잭션은 corporate ↔ brand 양쪽에 속한다.
    // CORPORATE_ADMIN 은 자기 corporate row 만, BRAND_ADMIN 은 자기 brand row 만.
    if (ctx.userType === 'CORPORATE_ADMIN') assertCorporateScope(ctx, t.corporateId);
    else if (ctx.userType !== 'SUPER_ADMIN') assertBrandScope(ctx, t.brandHqId);
    return t;
  }

  async listByCorporate(
    ctx: MealCallerCtx,
    corporateId: string,
    skip: number,
    take: number,
  ) {
    assertCorporateScope(ctx, corporateId);
    return this.prisma.mealTransaction.findMany({
      where: { corporateId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByBrand(
    ctx: MealCallerCtx,
    brandHqId: string,
    skip: number,
    take: number,
  ) {
    assertBrandScope(ctx, brandHqId);
    return this.prisma.mealTransaction.findMany({
      where: { brandHqId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async authorize(
    ctx: MealCallerCtx,
    input: AuthorizeMealTransactionInput,
  ) {
    // 1. brand 축 capability + permission 가드
    assertBrandScope(ctx, input.brandHqId);
    const brandCtx = withTargetBrand(ctx, input.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.transaction.authorize');

    // 2. Idempotency
    const existing = await this.prisma.mealTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return existing;

    // 3. Wallet
    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: input.walletId },
    });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    if (wallet.status !== 'ACTIVE') {
      return this.recordDecline(input, wallet.corporateId, 'EMPLOYEE_INACTIVE');
    }

    // 4. Enrollment 활성
    const enrollment = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { brandHqId: input.brandHqId },
    });
    if (!enrollment || !enrollment.isActive) {
      return this.recordDecline(input, wallet.corporateId, 'MERCHANT_INACTIVE');
    }

    // 5. 정책 평가
    const evaluated = await this.policy.evaluateForEmployee(
      wallet.employeeId,
      new Date(),
    );
    if (
      evaluated &&
      evaluated.maxPerTransactionVnd > 0n &&
      input.requestedAmountVnd > evaluated.maxPerTransactionVnd
    ) {
      return this.recordDecline(input, wallet.corporateId, 'OUT_OF_POLICY_WINDOW');
    }

    // 6. 일일 한도
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
      if (used + input.requestedAmountVnd > evaluated.dailyLimitVnd) {
        return this.recordDecline(
          input,
          wallet.corporateId,
          'DAILY_LIMIT_EXCEEDED',
        );
      }
    }

    // 7. 잔액 차감 + 승인 트랜잭션 (단일 DB 트랜잭션)
    return this.prisma.$transaction(async (tx) => {
      const fresh = await tx.mealWallet.findUnique({
        where: { id: wallet.id },
      });
      if (!fresh) {
        throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
      }
      const fundingState = normalizeMealWalletFundingState(fresh);

      const allocation = allocateMealWalletSpend(
        fresh,
        input.requestedAmountVnd,
        Boolean(evaluated?.allowSplitPayment),
      );

      if (!allocation) {
        if (
          evaluated &&
          !evaluated.allowSplitPayment &&
          input.requestedAmountVnd > fundingState.companyAllowanceVnd &&
          input.requestedAmountVnd <= fundingState.balanceVnd
        ) {
          return this.recordDecline(input, wallet.corporateId, 'SPLIT_PAYMENT_DISABLED');
        }
        throw new DomainError({ code: 'INSUFFICIENT_BALANCE', params: { available: fundingState.balanceVnd.toString(),
          requested: input.requestedAmountVnd.toString() } });
      }
      await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: allocation.balanceVnd,
          companyAllowanceVnd: allocation.companyAllowanceVnd,
          personalTopUpVnd: allocation.personalTopUpVnd,
        },
      });
      return tx.mealTransaction.create({
        data: {
          walletId: wallet.id,
          corporateId: wallet.corporateId,
          brandHqId: input.brandHqId,
          branchId: input.branchId,
          terminalId: input.terminalId ?? null,
          loopType: input.loopType,
          authMethod: input.authMethod,
          requestedAmountVnd: input.requestedAmountVnd,
          approvedAmountVnd: input.requestedAmountVnd,
          companyShareVnd: allocation.companyShareVnd,
          employeeShareVnd: allocation.employeeShareVnd,
          status: 'APPROVED',
          idempotencyKey: input.idempotencyKey,
          authorizedAt: new Date(),
        },
      });
    });
  }

  private async recordDecline(
    input: AuthorizeMealTransactionInput,
    corporateId: string,
    reason: string,
  ) {
    return this.prisma.mealTransaction.create({
      data: {
        walletId: input.walletId,
        corporateId,
        brandHqId: input.brandHqId,
        branchId: input.branchId,
        terminalId: input.terminalId ?? null,
        loopType: input.loopType,
        authMethod: input.authMethod,
        requestedAmountVnd: input.requestedAmountVnd,
        approvedAmountVnd: 0n,
        employeeShareVnd: 0n,
        status: 'DECLINED',
        declineReason: reason,
        idempotencyKey: input.idempotencyKey,
      },
    });
  }

  async reverse(ctx: MealCallerCtx, transactionId: string) {
    const t = await this.prisma.mealTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!t) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Transaction' }, details: { reason: 'Transaction not found' } });
    assertBrandScope(ctx, t.brandHqId);
    const brandCtx = withTargetBrand(ctx, t.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.transaction.reverse');

    if (t.status !== 'APPROVED') {
      throw new DomainError({ code: 'CANNOT_REVERSE', params: { currentStatus: t.status } });
    }
    return this.prisma.$transaction(async (db) => {
      await db.mealWallet.update({
        where: { id: t.walletId },
        data: {
          balanceVnd: { increment: t.approvedAmountVnd },
          companyAllowanceVnd: { increment: t.companyShareVnd },
          personalTopUpVnd: { increment: t.employeeShareVnd },
        },
      });
      return db.mealTransaction.update({
        where: { id: t.id },
        data: { status: 'REVERSED' },
      });
    });
  }
}
