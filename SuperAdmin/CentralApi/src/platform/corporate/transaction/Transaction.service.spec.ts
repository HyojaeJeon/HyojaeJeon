/**
 * 한국어: MealTransactionService 단위 테스트. (P0-1)
 *   결제 승인 핵심 경로의 scope 강제, idempotency, 트랜잭션 원자성, 정책 평가, 잔액 검증을
 *   각각의 happy/unhappy path 로 검증한다. Prisma · entitlement · permission · policy 는 mock.
 */
import { DomainError } from '@core/errors/DomainError';
import { MealTransactionService } from './Transaction.service';
import type { MealCallerCtx } from '../_internal/callerCtx';

function makeCtx(overrides: Partial<MealCallerCtx> = {}): MealCallerCtx {
  return {
    userType: 'BRAND_ADMIN',
    userId: 'user-1',
    distributorId: null,
    brandHqId: 'brand-1',
    branchId: null,
    corporateId: null,
    ...overrides,
  };
}

function makeInput(overrides: Partial<Parameters<MealTransactionService['authorize']>[1]> = {}) {
  return {
    walletId: 'wallet-1',
    brandHqId: 'brand-1',
    branchId: 'branch-1',
    terminalId: 'term-1',
    loopType: 'OPEN_LOOP' as const,
    authMethod: 'APP_QR' as const,
    requestedAmountVnd: 10_000n,
    idempotencyKey: 'idem-1',
    ...overrides,
  };
}

describe('MealTransactionService', () => {
  // jest mock 객체를 any 로 명시해 self-reference 타입 문제를 회피한다 (테스트 한정).
  const prisma: any = {
    mealTransaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    mealWallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mealMerchantEnrollment: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (tx: any) => unknown) => fn(prisma)),
  };

  const entitlement = {
    requireCapability: jest.fn(async () => undefined),
  } as unknown as import('@shared/entitlement/Entitlement.service').EntitlementService;
  const permission = {
    require: jest.fn(async () => undefined),
    has: jest.fn(async () => true),
  } as unknown as import('@core/rbac/Permission.service').PermissionService;
  const policy = {
    evaluateForEmployee: jest.fn(async () => null),
  } as unknown as import('../policy/Policy.service').MealPolicyService;

  const service = new MealTransactionService(
    prisma as never,
    entitlement,
    permission,
    policy,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById — scope enforcement', () => {
    it('SUPER_ADMIN can read transaction across tenants', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue({
        id: 't1',
        corporateId: 'corp-x',
        brandHqId: 'brand-x',
      });

      const result = await service.findById(
        makeCtx({ userType: 'SUPER_ADMIN', brandHqId: null }),
        't1',
      );

      expect(result?.id).toBe('t1');
    });

    it('CORPORATE_ADMIN cannot read another corporate', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue({
        id: 't1',
        corporateId: 'corp-other',
        brandHqId: 'brand-1',
      });

      await expect(
        service.findById(
          makeCtx({ userType: 'CORPORATE_ADMIN', corporateId: 'corp-mine', brandHqId: null }),
          't1',
        ),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('BRAND_ADMIN cannot read another brand', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue({
        id: 't1',
        corporateId: 'corp-1',
        brandHqId: 'brand-other',
      });

      await expect(
        service.findById(makeCtx({ userType: 'BRAND_ADMIN', brandHqId: 'brand-mine' }), 't1'),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('returns NOT_FOUND when row missing', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue(null);
      await expect(service.findById(makeCtx(), 'missing')).rejects.toBeInstanceOf(DomainError);
    });
  });

  describe('authorize — capability + permission', () => {
    it('rejects caller from different brand before any DB read', async () => {
      await expect(
        service.authorize(
          makeCtx({ brandHqId: 'brand-mine' }),
          makeInput({ brandHqId: 'brand-other' }),
        ),
      ).rejects.toBeInstanceOf(DomainError);
      expect(prisma.mealTransaction.findUnique).not.toHaveBeenCalled();
    });

    it('checks MEAL_TICKET capability + corporate.transaction.authorize permission', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue(null);
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 100_000n,
        companyAllowanceVnd: 100_000n,
        personalTopUpVnd: 0n,
        status: 'ACTIVE',
      });
      prisma.mealMerchantEnrollment.findUnique.mockResolvedValue({ isActive: true });
      prisma.mealTransaction.create.mockResolvedValue({ id: 't-new', status: 'APPROVED' });

      await service.authorize(makeCtx(), makeInput());

      expect(entitlement.requireCapability).toHaveBeenCalledWith(
        expect.objectContaining({ brandHqId: 'brand-1' }),
        'MEAL_TICKET',
      );
      expect(permission.require).toHaveBeenCalledWith(
        expect.objectContaining({ brandHqId: 'brand-1' }),
        'corporate.transaction.authorize',
      );
    });
  });

  describe('authorize — idempotency', () => {
    it('returns existing transaction without DB writes', async () => {
      const existing = { id: 't-existing', status: 'APPROVED' };
      prisma.mealTransaction.findUnique.mockResolvedValue(existing);

      const result = await service.authorize(makeCtx(), makeInput({ idempotencyKey: 'idem-existing' }));

      expect(result).toBe(existing);
      expect(prisma.mealWallet.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('authorize — wallet & merchant gates', () => {
    beforeEach(() => {
      prisma.mealTransaction.findUnique.mockResolvedValue(null);
    });

    it('throws NOT_FOUND when wallet missing', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue(null);
      await expect(service.authorize(makeCtx(), makeInput())).rejects.toBeInstanceOf(DomainError);
    });

    it('declines when wallet is not ACTIVE', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 100_000n,
        companyAllowanceVnd: 100_000n,
        personalTopUpVnd: 0n,
        status: 'SUSPENDED',
      });
      prisma.mealTransaction.create.mockResolvedValue({ id: 't-decline', status: 'DECLINED' });

      const result = await service.authorize(makeCtx(), makeInput());

      expect(result.status).toBe('DECLINED');
      expect(prisma.mealTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ declineReason: 'EMPLOYEE_INACTIVE' }),
        }),
      );
    });

    it('declines when merchant enrollment is inactive', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 100_000n,
        companyAllowanceVnd: 100_000n,
        personalTopUpVnd: 0n,
        status: 'ACTIVE',
      });
      prisma.mealMerchantEnrollment.findUnique.mockResolvedValue({ isActive: false });
      prisma.mealTransaction.create.mockResolvedValue({ id: 't-decline', status: 'DECLINED' });

      const result = await service.authorize(makeCtx(), makeInput());

      expect(result.status).toBe('DECLINED');
      expect(prisma.mealTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ declineReason: 'MERCHANT_INACTIVE' }),
        }),
      );
    });
  });

  describe('authorize — policy & limit', () => {
    beforeEach(() => {
      prisma.mealTransaction.findUnique.mockResolvedValue(null);
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 100_000n,
        companyAllowanceVnd: 100_000n,
        personalTopUpVnd: 0n,
        status: 'ACTIVE',
      });
      prisma.mealMerchantEnrollment.findUnique.mockResolvedValue({ isActive: true });
    });

    it('declines when amount exceeds maxPerTransaction', async () => {
      (policy.evaluateForEmployee as jest.Mock).mockResolvedValue({
        maxPerTransactionVnd: 5_000n,
        dailyLimitVnd: 0n,
      });
      prisma.mealTransaction.create.mockResolvedValue({ status: 'DECLINED' });

      const result = await service.authorize(makeCtx(), makeInput({ requestedAmountVnd: 10_000n }));

      expect(result.status).toBe('DECLINED');
      expect(prisma.mealTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ declineReason: 'OUT_OF_POLICY_WINDOW' }),
        }),
      );
    });

    it('declines when daily limit would be exceeded', async () => {
      (policy.evaluateForEmployee as jest.Mock).mockResolvedValue({
        maxPerTransactionVnd: 0n,
        dailyLimitVnd: 50_000n,
      });
      prisma.mealTransaction.aggregate.mockResolvedValue({
        _sum: { approvedAmountVnd: 45_000n },
      });
      prisma.mealTransaction.create.mockResolvedValue({ status: 'DECLINED' });

      const result = await service.authorize(makeCtx(), makeInput({ requestedAmountVnd: 10_000n }));

      expect(result.status).toBe('DECLINED');
      expect(prisma.mealTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ declineReason: 'DAILY_LIMIT_EXCEEDED' }),
        }),
      );
    });
  });

  describe('authorize — atomic balance deduction', () => {
    beforeEach(() => {
      prisma.mealTransaction.findUnique.mockResolvedValue(null);
      prisma.mealMerchantEnrollment.findUnique.mockResolvedValue({ isActive: true });
      // 이전 테스트 mock 누수 방지
      (policy.evaluateForEmployee as jest.Mock).mockResolvedValue(null);
      prisma.mealTransaction.aggregate.mockResolvedValue({ _sum: { approvedAmountVnd: 0n } });
    });

    it('throws INSUFFICIENT_BALANCE when wallet balance is too low (fresh read inside tx)', async () => {
      // 첫 호출(외부 lookup)도 잔액이 부족 → fresh read 또한 부족 → DomainError
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 5_000n,
        companyAllowanceVnd: 5_000n,
        personalTopUpVnd: 0n,
        status: 'ACTIVE',
      });

      await expect(
        service.authorize(makeCtx(), makeInput({ requestedAmountVnd: 10_000n })),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('approves and deducts balance atomically', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 100_000n,
        companyAllowanceVnd: 100_000n,
        personalTopUpVnd: 0n,
        status: 'ACTIVE',
      });
      prisma.mealTransaction.create.mockResolvedValue({ id: 't-new', status: 'APPROVED' });

      await service.authorize(makeCtx(), makeInput({ requestedAmountVnd: 10_000n }));

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.mealWallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'wallet-1' },
          data: {
            balanceVnd: 90_000n,
            companyAllowanceVnd: 90_000n,
            personalTopUpVnd: 0n,
          },
        }),
      );
      expect(prisma.mealTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedAmountVnd: 10_000n,
            companyShareVnd: 10_000n,
            employeeShareVnd: 0n,
          }),
        }),
      );
    });

    it('approves split payment using company allowance + personal top-up', async () => {
      prisma.mealWallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        corporateId: 'corp-1',
        employeeId: 'emp-1',
        balanceVnd: 100_000n,
        companyAllowanceVnd: 70_000n,
        personalTopUpVnd: 30_000n,
        status: 'ACTIVE',
      });
      (policy.evaluateForEmployee as jest.Mock).mockResolvedValue({
        policyId: 'policy-split',
        dailyLimitVnd: 0n,
        maxPerTransactionVnd: 0n,
        allowSplitPayment: true,
      });
      prisma.mealTransaction.create.mockResolvedValue({ id: 't-split', status: 'APPROVED' });

      await service.authorize(makeCtx(), makeInput({ requestedAmountVnd: 100_000n }));

      expect(prisma.mealWallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'wallet-1' },
          data: {
            balanceVnd: 0n,
            companyAllowanceVnd: 0n,
            personalTopUpVnd: 0n,
          },
        }),
      );
      expect(prisma.mealTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedAmountVnd: 100_000n,
            companyShareVnd: 70_000n,
            employeeShareVnd: 30_000n,
          }),
        }),
      );
    });
  });

  describe('reverse', () => {
    it('rejects reversal of non-APPROVED transaction', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue({
        id: 't1',
        brandHqId: 'brand-1',
        walletId: 'wallet-1',
        approvedAmountVnd: 10_000n,
        companyShareVnd: 10_000n,
        employeeShareVnd: 0n,
        status: 'DECLINED',
      });

      await expect(service.reverse(makeCtx(), 't1')).rejects.toBeInstanceOf(DomainError);
    });

    it('refunds wallet and updates status atomically', async () => {
      prisma.mealTransaction.findUnique.mockResolvedValue({
        id: 't1',
        brandHqId: 'brand-1',
        walletId: 'wallet-1',
        approvedAmountVnd: 10_000n,
        companyShareVnd: 10_000n,
        employeeShareVnd: 0n,
        status: 'APPROVED',
      });
      prisma.mealTransaction.update.mockResolvedValue({ id: 't1', status: 'REVERSED' });

      const result = await service.reverse(makeCtx(), 't1');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.mealWallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'wallet-1' },
          data: {
            balanceVnd: { increment: 10_000n },
            companyAllowanceVnd: { increment: 10_000n },
            personalTopUpVnd: { increment: 0n },
          },
        }),
      );
      expect(result.status).toBe('REVERSED');
    });
  });
});
