/**
 * 한국어: Policy 모듈 — 플랫폼 라이선스 및 정책 관리 기능을 NestJS 모듈로 묶는다.
 *         LicenseResolver/PlatformPolicyResolver를 통해 GraphQL 엔드포인트를 노출하고,
 *         LicenseService/PlatformPolicyService를 다른 모듈에서 주입 가능하도록 exports한다.
 * Tiếng Việt: Module Policy — gộp các chức năng quản lý license và chính sách nền tảng thành module NestJS.
 *             Cung cấp endpoint GraphQL qua LicenseResolver/PlatformPolicyResolver,
 *             và exports LicenseService/PlatformPolicyService để các module khác có thể inject.
 */
import { Module } from '@nestjs/common';
import { LicenseResolver } from './resolvers/license.resolver';
import { PlatformPolicyResolver } from './resolvers/platform-policy.resolver';
import { LicenseService } from './services/license.service';
import { PlatformPolicyService } from './services/platform-policy.service';

@Module({
  providers: [LicenseResolver, PlatformPolicyResolver, LicenseService, PlatformPolicyService],
  /**
   * 한국어: LicenseService, PlatformPolicyService를 exports하여
   *         AuditModule 등 다른 모듈에서 라이선스/정책 조회가 가능하도록 한다.
   * Tiếng Việt: Exports LicenseService, PlatformPolicyService để các module khác
   *             như AuditModule có thể truy vấn license/chính sách.
   */
  exports: [LicenseService, PlatformPolicyService],
})
export class PolicyModule {}
