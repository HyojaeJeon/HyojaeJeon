/**
 * CentralApi 애플리케이션 엔트리포인트
 * 한국어: NestJS + Fastify 어댑터로 GraphQL-first 중앙 API 서버를 부트스트랩한다.
 *         REST는 webhook/health 등 예외적 경우에만 사용 (설계 기준서 준수).
 * Tiếng Việt: Bootstrap máy chủ API trung tâm GraphQL-first bằng NestJS + Fastify adapter.
 *             REST chỉ dùng ngoại lệ cho webhook/health (tuân thủ tài liệu thiết kế).
 */
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { AppModule } from './app.module';
import { RealtimeService } from '@core/realtime/realtime.service';

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function bootstrap() {
  /**
   * 한국어: Fastify 어댑터로 NestJS 앱 생성. Express 대신 Fastify 사용 (설계 결정사항).
   * Tiếng Việt: Tạo app NestJS với Fastify adapter. Dùng Fastify thay vì Express (quyết định thiết kế).
   */
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      bodyLimit: readIntEnv('FASTIFY_BODY_LIMIT_BYTES', 1024 * 1024),
      requestTimeout: readIntEnv('FASTIFY_REQUEST_TIMEOUT_MS', 30_000),
      keepAliveTimeout: readIntEnv('FASTIFY_KEEP_ALIVE_TIMEOUT_MS', 72_000),
    }),
  );

  const configService = app.get(ConfigService);
  app.enableShutdownHooks();

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate'],
  });

  /**
   * 한국어: REST 엔드포인트에만 'api/v1' 접두사 적용.
   *         GraphQL(/graphql)과 health(/health)는 접두사에서 제외한다.
   * Tiếng Việt: Chỉ áp dụng tiền tố 'api/v1' cho REST endpoint.
   *             GraphQL(/graphql) và health(/health) được loại trừ khỏi tiền tố.
   */
  app.setGlobalPrefix('api/v1', {
    exclude: ['graphql', 'health'],
  });

  /**
   * 한국어: 전역 유효성 검사 파이프. 모든 요청 DTO를 자동 변환하고,
   *         정의되지 않은 프로퍼티는 제거(whitelist)하며 거부(forbidNonWhitelisted)한다.
   * Tiếng Việt: Pipe kiểm tra tính hợp lệ toàn cục. Tự động chuyển đổi tất cả DTO yêu cầu,
   *             loại bỏ (whitelist) và từ chối (forbidNonWhitelisted) thuộc tính không được định nghĩa.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * 한국어: CORS 설정 — 환경변수 ALLOWED_ORIGINS에서 허용 도메인 목록을 읽는다.
   *         운영 환경에서는 반드시 Portal URL만 허용해야 한다 (보안 요구사항).
   * Tiếng Việt: Cấu hình CORS — đọc danh sách domain được phép từ biến môi trường ALLOWED_ORIGINS.
   *             Trong môi trường sản xuất, chỉ cho phép URL Portal (yêu cầu bảo mật).
   */
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  const realtime = app.get(RealtimeService);
  await realtime.attach(app.getHttpServer());
  Logger.log(`CentralApi running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`GraphQL Playground: http://localhost:${port}/graphql`, 'Bootstrap');
  Logger.log(
    `Realtime socket: ws://localhost:${port}${configService.get<string>('REALTIME_PATH', '/realtime')}`,
    'Bootstrap',
  );
}

bootstrap();
