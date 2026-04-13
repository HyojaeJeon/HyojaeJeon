/**
 * Sync 컨트롤러 (REST webhook)
 * 한국어: Edge POS의 상향 동기화 데이터를 수신하는 REST webhook 엔드포인트.
 *         설계 문서 기준 GraphQL-first 예외로 허용된 REST 엔드포인트.
 *         class-validator 기반 입력 검증 DTO를 적용하여 악의적 페이로드를 차단한다.
 * Tiếng Việt: Endpoint REST webhook nhận dữ liệu đồng bộ hướng lên từ Edge POS.
 *             Endpoint REST được phép ngoại lệ theo tài liệu thiết kế GraphQL-first.
 *             Áp dụng DTO kiểm tra đầu vào dựa trên class-validator để chặn payload độc hại.
 */
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SyncService } from './Sync.service';
import { UpstreamSyncInput } from './dto/UpstreamSync.input';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * 한국어: POST /api/v1/sync/upstream — Edge POS 상향 sync 수신.
   *         202 Accepted 응답 후 비동기 처리 (SyncWorkers 큐 적재 예정).
   * Tiếng Việt: POST /api/v1/sync/upstream — Nhận sync hướng lên từ Edge POS.
   *             Phản hồi 202 Accepted rồi xử lý bất đồng bộ (sẽ đưa vào hàng đợi SyncWorkers).
   */
  @Post('upstream')
  @HttpCode(HttpStatus.ACCEPTED)
  async receiveUpstream(@Body() body: UpstreamSyncInput) {
    return this.syncService.processUpstreamSync(body);
  }
}
