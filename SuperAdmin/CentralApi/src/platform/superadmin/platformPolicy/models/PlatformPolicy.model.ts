/**
 * 한국어: PlatformPolicy GraphQL 모델 — 플랫폼 정책 엔티티의 GraphQL ObjectType 정의.
 *         정책은 Global → RegionalDistributor → BrandHQ → Branch → EdgePos 5단계 계층으로
 *         상속되며, scopeType/scopeId/policyKey/version 조합으로 유일하게 식별된다.
 *         policyValueJson에 정책 설정값을 JSON으로 저장한다.
 * Tiếng Việt: Model GraphQL PlatformPolicy — định nghĩa ObjectType GraphQL cho entity chính sách nền tảng.
 *             Chính sách được kế thừa qua 5 cấp: Global → RegionalDistributor → BrandHQ → Branch → EdgePos,
 *             và được định danh duy nhất bởi tổ hợp scopeType/scopeId/policyKey/version.
 *             policyValueJson lưu trữ giá trị cấu hình chính sách dạng JSON.
 */
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class PlatformPolicyModel {
  /** 한국어: 정책 고유 ID (UUID) / Tiếng Việt: ID duy nhất của chính sách (UUID) */
  @Field(() => ID) id!: string;

  /** 한국어: 정책 키 (예: 'maxOrderAmount', 'autoSyncInterval') / Tiếng Việt: Khóa chính sách (ví dụ: 'maxOrderAmount', 'autoSyncInterval') */
  @Field() policyKey!: string;

  /** 한국어: 스코프 유형 (예: 'GLOBAL', 'BRAND_HQ', 'BRANCH', 'EDGE_POS') / Tiếng Việt: Loại scope (ví dụ: 'GLOBAL', 'BRAND_HQ', 'BRANCH', 'EDGE_POS') */
  @Field() scopeType!: string;

  /** 한국어: 스코프 대상 엔티티 ID (Global 스코프는 null) / Tiếng Việt: ID entity đích của scope (null khi scope là Global) */
  @Field(() => String, { nullable: true }) scopeId?: string | null;

  /** 한국어: 정책 설정값 JSON / Tiếng Việt: JSON giá trị cấu hình chính sách */
  @Field(() => GraphQLJSON) policyValueJson!: unknown;

  /** 한국어: 정책 버전 번호 (동일 키/스코프에서 버전 관리) / Tiếng Việt: Số phiên bản chính sách (quản lý phiên bản trong cùng khóa/scope) */
  @Field(() => Int) version!: number;

  /** 한국어: 활성 여부 — 동일 키/스코프에서 최신 버전만 true / Tiếng Việt: Trạng thái hoạt động — chỉ phiên bản mới nhất trong cùng khóa/scope là true */
  @Field() isActive!: boolean;

  /** 한국어: 생성 일시 / Tiếng Việt: Thời gian tạo */
  @Field() createdAt!: Date;

  /** 한국어: 수정 일시 / Tiếng Việt: Thời gian cập nhật */
  @Field() updatedAt!: Date;
}
