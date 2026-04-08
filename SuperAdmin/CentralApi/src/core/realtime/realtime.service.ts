/**
 * 한국어: RealtimeService — 단일 Socket.IO 허브.
 *
 *   - GraphQL/REST 와 별개로, 중앙 서버에서 실시간 브로드캐스트를 담당한다.
 *   - default namespace 하나만 사용하고, room 으로 tenant scope 를 분리한다.
 *   - Redis adapter 를 붙일 수 있으면 horizontal scaling 을 지원한다.
 *   - JWT handshake auth + server-authoritative tenantContext 재계산을 사용한다.
 *
 * Tiếng Việt: RealtimeService — hub Socket.IO đơn.
 */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomUUID } from 'node:crypto';
import type { IncomingMessage, Server as HttpServer } from 'node:http';
import { createClient, type RedisClientType } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server, type Socket } from 'socket.io';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { resolveLocale, type SupportedLocale } from '@core/i18n/locale.util';
import { resolveRedisConnectionInfo } from '@core/redis/redis-connection';
import { RealtimeEvents } from './realtime-events';
import { resolveRoomsForAudience } from './audience/realtime-audience.policy';
import {
  roomsForTenantContext,
  roomsForUser,
  RealtimeRooms,
  type RealtimeTenantScope,
} from './realtime-rooms';
import type { RealtimeTopicDefinition } from './topics/realtime-topic.types';

interface RealtimeSocketData {
  user: JwtPayload;
  locale: SupportedLocale;
  requestId: string;
}

@Injectable()
export class RealtimeService implements OnModuleDestroy {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;
  /**
   * P2-6: Realtime 메시지 HMAC 서명 시크릿.
   *   설정되어 있으면 모든 payload 에 { sig, ts } 를 덧붙여 전송하여
   *   클라이언트 측에서 변조/재전송 공격을 탐지할 수 있다.
   *   클라이언트 검증 로직:
   *     sigCheck = HMAC_SHA256(secret, `${ts}.${JSON.stringify(payload)}`)
   *     ts 가 5 분 이상 과거면 거부.
   */
  private readonly hmacSecret: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authSession: AuthSessionService,
  ) {
    const secret = this.configService.get<string>('REALTIME_HMAC_SECRET');
    this.hmacSecret = secret && secret.length >= 16 ? secret : null;
    if (!this.hmacSecret) {
      this.logger.warn(
        'REALTIME_HMAC_SECRET is not set (or <16 chars). Realtime messages will not be HMAC-signed.',
      );
    }
  }

  get isBound(): boolean {
    return this.server !== null;
  }

  async attach(httpServer: HttpServer): Promise<void> {
    if (this.server) return;

    const allowedOrigins = this.configService
      .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    this.server = new Server(httpServer, {
      path: this.configService.get<string>('REALTIME_PATH', '/realtime'),
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: this.configService.get<number>('REALTIME_PING_INTERVAL_MS', 25_000),
      pingTimeout: this.configService.get<number>('REALTIME_PING_TIMEOUT_MS', 20_000),
      connectTimeout: this.configService.get<number>('REALTIME_CONNECT_TIMEOUT_MS', 10_000),
    });

    await this.setupRedisAdapter();
    this.registerMiddleware();
    this.registerEvents();

    this.logger.log(
      `Realtime socket attached on path ${this.configService.get<string>('REALTIME_PATH', '/realtime')}`,
    );
  }

  emitToRoom(room: string, event: string, payload: unknown): void {
    if (!this.server) return;
    this.server.to(room).emit(event, this.signPayload(payload));
  }

  publish<TPayload>(topic: RealtimeTopicDefinition<TPayload>, payload: TPayload): void {
    if (!this.server) return;
    const rooms = resolveRoomsForAudience(topic.audience);
    if (rooms.length === 0) return;

    const signed = this.signPayload(payload);
    for (const room of rooms) {
      this.server.to(room).emit(topic.name, signed);
    }
  }

  /**
   * P2-6: payload 에 HMAC 서명과 timestamp 를 부착한다.
   *   hmacSecret 이 없으면 원본을 그대로 반환 (backward compat).
   *   반환 구조: { payload, ts, sig }.
   */
  private signPayload(payload: unknown): unknown {
    if (!this.hmacSecret) return payload;
    const ts = Date.now();
    const serialized = JSON.stringify(payload ?? null);
    const sig = createHmac('sha256', this.hmacSecret)
      .update(`${ts}.${serialized}`)
      .digest('hex');
    return { payload, ts, sig };
  }

  emitToUser(userType: string, userId: string, event: string, payload: unknown): void {
    this.emitToRoom(RealtimeRooms.user(userType, userId), event, payload);
  }

  emitToTenant(
    tenant: RealtimeTenantScope | undefined,
    event: string,
    payload: unknown,
  ): void {
    if (!tenant) return;
    for (const room of roomsForTenantContext(tenant)) {
      this.emitToRoom(room, event, payload);
    }
  }

  emitToEdgePos(edgePosId: string, event: string, payload: unknown): void {
    this.emitToRoom(RealtimeRooms.edgePos(edgePosId), event, payload);
  }

  async onModuleDestroy(): Promise<void> {
    await this.subClient?.quit().catch(() => undefined);
    await this.pubClient?.quit().catch(() => undefined);
    await this.server?.close();
    this.server = null;
  }

  private registerMiddleware(): void {
    if (!this.server) return;

    this.server.use(async (socket, next) => {
      try {
        const { user, locale, requestId } = await this.authenticateSocket(socket);
        const data = socket.data as RealtimeSocketData;
        data.user = user;
        data.locale = locale;
        data.requestId = requestId;
        next();
      } catch (error) {
        next(this.socketError('UNAUTHENTICATED', (error as Error).message));
      }
    });
  }

  private registerEvents(): void {
    if (!this.server) return;

    this.server.on('connection', (socket) => {
      const data = socket.data as RealtimeSocketData;
      const rooms = roomsForUser(data.user);
      for (const room of rooms) {
        socket.join(room);
      }

      this.logger.log(
        `socket connected user=${data.user.userType}:${data.user.sub} socket=${socket.id} rooms=${rooms.join(',')}`,
      );

      socket.emit(
        RealtimeEvents.connected,
        this.signPayload({
          requestId: data.requestId,
          locale: data.locale,
          rooms,
        }),
      );

      socket.on('disconnect', (reason) => {
        this.logger.debug(
          `socket disconnected user=${data.user.userType}:${data.user.sub} socket=${socket.id} reason=${reason}`,
        );
      });
    });
  }

  private async setupRedisAdapter(): Promise<void> {
    const info = resolveRedisConnectionInfo(this.configService);
    if (!info.enabled || !this.server) {
      this.logger.warn('Realtime Redis adapter disabled because Redis is unavailable');
      return;
    }

    try {
      this.pubClient = info.url
        ? createClient({ url: info.url })
        : createClient({
            socket: { host: info.host ?? '127.0.0.1', port: info.port },
            username: info.username,
            password: info.password,
            database: info.db,
          });
      this.subClient = this.pubClient.duplicate();

      this.pubClient.on('error', (error) => {
        this.logger.error(`Realtime Redis pub client error: ${(error as Error).message}`);
      });
      this.subClient.on('error', (error) => {
        this.logger.error(`Realtime Redis sub client error: ${(error as Error).message}`);
      });

      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      this.server.adapter(createAdapter(this.pubClient, this.subClient));
      this.logger.log('Realtime Redis adapter enabled');
    } catch (error) {
      this.logger.warn(
        `Realtime Redis adapter disabled: ${(error as Error).message}`,
      );
      await this.pubClient?.quit().catch(() => undefined);
      await this.subClient?.quit().catch(() => undefined);
      this.pubClient = null;
      this.subClient = null;
    }
  }

  private async authenticateSocket(
    socket: Socket,
  ): Promise<{ user: JwtPayload; locale: SupportedLocale; requestId: string }> {
    const token = this.extractToken(socket);
    if (!token) {
      throw new Error('Socket authentication token is required');
    }

    const requestId =
      this.headerValue(socket.handshake.headers, 'x-request-id') ?? randomUUID();
    const acceptLanguage = this.headerValue(socket.handshake.headers, 'accept-language');
    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token);
    const user = await this.authSession.resolveJwtPayload(decoded);
    const locale = resolveLocale({
      acceptLanguage,
      userLanguage: user.defaultLanguage ?? null,
      tenantLanguage: null,
    });

    return { user, locale, requestId };
  }

  private extractToken(socket: Socket): string | null {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }

    const header = this.headerValue(socket.handshake.headers, 'authorization');
    if (!header) return null;
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() ?? null;
  }

  private headerValue(
    headers: IncomingMessage['headers'],
    name: string,
  ): string | undefined {
    const raw = headers?.[name.toLowerCase()];
    if (Array.isArray(raw)) return raw[0];
    return raw ? String(raw) : undefined;
  }

  private socketError(code: string, message: string): Error {
    const error = new Error(message);
    (error as Error & { data?: Record<string, unknown> }).data = { code };
    return error;
  }
}
