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
import { DomainError } from '@core/errors/DomainError';
import { PermissionService } from './Permission.service';

describe('PermissionService', () => {
  const prisma: any = {
    superAdminUser: { findFirst: jest.fn() },
    distributorUser: { findFirst: jest.fn() },
    brandAdminUser: { findFirst: jest.fn() },
    corporateAdminUser: { findFirst: jest.fn() },
    userRoleAssignment: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), count: jest.fn() },
    role: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    rolePermission: { findMany: jest.fn(), count: jest.fn() },
    permission: { create: jest.fn(), update: jest.fn(), delete: jest.fn(), findUnique: jest.fn() },
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

  describe('assignRole scope axis validation', () => {
    beforeEach(() => {
      prisma.role.findUnique.mockReset?.();
      prisma.userRoleAssignment.findFirst = jest.fn().mockResolvedValue(null);
      prisma.userRoleAssignment.create = jest.fn().mockResolvedValue({ id: 'a-1' });
    });

    it('rejects CORPORATE role assigned with scopeBrandHqId (axis mismatch)', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 'r-1', roleCode: 'corp-admin', scope: 'CORPORATE' });
      await expect(
        service.assignRole(
          { userType: 'SUPER_ADMIN', userId: 'admin-1' },
          {
            userType: 'CORPORATE_ADMIN',
            userId: 'u-1',
            roleCode: 'corp-admin',
            scopeBrandHqId: 'brand-1',
          },
        ),
      ).rejects.toMatchObject({ code: 'SCOPE_AXIS_MISMATCH' });
    });

    it('rejects BRAND_HQ role assigned with no scope axis (PLATFORM) ', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 'r-2', roleCode: 'brand-admin', scope: 'BRAND_HQ' });
      await expect(
        service.assignRole(
          { userType: 'SUPER_ADMIN', userId: 'admin-1' },
          { userType: 'BRAND_ADMIN', userId: 'u-1', roleCode: 'brand-admin' },
        ),
      ).rejects.toMatchObject({ code: 'SCOPE_AXIS_MISMATCH' });
    });

    it('accepts BRAND_HQ role assigned with scopeBrandHqId', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 'r-2', roleCode: 'brand-admin', scope: 'BRAND_HQ' });
      await expect(
        service.assignRole(
          { userType: 'SUPER_ADMIN', userId: 'admin-1' },
          {
            userType: 'BRAND_ADMIN',
            userId: 'u-1',
            roleCode: 'brand-admin',
            scopeBrandHqId: 'brand-1',
          },
        ),
      ).resolves.toEqual({ id: 'a-1' });
    });
  });

  describe('getRolePermissionsMatrix', () => {
    it('returns only pairs whose role.scope matches the given scope', async () => {
      const rows = [
        { roleId: 'r-platform-1', permissionId: 'p-1' },
        { roleId: 'r-platform-1', permissionId: 'p-2' },
      ];
      prisma.rolePermission.findMany.mockResolvedValue(rows);

      const result = await service.getRolePermissionsMatrix('PLATFORM');

      expect(result).toEqual(rows);
      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { role: { scope: 'PLATFORM' } },
        select: { roleId: true, permissionId: true },
      });
    });

    it('returns empty array when no pairs exist for scope', async () => {
      prisma.rolePermission.findMany.mockResolvedValue([]);
      const result = await service.getRolePermissionsMatrix('CORPORATE');
      expect(result).toEqual([]);
    });
  });

  describe('multilingual CRUD (Slice B)', () => {
    const actor = { userType: 'SUPER_ADMIN', userId: 'admin-1' };

    it('createPermission writes multilingual fields and AuditLog', async () => {
      const created = {
        id: 'p-new',
        permissionKey: 'brand.menu.read',
        domain: 'brand',
        name: 'Đọc menu',
        nameKo: '메뉴 조회',
        nameEn: 'Read menu',
        description: 'desc-vi',
        descriptionKo: 'desc-ko',
        descriptionEn: 'desc-en',
        isSystem: false,
      };
      prisma.permission.create.mockResolvedValue(created);

      const result = await service.createPermission(actor, {
        permissionKey: 'brand.menu.read',
        domain: 'brand',
        name: 'Đọc menu',
        nameKo: '메뉴 조회',
        nameEn: 'Read menu',
        description: 'desc-vi',
        descriptionKo: 'desc-ko',
        descriptionEn: 'desc-en',
      });

      expect(result).toEqual(created);
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          permissionKey: 'brand.menu.read',
          domain: 'brand',
          name: 'Đọc menu',
          nameKo: '메뉴 조회',
          nameEn: 'Read menu',
          description: 'desc-vi',
          descriptionKo: 'desc-ko',
          descriptionEn: 'desc-en',
          isSystem: false,
        }),
      });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'RBAC_PERMISSION_CREATE',
          targetType: 'Permission',
          targetId: 'p-new',
          afterDataJson: expect.objectContaining({ nameKo: '메뉴 조회' }),
        }),
      );
    });

    it('deletePermission rejects isSystem=true with SYSTEM_PERMISSION_READONLY', async () => {
      prisma.permission.findUnique.mockResolvedValue({
        id: 'p-sys',
        permissionKey: 'platform.rbac.write',
        isSystem: true,
      });
      await expect(service.deletePermission(actor, 'p-sys')).rejects.toMatchObject({
        code: 'SYSTEM_PERMISSION_READONLY',
      });
      expect(prisma.permission.delete).not.toHaveBeenCalled();
    });

    it('deleteRole rejects isSystem=true with SYSTEM_ROLE_READONLY', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'r-sys',
        roleCode: 'PLATFORM_SUPER_ADMIN',
        isSystem: true,
      });
      await expect(service.deleteRole(actor, 'r-sys')).rejects.toMatchObject({
        code: 'SYSTEM_ROLE_READONLY',
      });
    });

    it('updateRole partial multilingual update (nameKo only) writes only that field', async () => {
      prisma.role.findUnique.mockResolvedValue({
        id: 'r-1',
        roleCode: 'BRAND_OPS',
        roleName: 'Brand Ops',
        scope: 'BRAND_HQ',
        isSystem: false,
      });
      prisma.userRoleAssignment.findMany.mockResolvedValue([]);
      prisma.role.update.mockResolvedValue({
        id: 'r-1',
        roleCode: 'BRAND_OPS',
        roleName: 'Brand Ops',
        nameKo: '브랜드 운영',
        scope: 'BRAND_HQ',
        isSystem: false,
      });

      await service.updateRole(actor, 'r-1', { roleNameKo: '브랜드 운영' });

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        data: { roleNameKo: '브랜드 운영' },
      });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ actionType: 'RBAC_ROLE_UPDATE', targetType: 'Role' }),
      );
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
