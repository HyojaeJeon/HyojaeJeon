/**
 * 한국어: MealWalletService 단위 테스트. (P0-1)
 *   임직원 지갑 생성/충전 시 corporate scope 강제, capability/permission 강제, 트랜잭션
 *   원자성, PREPAID_DEPOSIT 잔액 검증을 다룬다.
 */
import { DomainError } from '@core/errors/domain-error';
import { MealWalletService } from './wallet.service';
import type { MealCallerCtx } from '../_internal/caller-ctx';

function ctx(overrides: Partial<MealCallerCtx> = {}): MealCallerCtx {
  return {
    userType: 'CORPORATE_ADMIN',
    userId: 'u1',
    distributorId: null,
    brandHqId: null,
    branchId: null,
    corporateId: 'corp-1',
    ...overrides,
  };
}

describe('MealWalletService', () => {
  const prisma: any = {
    mealWallet: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    mealEmployee: {
      findUnique: jest.fn(),
    },
    mealCorporate: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (tx: any) => unknown) => fn(prisma)),
  };

  const entitlement = {
    requireCapability: jest.fn(async () => undefined),
  } as unknown as import('@shared/entitlement/entitlement.service').EntitlementService;
  const permission = {
    require: jest.fn(async () => undefined),
  } as unknown as import('@core/rbac/permission.service').PermissionService;

  const service = new MealWalletService(prisma as never, entitlement, permission);

  beforeEach(() => jest.clearAllMocks());

  describe('findById — corporate scope', () => {
    it('returns wallet when caller corporate matches', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({ id: 'w1', corporateId: 'corp-1' });
      const result = await service.findById(ctx(), 'w1');
      expect(result.id).toBe('w1');
    });

    it('rejects cross-corporate read', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({ id: 'w1', corporateId: 'corp-other' });
      await expect(service.findById(ctx(), 'w1')).rejects.toBeInstanceOf(DomainError);
    });

    it('SUPER_ADMIN bypasses corporate scope', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({ id: 'w1', corporateId: 'corp-other' });
      const result = await service.findById(
        ctx({ userType: 'SUPER_ADMIN', corporateId: null }),
        'w1',
      );
      expect(result.id).toBe('w1');
    });

    it('throws RESOURCE_NOT_FOUND when missing', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue(null);
      await expect(service.findById(ctx(), 'missing')).rejects.toBeInstanceOf(DomainError);
    });
  });

  describe('create — capability + permission + scope', () => {
    it('rejects when employee belongs to another corporate', async () => {
      prisma.mealEmployee.findUnique.mockResolvedValue({
        id: 'emp-1',
        corporateId: 'corp-other',
        deletedAt: null,
      });

      await expect(
        service.create(ctx(), { employeeId: 'emp-1', dailyLimitVnd: 0n }),
      ).rejects.toBeInstanceOf(DomainError);
      expect(entitlement.requireCapability).not.toHaveBeenCalled();
    });

    it('rejects when employee is soft-deleted', async () => {
      prisma.mealEmployee.findUnique.mockResolvedValue({
        id: 'emp-1',
        corporateId: 'corp-1',
        deletedAt: new Date(),
      });

      await expect(
        service.create(ctx(), { employeeId: 'emp-1', dailyLimitVnd: 0n }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('creates wallet after passing all gates', async () => {
      prisma.mealEmployee.findUnique.mockResolvedValue({
        id: 'emp-1',
        corporateId: 'corp-1',
        deletedAt: null,
      });
      prisma.mealWallet.create.mockResolvedValue({ id: 'wallet-new' });

      const result = await service.create(ctx(), {
        employeeId: 'emp-1',
        dailyLimitVnd: 50_000n,
      });

      expect(entitlement.requireCapability).toHaveBeenCalledWith(
        expect.objectContaining({ corporateId: 'corp-1' }),
        'MEAL_TICKET',
      );
      expect(permission.require).toHaveBeenCalledWith(
        expect.objectContaining({ corporateId: 'corp-1' }),
        'corporate.wallet.write',
      );
      expect(prisma.mealWallet.create).toHaveBeenCalledWith({
        data: {
          corporateId: 'corp-1',
          employeeId: 'emp-1',
          dailyLimitVnd: 50_000n,
        },
      });
      expect(result.id).toBe('wallet-new');
    });
  });

  describe('fund — amount validation + atomic deposit deduction', () => {
    it('rejects non-positive amounts', async () => {
      await expect(
        service.fund(ctx(), { walletId: 'w1', amountVnd: 0n }),
      ).rejects.toBeInstanceOf(DomainError);
      await expect(
        service.fund(ctx(), { walletId: 'w1', amountVnd: -1n }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('rejects when wallet missing', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue(null);
      await expect(
        service.fund(ctx(), { walletId: 'w1', amountVnd: 1000n }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('rejects when caller corporate mismatches wallet corporate', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'w1',
        corporateId: 'corp-other',
        balanceVnd: 0n,
      });
      await expect(
        service.fund(ctx(), { walletId: 'w1', amountVnd: 1000n }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('throws INSUFFICIENT_DEPOSIT for PREPAID model with low balance', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'w1',
        corporateId: 'corp-1',
        balanceVnd: 0n,
      });
      prisma.mealCorporate.findUnique.mockResolvedValue({
        id: 'corp-1',
        fundingModel: 'PREPAID_DEPOSIT',
        depositBalanceVnd: 500n,
      });

      await expect(
        service.fund(ctx(), { walletId: 'w1', amountVnd: 1000n }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('atomically deducts deposit and increases wallet (PREPAID)', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'w1',
        corporateId: 'corp-1',
        balanceVnd: 100n,
      });
      prisma.mealCorporate.findUnique.mockResolvedValue({
        id: 'corp-1',
        fundingModel: 'PREPAID_DEPOSIT',
        depositBalanceVnd: 5_000n,
      });
      prisma.mealWallet.update.mockResolvedValue({ id: 'w1', balanceVnd: 1100n });

      const result = await service.fund(ctx(), { walletId: 'w1', amountVnd: 1000n });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.mealCorporate.update).toHaveBeenCalledWith({
        where: { id: 'corp-1' },
        data: { depositBalanceVnd: 4_000n },
      });
      expect(prisma.mealWallet.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { balanceVnd: 1100n },
      });
      expect(result.balanceVnd).toBe(1100n);
    });

    it('skips deposit deduction for CREDIT_NET model', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'w1',
        corporateId: 'corp-1',
        balanceVnd: 0n,
      });
      prisma.mealCorporate.findUnique.mockResolvedValue({
        id: 'corp-1',
        fundingModel: 'CREDIT_NET30',
        depositBalanceVnd: 0n,
      });
      prisma.mealWallet.update.mockResolvedValue({ id: 'w1', balanceVnd: 1000n });

      await service.fund(ctx(), { walletId: 'w1', amountVnd: 1000n });

      expect(prisma.mealCorporate.update).not.toHaveBeenCalled();
      expect(prisma.mealWallet.update).toHaveBeenCalled();
    });
  });
});
