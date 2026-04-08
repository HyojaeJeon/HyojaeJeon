/**
 * 한국어: PermissionService 단위 테스트. (P0-1)
 *   getEffectivePermissions / has / require / invalidate 의 핵심 동작:
 *     - 비활성 계정은 빈 권한 집합
 *     - 글로벌 assignment (scope null) 는 항상 적용
 *     - scope assignment 는 ctx 와 일치할 때만 적용
 *     - 만료/회수된 assignment 는 prisma where 로 필터
 *     - require() 는 PERMISSION_DENIED 발생
 *     - invalidate() 가 RBAC + tenantContext 캐시 둘 다 제거 (P0-5)
 */
import { DomainError } from '@core/errors/domain-error';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  const prisma: any = {
    superAdminUser: { findFirst: jest.fn() },
    distributorUser: { findFirst: jest.fn() },
    brandAdminUser: { findFirst: jest.fn() },
    corporateAdminUser: { findFirst: jest.fn() },
    userRoleAssignment: { findMany: jest.fn() },
    role: { findUnique: jest.fn() },
  };

  const audit: any = { log: jest.fn(async () => undefined) };

  // CacheService 는 직접 통과 (loader 를 즉시 실행) 형태로 mock.
  const cache: any = {
    rememberJson: jest.fn(async (_descriptor: unknown, loader: () => Promise<unknown>) => loader()),
    invalidateIndex: jest.fn(async () => undefined),
    get: jest.fn(),
    set: jest.fn(),
  };

  const tenantContext: any = {
    invalidate: jest.fn(async () => undefined),
  };

  const service = new PermissionService(prisma, audit, cache, tenantContext);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function activeAccount() {
    prisma.superAdminUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.brandAdminUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.distributorUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.corporateAdminUser.findFirst.mockResolvedValue({ id: 'u1' });
  }

  describe('getEffectivePermissions', () => {
    it('returns empty set when account is not ACTIVE', async () => {
      prisma.brandAdminUser.findFirst.mockResolvedValue(null);
      const set = await service.getEffectivePermissions({
        userType: 'BRAND_ADMIN',
        userId: 'u1',
      } as any);
      expect(set.size).toBe(0);
      expect(prisma.userRoleAssignment.findMany).not.toHaveBeenCalled();
    });

    it('aggregates global (scope null) assignments', async () => {
      activeAccount();
      prisma.userRoleAssignment.findMany.mockResolvedValue([
        {
          scopeDistributorId: null,
          scopeBrandHqId: null,
          scopeBranchId: null,
          scopeCorporateId: null,
          role: {
            rolePermissions: [
              { permission: { permissionKey: 'brand.profile.read' } },
              { permission: { permissionKey: 'brand.profile.write' } },
            ],
          },
        },
      ]);

      const set = await service.getEffectivePermissions({
        userType: 'BRAND_ADMIN',
        userId: 'u1',
        brandHqId: 'brand-1',
      } as any);

      expect(set.has('brand.profile.read')).toBe(true);
      expect(set.has('brand.profile.write')).toBe(true);
    });

    it('filters out scope assignments that do not match ctx', async () => {
      activeAccount();
      prisma.userRoleAssignment.findMany.mockResolvedValue([
        {
          scopeBrandHqId: 'brand-1',
          role: { rolePermissions: [{ permission: { permissionKey: 'brand.profile.read' } }] },
        },
        {
          scopeBrandHqId: 'brand-other',
          role: { rolePermissions: [{ permission: { permissionKey: 'brand.profile.write' } }] },
        },
      ]);

      const set = await service.getEffectivePermissions({
        userType: 'BRAND_ADMIN',
        userId: 'u1',
        brandHqId: 'brand-1',
      } as any);

      expect(set.has('brand.profile.read')).toBe(true);
      expect(set.has('brand.profile.write')).toBe(false);
    });

    it('respects all 4 scope axes simultaneously', async () => {
      activeAccount();
      prisma.userRoleAssignment.findMany.mockResolvedValue([
        {
          scopeDistributorId: 'dist-1',
          scopeBrandHqId: 'brand-1',
          scopeBranchId: 'branch-1',
          scopeCorporateId: null,
          role: { rolePermissions: [{ permission: { permissionKey: 'pos.read' } }] },
        },
      ]);

      // 정확한 4 축 매치
      const ok = await service.getEffectivePermissions({
        userType: 'BRAND_ADMIN',
        userId: 'u1',
        distributorId: 'dist-1',
        brandHqId: 'brand-1',
        branchId: 'branch-1',
      } as any);
      expect(ok.has('pos.read')).toBe(true);

      // branch 가 다르면 거절
      const wrongBranch = await service.getEffectivePermissions({
        userType: 'BRAND_ADMIN',
        userId: 'u1',
        distributorId: 'dist-1',
        brandHqId: 'brand-1',
        branchId: 'branch-other',
      } as any);
      expect(wrongBranch.has('pos.read')).toBe(false);
    });

    it('passes status=ACTIVE and expiresAt filter to prisma findMany', async () => {
      activeAccount();
      prisma.userRoleAssignment.findMany.mockResolvedValue([]);

      await service.getEffectivePermissions({
        userType: 'BRAND_ADMIN',
        userId: 'u1',
      } as any);

      expect(prisma.userRoleAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
            OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
          }),
        }),
      );
    });
  });

  describe('has & require', () => {
    it('require() throws PERMISSION_DENIED for missing key', async () => {
      activeAccount();
      prisma.userRoleAssignment.findMany.mockResolvedValue([]);

      await expect(
        service.require({ userType: 'BRAND_ADMIN', userId: 'u1' } as any, 'brand.profile.write'),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('require() succeeds when key present', async () => {
      activeAccount();
      prisma.userRoleAssignment.findMany.mockResolvedValue([
        {
          scopeBrandHqId: null,
          role: { rolePermissions: [{ permission: { permissionKey: 'brand.profile.write' } }] },
        },
      ]);

      await expect(
        service.require({ userType: 'BRAND_ADMIN', userId: 'u1' } as any, 'brand.profile.write'),
      ).resolves.toBeUndefined();
    });
  });

  describe('invalidate (P0-5 tenantContext linkage)', () => {
    it('invalidates RBAC index AND tenantContext together', async () => {
      await service.invalidate('BRAND_ADMIN', 'u1');

      expect(cache.invalidateIndex).toHaveBeenCalledWith(
        expect.stringContaining('rbac:perms:index:BRAND_ADMIN:u1'),
      );
      expect(tenantContext.invalidate).toHaveBeenCalledWith('BRAND_ADMIN', 'u1');
    });

    it('skips tenantContext invalidation for unknown userType', async () => {
      await service.invalidate('UNKNOWN_TYPE', 'u1');

      expect(cache.invalidateIndex).toHaveBeenCalled();
      expect(tenantContext.invalidate).not.toHaveBeenCalled();
    });
  });
});
