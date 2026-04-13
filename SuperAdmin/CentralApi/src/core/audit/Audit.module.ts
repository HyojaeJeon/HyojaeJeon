/**
 * 한국어: AuditModule (core, global) — 감사 로그 인프라 서비스만 노출.
 *   GraphQL DTO/resolver 는 platform/superadmin/audit 가 책임진다.
 *   다른 도메인 service 가 inject 해서 .log() 를 호출할 수 있도록 @Global 로 등록.
 *
 * Tiếng Việt: Module Audit hạ tầng — chỉ AuditService, không phụ thuộc GraphQL.
 */
import { Global, Module } from '@nestjs/common';
import { AuditService } from './Audit.service';

@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
