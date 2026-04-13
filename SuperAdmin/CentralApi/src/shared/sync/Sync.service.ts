/**
 * 한국어: Sync 서비스 — Edge POS 상향 동기화(Upstream Sync) 처리 및 동기화 상태 조회를 담당한다.
 *         Redis 분산 락 + AuditLog requestId 이중 멱등성 검사를 수행하여 중복 처리를 방지한다.
 *         수신된 sync 이벤트는 AuditLog에 기록하고, EdgePosTerminal의 lastSyncAt을 갱신한 뒤,
 *         Redis Stream('sync:upstream')에 적재하여 SyncWorkers에서 비동기 처리를 위임한다.
 * Tiếng Việt: Service Sync — phụ trách xử lý đồng bộ hướng lên (Upstream Sync) từ Edge POS và truy vấn trạng thái đồng bộ.
 *             Thực hiện kiểm tra idempotency kép: khóa phân tán Redis + requestId AuditLog để ngăn xử lý trùng lặp.
 *             Sự kiện sync nhận được sẽ ghi vào AuditLog, cập nhật lastSyncAt của EdgePosTerminal,
 *             rồi đưa vào Redis Stream ('sync:upstream') để ủy quyền xử lý bất đồng bộ cho SyncWorkers.
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { RedisService } from '@core/redis/Redis.service';
import { GraphqlSubscriptionBusService } from '@core/graphql/subscriptions/GraphqlSubscriptionBus.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { SyncEventConnectionArgs } from './dto/SyncEventConnection.args';
import { SyncEventConnectionModel } from './models/SyncEventConnection.model';
import { decodeDateIdCursor, encodeDateIdCursor } from '@core/graphql/pagination/cursor.util';

/**
 * 한국어: 상향 동기화 페이로드 인터페이스 — 설계 기준서의 공통 봉투 규격을 준수한다.
 *         v(프로토콜 버전), requestId, timestamp, idempotencyKey는 공통 헤더 필드이다.
 * Tiếng Việt: Interface payload đồng bộ hướng lên — tuân thủ quy cách phong bì chung của tài liệu thiết kế.
 *             v (phiên bản giao thức), requestId, timestamp, idempotencyKey là các trường header chung.
 */
interface UpstreamSyncPayload {
  v: number;
  requestId: string;
  timestamp: string;
  idempotencyKey: string;
  edgePosId: string;
  eventType: string;
  dataJson: unknown;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly subscriptionBus: GraphqlSubscriptionBusService,
  ) {}

  /**
   * 한국어: 상향 동기화 처리 — 아래 순서로 실행한다:
   *         1. Redis 분산 락 획득 (idempotencyKey 또는 requestId 기준, TTL 300초)
   *         2. AuditLog에서 동일 requestId 존재 여부 확인 (DB 레벨 이중 검사)
   *         3. AuditLog에 sync 수신 이벤트 기록
   *         4. EdgePosTerminal의 lastSyncAt 갱신
   *         5. Redis Stream 'sync:upstream'에 페이로드 적재 (SyncWorkers 비동기 처리)
   *         6. finally 블록에서 Redis 락 해제
   * Tiếng Việt: Xử lý đồng bộ hướng lên — thực hiện theo thứ tự:
   *             1. Lấy khóa phân tán Redis (theo idempotencyKey hoặc requestId, TTL 300 giây)
   *             2. Kiểm tra requestId tồn tại trong AuditLog (kiểm tra kép mức DB)
   *             3. Ghi sự kiện nhận sync vào AuditLog
   *             4. Cập nhật lastSyncAt của EdgePosTerminal
   *             5. Đưa payload vào Redis Stream 'sync:upstream' (SyncWorkers xử lý bất đồng bộ)
   *             6. Giải phóng khóa Redis trong khối finally
   */
  async processUpstreamSync(payload: UpstreamSyncPayload) {
    // 한국어: 멱등성 락 키 — idempotencyKey 우선, 없으면 requestId 사용
    // Tiếng Việt: Khóa lock idempotency — ưu tiên idempotencyKey, nếu không có dùng requestId
    const lockKey = CachePolicies.syncUpstreamIdempotency(
      payload.idempotencyKey,
      payload.requestId,
    ).key;
    const redisAvailable = this.redis.isEnabled();

    // 한국어: Redis가 사용 가능하면 분산 락 획득 시도 (TTL 300초, owner = requestId)
    // Tiếng Việt: Nếu Redis khả dụng, thử lấy khóa phân tán (TTL 300 giây, owner = requestId)
    const lockToken = redisAvailable
      ? await this.redis.acquireLock(lockKey, 300, payload.requestId)
      : null;

    // 한국어: Redis 사용 가능한데 락 획득 실패 → 동일 요청이 다른 프로세스에서 처리 중
    // Tiếng Việt: Redis khả dụng mà lấy khóa thất bại → yêu cầu giống đang được xử lý bởi tiến trình khác
    if (redisAvailable && !lockToken) {
      this.logger.warn(`Duplicate sync payload detected by Redis lock: ${payload.requestId}`);
      return { status: 'ALREADY_PROCESSED', requestId: payload.requestId };
    }

    try {
      // ── P1-F: idempotency 는 DB unique 제약 + insert-and-catch 로 race-safe ──
      // AuditLog.requestId @unique 제약이 있으므로, 두 프로세스가 동시에 같은 requestId 를
      // 처리해도 둘 중 하나는 P2002 (unique violation) 로 실패한다.
      // ── P1-3: durable outbox 패턴 ──
      // AuditLog + EdgePosTerminal.lastSyncAt + SyncOutbox 를 단일 트랜잭션에서 atomic 처리.
      // Redis enqueue 는 worker hint 일 뿐, source of truth 는 SyncOutbox.
      let acceptedEvent: { id: string; createdAt: Date } | null = null;
      try {
        acceptedEvent = await this.prisma.$transaction(async (tx) => {
          const auditLog = await tx.auditLog.create({
            data: {
              actorType: 'EDGE_POS',
              actorId: payload.edgePosId,
              actionType: `SYNC_UPSTREAM_${payload.eventType}`,
              targetType: 'SyncEvent',
              requestId: payload.requestId,
              afterDataJson: payload.dataJson as object,
            },
          });
          await tx.edgePosTerminal.updateMany({
            where: { id: payload.edgePosId },
            data: { lastSyncAt: new Date() },
          });
          await tx.syncOutbox.create({
            data: {
              channel: `sync.upstream.${payload.eventType}`.toLowerCase(),
              scopeType: 'EDGE_POS',
              scopeId: payload.edgePosId,
              payloadJson: {
                v: payload.v,
                requestId: payload.requestId,
                timestamp: payload.timestamp,
                idempotencyKey: payload.idempotencyKey,
                edgePosId: payload.edgePosId,
                eventType: payload.eventType,
                dataJson: payload.dataJson as object,
              } as object,
              status: 'PENDING',
            },
          });
          return {
            id: auditLog.id,
            createdAt: auditLog.createdAt,
          };
        });
      } catch (e) {
        // P2002 = unique violation on AuditLog.requestId → 동일 requestId 가 이미 처리됨.
        const code = (e as { code?: string })?.code;
        if (code === 'P2002') {
          this.logger.warn(`Duplicate requestId (race-safe): ${payload.requestId}`);
          return { status: 'ALREADY_PROCESSED', requestId: payload.requestId };
        }
        throw e;
      }

      // Redis enqueue 는 best-effort hint. 실패해도 outbox 가 source of truth.
      try {
        await this.redis.enqueueStream('sync:upstream', {
          v: payload.v,
          requestId: payload.requestId,
          timestamp: payload.timestamp,
          idempotencyKey: payload.idempotencyKey,
          edgePosId: payload.edgePosId,
          eventType: payload.eventType,
          dataJson: payload.dataJson,
        });
      } catch (err) {
        this.logger.warn(
          `Redis enqueue hint failed (outbox row created OK): ${(err as Error).message}`,
        );
      }

      this.logger.log(
        `Upstream sync persisted to outbox: ${payload.requestId} [${payload.eventType}]`,
      );

      if (acceptedEvent) {
        await this.subscriptionBus.publish('syncEventReceived', {
          id: acceptedEvent.id,
          edgePosId: payload.edgePosId,
          eventType: payload.eventType,
          requestId: payload.requestId,
          payloadJson: payload.dataJson,
          createdAt: acceptedEvent.createdAt,
        });
      }

      return { status: 'ACCEPTED', requestId: payload.requestId };
    } finally {
      // 한국어: Redis 분산 락 해제 — 다른 프로세스가 동일 키로 작업할 수 있도록 반환
      // Tiếng Việt: Giải phóng khóa phân tán Redis — trả lại để tiến trình khác có thể làm việc với cùng khóa
      if (redisAvailable && lockToken) {
        await this.redis.releaseLock(lockKey, lockToken);
      }
    }
  }

  /**
   * 한국어: Edge POS 단말의 동기화 상태를 조회한다 — lastSyncAt, lastHeartbeatAt, status를 반환.
   *         단말이 존재하지 않으면 기본값(null, 'Unknown')을 반환한다.
   * Tiếng Việt: Truy vấn trạng thái đồng bộ của terminal Edge POS — trả về lastSyncAt, lastHeartbeatAt, status.
   *             Nếu terminal không tồn tại, trả về giá trị mặc định (null, 'Unknown').
   */
  async getSyncStatus(edgePosId: string) {
    const terminal = await this.prisma.edgePosTerminal.findFirst({
      where: { id: edgePosId },
    });

    return {
      edgePosId,
      lastSyncAt: terminal?.lastSyncAt ?? null,
      lastHeartbeatAt: terminal?.lastHeartbeatAt ?? null,
      status: terminal?.status ?? 'Unknown',
    };
  }

  async findEventConnection(filter: SyncEventConnectionArgs): Promise<SyncEventConnectionModel> {
    const baseWhere = {
      targetType: 'SyncEvent',
      ...(filter.edgePosId ? { actorId: filter.edgePosId } : {}),
      ...(filter.eventType ? { actionType: `SYNC_UPSTREAM_${filter.eventType}` } : {}),
      ...(filter.dateFrom || filter.dateTo
        ? {
            createdAt: {
              ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
              ...(filter.dateTo ? { lte: filter.dateTo } : {}),
            },
          }
        : {}),
    };

    const cursor = filter.after ? decodeDateIdCursor(filter.after) : null;

    const where = cursor
      ? {
          ...baseWhere,
          OR: [
            { createdAt: { lt: new Date(cursor.createdAt) } },
            { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
          ],
        }
      : baseWhere;

    const take = filter.first + 1;
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    const hasNextPage = rows.length > filter.first;
    const visibleRows = hasNextPage ? rows.slice(0, filter.first) : rows;
    const edges = visibleRows.map((row) => ({
      cursor: encodeDateIdCursor({
        createdAt: row.createdAt.toISOString(),
        id: row.id,
      }),
      node: {
        id: row.id,
        edgePosId: row.actorId ?? '',
        eventType: row.actionType.replace(/^SYNC_UPSTREAM_/, ''),
        requestId: row.requestId,
        payloadJson: row.afterDataJson,
        createdAt: row.createdAt,
      },
    }));

    return {
      edges,
      nodes: edges.map((edge) => edge.node),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: Boolean(filter.after),
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges.at(-1)?.cursor ?? null,
      },
      totalCount: await this.prisma.auditLog.count({ where: baseWhere }),
    };
  }
}
