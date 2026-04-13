/**
 * 한국어: Tenancy 모듈 — TenantContextService 를 전역 provider 로 제공한다.
 *   JwtStrategy, PermissionGuard, 각 도메인 service 가 DI 로 주입받는다.
 *
 * Tiếng Việt: Module Tenancy — cung cấp TenantContextService như provider toàn cục.
 */
import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './TenantContext.service';

@Global()
@Module({
  providers: [TenantContextService],
  exports: [TenantContextService],
})
export class TenancyModule {}
