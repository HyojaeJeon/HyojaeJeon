/**
 * 한국어: Audit 모듈 — 감사 로그(AuditLog) 관리 기능을 NestJS 모듈로 묶는다.
 *         모든 주요 데이터 변경 이벤트(생성/수정/삭제/동기화)를 기록하여 추적 가능성을 보장한다.
 *         AuditService를 exports하여 다른 모듈(Auth, Sync, Tenant 등)에서 감사 로그 기록이 가능하다.
 * Tiếng Việt: Module Audit — gộp chức năng quản lý log kiểm toán (AuditLog) thành module NestJS.
 *             Ghi lại tất cả sự kiện thay đổi dữ liệu quan trọng (tạo/sửa/xóa/đồng bộ) để đảm bảo truy xuất.
 *             Exports AuditService để các module khác (Auth, Sync, Tenant...) có thể ghi log kiểm toán.
 */
import { Module } from '@nestjs/common';
import { AuditResolver } from './audit.resolver';
import { AuditService } from './audit.service';

@Module({
  providers: [AuditResolver, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
