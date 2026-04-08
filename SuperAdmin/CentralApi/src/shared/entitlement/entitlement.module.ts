/**
 * 한국어: Entitlement 모듈 — BrandHQ capability 권한 관리.
 *         기준서 §100. EntitlementService 는 다른 모듈에서 주입 가능하도록 export 한다.
 *         Global 로 등록하여 모든 도메인 service 에서 inject 가능.
 * Tiếng Việt: Module Entitlement — quản lý quyền capability của BrandHQ.
 */
import { Global, Module } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import { EntitlementResolver } from './entitlement.resolver';

@Global()
@Module({
  providers: [EntitlementService, EntitlementResolver],
  exports: [EntitlementService],
})
export class EntitlementModule {}
