import { SyncService } from './sync.service';

describe('SyncService', () => {
  // 한국어: prisma.$transaction 은 콜백을 tx 로 받아 실행한다 — mock 도 동일하게 tx 로 prisma 자체를 전달.
  const prisma: any = {
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
    syncOutbox: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (tx: any) => Promise<unknown>) => fn(prisma)),
  };

  const redis = {
    isEnabled: jest.fn(),
    acquireLock: jest.fn(),
    releaseLock: jest.fn(),
    enqueueStream: jest.fn(),
  };

  const realtime = {
    publishUpstreamAccepted: jest.fn(),
    publishUpstreamDuplicate: jest.fn(),
  };

  const service = new SyncService(prisma as never, redis as never, realtime as never);

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
    expect(realtime.publishUpstreamDuplicate).toHaveBeenCalledWith('edge-1', {
      requestId: 'req-1',
      status: 'ALREADY_PROCESSED',
      eventType: 'ORDER_UPSERTED',
      reason: 'REDIS_LOCK',
    });
  });

  it('returns already processed when AuditLog.create raises P2002 unique violation', async () => {
    redis.isEnabled.mockReturnValue(true);
    redis.acquireLock.mockResolvedValue('lock-1');
    // P2002 를 $transaction 콜백 내부에서 시뮬레이션 — insert-and-catch 경로 검증.
    const p2002 = Object.assign(new Error('Unique constraint violated on requestId'), { code: 'P2002' });
    prisma.auditLog.create.mockRejectedValueOnce(p2002);
    redis.releaseLock.mockResolvedValue(true);

    const result = await service.processUpstreamSync(payload);

    expect(result).toEqual({ status: 'ALREADY_PROCESSED', requestId: 'req-1' });
    expect(redis.releaseLock).toHaveBeenCalledWith(
      'sync:upstream:idempotency:idem-1',
      'lock-1',
    );
    expect(realtime.publishUpstreamDuplicate).toHaveBeenCalledWith('edge-1', {
      requestId: 'req-1',
      status: 'ALREADY_PROCESSED',
      eventType: 'ORDER_UPSERTED',
      reason: 'P2002',
    });
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
          actorType: 'EDGE_POS',
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
    expect(realtime.publishUpstreamAccepted).toHaveBeenCalledWith('edge-1', {
      requestId: 'req-1',
      status: 'ACCEPTED',
      eventType: 'ORDER_UPSERTED',
    });
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
