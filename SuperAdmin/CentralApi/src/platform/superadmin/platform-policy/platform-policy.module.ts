/**
 * 한국어: PlatformPolicy 모듈 — runtime 운영 노브(예: auth.max_login_attempts) 의 단일 leaf.
 *   기존 RuntimePolicyModule(governance) 에서 분리되어 표준 leaf 템플릿을 따른다.
 *
 * Tiếng Việt: Module PlatformPolicy — leaf đơn cho cấu hình vận hành runtime.
 */
import { Module } from '@nestjs/common';
import { PlatformPolicyResolver } from './platform-policy.resolver';
import { PlatformPolicyService } from './platform-policy.service';

@Module({
  providers: [PlatformPolicyResolver, PlatformPolicyService],
  exports: [PlatformPolicyService],
})
export class PlatformPolicyModule {}
