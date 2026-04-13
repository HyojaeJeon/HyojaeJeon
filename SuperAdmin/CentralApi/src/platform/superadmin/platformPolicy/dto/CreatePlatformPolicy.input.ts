/**
 * 한국어: 플랫폼 정책 생성 입력 DTO — createPlatformPolicy 뮤테이션에 필요한 필드를 정의한다.
 *         policyKey와 scopeType으로 정책 대상을 지정하고, 정책 값을 JSON으로 입력받는다.
 * Tiếng Việt: DTO đầu vào tạo chính sách nền tảng — định nghĩa các trường cần thiết cho mutation createPlatformPolicy.
 *             Chỉ định đối tượng chính sách bằng policyKey và scopeType, nhận giá trị chính sách dưới dạng JSON.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreatePlatformPolicyInput {
  /** 한국어: 정책 키 (예: 'MAX_BRANCH_PER_BRAND') / Tiếng Việt: Khóa chính sách (ví dụ: 'MAX_BRANCH_PER_BRAND') */
  @Field() policyKey!: string;

  /** 한국어: 스코프 유형 (예: 'GLOBAL', 'BRAND_HQ') / Tiếng Việt: Loại scope (ví dụ: 'GLOBAL', 'BRAND_HQ') */
  @Field() scopeType!: string;

  /** 한국어: 스코프 대상 엔티티 ID (Global이면 null) / Tiếng Việt: ID entity đích của scope (null nếu Global) */
  @Field(() => ID, { nullable: true }) scopeId?: string;

  /** 한국어: 정책 값 JSON / Tiếng Việt: Giá trị chính sách dạng JSON */
  @Field(() => GraphQLJSON, { nullable: true }) policyValueJson?: object;
}
