/**
 * 한국어: SuperAdmin Audit 모듈 — 감사 로그 GraphQL 조회 어댑터만 등록한다.
 *   AuditService 는 core/audit/audit.module 이 @Global 로 제공하므로 별도 provider 등록 불필요.
 *
 * Tiếng Việt: Module SuperAdmin audit — chỉ đăng ký GraphQL resolver.
 */
import { Module } from '@nestjs/common';
import { AuditResolver } from './audit.resolver';

@Module({
  providers: [AuditResolver],
})
export class AuditModule {}
