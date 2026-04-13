/**
 * 한국어: Health 모듈 — 시스템 상태 확인(Health Check) 기능을 NestJS 모듈로 묶는다.
 *         HealthController를 통해 GET /health REST 엔드포인트만 제공한다.
 *         이는 설계 문서 기준 GraphQL-first 예외로 허용된 REST 엔드포인트이다.
 *         로드밸런서, 모니터링 시스템, K8s readiness/liveness probe 등에서 사용한다.
 * Tiếng Việt: Module Health — gộp chức năng kiểm tra trạng thái hệ thống (Health Check) thành module NestJS.
 *             Chỉ cung cấp endpoint REST GET /health qua HealthController,
 *             đây là endpoint REST được phép ngoại lệ theo tài liệu thiết kế GraphQL-first.
 *             Được sử dụng bởi load balancer, hệ thống giám sát, K8s readiness/liveness probe.
 */
import { Module } from '@nestjs/common';
import { HealthController } from './Health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
