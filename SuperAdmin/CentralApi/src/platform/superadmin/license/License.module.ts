/**
 * 한국어: License 모듈 — PlatformLicense 도메인의 단일 leaf 모듈.
 *   기존 RuntimePolicyModule(governance) 에서 분리되어 표준 leaf 템플릿을 따른다.
 *
 * Tiếng Việt: Module License — leaf đơn cho domain PlatformLicense.
 */
import { Module } from '@nestjs/common';
import { LicenseResolver } from './License.resolver';
import { LicenseService } from './License.service';

@Module({
  providers: [LicenseResolver, LicenseService],
  exports: [LicenseService],
})
export class LicenseModule {}
