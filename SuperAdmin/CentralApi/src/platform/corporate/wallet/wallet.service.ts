/**
 * 한국어: MealWallet Service.
 *   임직원 식권 allowance ledger 발급/조회/회사지원금/개인충전.
 *   모든 read/write 경로에서 caller 의 corporateContext 를 row 의 corporateId 와 강제 일치 검증한다.
 *   SUPER_ADMIN 만 corporate 경계를 자유롭게 넘는다.
 *
 * Tiếng Việt: Service ví điện tử nhân viên với kiểm tra scope corporate cho mọi read/write.
 */
import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { PermissionService } from '@core/rbac/permission.service';
import {
  MealCallerCtx,
  assertCorporateScope,
  withTargetCorporate,
} from '../_internal/caller-ctx';
import { CreateMealWalletInput } from './dto/create-meal-wallet.input';
import { FundMealWalletInput } from './dto/fund-meal-wallet.input';
import { TopUpMealWalletInput } from './dto/top-up-meal-wallet.input';
import { DomainError } from '@core/errors/domain-error';
import {
  COMPANY_ALLOWANCE_SOURCE_TYPE,
  PERSONAL_TOP_UP_SOURCE_TYPE,
  applyMealWalletFunding,
} from './_internal/wallet-ledger';

@Injectable()
export class MealWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly permission: PermissionService,
  ) {}

  /**
   * 한국어: corporate 경계 내에서 employee 로 wallet 조회. 다른 corporate 의 wallet 은 절대 노출하지 않는다.
   */
  async findByEmployee(ctx: MealCallerCtx, employeeId: string) {
    const wallet = await this.prisma.mealWallet.findUnique({ where: { employeeId } });
    if (!wallet) return null;
    assertCorporateScope(ctx, wallet.corporateId);
    return wallet;
  }

  async findById(ctx: MealCallerCtx, id: string) {
    const wallet = await this.prisma.mealWallet.findUnique({ where: { id } });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    assertCorporateScope(ctx, wallet.corporateId);
    return wallet;
  }

  /**
   * 한국어: corporateId 로 wallet 목록 조회.
   *   1차 방어: caller 의 corporateContext 가 요청 corporateId 와 다르면 즉시 거절 (Prisma 호출 전).
   *   2차 방어: WHERE 절에 corporateId 를 명시 — caller 가 SUPER_ADMIN 이라도 다른 corporate row 가 섞일 수 없다.
   */
  async listByCorporate(
    ctx: MealCallerCtx,
    corporateId: string,
    skip: number,
    take: number,
  ) {
    assertCorporateScope(ctx, corporateId);
    return this.prisma.mealWallet.findMany({
      where: { corporateId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 신규 wallet 발급.
   *   target employee 의 corporateId 를 lookup 하여 caller scope 검증 → capability → permission 순으로 가드.
   */
  async create(ctx: MealCallerCtx, input: CreateMealWalletInput) {
    const employee = await this.prisma.mealEmployee.findUnique({
      where: { id: input.employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Employee' }, details: { reason: 'Employee not found' } });
    }
    assertCorporateScope(ctx, employee.corporateId);

    const targetCtx = withTargetCorporate(ctx, employee.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.wallet.write');

    return this.prisma.mealWallet.create({
      data: {
        corporateId: employee.corporateId,
        employeeId: employee.id,
        dailyLimitVnd: input.dailyLimitVnd,
      },
    });
  }

  /**
   * 한국어: 회사 지원금 적립 (Funding Account → Wallet allowance bucket).
   *   1) wallet 을 lookup 하고 caller corporate 와 일치 검증.
   *   2) target corporate 기준으로 capability/permission 가드.
   *   3) 트랜잭션 내부에서 corporate 잔액 차감 + wallet 잔액 증가.
   */
  async fund(ctx: MealCallerCtx, input: FundMealWalletInput) {
    if (input.amountVnd <= 0n) {
      throw new DomainError({ code: 'INVALID_AMOUNT', details: { reason: 'amountVnd must be positive' } });
    }

    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: input.walletId },
    });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    assertCorporateScope(ctx, wallet.corporateId);

    const targetCtx = withTargetCorporate(ctx, wallet.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.wallet.fund');

    return this.prisma.$transaction(async (tx) => {
      const corp = await tx.mealCorporate.findUnique({
        where: { id: wallet.corporateId },
      });
      if (!corp) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Corporate' }, details: { reason: 'Corporate not found' } });

      // PREPAID_DEPOSIT 만 잔액에서 직접 차감. CREDIT_NET* 는 외상이므로 잔액 검증 없이 충전 허용.
      if (corp.fundingModel === 'PREPAID_DEPOSIT') {
        if (corp.depositBalanceVnd < input.amountVnd) {
          throw new DomainError({ code: 'INSUFFICIENT_DEPOSIT', params: { available: corp.depositBalanceVnd.toString(),
            requested: input.amountVnd.toString() } });
        }
        await tx.mealCorporate.update({
          where: { id: corp.id },
          data: {
            depositBalanceVnd: corp.depositBalanceVnd - input.amountVnd,
          },
        });
      }

      const nextState = applyMealWalletFunding(
        wallet,
        input.amountVnd,
        COMPANY_ALLOWANCE_SOURCE_TYPE,
      );

      const updatedWallet = await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: nextState.balanceVnd,
          companyAllowanceVnd: nextState.companyAllowanceVnd,
          personalTopUpVnd: nextState.personalTopUpVnd,
        },
      });

      await tx.mealWalletFundingEntry.create({
        data: {
          walletId: wallet.id,
          sourceType: COMPANY_ALLOWANCE_SOURCE_TYPE,
          status: 'POSTED',
          amountVnd: input.amountVnd,
          sourceBatchId: input.sourceBatchId ?? null,
          postedAt: new Date(),
        },
      });

      return updatedWallet;
    });
  }

  /**
   * 한국어: 개인 추가 충전.
   *   실제 결제 승인 이후 personal top-up bucket 으로 적립한다.
   */
  async topUp(ctx: MealCallerCtx, input: TopUpMealWalletInput) {
    if (input.amountVnd <= 0n) {
      throw new DomainError({ code: 'INVALID_AMOUNT', details: { reason: 'amountVnd must be positive' } });
    }

    const wallet = await this.prisma.mealWallet.findUnique({
      where: { id: input.walletId },
    });
    if (!wallet) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Wallet' }, details: { reason: 'Wallet not found' } });
    assertCorporateScope(ctx, wallet.corporateId);

    const targetCtx = withTargetCorporate(ctx, wallet.corporateId);
    await this.entitlement.requireCapability(targetCtx, 'MEAL_TICKET');
    await this.permission.require(targetCtx, 'corporate.wallet.topup');

    return this.prisma.$transaction(async (tx) => {
      const nextState = applyMealWalletFunding(
        wallet,
        input.amountVnd,
        PERSONAL_TOP_UP_SOURCE_TYPE,
      );

      const updatedWallet = await tx.mealWallet.update({
        where: { id: wallet.id },
        data: {
          balanceVnd: nextState.balanceVnd,
          companyAllowanceVnd: nextState.companyAllowanceVnd,
          personalTopUpVnd: nextState.personalTopUpVnd,
        },
      });

      await tx.mealWalletFundingEntry.create({
        data: {
          walletId: wallet.id,
          sourceType: PERSONAL_TOP_UP_SOURCE_TYPE,
          status: 'POSTED',
          amountVnd: input.amountVnd,
          sourceReferenceId: input.paymentReferenceId ?? null,
          postedAt: new Date(),
        },
      });

      return updatedWallet;
    });
  }

  async listFundingEntriesByWallet(
    ctx: MealCallerCtx,
    walletId: string,
    skip: number,
    take: number,
  ) {
    await this.findById(ctx, walletId);
    return this.prisma.mealWalletFundingEntry.findMany({
      where: { walletId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
