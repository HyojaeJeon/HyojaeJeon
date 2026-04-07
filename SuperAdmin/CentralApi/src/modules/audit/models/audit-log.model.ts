/**
 * 한국어: AuditLog GraphQL 모델 — 감사 로그 엔티티의 GraphQL ObjectType 정의.
 *         누가(actor), 무엇을(target), 어떻게(action) 변경했는지를 기록한다.
 *         beforeDataJson/afterDataJson으로 변경 전후 스냅샷을 JSON으로 보관하여
 *         데이터 변경 이력을 완전히 추적할 수 있다.
 * Tiếng Việt: Model GraphQL AuditLog — định nghĩa ObjectType GraphQL cho entity log kiểm toán.
 *             Ghi lại ai (actor), cái gì (target), thay đổi như thế nào (action).
 *             beforeDataJson/afterDataJson lưu snapshot trước/sau thay đổi dạng JSON
 *             để theo dõi đầy đủ lịch sử thay đổi dữ liệu.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class AuditLogModel {
  /** 한국어: 감사 로그 고유 ID (UUID) / Tiếng Việt: ID duy nhất của log kiểm toán (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 행위자 유형 (예: 'User', 'System', 'EdgePos') / Tiếng Việt: Loại tác nhân (ví dụ: 'User', 'System', 'EdgePos') */
  @Field()
  actorType!: string;

  /** 한국어: 행위자 ID (시스템 자동 작업 시 null) / Tiếng Việt: ID tác nhân (null khi thao tác tự động của hệ thống) */
  @Field(() => String, { nullable: true })
  actorId?: string | null;

  /** 한국어: 행위 유형 (예: 'CREATE', 'UPDATE', 'DELETE', 'SYNC_UPSTREAM') / Tiếng Việt: Loại hành động (ví dụ: 'CREATE', 'UPDATE', 'DELETE', 'SYNC_UPSTREAM') */
  @Field()
  actionType!: string;

  /** 한국어: 대상 엔티티 유형 (예: 'Branch', 'Brand', 'License') / Tiếng Việt: Loại entity đích (ví dụ: 'Branch', 'Brand', 'License') */
  @Field()
  targetType!: string;

  /** 한국어: 대상 엔티티 ID / Tiếng Việt: ID entity đích */
  @Field(() => String, { nullable: true })
  targetId?: string | null;

  /** 한국어: 연관 요청 ID — 멱등성 검사 및 요청 추적용 / Tiếng Việt: ID yêu cầu liên quan — dùng cho kiểm tra idempotency và theo dõi yêu cầu */
  @Field(() => String, { nullable: true })
  requestId?: string | null;

  /** 한국어: 변경 전 데이터 스냅샷 (JSON). 신규 생성 시 null / Tiếng Việt: Snapshot dữ liệu trước thay đổi (JSON). Null khi tạo mới */
  @Field(() => GraphQLJSON, { nullable: true })
  beforeDataJson?: unknown | null;

  /** 한국어: 변경 후 데이터 스냅샷 (JSON). 삭제 시 null / Tiếng Việt: Snapshot dữ liệu sau thay đổi (JSON). Null khi xóa */
  @Field(() => GraphQLJSON, { nullable: true })
  afterDataJson?: unknown | null;

  /** 한국어: 요청 IP 주소 / Tiếng Việt: Địa chỉ IP yêu cầu */
  @Field(() => String, { nullable: true })
  ipAddress?: string | null;

  /** 한국어: 요청 User-Agent 헤더 / Tiếng Việt: Header User-Agent của yêu cầu */
  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  /** 한국어: 로그 생성 일시 / Tiếng Việt: Thời gian tạo log */
  @Field()
  createdAt!: Date;
}
