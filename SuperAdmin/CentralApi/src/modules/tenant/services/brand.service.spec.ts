import { ForbiddenException } from '@nestjs/common';
import { BrandService } from './brand.service';
import { RoleCode } from '../../auth/constants/roles.constant';

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

  const service = new BrandService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('injects distributor scope into brand list queries', async () => {
    prisma.brandProfile.findMany.mockResolvedValue([]);

    await service.findAll(0, 20, {
      sub: 'u1',
      loginId: 'dist-admin',
      roleCode: RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
      userType: 'ChannelUser',
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
          roleCode: RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
          userType: 'ChannelUser',
          tenantContext: { distributorId: 'dist-1' },
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
