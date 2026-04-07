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
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { SyncEventConnectionArgs } from './dto/sync-event-connection.args';
import { SyncEventConnectionModel } from './models/sync-event-connection.model';
import { decodeDateIdCursor, encodeDateIdCursor } from '../../common/graphql/cursor.util';

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
    const lockKey = `sync:upstream:idempotency:${payload.idempotencyKey || payload.requestId}`;
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
      // 한국어: DB 레벨 멱등성 이중 검사 — AuditLog에 동일 requestId가 이미 존재하는지 확인
      // Tiếng Việt: Kiểm tra idempotency kép mức DB — xác nhận requestId giống đã tồn tại trong AuditLog chưa
      const existing = await this.prisma.auditLog.findFirst({
        where: { requestId: payload.requestId },
      });

      if (existing) {
        this.logger.warn(`Duplicate requestId: ${payload.requestId}, skipping`);
        return { status: 'ALREADY_PROCESSED', requestId: payload.requestId };
      }

      // 한국어: AuditLog에 sync 수신 이벤트를 기록한다
      // Tiếng Việt: Ghi sự kiện nhận sync vào AuditLog
      await this.prisma.auditLog.create({
        data: {
          actorType: 'EdgePos',
          actorId: payload.edgePosId,
          actionType: `SYNC_UPSTREAM_${payload.eventType}`,
          targetType: 'SyncEvent',
          requestId: payload.requestId,
          afterDataJson: payload.dataJson as object,
        },
      });

      // 한국어: 해당 Edge POS 단말의 마지막 동기화 시각을 현재 시각으로 갱신
      // Tiếng Việt: Cập nhật thời gian đồng bộ lần cuối của terminal Edge POS sang thời gian hiện tại
      await this.prisma.edgePosTerminal.updateMany({
        where: { id: payload.edgePosId },
        data: { lastSyncAt: new Date() },
      });

      // 한국어: Redis Stream에 sync 페이로드를 적재하여 SyncWorkers 비동기 처리를 위임
      // Tiếng Việt: Đưa payload sync vào Redis Stream để ủy quyền xử lý bất đồng bộ cho SyncWorkers
      await this.redis.enqueueStream('sync:upstream', {
        v: payload.v,
        requestId: payload.requestId,
        timestamp: payload.timestamp,
        idempotencyKey: payload.idempotencyKey,
        edgePosId: payload.edgePosId,
        eventType: payload.eventType,
        dataJson: payload.dataJson,
      });

      this.logger.log(`Upstream sync received: ${payload.requestId} [${payload.eventType}]`);

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
