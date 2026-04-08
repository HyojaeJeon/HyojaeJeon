import { DomainError } from '@core/errors/domain-error';
import { BrandService } from './brand.service';

describe('BrandService', () => {
  const prisma = {
    brandProfile: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    distributorProfile: {
      findFirst: jest.fn(),
    },
  };

  const permissionStub = { require: jest.fn(async () => undefined), has: jest.fn(async () => true) } as unknown as import('@core/rbac/permission.service').PermissionService;
  const entitlementStub = { requireCapability: jest.fn(async () => undefined) } as unknown as import('@shared/entitlement/entitlement.service').EntitlementService;
  const service = new BrandService(prisma as never, permissionStub, entitlementStub);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('injects distributor scope into brand list queries', async () => {
    prisma.brandProfile.findMany.mockResolvedValue([]);

    await service.findAll(0, 20, {
      sub: 'u1',
      loginId: 'dist-admin',
      userType: 'DISTRIBUTOR_USER',
      tenantContext: { distributorId: 'dist-1' },
    });

    expect(prisma.brandProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ deletedAt: null }, { distributorId: 'dist-1' }],
        },
      }),
    );
  });

  it('rejects brand creation when distributor is outside caller scope', async () => {
    prisma.distributorProfile.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          distributorId: 'dist-2',
          brandCode: 'BR-001',
          brandName: 'Forbidden Brand',
          countryCode: 'VN',
          defaultLanguageCode: 'vi-VN',
        },
        {
          sub: 'u1',
          loginId: 'dist-admin',
          userType: 'DISTRIBUTOR_USER',
          tenantContext: { distributorId: 'dist-1' },
        },
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
