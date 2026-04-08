import { AuditService } from './audit.service';

describe('AuditService', () => {
  const prisma = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  const service = new AuditService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses keyset pagination for findKeysetPage and returns plain POJO result', async () => {
    prisma.auditLog.findMany.mockResolvedValue([
      { id: 'log-3', createdAt: new Date('2026-04-04T03:00:00.000Z') },
      { id: 'log-2', createdAt: new Date('2026-04-04T02:00:00.000Z') },
      { id: 'log-1', createdAt: new Date('2026-04-04T01:00:00.000Z') },
    ]);
    prisma.auditLog.count.mockResolvedValue(12);

    const result = await service.findKeysetPage({
      actorType: 'SYSTEM',
      first: 2,
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 3,
        where: { actorType: 'SYSTEM' },
      }),
    );
    expect(result.nodes).toHaveLength(2);
    expect(result.hasNextPage).toBe(true);
    expect(result.totalCount).toBe(12);
  });

  it('applies after cursor (createdAt + id) as a compound keyset filter', async () => {
    prisma.auditLog.findMany.mockResolvedValue([]);
    prisma.auditLog.count.mockResolvedValue(0);

    await service.findKeysetPage({
      first: 50,
      afterCreatedAt: new Date('2026-04-04T03:00:00.000Z'),
      afterId: 'log-3',
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {},
            {
              OR: [
                { createdAt: { lt: new Date('2026-04-04T03:00:00.000Z') } },
                {
                  AND: [
                    { createdAt: new Date('2026-04-04T03:00:00.000Z') },
                    { id: { lt: 'log-3' } },
                  ],
                },
              ],
            },
          ],
        },
      }),
    );
  });
});
