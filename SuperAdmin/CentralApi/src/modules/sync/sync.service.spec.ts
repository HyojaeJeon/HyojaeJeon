import { SyncService } from './sync.service';

describe('SyncService', () => {
  const prisma = {
    auditLog: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    edgePosTerminal: {
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const redis = {
    isEnabled: jest.fn(),
    acquireLock: jest.fn(),
    releaseLock: jest.fn(),
    enqueueStream: jest.fn(),
  };

  const service = new SyncService(prisma as never, redis as never);

  const payload = {
    v: 1,
    requestId: 'req-1',
    timestamp: '2026-04-04T10:00:00.000Z',
    idempotencyKey: 'idem-1',
    edgePosId: 'edge-1',
    eventType: 'ORDER_UPSERTED',
    dataJson: { orderId: 'order-1' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('short-circuits when Redis lock indicates a duplicate in flight request', async () => {
    redis.isEnabled.mockReturnValue(true);
    redis.acquireLock.mockResolvedValue(null);

    const result = await service.processUpstreamSync(payload);

    expect(result).toEqual({ status: 'ALREADY_PROCESSED', requestId: 'req-1' });
    expect(prisma.auditLog.findFirst).not.toHaveBeenCalled();
  });

  it('returns already processed when the requestId already exists in AuditLog', async () => {
    redis.isEnabled.mockReturnValue(true);
    redis.acquireLock.mockResolvedValue('lock-1');
    prisma.auditLog.findFirst.mockResolvedValue({ id: 'audit-1', requestId: 'req-1' });
    redis.releaseLock.mockResolvedValue(true);

    const result = await service.processUpstreamSync(payload);

    expect(result).toEqual({ status: 'ALREADY_PROCESSED', requestId: 'req-1' });
    expect(redis.releaseLock).toHaveBeenCalledWith(
      'sync:upstream:idempotency:idem-1',
      'lock-1',
    );
  });

  it('writes audit/update/stream records for accepted upstream sync payloads', async () => {
    redis.isEnabled.mockReturnValue(true);
    redis.acquireLock.mockResolvedValue('lock-1');
    prisma.auditLog.findFirst.mockResolvedValue(null);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.edgePosTerminal.updateMany.mockResolvedValue({ count: 1 });
    redis.enqueueStream.mockResolvedValue('stream-1');
    redis.releaseLock.mockResolvedValue(true);

    const result = await service.processUpstreamSync(payload);

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorType: 'EdgePos',
          actorId: 'edge-1',
          requestId: 'req-1',
        }),
      }),
    );
    expect(prisma.edgePosTerminal.updateMany).toHaveBeenCalledWith({
      where: { id: 'edge-1' },
      data: { lastSyncAt: expect.any(Date) },
    });
    expect(redis.enqueueStream).toHaveBeenCalledWith(
      'sync:upstream',
      expect.objectContaining({
        requestId: 'req-1',
        edgePosId: 'edge-1',
        eventType: 'ORDER_UPSERTED',
      }),
    );
    expect(result).toEqual({ status: 'ACCEPTED', requestId: 'req-1' });
  });

  it('returns sync event connection data with keyset pagination metadata', async () => {
    prisma.auditLog.findMany.mockResolvedValue([
      {
        id: 'audit-2',
        actorId: 'edge-1',
        actionType: 'SYNC_UPSTREAM_ORDER_UPSERTED',
        requestId: 'req-2',
        afterDataJson: { orderId: 'order-2' },
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
      },
      {
        id: 'audit-1',
        actorId: 'edge-1',
        actionType: 'SYNC_UPSTREAM_ORDER_UPSERTED',
        requestId: 'req-1',
        afterDataJson: { orderId: 'order-1' },
        createdAt: new Date('2026-04-05T09:59:00.000Z'),
      },
    ]);
    prisma.auditLog.count.mockResolvedValue(7);

    const result = await service.findEventConnection({
      edgePosId: 'edge-1',
      eventType: 'ORDER_UPSERTED',
      first: 1,
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          targetType: 'SyncEvent',
          actorId: 'edge-1',
          actionType: 'SYNC_UPSTREAM_ORDER_UPSERTED',
        }),
        take: 2,
      }),
    );
    expect(result.totalCount).toBe(7);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]).toEqual(
      expect.objectContaining({
        id: 'audit-2',
        edgePosId: 'edge-1',
        eventType: 'ORDER_UPSERTED',
        requestId: 'req-2',
      }),
    );
  });
});
