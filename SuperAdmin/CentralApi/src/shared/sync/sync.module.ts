/**
 * 한국어: Sync 모듈 — Edge POS와 중앙 서버 간 동기화 기능을 NestJS 모듈로 묶는다.
 *         REST webhook(SyncController)과 GraphQL(SyncResolver) 양쪽 인터페이스를 제공한다.
 *         SyncController는 설계 문서 기준 GraphQL-first의 예외로 허용된 REST 엔드포인트이다.
 *         SyncService를 exports하여 SyncWorkers 등 다른 모듈에서 사용 가능하다.
 * Tiếng Việt: Module Sync — gộp chức năng đồng bộ giữa Edge POS và máy chủ trung tâm thành module NestJS.
 *             Cung cấp cả hai interface: REST webhook (SyncController) và GraphQL (SyncResolver).
 *             SyncController là endpoint REST được phép ngoại lệ theo tài liệu thiết kế GraphQL-first.
 *             Exports SyncService để các module khác như SyncWorkers sử dụng.
 */
import { Module } from '@nestjs/common';
import { RealtimeModule } from '@core/realtime/realtime.module';
import { SyncController } from './sync.controller';
import { SyncResolver } from './sync.resolver';
import { SyncService } from './sync.service';

@Module({
  imports: [RealtimeModule],
  controllers: [SyncController],
  providers: [SyncResolver, SyncService],
  exports: [SyncService],
})
export class SyncModule {}
