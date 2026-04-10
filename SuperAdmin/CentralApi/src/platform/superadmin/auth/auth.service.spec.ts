/**
 * 한국어: AuthService 의 관리자 전용 계정 액션 단위 테스트.
 *   - suspendAccount: 상태 전환, 감사 로그, cross-tenant 방어, 비밀번호 노출 금지.
 *   - resetAccountPassword: 비밀번호 해시 교체, 최소 길이 검증, 감사 로그에 해시/평문 미포함.
 *
 * Tiếng Việt: Unit test cho AuthService — suspendAccount và resetAccountPassword.
 */
import { AuthService } from './auth.service';
import { DomainError } from '@core/errors/domain-error';

describe('AuthService - admin account actions', () => {
  const prisma: any = {
    superAdminUser: { findFirst: jest.fn(), update: jest.fn() },
    distributorUser: { findFirst: jest.fn(), update: jest.fn() },
    brandAdminUser: { findFirst: jest.fn(), update: jest.fn() },
    corporateAdminUser: { findFirst: jest.fn(), update: jest.fn() },
    userRoleAssignment: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const jwt: any = { signAsync: jest.fn() };
  const config: any = { get: jest.fn() };
  const redis: any = {};
  const permission: any = { invalidate: jest.fn(async () => undefined), getEffectivePermissions: jest.fn(async () => new Set<string>()) };
  const tenantContextService: any = { invalidate: jest.fn(async () => undefined) };
  const audit: any = { log: jest.fn(async () => undefined) };
  const platformPolicy: any = { getNumber: jest.fn() };

  const service = new AuthService(prisma, jwt, config, redis, permission, tenantContextService, audit, platformPolicy);

  const superActor = {
    userType: 'SUPER_ADMIN' as const,
    userId: 'admin-1',
    tenantContext: {},
  };

  function baseAccountRow(overrides: Record<string, unknown> = {}) {
    return {
      id: 'u-1',
      loginId: 'bob',
      passwordHash: 'HASH_SECRET',
      displayName: 'Bob',
      email: null,
      phone: null,
      status: 'ACTIVE',
      lastLoginAt: null,
      passwordChangedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      distributorId: null,
      brandHQId: null,
      corporateId: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.userRoleAssignment.findMany.mockResolvedValue([]);
  });

  describe('suspendAccount', () => {
    it('ACTIVE → SUSPENDED 상태 전이 + AuditLog 1건', async () => {
      const before = baseAccountRow({ status: 'ACTIVE' });
      prisma.superAdminUser.findFirst.mockResolvedValue(before);
      prisma.superAdminUser.update.mockResolvedValue({ ...before, status: 'SUSPENDED' });

      await service.suspendAccount('SUPER_ADMIN', 'u-1', 'SUSPENDED', 'policy-violation', superActor);

      expect(prisma.superAdminUser.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { status: 'SUSPENDED' },
      });
      expect(audit.log).toHaveBeenCalledTimes(1);
      const payload = audit.log.mock.calls[0][0];
      expect(payload.actionType).toBe('USER_SUSPEND');
      expect(payload.targetType).toBe('SuperAdminUser');
      expect(payload.beforeDataJson).toEqual({ status: 'ACTIVE', reason: 'policy-violation' });
      expect(payload.afterDataJson).toEqual({ status: 'SUSPENDED', reason: 'policy-violation' });
      // 감사 로그에 passwordHash 가 들어가면 안 된다.
      expect(JSON.stringify(payload)).not.toContain('HASH_SECRET');
    });

    it('존재하지 않는 userId → USER_NOT_FOUND', async () => {
      prisma.superAdminUser.findFirst.mockResolvedValue(null);
      await expect(
        service.suspendAccount('SUPER_ADMIN', 'missing', 'SUSPENDED', null, superActor),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('cross-tenant actor → CROSS_TENANT_ACCESS_DENIED', async () => {
      const before = baseAccountRow({ brandHQId: 'brand-A' });
      prisma.brandAdminUser.findFirst.mockResolvedValue(before);

      const otherBrandActor = {
        userType: 'BRAND_ADMIN' as const,
        userId: 'admin-other',
        tenantContext: { brandHQId: 'brand-B' },
      };

      await expect(
        service.suspendAccount('BRAND_ADMIN', 'u-1', 'SUSPENDED', null, otherBrandActor),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('AuditLog targetType 은 4개 PascalCase 모델명 중 하나', async () => {
      const pairs: Array<[any, string, string]> = [
        ['SUPER_ADMIN', 'superAdminUser', 'SuperAdminUser'],
        ['DISTRIBUTOR_USER', 'distributorUser', 'DistributorUser'],
        ['BRAND_ADMIN', 'brandAdminUser', 'BrandAdminUser'],
        ['CORPORATE_ADMIN', 'corporateAdminUser', 'CorporateAdminUser'],
      ];
      for (const [userType, prismaKey, expectedTarget] of pairs) {
        jest.clearAllMocks();
        const row = baseAccountRow({ status: 'ACTIVE' });
        (prisma as any)[prismaKey].findFirst.mockResolvedValue(row);
        (prisma as any)[prismaKey].update.mockResolvedValue({ ...row, status: 'SUSPENDED' });
        await service.suspendAccount(userType, 'u-1', 'SUSPENDED', null, superActor);
        expect(audit.log.mock.calls[0][0].targetType).toBe(expectedTarget);
      }
    });
  });

  describe('resetAccountPassword', () => {
    it('정상: 해시 갱신 + AuditLog 1건 (평문/해시 미포함)', async () => {
      const before = baseAccountRow();
      prisma.superAdminUser.findFirst.mockResolvedValue(before);
      prisma.superAdminUser.update.mockResolvedValue(before);

      await service.resetAccountPassword('SUPER_ADMIN', 'u-1', 'SuperSecret123', superActor);

      expect(prisma.superAdminUser.update).toHaveBeenCalledTimes(1);
      const updateArg = prisma.superAdminUser.update.mock.calls[0][0];
      expect(updateArg.data.passwordHash).toBeDefined();
      expect(updateArg.data.passwordHash).not.toBe('SuperSecret123');
      expect(updateArg.data.passwordChangedAt).toBeInstanceOf(Date);

      expect(audit.log).toHaveBeenCalledTimes(1);
      const payload = audit.log.mock.calls[0][0];
      expect(payload.actionType).toBe('USER_PASSWORD_RESET');
      expect(payload.targetType).toBe('SuperAdminUser');
      const serialized = JSON.stringify(payload);
      expect(serialized).not.toContain('SuperSecret123');
      expect(serialized).not.toContain('HASH_SECRET');
      expect(serialized).not.toContain('passwordHash');
    });

    it('8자 미만 비밀번호 → VALIDATION_ERROR', async () => {
      prisma.superAdminUser.findFirst.mockResolvedValue(baseAccountRow());
      await expect(
        service.resetAccountPassword('SUPER_ADMIN', 'u-1', 'short', superActor),
      ).rejects.toBeInstanceOf(DomainError);
      expect(prisma.superAdminUser.update).not.toHaveBeenCalled();
    });

    it('존재하지 않는 userId → USER_NOT_FOUND', async () => {
      prisma.superAdminUser.findFirst.mockResolvedValue(null);
      await expect(
        service.resetAccountPassword('SUPER_ADMIN', 'missing', 'SuperSecret123', superActor),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('cross-tenant actor → CROSS_TENANT_ACCESS_DENIED', async () => {
      const before = baseAccountRow({ corporateId: 'corp-A' });
      prisma.corporateAdminUser.findFirst.mockResolvedValue(before);

      const otherCorpActor = {
        userType: 'CORPORATE_ADMIN' as const,
        userId: 'admin-other',
        tenantContext: { corporateId: 'corp-B' },
      };
      await expect(
        service.resetAccountPassword('CORPORATE_ADMIN', 'u-1', 'SuperSecret123', otherCorpActor),
      ).rejects.toBeInstanceOf(DomainError);
      expect(prisma.corporateAdminUser.update).not.toHaveBeenCalled();
    });
  });
});
