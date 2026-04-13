import { PlatformPolicyService } from './PlatformPolicy.service';

describe('PlatformPolicyService', () => {
  const prisma = {
    platformPolicy: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const auditStub = { log: jest.fn() } as unknown as import('@core/audit/Audit.service').AuditService;
  const service = new PlatformPolicyService(prisma as never, auditStub);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the first active policy found while traversing the scope hierarchy upward', async () => {
    prisma.platformPolicy.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'policy-1', scopeType: 'BRAND_HQ' });

    const result = await service.resolveEffectivePolicy('max_login_attempts', 'EDGE_POS', {
      EDGE_POS: 'edge-1',
      BRANCH: 'branch-1',
      BRAND_HQ: 'brand-1',
      REGIONAL_DISTRIBUTOR: 'dist-1',
      GLOBAL: null,
    });

    expect(result).toEqual({ id: 'policy-1', scopeType: 'BRAND_HQ' });
    expect(prisma.platformPolicy.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          policyKey: 'max_login_attempts',
          scopeType: 'EDGE_POS',
          scopeId: 'edge-1',
          isActive: true,
        },
      }),
    );
    expect(prisma.platformPolicy.findFirst).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        where: {
          policyKey: 'max_login_attempts',
          scopeType: 'BRAND_HQ',
          scopeId: 'brand-1',
          isActive: true,
        },
      }),
    );
  });

  it('creates a new version and deactivates the previous active version', async () => {
    prisma.platformPolicy.findFirst.mockResolvedValue({ id: 'prev-1', version: 2 });
    prisma.platformPolicy.update.mockResolvedValue({ id: 'prev-1', isActive: false });
    prisma.platformPolicy.create.mockResolvedValue({ id: 'next-1', version: 3, isActive: true });

    const result = await service.create({
      policyKey: 'theme',
      scopeType: 'BRAND_HQ',
      scopeId: 'brand-1',
      policyValueJson: { mode: 'light' },
    });

    expect(prisma.platformPolicy.update).toHaveBeenCalledWith({
      where: { id: 'prev-1' },
      data: { isActive: false },
    });
    expect(prisma.platformPolicy.create).toHaveBeenCalledWith({
      data: {
        policyKey: 'theme',
        scopeType: 'BRAND_HQ',
        scopeId: 'brand-1',
        policyValueJson: { mode: 'light' },
        version: 3,
        isActive: true,
      },
    });
    expect(result).toEqual({ id: 'next-1', version: 3, isActive: true });
  });
});
